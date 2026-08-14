// Device code-transform: cleans Vite/framework noise out of a served module,
// injects NativeScript build globals + the process.env shim, normalizes
// imports/helpers for the on-device ESM runtime, and collects an importer's
// app-relative dependencies. Pure functions only.
import { sanitizeStrayCoreReferences, isDeepCoreSubpath } from './core-sanitize.js';
import * as path from 'path';
import * as PAT from './constants.js';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../helpers/ast-normalizer.js';
import { stripDanglingViteCjsImports } from '../helpers/sanitize.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getProjectRootPath } from '../../helpers/project.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { getCliFlags, resolvePlatform } from '../../helpers/cli-flags.js';
import { resolveVerboseFlag } from '../../helpers/logging.js';
import { getProjectFlavor } from '../../helpers/flavor.js';
import { buildDefineShimStatements, buildGuardedDefineSeedStatement, buildUserDefineShimStatements, getRuntimeDefineValues, getUserProcessEnvDefineEntries } from '../../helpers/global-defines.js';
import { linkAngularPartialsIfNeeded } from '../frameworks/angular/server/linker.js';
import { isCoreGlobalsReference, isNativeScriptCoreModule, isNativeScriptPluginModule, normalizeNativeScriptCoreSpecifier, resolveVendorFromCandidate } from './websocket-module-specifiers.js';
import { ensureNativeScriptModuleBindings, getProcessCodeResolvedSpecifierOverrides, type EnsureNativeScriptModuleBindingsOptions } from './websocket-module-bindings.js';
import { deduplicateLinkerImports, ensureDestructureRtImports, ensureVariableDynamicImportHelper, hoistTopLevelStaticImports, repairImportEqualsAssignments, stripCoreGlobalsImports, stripViteDynamicImportVirtual } from './websocket-served-module-helpers.js';
import { buildNodeModuleProvenancePrelude, normalizeImportPath, removeNamedImports, rewriteVitePrebundleImportsForDevice, shouldRemapImport } from './device-transform-helpers.js';
import { nsConfigToJson } from '../../helpers/utils.js';

// Build a serialized process.env object from CLI --env.* flags.
// This is injected into every HTTP-served module so app code referencing
// process.env.TEST_ENV (etc.) works on device in HMR dev mode.
const __processEnvEntries: Record<string, string> = { NODE_ENV: 'development' };
try {
	const flags = getCliFlags();
	for (const [k, v] of Object.entries(flags || {})) {
		// Skip internal NativeScript build flags
		if (['ios', 'android', 'visionos', 'platform', 'hmr', 'verbose'].includes(k)) continue;
		__processEnvEntries[k] = String(v);
	}
} catch {}

// Serialized lazily (and cached) so the app's `process.env.<KEY>` define
// entries — captured from the resolved Vite config in `configResolved`, i.e.
// AFTER this module evaluates — are included. Production bundles get those
// values via Vite's textual substitution; raw-served HMR modules only see
// this shim. CLI --env.* flags win on key collisions (they are the more
// specific, per-invocation input).
let __processEnvJsonCache: string | null = null;
function getProcessEnvJson(): string {
	if (__processEnvJsonCache === null) {
		__processEnvJsonCache = JSON.stringify({ ...getUserProcessEnvDefineEntries(), ...__processEnvEntries });
	}
	return __processEnvJsonCache;
}

// Canonical define values resolved once
const __runtimeDefines = (() => {
	let platform: string | undefined;
	let verbose = false;
	try {
		platform = resolvePlatform();
		verbose = resolveVerboseFlag();
	} catch {}
	return { platform, values: getRuntimeDefineValues({ platform, isDevMode: true, verbose }) };
})();

// Guarded platform seed injected ahead of the per-module define shims so
// whichever HTTP-served module evaluates FIRST seeds globalThis correctly.
//
// Why this is needed: under HMR the device bundle's externalized core imports
// (`import "http://…/ns/core/globals"` etc.) evaluate BEFORE the bundle's own
// body per ESM semantics — so the bundle's inlined `virtual:ns-defines-seed`
// statements have NOT run when the HTTP core graph instantiates. Without this
// seed, code reading `globalThis.__APPLE__` directly would see undefined.
// Only emitted when a platform flag was actually detected — seeding
// all-false platform flags would be worse than not seeding.
const __platformSeed = __runtimeDefines.platform ? buildGuardedDefineSeedStatement(__runtimeDefines.values) : '';

interface ProcessCodeForDeviceOptions {
	resolvedSpecifierOverrides?: Map<string, string>;
	/**
	 * The request being served carries `?ns_worker=1` — it is part of a
	 * worker realm's module graph (marker propagated by the /ns/m route), so
	 * vendor imports must take the per-module HTTP form regardless of the
	 * module's own filename.
	 */
	workerRealm?: boolean;
}

/**
 * True when the served module id names a worker ENTRY by the NativeScript
 * `.worker` filename convention (`zip.worker.ts`, `effect.worker`, …). The
 * /ns/m route strips script extensions, so match both the extensionless and
 * extension-carrying forms, ignoring any query suffix.
 */
export function isWorkerEntryModuleId(sourceId?: string): boolean {
	if (!sourceId) {
		return false;
	}
	const clean = sourceId.split('?')[0];
	return /\.worker(?:\.(?:ts|tsx|js|jsx|mjs|mts|cts))?$/i.test(clean);
}

// Default-import forms of the app's nativescript.config-as-JSON module:
// the Vite-resolved virtual id (`/@id/__x00__nsvite:nsconfig-json`, any query
// suffix) and the raw `~/package.json` alias it originates from (see
// helpers/config-as-json.ts).
const NS_CONFIG_VIRTUAL_IMPORT_RE = /(^|\n)([\t ]*)import\s+([A-Za-z_$][\w$]*)\s+from\s*["'](?:\/@id\/(?:__x00__)?|\0)?nsvite:nsconfig-json[^"']*["'];?/g;
const NS_CONFIG_TILDE_IMPORT_RE = /(^|\n)([\t ]*)import\s+([A-Za-z_$][\w$]*)\s+from\s*["']~\/package\.json(?:\?[^"']*)?["'];?/g;

let cachedNsConfigJsonLiteral: string | null = null;
function getNsConfigJsonLiteral(): string {
	if (cachedNsConfigJsonLiteral === null) {
		try {
			cachedNsConfigJsonLiteral = JSON.stringify(nsConfigToJson());
		} catch {
			// No nativescript.config reachable (tests, bare fixtures) — the
			// importers only read optional profiling/cssParser hints from it.
			cachedNsConfigJsonLiteral = '{}';
		}
	}
	return cachedNsConfigJsonLiteral;
}

/**
 * Inline the app's nativescript.config JSON where a served module default-
 * imports it. @nativescript/core's `profiling/index.ts` and
 * `ui/styling/style-scope.ts` do `import appConfig from '~/package.json'`,
 * which Vite resolves to the `nsvite:nsconfig-json` virtual module and emits
 * as `/@id/__x00__nsvite:nsconfig-json`. The generic /@id/ virtual-import
 * strip in processCodeForDevice would delete that import and leave a bare
 * `appConfig` reference — a `ReferenceError: appConfig is not defined` at
 * module eval (hit when monorepo core source is served through /ns/m).
 * Replacing the import with `const <name> = <config-json>;` mirrors what the
 * production build (config-as-json.ts) and the dev core bundle
 * (core-bundle.ts's nsConfigPlugin) already provide.
 */
export function inlineNsConfigVirtualImports(code: string): string {
	if (!code || (!code.includes('nsvite:nsconfig-json') && !code.includes('~/package.json'))) return code;
	const replace = (_m: string, pfx: string, indent: string, name: string) => `${pfx}${indent}const ${name} = ${getNsConfigJsonLiteral()};`;
	return code.replace(NS_CONFIG_VIRTUAL_IMPORT_RE, replace).replace(NS_CONFIG_TILDE_IMPORT_RE, replace);
}

// Canonical hot-context id for a served app module: project-relative,
// extensionless, query-free. Must agree with `canonicalHotKey` in
// `hmr/client/hot-context.ts` so cold-boot evaluation and HMR re-evaluation
// resolve the same `hot.data` entry.
export function computeHotContextId(sourceId: string | undefined, projectRoot: string | undefined): string | null {
	if (!sourceId || typeof sourceId !== 'string') return null;
	let id = sourceId.split('?')[0].split('#')[0].replace(/\\/g, '/');
	if (!id) return null;
	id = id.replace(/^\/@fs/, '');
	if (projectRoot) {
		const rootPosix = projectRoot.replace(/\\/g, '/').replace(/\/$/, '');
		if (rootPosix && id.startsWith(rootPosix + '/')) {
			id = id.slice(rootPosix.length);
		}
	}
	if (id.startsWith('/ns/m/')) id = id.slice('/ns/m'.length);
	id = id.replace(/\.(ts|tsx|js|jsx|mjs|mts|cts)$/i, '');
	if (!id.startsWith('/')) id = '/' + id;
	return id;
}

// One-line `import.meta.hot` prelude. Single-statement, no internal `;` or
// newline, so that if any later sanitize pass re-applies
// `IMPORT_META_HOT_ASSIGNMENT` the whole statement strips cleanly (module
// degrades to `import.meta.hot === undefined` instead of a SyntaxError).
// The registry global is installed by the `/__ns_dev__/client` bootstrap
// BEFORE the entry graph evaluates; outside dev it's absent and the
// expression yields `undefined`, matching Vite's production semantics.
export function buildHotContextPrelude(hotContextId: string): string {
	const idJson = JSON.stringify(hotContextId);
	return `import.meta.hot = globalThis.__NS_HOT_REGISTRY__ && globalThis.__NS_HOT_REGISTRY__.createHotContext ? globalThis.__NS_HOT_REGISTRY__.createHotContext(${idJson}) : undefined;\n`;
}

function collectImportDependencies(code: string, importerPath: string): Set<string> {
	const importerDir = path.posix.dirname(importerPath);
	const deps = new Set<string>();
	const patterns = [PAT.IMPORT_PATTERN_1, PAT.IMPORT_PATTERN_2, PAT.EXPORT_PATTERN, PAT.IMPORT_PATTERN_3];

	for (const pattern of patterns) {
		pattern.lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(code)) !== null) {
			const rawSpec = match[2];
			const spec = normalizeNativeScriptCoreSpecifier(rawSpec);
			if (!spec || !shouldRemapImport(spec)) {
				continue;
			}

			if (resolveVendorFromCandidate(spec)) {
				continue;
			}
			// Manifest-aware vendor spec detection
			try {
				if (resolveVendorSpecifier && resolveVendorSpecifier(spec)) {
					continue;
				}
			} catch {}

			const normalized = normalizeImportPath(spec, importerDir);
			if (normalized) {
				if (resolveVendorFromCandidate(normalized)) {
					continue;
				}
				try {
					if (resolveVendorSpecifier && resolveVendorSpecifier(normalized)) {
						continue;
					}
				} catch {}
				if (isCoreGlobalsReference(normalized)) {
					continue;
				}
				if (isNativeScriptCoreModule(normalized)) {
					continue;
				}
				if (isNativeScriptPluginModule(normalized)) {
					continue;
				}
				deps.add(normalized);
			}
		}
	}

	return deps;
}

/**
 * Clean code: remove Vite/Vue noise, rewrite to vendor
 */
function cleanCode(code: string, strategy: FrameworkServerStrategy): string {
	let result = code;

	// Remove Vite client and hot module noise ('$1' keeps the preceding
	// newline/semicolon boundary — see VITE_CLIENT_IMPORT in constants.ts).
	// Vite's own `import.meta.hot = __vite__createHotContext(...)` targets the
	// browser client; we strip it and processCodeForDevice injects the NS
	// hot-context prelude instead (JS-owned import.meta.hot).
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '$1');
	result = result.replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');

	result = strategy.preClean?.(result) ?? result;
	result = strategy.rewriteFrameworkImports?.(result) ?? result;

	// Vendor manifest-driven import rewrites
	// NOTE: Static and side-effect vendor imports are intentionally NOT rewritten here.
	// They are left as import statements so that ensureNativeScriptModuleBindings()
	// (called later in processCodeForDevice) can transform them using the robust
	// __nsVendorRequire + __nsPick pattern that works on device.
	// Only dynamic imports are handled here since ensureNativeScriptModuleBindings
	// does not process dynamic import() calls.
	try {
		const manifest = getVendorManifest();
		if (manifest) {
			// Dynamic import rewrites: import('pkg') -> Promise.resolve(__nsVendor('id'))
			const dynImportRE = /(import\(\s*["'])([^"']+)(["']\s*\))/g;
			result = result.replace(dynImportRE, (full, pre, spec, post) => {
				if (isNativeScriptCoreModule(spec)) return full;
				const resolved = resolveVendorSpecifier(spec);
				if (!resolved || /^@nativescript\/core(\b|\/)/i.test(resolved)) return full;
				return `Promise.resolve(__nsVendor(${JSON.stringify(resolved)}))`;
			});
		}
	} catch (e) {
		// Non-fatal; fallback to original code if manifest logic fails
	}
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '$1').replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');

	// The stripped /@vite/client import may have carried the `injectQuery`
	// binding (Vite 8 rewrites worker/url dynamic imports to
	// `__vite__injectQuery(url, 'import')`). Shim it as identity — query
	// injection is meaningless for the on-device HTTP loader.
	if (/\b__vite__injectQuery\s*\(/.test(result) && !/(?:const|let|var|function)\s+__vite__injectQuery\b/.test(result)) {
		result = `const __vite__injectQuery = (url) => url;\n` + result;
	}

	// Clean up HMR noise
	result = strategy.postClean?.(result) ?? result;
	result = stripCoreGlobalsImports(result);

	return result;
}
/**
 * Process code for device: inject globals, remove framework imports
 */

function processCodeForDevice(code: string, isVitePreBundled: boolean, preserveVendorImports: boolean = false, isNodeModule: boolean = false, sourceId?: string, options?: ProcessCodeForDeviceOptions): string {
	let result = code;
	const resolvedSpecifierOverrides = options?.resolvedSpecifierOverrides || getProcessCodeResolvedSpecifierOverrides(sourceId, getProjectRootPath());
	const bindingOptions: EnsureNativeScriptModuleBindingsOptions = {
		preserveNonPluginVendorImports: preserveVendorImports,
		resolvedSpecifierOverrides,
		// Worker entries evaluate in their own realm, where the main realm's
		// vendor registry / __nsRequire never exist — route their vendor
		// imports to the /ns/m/node_modules HTTP ESM form instead (realm-local
		// copy via the deps-bundle bridge, matching webpack's per-worker
		// bundling semantics). Entry-level detection by the `.worker` filename
		// convention; a worker's TRANSITIVE imports share URLs with the main
		// realm and cannot be forked per-realm, so plugins consumed by worker
		// code should be imported from the worker entry itself.
		vendorImportsAsHttp: options?.workerRealm || isWorkerEntryModuleId(sourceId),
	};

	// Ensure Angular partial declarations are linked before any sanitizers run so runtime never hits the JIT path.
	result = linkAngularPartialsIfNeeded(result);

	// Post-linker: deduplicate/resolve imports the Angular linker injected with bare specifiers
	result = deduplicateLinkerImports(result);

	// First: aggressively strip any lingering virtual dynamic-import-helper before anything else.
	// Doing this up-front prevents downstream dependency collection from seeing the virtual id.
	result = stripViteDynamicImportVirtual(result);

	// Skip reactive injection for Vite pre-bundled deps (they have Vue bundled already)
	if (isVitePreBundled) {
		return result;
	}

	// Inject ALL NativeScript/build globals at the top (matching global-defines.ts)
	// This ensures any code using __DEV__, __ANDROID__, __IOS__, etc. works correctly
	const allGlobals = [
		// Minimal process shim — populated with CLI --env.* flags at module load time.
		// In production builds, Vite/Rollup replaces process.env.* statically.
		// In HMR dev mode the code runs as-is on device, so we need the shim.
		//
		// IMPORTANT: every check goes through `globalThis.process` (a member
		// expression), NEVER bare `typeof process` (an identifier reference).
		// bare identifier resolution
		// against runtime-added global object properties is not reliable in
		// V8 module scope. `globalThis.process` is unambiguous: it always
		// reads the `process` property off the (single) global object.
		//
		// The shim is also strictly additive — it only initializes
		// `globalThis.process` and `globalThis.process.env` if they are
		// missing. App code that pre-populates `process.env` (e.g. an Azure
		// App Configuration boot module) is preserved; we never overwrite a
		// populated env with the bare `{ NODE_ENV: 'development' }` stub.
		`if (typeof globalThis.process === "undefined" || globalThis.process === null) { globalThis.process = { env: ${getProcessEnvJson()} }; } else if (!globalThis.process.env) { globalThis.process.env = ${getProcessEnvJson()}; }`,
		// Seed platform defines from the dev server's CLI flags BEFORE the const
		// shims snapshot them — see __platformSeed above for the ESM-ordering
		// rationale (externalized core imports evaluate before the bundle body).
		...(__platformSeed ? [__platformSeed] : []),
		// Per-module shim consts with canonical fallbacks — generated from the
		// same getRuntimeDefineValues source as the seed and Vite's `define`.
		...buildDefineShimStatements(__runtimeDefines.values),
		// App-configured `__FOO__` defines (e.g. __NS_NATIVE_OVERRIDES__). Excludes
		// the builtin keys just shimmed above so we never emit a duplicate `const`.
		...buildUserDefineShimStatements(Object.keys(__runtimeDefines.values)),
	];
	result = allGlobals.join('\n') + '\n' + result;
	const nodeModuleProvenancePrelude = buildNodeModuleProvenancePrelude(sourceId);
	if (nodeModuleProvenancePrelude) {
		result = nodeModuleProvenancePrelude + result;
	}

	// JS-owned `import.meta.hot`: app modules get a hot context bound to
	// their canonical id (library code never registers hot boundaries).
	if (!isNodeModule) {
		const hotContextId = computeHotContextId(sourceId, getProjectRootPath());
		if (hotContextId) {
			result = buildHotContextPrelude(hotContextId) + result;
		}
	}

	// AST normalization: inject /ns/rt helper aliases for underscore-prefixed identifiers.
	// ONLY for app source files — library code in node_modules should be served as-is.
	// Running the normalizer on libraries like tslib injects harmful destructures
	// (e.g., `const { SuppressedError } = __ns_rt_ns_1`) that shadow globals.
	if (!isNodeModule) {
		// CRITICAL ORDERING: canonicalise any bare `@nativescript/core[/sub]`
		// specifiers to `/ns/core[/sub]` BEFORE the AST normaliser sees them.
		// `astNormalizeModuleImportsAndHelpers` defensively rewrites bare
		// `@nativescript/core` imports and emits a one-shot
		// `[ast-normalizer] unexpected @nativescript/core spec` warning —
		// the warning means the upstream rewriter regressed. For Vue SFC
		// `<script>` blocks the bare specifier flows through Vite's
		// transform pipeline without a per-statement source-string rewrite
		// (Vite's resolver only edits the module graph, not the emitted
		// code), so the only upstream rewriter that can canonicalise these
		// in dev mode is this regex sweep. Running it here keeps the AST
		// normaliser purely a tripwire instead of an active rewriter.
		try {
			result = sanitizeStrayCoreReferences(result);
		} catch {}

		try {
			// The unsound underscore TEXT-SCAN fallback inside the normalizer is
			// only meaningful for compiled Vue template helpers; on every other
			// flavor it has misread app/library internals as helpers (see the
			// fallback's comment in ast-normalizer.ts). AST-based detection stays
			// on for all flavors.
			result = astNormalizeModuleImportsAndHelpers(result, { underscoreTextFallback: getProjectFlavor() === 'vue' });
		} catch {}

		// Verify there are no duplicate top-level const/let bindings after AST normalization
		try {
			result = astVerifyAndAnnotateDuplicates(result);
		} catch {}
	}

	// If AST marker present OR this is a node_modules file, skip regex-based helper
	// alias injection. Library code should NOT get /ns/rt destructures injected —
	// underscore-prefixed identifiers in libraries are internal variables, not NS helpers.
	// Vue-only for the same reason as the normalizer's text fallback: /ns/rt
	// underscore helpers (`_toDisplayString`, …) only exist in compiled Vue
	// template output; on other flavors this scope-blind regex misreads app
	// internals as helpers.
	if (getProjectFlavor() === 'vue' && !isNodeModule && !/^\s*(?:\/\/|\/\*) \[ast-normalized\]/m.test(result)) {
		try {
			const underscored = new Set<string>();
			// `(?![\w$])` (not `\b`): `\w` excludes `$`, so `\b` would match the prefix
			// `_Symbol` inside Babel temp vars like `_Symbol$toStringTag`.
			const re = /(^|[^.\w$])_([A-Za-z]\w*)(?![\w$])/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(result))) {
				const name = m[2];
				if (name === 'ctx' || name === 'cache') continue;
				if (name.startsWith('hoisted_')) continue;
				if (name.startsWith('component_')) continue;
				if (name.startsWith('directive_')) continue;
				if (name === 'sfc_main') continue;
				if (name === 'ns_sfc__' || name.startsWith('ns_sfc')) continue;
				if (name.startsWith('sfc')) continue;
				try {
					const declRE = new RegExp(`(^|\\n)\\s*(?:const|let|var)\\s+_${name}\\b`);
					if (declRE.test(result)) continue;
				} catch {}
				underscored.add(name);
			}
			if (underscored.size) {
				const needed: string[] = [];
				for (const n of underscored) {
					const aliasNeedle = new RegExp(`\\b${n}\\s+as\\s+_${n}\\b`);
					if (!aliasNeedle.test(result)) needed.push(n);
				}
				if (needed.length) {
					const importLine = `import { ${needed.map((n) => `${n} as _${n}`).join(', ')} } from "/ns/rt";\n`;
					result = importLine + result;
				}
			}
		} catch {}
	}

	// In strict dev mode, proactively surface duplicate-binding diagnostics to avoid "already declared" runtime errors
	try {
		if (/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\]/m.test(result)) {
			const diagnosticLine = (result.match(/^\s*\/\/ \[ast-verify\]\[duplicate-bindings\][^\n]*/m) || [])[0] || '// [ast-verify][duplicate-bindings]';
			const brief = diagnosticLine.replace(/^[^:]*:?\s?/, '');
			const escaped = brief.replace(/["\\]/g, '\\$&');
			const thrower = `throw new Error("[nsv-hmr] Duplicate top-level bindings detected: ${escaped}");`;
			result = `${thrower}\n` + result;
		}
	} catch {}

	// Inline the nativescript.config JSON import BEFORE the generic /@id/
	// strip below, which would otherwise delete it and leave the consumer's
	// binding (`appConfig` in core's profiling/style-scope) undefined.
	try {
		result = inlineNsConfigVirtualImports(result);
	} catch {}

	// Un-prefix REAL bare-module ids Vite serves as `/@id/<id>` (no `__x00__`
	// virtual marker) BEFORE the virtual-id strip below. Vite uses `/@id/` for
	// any resolved id that isn't a file path — including genuine packages that
	// aren't in optimizeDeps (e.g. `html-entities`), not just virtual modules.
	// Restoring the bare specifier lets the module-bindings pass route them
	// like any other dependency import; deleting them left the consumer's
	// bindings undefined (observed as `decode is not defined` in
	// DecodeHtmlEntitiesPipe).
	result = result.replace(/(import\s+[^;]+\s+from\s+["'])\/@id\/(?!__x00__)([^"']+)(["'])/g, '$1$2$3');
	// Remove Vite internal imports (dynamic-import-helper, etc.)
	// This handles both standalone lines and concatenated imports on the same line
	// EXCEPT oxc runtime helpers (decorators etc.): Vite 8's oxc transform emits
	// `import _decorate from "/@id/__x00__@oxc-project+runtime@<ver>/helpers/decorate.js"`.
	// Unlike other virtual ids these are real, servable dev-server URLs returning
	// self-contained ESM — stripping them leaves `_decorate`/`_decorateMetadata`
	// undefined at runtime. They're origin-prefixed for the device in rewriteImports.
	result = result.replace(/import\s+[^;]+\s+from\s+["']\/@id\/(?!__x00__@oxc-project\+runtime)[^"']*["'];?\s*/g, '');
	// Also remove side-effect only virtual id imports like: import "/@id/__x00__vite/dynamic-import-helper.js";
	// These can slip through and cause the NativeScript runtime to attempt resolving
	// a non-existent physical file (e.g. /@id/__x00__vite/dynamic-import-helper.js) leading to
	// module not found crashes during HMR evaluation.
	if (/^[\t ]*import\s+["']\/@id\/[^"']+["'];?\s*$/m.test(result)) {
		result = result.replace(/^[\t ]*import\s+["']\/@id\/[^"']+["'];?\s*$/gm, '');
		// Inject a lightweight marker comment (harmless if left in output) so devs can confirm rewrite took place when viewing streamed artifact.
		result = `// [hmr-sanitize] stripped virtual /@id/ side-effect imports\n${result}`;
	}

	// IMPORTANT: Perform vendor-module binding injection BEFORE stripping Vite prebundle imports.
	// This allows the rewriter to see and canonicalize '/node_modules/.vite/deps/*' specifiers back
	// to their package ids (e.g., '@nativescript/firebase-core') and generate require-based bindings
	// so named imports like `{ firebase }` are preserved as const bindings.
	//
	// Some upstream transforms can emit a multiline form:
	//   import { x } from
	//   "/node_modules/.vite/deps/...";
	// If we don't normalize it, later stripping of naked string-only lines can leave
	// an invalid `import ... from` statement.
	try {
		result = result.replace(/(^|\n)([\t ]*import\s+[^;]*?\s+from)\s*\n\s*("\/?node_modules\/\.vite\/deps\/[^"\n]+"\s*;?\s*)/gm, (_m, p1, p2, p3) => `${p1}${p2} ${p3}`);
	} catch {}
	// When preserveVendorImports is true (HMR /ns/m/ endpoint), skip the
	// __nsVendorRequire + __nsPick rewrite. Vendor imports stay as bare
	// specifiers so the device-side import map resolves them via V8's native
	// module system, which correctly handles export * re-exports.
	result = ensureNativeScriptModuleBindings(result, bindingOptions);

	// Repair any accidental "import ... = expr" assignments that may have slipped in.
	try {
		result = repairImportEqualsAssignments(result);
	} catch {}

	// Strip Vite prebundle deps imports (both named and side-effect) and any malformed const string artifacts
	// Example problematic line observed: const "/node_modules/.vite/deps/@nativescript_firebase-messaging.js?v=...";
	if (/node_modules\/\.vite\/deps\//.test(result)) {
		result = rewriteVitePrebundleImportsForDevice(result, preserveVendorImports);
		// Malformed const string lines accidentally produced by upstream transforms
		result = result.replace(/^[\t ]*const\s+["']\/?node_modules\/\.vite\/deps\/[^"']+["'];?\s*$/gm, '// [hmr-sanitize] stripped malformed const prebundle ref\n');
		// Naked string-only lines pointing at prebundle deps
		result = result.replace(/^[\t ]*["']\/?node_modules\/\.vite\/deps\/[^"']+["'];?\s*$/gm, '// [hmr-sanitize] stripped prebundle side-effect literal\n');
	}

	// Dynamic aliasing covers helper imports; no further static list handling needed.

	// Handle navigation helpers (dev bridge): $navigateTo, $navigateBack
	// Note: do NOT inject $showModal as a named import; AST normalizer/destructure covers it when imported,
	// and free-uses are handled via AST injection. This avoids duplicate identifier redeclarations.
	if (/\$(?:navigate(?:To|Back)|showModal)\b/.test(result)) {
		const navHelpers: string[] = [];
		// Only consider free uses (not property access like obj.$navigateTo)
		const needTo = /(^|[^.\w$])\$navigateTo\b/.test(result);
		const needBack = /(^|[^.\w$])\$navigateBack\b/.test(result);
		if (needTo) navHelpers.push('$navigateTo');
		if (needBack) navHelpers.push('$navigateBack');
		// Intentionally exclude $showModal from navHelpers injection to prevent named import reinsertion
		// Remove any direct imports/usages that might shadow globals
		// 1) From 'vue' or 'nativescript-vue' sources
		result = removeNamedImports(result, navHelpers);
		// 2) From our runtime bridge '/ns/rt' (versioned or not)
		try {
			// Do NOT re-introduce named imports from /ns/rt for nav helpers; drop them entirely after removing nav helpers.
			const rtNamedRE = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["'];?\s*/gm;
			// Also compute locally-declared helpers to drop regardless of free-use detection
			const hasLocalToForDrop = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateTo\b/.test(result);
			const hasLocalBackForDrop = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateBack\b/.test(result);
			result = result.replace(rtNamedRE, (full, pfx, specList) => {
				const drop = new Set<string>(navHelpers);
				if (hasLocalToForDrop) drop.add('$navigateTo');
				if (hasLocalBackForDrop) drop.add('$navigateBack');
				const remaining = String(specList)
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.filter((entry) => {
						const base = entry.split(/\s+as\s+/i)[0].trim();
						return !drop.has(base);
					});
				if (!remaining.length) return pfx || '';
				// Preserve non-navigation named imports for later normalization
				return `${pfx}import { ${remaining.join(', ')} } from "/ns/rt";`;
			});
			// Also strip $navigateTo/$navigateBack from any destructuring previously created from /ns/rt
			// Also remove from destructures bound off any __ns_rt_ns temp (including _re)
			const rtDestructureRE = /(^|[\n;])\s*const\s*\{([^}]+)\}\s*=\s*(__ns_rt_ns(?:\d+|_re))\s*;?\s*/gm;
			result = result.replace(rtDestructureRE, (full, pfx, specList, varName) => {
				const cleaned = String(specList)
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.filter((seg) => {
						const lhs = seg.split(':')[0].trim();
						return !/^\$navigate(?:To|Back)$/.test(lhs);
					});
				if (!cleaned.length) return pfx || '';
				return `${pfx}const { ${cleaned.join(', ')} } = ${varName};`;
			});
		} catch {}
		// Inject named imports from /ns/rt to provide bindings without redeclaration collisions
		const imports: string[] = [];
		const hasImportTo = /(^|\n)\s*import\s*\{[^}]*\$navigateTo[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["']/.test(result);
		const hasImportBack = /(^|\n)\s*import\s*\{[^}]*\$navigateBack[^}]*\}\s*from\s*["'](?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?["']/.test(result);
		// Avoid adding named imports if a local binding already exists (e.g., wrapper const)
		const hasLocalTo = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateTo\b/.test(result);
		const hasLocalBack = /(^|[\n;])\s*(?:const|let|var|function)\s+\$navigateBack\b/.test(result);
		if (needTo && !hasImportTo && !hasLocalTo) imports.push('$navigateTo');
		if (needBack && !hasImportBack && !hasLocalBack) imports.push('$navigateBack');
		// Do not inject $showModal named import; avoid duplicates with destructures created upstream
		if (imports.length) {
			result = `import { ${imports.join(', ')} } from "/ns/rt";\n` + result;
		}
	}

	// Ensure vendor bindings also apply after potential wrapper injections above
	// (idempotent: second pass will be a no-op if imports already consumed).
	result = ensureNativeScriptModuleBindings(result, bindingOptions);
	try {
		result = repairImportEqualsAssignments(result);
	} catch {}

	// Rewrite any previously-injected vendor-based core access to the unified HTTP core bridge
	try {
		const vendorCoreRE1 = /globalThis\.__nsVendor\s*\(\s*["']@nativescript\/core["']\s*\)/g;
		const vendorCoreRE2 = /__nsVendor\s*\(\s*["']@nativescript\/core["']\s*\)/g;
		if (vendorCoreRE1.test(result) || vendorCoreRE2.test(result)) {
			const hasImport = /import\s+__ns_core_bridge\s+from\s+["'][^"']*\/(?:\@ns|ns)\/core(?:\/[^"']+)?["']\s*;?/.test(result) || /(^|\n)\s*import\s+__ns_core_bridge\s+from\s+["']\/(?:\@ns|ns)\/core["']\s*;?/m.test(result);
			if (!hasImport) {
				result = `import __ns_core_bridge from "/ns/core";\n` + result;
			}
			result = result.replace(vendorCoreRE1, '__ns_core_bridge');
			result = result.replace(vendorCoreRE2, '__ns_core_bridge');
		}
	} catch {}

	// Rewrite any explicit require('@nativescript/core[/sub]') calls to the unified core bridge
	try {
		const reqCoreRE1 = /(^|[^.\w$])require\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g;
		const reqCoreRE2 = /(?:globalThis|window|self)\.require\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g;
		if (reqCoreRE1.test(result) || reqCoreRE2.test(result)) {
			const hasImport = /import\s+__ns_core_bridge\s+from\s+["'][^"']*\/(?:\@ns|ns)\/core(?:\/[^"']+)?["']\s*;?/.test(result) || /(^|\n)\s*import\s+__ns_core_bridge\s+from\s+["']\/(?:\@ns|ns)\/core["']\s*;?/m.test(result);
			if (!hasImport) {
				result = `import __ns_core_bridge from "/ns/core";\n` + result;
			}
			result = result.replace(reqCoreRE1, (_m, p1, _sub) => `${p1}__ns_core_bridge`);
			result = result.replace(reqCoreRE2, '__ns_core_bridge');
		}
	} catch {}

	// Apply the three-pass safety net for stray @nativescript/core references
	// (naked string literals, dangling `from` merges, lingering resolved-path
	// references). Centralised in core-sanitize.sanitizeStrayCoreReferences so
	// every NS-M emitter applies the same passes in the same order.
	result = sanitizeStrayCoreReferences(result);

	result = ensureVariableDynamicImportHelper(result);

	// Normalize any lingering @nativescript/core imports to the /ns/core bridge (non-destructive best-effort)
	try {
		// Rewrite named imports from the /ns/core bridge into default import + destructuring.
		// This makes `import { Frame } from '@nativescript/core'` work even if the bridge provides only a default export.
		{
			let __core_ns_seq = 0;
			const toDestructureCore = (specList: string) =>
				specList
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.map((seg) => {
						const m = seg.split(/\s+as\s+/i);
						return m.length === 2 ? `${m[0].trim()}: ${m[1].trim()}` : seg;
					})
					.join(', ');
			const reNamed = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']+)?)['"];?\s*/gm;
			result = result.replace(reNamed, (_full, pfx: string, specList: string, src: string) => {
				// Deep subpath URLs serve actual ESM with real named exports — skip.
				if (isDeepCoreSubpath(src)) return _full;
				__core_ns_seq++;
				const tmp = `__ns_core_ns${__core_ns_seq}`;
				const decl = `const { ${toDestructureCore(specList)} } = ${tmp};`;
				return `${pfx}import ${tmp} from ${JSON.stringify(src)};\n${decl}\n`;
			});
			const reMixed = /(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']+)?)['"];?\s*/gm;
			result = result.replace(reMixed, (_full, pfx: string, defName: string, specList: string, src: string) => {
				if (isDeepCoreSubpath(src)) return _full;
				const decl = `const { ${toDestructureCore(specList)} } = ${defName};`;
				return `${pfx}import ${defName} from ${JSON.stringify(src)};\n${decl}\n`;
			});
		}
	} catch {}

	// Note: Removed legacy var-based underscore prelude to avoid const/var redeclaration conflicts.
	// Normalize concatenated imports that may have ended up after a statement on the same line
	try {
		// Common concatenations
		// Keep a single semicolon before the import to avoid generating ';;'
		result = result.replace(/;\s*import\s+/g, ';\nimport ');
		result = result.replace(/}\s*import\s+/g, '}\nimport ');
		// Fallback: ensure any static import that isn't at start of line gets a newline before it.
		//
		// Only match after **structural** statement-ending characters: `;`, `}`, `)`, `]`. We
		// deliberately do NOT include `'`, `"`, or `` ` `` here — those are string-literal
		// terminators (and openers!), and including them caused the regex to fire inside
		// example code embedded in error strings. Concrete failure observed:
		// `@supabase/realtime-js` throws an Error whose message contains the literal
		// `'  import ws from "ws"\n' +`. With `'` in the delimiter class, the engine matched
		// the opening `'` of that string literal as a "statement terminator" and rewrote the
		// example to `'\nimport ws from "..."` — splitting the string across two lines and
		// producing a SyntaxError on device. The structural delimiters below do not appear
		// inside string-literal openers, so the rewrite is safe.
		result = result.replace(/([;}\)\]])\s*(import\s+[^;\n]*\s+from\s*["'][^"']+["'])/g, '$1\n$2');
	} catch {}

	// Collapse duplicate destructuring from the same temp namespace var (e.g., multiple const { x } = __ns_rt_ns1)
	try {
		const collapse = (code: string, prefix: string) => {
			const re = new RegExp(`(^|\\n)\\s*const\\s*\\{([^}]+)\\}\\s*=\\s*(${prefix}\\d+)\\s*;?\\s*`, 'gm');
			const byVar: Record<string, Set<string>> = {};
			code.replace(re, (_full, _pfx, specList, varName) => {
				const set = (byVar[varName] ||= new Set());
				String(specList)
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.forEach((seg) => set.add(seg));
				return '';
			});
			if (Object.keys(byVar).length) {
				// Remove all existing destructures first
				code = code.replace(re, (full, pfx) => pfx || '');
				// Re-emit one per var
				const blocks = Object.entries(byVar).map(([varName, set]) => `const { ${Array.from(set).join(', ')} } = ${varName};`);
				code = blocks.join('\n') + '\n' + code;
			}
			return code;
		};
		result = collapse(result, '__ns_rt_ns');
		result = collapse(result, '__ns_core_ns');
	} catch {}

	// After consolidating destructures, hoist static import declarations to the very top so imports
	// always come before any statements that might reference their bindings. This ordering avoids
	// device runtimes that are stricter about imports-first semantics during module instantiation.
	try {
		result = hoistTopLevelStaticImports(result);
	} catch {}

	// Final safety: normalize any lingering named imports from /ns/rt into default+destructure
	// Skip for node_modules (no /ns/rt helpers needed) and when AST marker present
	try {
		if (!isNodeModule && !/^\s*\/\* \[ast-normalized\] \*\//m.test(result)) {
			result = ensureDestructureRtImports(result);
		}
	} catch {}

	// Post-pass: if both a destructure from __ns_rt_ns* and named imports from /ns/rt exist,
	// remove overlapping named specifiers to avoid "Identifier has already been declared".
	try {
		// Collect all bindings destructured from any __ns_rt_ns* temp
		const rtDestructureRE = /(^|\n)\s*const\s*\{([^}]+)\}\s*=\s*(__ns_rt_ns(?:\d+|_re))\s*;?\s*/gm;
		const rtBound = new Set<string>();
		let m: RegExpExecArray | null;
		while ((m = rtDestructureRE.exec(result)) !== null) {
			const specList = String(m[2] || '');
			specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.forEach((seg) => {
					const bind = seg.includes(':') ? seg.split(':')[1].trim() : seg;
					if (bind) rtBound.add(bind);
				});
		}
		if (rtBound.size) {
			// Rewrite named imports from /ns/rt by removing any specifiers already provided via destructure
			const rtNamedImportRE = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/rt(?:\/[\d]+)?)["'];?\s*/gm;
			const edits: Array<{ start: number; end: number; text: string }> = [];
			while ((m = rtNamedImportRE.exec(result)) !== null) {
				const full = m[0];
				const pfx = m[1] || '';
				const specList = String(m[2] || '');
				const src = m[3];
				const kept: string[] = [];
				specList
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
					.forEach((seg) => {
						const name = seg.split(/\s+as\s+/i)[0].trim();
						if (!rtBound.has(name)) kept.push(seg);
					});
				let replacement = '';
				if (kept.length) {
					replacement = `${pfx}import { ${kept.join(', ')} } from ${JSON.stringify(src)};`;
				} else {
					// Drop the import entirely if nothing remains
					replacement = pfx || '';
				}
				edits.push({
					start: rtNamedImportRE.lastIndex - full.length,
					end: rtNamedImportRE.lastIndex,
					text: replacement,
				});
			}
			if (edits.length) {
				// Apply edits in reverse order
				edits
					.sort((a, b) => b.start - a.start)
					.forEach((e) => {
						result = result.slice(0, e.start) + e.text + result.slice(e.end);
					});
			}
		}
	} catch {}

	// Tidy-ups: remove stray lines that are only semicolons and collapse excessive blank lines
	try {
		// Remove lines that contain only an optional whitespace and a single ';'
		result = result.replace(/^[ \t]*;[ \t]*$/gm, '');
		// Collapse 3+ blank lines into at most 2 to keep output compact and consistent
		result = result.replace(/\n{3,}/g, '\n\n');
	} catch {}

	// De-duplicate destructured bindings across different temp vars to avoid 'Identifier has already been declared'
	try {
		const reDestructureAny = /(^|\n)\s*const\s*\{([^}]+)\}\s*=\s*(__ns_(?:rt|core)_[A-Za-z0-9_]+)\s*;?\s*/gm;
		const seenBindings = new Set<string>();
		const edits: Array<{ start: number; end: number; text: string }> = [];
		let m: RegExpExecArray | null;
		while ((m = reDestructureAny.exec(result)) !== null) {
			const full = m[0];
			const pfx = m.index;
			const specList = m[2] as string;
			const varName = m[3] as string;
			const entries = specList
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			const kept: string[] = [];
			for (const seg of entries) {
				const bind = seg.includes(':') ? seg.split(':')[1].trim() : seg;
				if (seenBindings.has(bind)) continue;
				seenBindings.add(bind);
				kept.push(seg);
			}
			const replacement = kept.length ? `${m[1]}const { ${kept.join(', ')} } = ${varName};` : m[1] || '';
			edits.push({ start: pfx, end: pfx + full.length, text: replacement });
		}
		if (edits.length) {
			// Apply edits in reverse order to not mess up indices
			edits
				.sort((a, b) => b.start - a.start)
				.forEach((e) => {
					result = result.slice(0, e.start) + e.text + result.slice(e.end);
				});
		}
	} catch {}

	// As a final safety net, neutralize any uses of Vite's CJS import helpers when the helper variable
	// itself is not declared (e.g., stripped earlier during sanitation). This prevents runtime errors like
	// "Cannot read properties of undefined (reading 'initNorrix')" on device when accessing
	// __vite__cjsImportX__pkg["prop"].
	try {
		result = stripDanglingViteCjsImports(result);
	} catch {}

	return result;
}

export { processCodeForDevice, cleanCode, collectImportDependencies };
