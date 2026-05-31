// Device code-transform subsystem: rewrites a served module's imports + source
// for the on-device ESM runtime (the HMR plugin's hot path). Extracted verbatim
// from `websocket.ts`; that file imports these back for the plugin closure and
// re-exports the public entry points (`rewriteImports`,
// `prepareAngularEntryForDevice`, `__test_processCodeForDevice`) so existing
// imports keep resolving. Pure functions only — no plugin/server state beyond
// the project-derived `APP_ROOT_DIR` and the CLI-env snapshot below.
import { sanitizeStrayCoreReferences, isDeepCoreSubpath } from './core-sanitize.js';
import { existsSync, readFileSync } from 'fs';
import { astNormalizeModuleImportsAndHelpers, astVerifyAndAnnotateDuplicates } from '../helpers/ast-normalizer.js';
import { stripDanglingViteCjsImports } from '../helpers/sanitize.js';
import * as path from 'path';
import * as PAT from './constants.js';
import { getVendorManifest, resolveVendorSpecifier } from '../shared/vendor/registry.js';
import { getMonorepoWorkspaceRoot, getProjectRootPath } from '../../helpers/project.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import { createProcessSfcCode } from '../frameworks/vue/server/sfc-transforms.js';
import { getProjectAppPath } from '../../helpers/utils.js';
import { getCliFlags } from '../../helpers/cli-flags.js';
import { buildCoreUrl, buildCoreUrlPath } from '../../helpers/ns-core-url.js';
import { resolveAngularCoreHmrImportSource, rewriteAngularEntryRegisterOnly } from './websocket-angular-entry.js';
import { linkAngularPartialsIfNeeded } from '../frameworks/angular/server/linker.js';
import { isCoreGlobalsReference, isLikelyNativeScriptRuntimePluginSpecifier, isNativeScriptCoreModule, isNativeScriptPluginModule, normalizeNativeScriptCoreSpecifier, normalizeNodeModulesSpecifier, resolveNodeModulesPackageBoundary, resolveVendorFromCandidate, resolveVendorRouting, rewriteFsAbsoluteToNsM, shouldPreserveBareRuntimePluginSubpathImport, viteDepsPathToBareSpecifier } from './websocket-module-specifiers.js';
import { ensureNativeScriptModuleBindings, getProcessCodeResolvedSpecifierOverrides, type EnsureNativeScriptModuleBindingsOptions } from './websocket-module-bindings.js';
import { collectTopLevelImportRecords, deduplicateLinkerImports, ensureDestructureRtImports, ensureDynamicHmrImportHelper, ensureVariableDynamicImportHelper, hoistTopLevelStaticImports, repairImportEqualsAssignments, stripCoreGlobalsImports, stripViteDynamicImportVirtual } from './websocket-served-module-helpers.js';

const APP_ROOT_DIR = getProjectAppPath();

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
const __processEnvJson = JSON.stringify(__processEnvEntries);

export function prepareAngularEntryForDevice(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp: boolean = false): string {
	const rewrittenCode = rewriteImports(code, importerPath, sfcFileMap, depFileMap, projectRoot, verbose, outputDirOverrideRel, httpOrigin, resolveVendorAsHttp);

	return rewriteAngularEntryRegisterOnly(rewrittenCode, resolveAngularCoreHmrImportSource(rewrittenCode, httpOrigin));
}

const processSfcCode = createProcessSfcCode(processCodeForDevice);

interface ProcessCodeForDeviceOptions {
	resolvedSpecifierOverrides?: Map<string, string>;
}

// Bare specifiers and special skip patterns (virtual, data:, etc.)
const VENDOR_PACKAGES = /^[A-Za-z@][^:\/\s]*$/;
const SKIP_PATTERNS = /^(?:data:|blob:|node:|virtual:|vite:|\0|\/@@?id|\/__vite|__vite|__x00__)/;

function rewriteVitePrebundleImportsForDevice(code: string, preserveVendorImports: boolean): string {
	const imports = collectTopLevelImportRecords(code);
	if (!imports.length) {
		return code;
	}

	const edits: Array<{ start: number; end: number; text: string }> = [];
	for (const imp of imports) {
		const source = imp.source;
		const depMatch = source.match(/(?:^|\/)node_modules\/\.vite\/deps\/(.+)$/);
		const depPath = depMatch?.[1] || (source.startsWith('.vite/deps/') ? source.slice('.vite/deps/'.length) : null);
		if (!depPath) {
			continue;
		}

		let replacement = '';
		if (preserveVendorImports) {
			const canonical = resolveVendorFromCandidate(`.vite/deps/${depPath}`);
			const bareSpecifier = canonical || viteDepsPathToBareSpecifier(depPath);
			if (bareSpecifier) {
				replacement = imp.text.replace(source, bareSpecifier);
			}
		}

		edits.push({
			start: imp.start,
			end: imp.end,
			text: replacement,
		});
	}

	if (!edits.length) {
		return code;
	}

	let next = code;
	for (const edit of edits.sort((left, right) => right.start - left.start)) {
		next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
	}

	return next;
}

function buildNodeModuleProvenancePrelude(sourceId?: string): string {
	if (!sourceId) {
		return '';
	}

	const cleaned = sourceId.replace(PAT.QUERY_PATTERN, '');
	let normalized = normalizeNodeModulesSpecifier(cleaned);
	if (!normalized) {
		const viteDepsMatch = cleaned.match(/(?:^|\/)node_modules\/\.vite\/deps\/([^?#]+)/);
		if (viteDepsMatch?.[1]) {
			normalized = `.vite/deps/${viteDepsMatch[1]}`;
		}
	}

	if (!normalized) {
		return '';
	}

	let packageSpecifier = normalized;
	let via = 'node_modules';
	if (normalized.startsWith('.vite/deps/')) {
		via = 'vite-deps';
		packageSpecifier = viteDepsPathToBareSpecifier(normalized.slice('.vite/deps/'.length)) || normalized;
	}

	const rootPackage = resolveNodeModulesPackageBoundary(packageSpecifier, getProjectRootPath()).packageName;
	if (!rootPackage) {
		return '';
	}

	return `try { const __nsRecord = globalThis.__NS_RECORD_MODULE_PROVENANCE__; if (typeof __nsRecord === 'function') { __nsRecord(${JSON.stringify(rootPackage)}, ${JSON.stringify({ kind: 'http-esm', specifier: packageSpecifier, url: sourceId, via })}); } } catch {}\n`;
}

function shouldRemapImport(spec: string): boolean {
	if (!spec || typeof spec !== 'string') return false;
	if (VENDOR_PACKAGES.test(spec)) return false;
	if (isNativeScriptCoreModule(spec)) return false;
	if (isNativeScriptPluginModule(spec)) return false;
	if (resolveVendorFromCandidate(spec)) return false;
	if (spec.startsWith('~/')) return false;
	if (SKIP_PATTERNS.test(spec)) return false;
	if (!spec.startsWith('/') && !spec.startsWith('./') && !spec.startsWith('../')) {
		return false;
	}
	return true;
}

function removeNamedImports(code: string, names: string[]): string {
	const regex = /^(\s*import\s*\{)([^}]*)(\}\s*from\s*['"][^'"]+['"];?)/gm;
	return code.replace(regex, (_m, p1, specList, p3) => {
		const srcMatch = /from\s*['"]\s*([^'"\s]+)\s*['"]/i.exec(_m);
		const src = (srcMatch?.[1] || '').toLowerCase();
		const isVueSource = /^(?:vue|nativescript-vue)(?:\b|\/)/i.test(src);
		if (!isVueSource) {
			return _m;
		}
		const remaining = specList
			.split(',')
			.map((s: string) => s.trim())
			.filter(Boolean)
			.filter((entry: string) => {
				const base = entry.split(/\s+as\s+/i)[0].trim();
				return !names.includes(base);
			});

		if (!remaining.length) return '';
		return `${p1} ${remaining.join(', ')} ${p3}`;
	});
}

function normalizeImportPath(spec: string, importerDir: string): string | null {
	if (!spec) return null;

	let key: string;
	if (spec.startsWith('/')) {
		key = spec;
	} else if (spec.startsWith('./') || spec.startsWith('../')) {
		key = path.posix.normalize(path.posix.join(importerDir, spec));
		if (!key.startsWith('/')) {
			key = `/${key}`;
		}
	} else {
		key = spec;
	}

	return key.replace(PAT.QUERY_PATTERN, '');
}

function findDependencyFileName(depFileMap: Map<string, string>, key: string): string | undefined {
	const variants = new Set<string>();
	const base = key.replace(PAT.QUERY_PATTERN, '');
	variants.add(base);

	const normalized = path.posix.normalize(base);
	variants.add(normalized);

	const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
	variants.add(withSlash);

	for (const variant of Array.from(variants)) {
		if (variant.endsWith('.js')) {
			variants.add(variant.replace(/\.js$/i, '.mjs'));
		} else if (variant.endsWith('.mjs')) {
			variants.add(variant.replace(/\.mjs$/i, '.js'));
		}
	}

	for (const variant of variants) {
		const value = depFileMap.get(variant);
		if (value) {
			return value;
		}
	}

	return undefined;
}

function isRuntimePluginRootEntrySpecifier(specifier: string, projectRoot: string): boolean {
	if (!specifier) {
		return false;
	}

	const cleaned = specifier.replace(PAT.QUERY_PATTERN, '');
	const normalized = normalizeNodeModulesSpecifier(cleaned) || cleaned.replace(/^\/+/, '');
	if (!normalized) {
		return false;
	}

	const { packageName, subpath } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
	if (!packageName || !isLikelyNativeScriptRuntimePluginSpecifier(packageName, projectRoot)) {
		return false;
	}

	if (!subpath) {
		return true;
	}

	if (subpath.includes('/')) {
		return false;
	}

	const pkgBaseName = packageName.split('/').pop() || '';
	const withoutExt = /(?:\.(?:ios|android|visionos))?\.(?:ts|tsx|js|jsx|mjs|mts|cts)$/i.test(subpath) ? subpath.replace(/\.[^.]+$/, '') : subpath;
	const withoutPlatform = withoutExt.replace(/\.(ios|android|visionos)$/i, '');
	return withoutPlatform === 'index' || withoutPlatform === pkgBaseName;
}

function collectMixedRuntimePluginHttpRootPackages(code: string, projectRoot: string): Set<string> {
	const nonRootSubpathPackages = new Set<string>();
	const rootEntryPackages = new Set<string>();

	const visitSpecifier = (rawSpecifier: string | null | undefined) => {
		if (!rawSpecifier) {
			return;
		}

		const specifier = normalizeNativeScriptCoreSpecifier(rawSpecifier).replace(PAT.QUERY_PATTERN, '');
		if (!specifier) {
			return;
		}

		if (/^https?:\/\//.test(specifier) || specifier.startsWith('/ns/')) {
			return;
		}

		if (/^(?:\.|\/)/.test(specifier) && !specifier.includes('/node_modules/')) {
			return;
		}

		const normalized = normalizeNodeModulesSpecifier(specifier) || specifier.replace(/^\/+/, '');
		if (!normalized) {
			return;
		}

		const { packageName } = resolveNodeModulesPackageBoundary(normalized, projectRoot);
		if (!packageName || !isLikelyNativeScriptRuntimePluginSpecifier(packageName, projectRoot)) {
			return;
		}

		if (isRuntimePluginRootEntrySpecifier(normalized, projectRoot)) {
			rootEntryPackages.add(packageName);
			return;
		}

		nonRootSubpathPackages.add(packageName);
	};

	for (const pattern of [PAT.IMPORT_PATTERN_1, PAT.IMPORT_PATTERN_2, PAT.IMPORT_PATTERN_3, PAT.IMPORT_PATTERN_SIDE_EFFECT]) {
		pattern.lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(code)) !== null) {
			visitSpecifier(match[2]);
		}
	}

	return new Set(Array.from(nonRootSubpathPackages).filter((packageName) => rootEntryPackages.has(packageName)));
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

	// Remove Vite client and hot module noise
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '');
	result = result.replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');
	// Keep import.meta.hot call sites; runtime now provides a stable import.meta.hot.

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
	result = result.replace(PAT.VITE_CLIENT_IMPORT, '').replace(PAT.IMPORT_META_HOT_ASSIGNMENT, '');

	// Clean up HMR noise
	result = strategy.postClean?.(result) ?? result;
	result = stripCoreGlobalsImports(result);

	return result;
}

// Application import helpers

/**
 * Check if a path is an application module (not node_modules, not vendor, not relative)
 * This is generic and works for ANY project structure.
 *
 * Examples of application imports: /core/v4/store.ts, /src/utils/helper.ts, /custom/module.ts
 * Examples of NON-application imports: node_modules/..., ~/vendor.mjs, ./relative.ts, ../parent.ts
 */
function isApplicationImport(importPath: string): boolean {
	if (!importPath.startsWith('/')) {
		return false; // Relative paths (./..., ../...) are not application imports
	}

	// Exclude node_modules and special paths
	if (importPath.includes('node_modules') || importPath.startsWith('/@') || importPath.startsWith('~/')) {
		return false;
	}

	return true;
}

function stripToProjectRelative(importPath: string, projectRoot?: string): string {
	if (!importPath) {
		return '';
	}

	let normalized = importPath.replace(/\\/g, '/');
	normalized = normalized.replace(/^\/?@fs\//, '/');
	if (normalized.startsWith('file://')) {
		normalized = normalized.replace(/^file:\/\//, '/');
	}

	const documentsMarker = '/Documents/';
	const documentsIndex = normalized.indexOf(documentsMarker);
	if (documentsIndex !== -1) {
		return normalized.substring(documentsIndex + documentsMarker.length);
	}

	if (projectRoot) {
		const normalizedRoot = projectRoot.replace(/\\/g, '/').replace(/\/+$/, '');
		const rootIndex = normalized.indexOf(normalizedRoot);
		if (rootIndex !== -1) {
			const sliced = normalized.substring(rootIndex + normalizedRoot.length);
			return sliced.replace(/^\/+/, '');
		}
	}

	return normalized.replace(/^\/+/, '');
}

/**
 * Convert absolute application import to relative .mjs path for Documents folder
 * /core/v4/store.ts → ./core/v4/store.mjs
 */
function getProjectRelativeImportPath(importPath: string, projectRoot?: string): string | null {
	if (!importPath) {
		return null;
	}

	let normalized = importPath.replace(PAT.QUERY_PATTERN, '');
	normalized = normalized.replace(/\\/g, '/');
	if (normalized.startsWith('file://')) {
		normalized = normalized.replace(/^file:\/\//, '/');
	}

	const documentsMarker = '/Documents/';
	const documentsIndex = normalized.indexOf(documentsMarker);
	if (documentsIndex !== -1) {
		normalized = normalized.substring(documentsIndex + documentsMarker.length);
	} else if (projectRoot) {
		const normalizedRoot = projectRoot.replace(/\\/g, '/').replace(/\/+$/, '');
		const rootIndex = normalized.indexOf(normalizedRoot);
		if (rootIndex !== -1) {
			normalized = normalized.substring(rootIndex + normalizedRoot.length);
		}
	}

	normalized = normalized.replace(/^\/+/, '');
	if (!normalized) {
		return null;
	}
	if (normalized.startsWith('dep-')) {
		return null;
	}
	if (normalized.startsWith('sfc-')) {
		return null;
	}

	normalized = path.posix.normalize(normalized);
	if (!normalized) {
		return null;
	}

	normalized = normalized.replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '.mjs');
	if (!normalized.endsWith('.mjs')) {
		normalized = `${normalized}.mjs`;
	}

	return normalized.replace(/^\/+/, '');
}

function toAppModuleBaseId(importPath: string, projectRoot?: string): string | null {
	const projectRelative = getProjectRelativeImportPath(importPath, projectRoot);
	if (!projectRelative) {
		return null;
	}
	const base = projectRelative.replace(/\.mjs$/i, '');
	return `/${base}`;
}

function toNodeModulesHttpModuleId(importPath: string): string | null {
	const nodeModulesSpecifier = normalizeNodeModulesSpecifier(importPath);
	if (!nodeModulesSpecifier) {
		return null;
	}
	return `/ns/m/node_modules/${nodeModulesSpecifier}`;
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
		`if (typeof globalThis.process === "undefined" || globalThis.process === null) { globalThis.process = { env: ${__processEnvJson} }; } else if (!globalThis.process.env) { globalThis.process.env = ${__processEnvJson}; }`,
		'const __ANDROID__ = globalThis.__ANDROID__ !== undefined ? globalThis.__ANDROID__ : false;',
		'const __IOS__ = globalThis.__IOS__ !== undefined ? globalThis.__IOS__ : false;',
		'const __VISIONOS__ = globalThis.__VISIONOS__ !== undefined ? globalThis.__VISIONOS__ : false;',
		'const __APPLE__ = globalThis.__APPLE__ !== undefined ? globalThis.__APPLE__ : (__IOS__ || __VISIONOS__);',
		'const __DEV__ = globalThis.__DEV__ !== undefined ? globalThis.__DEV__ : false;',
		'const __COMMONJS__ = globalThis.__COMMONJS__ !== undefined ? globalThis.__COMMONJS__ : false;',
		'const __NS_WEBPACK__ = globalThis.__NS_WEBPACK__ !== undefined ? globalThis.__NS_WEBPACK__ : false;',
		'const __NS_ENV_VERBOSE__ = globalThis.__NS_ENV_VERBOSE__ !== undefined ? !!globalThis.__NS_ENV_VERBOSE__ : false;',
		"const __CSS_PARSER__ = globalThis.__CSS_PARSER__ !== undefined ? globalThis.__CSS_PARSER__ : 'css-tree';",
		'const __UI_USE_XML_PARSER__ = globalThis.__UI_USE_XML_PARSER__ !== undefined ? globalThis.__UI_USE_XML_PARSER__ : true;',
		'const __UI_USE_EXTERNAL_RENDERER__ = globalThis.__UI_USE_EXTERNAL_RENDERER__ !== undefined ? globalThis.__UI_USE_EXTERNAL_RENDERER__ : false;',
		'const __TEST__ = globalThis.__TEST__ !== undefined ? globalThis.__TEST__ : false;',
	];
	result = allGlobals.join('\n') + '\n' + result;
	const nodeModuleProvenancePrelude = buildNodeModuleProvenancePrelude(sourceId);
	if (nodeModuleProvenancePrelude) {
		result = nodeModuleProvenancePrelude + result;
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
			result = astNormalizeModuleImportsAndHelpers(result);
		} catch {}

		// Verify there are no duplicate top-level const/let bindings after AST normalization
		try {
			result = astVerifyAndAnnotateDuplicates(result);
		} catch {}
	}

	// If AST marker present OR this is a node_modules file, skip regex-based helper
	// alias injection. Library code should NOT get /ns/rt destructures injected —
	// underscore-prefixed identifiers in libraries are internal variables, not NS helpers.
	if (!isNodeModule && !/^\s*(?:\/\/|\/\*) \[ast-normalized\]/m.test(result)) {
		try {
			const underscored = new Set<string>();
			const re = /(^|[^.\w$])_([A-Za-z]\w*)\b/g;
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

	// Remove Vite internal imports (dynamic-import-helper, etc.)
	// This handles both standalone lines and concatenated imports on the same line
	result = result.replace(/import\s+[^;]+\s+from\s+["']\/@id\/[^"']*["'];?\s*/g, '');
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

// Assert that sanitized code no longer contains any Vite optimized deps artifacts
// or virtual ids that could break the HTTP ESM loader on device. Throws with
// a helpful diagnostics message if any are found.
/**
 * THE SINGLE REWRITE FUNCTION - used everywhere for consistency
 */
export function rewriteImports(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp: boolean = false): string {
	let result = code;
	// Pre-normalize concatenated imports onto their own lines.
	//
	// Babel's `genCode(ast, { retainLines: true })` in
	// `astNormalizeModuleImportsAndHelpers` (which runs before us in the SFC
	// asm pipeline, and in several other hot paths) can emit multiple
	// statements on a single line, e.g.:
	//   `} = __ns_rt_ns_1;import { $goTo } from "../utils";import PageWrapper from ...;`
	//
	// IMPORT_PATTERN_1/_2/_3/SIDE_EFFECT all anchor on `(?:^|\n)\s*import`,
	// so any import past the first one on a single line is silently dropped
	// by the rewriter. Downstream that leaves bare relative specifiers like
	// `../utils` to be resolved by the iOS HTTP ESM loader, which interprets
	// them relative to the `/ns/asm/0?path=...` URL and 404s on the
	// resulting `/ns/utils`. Splitting `;import` onto its own line makes the
	// existing patterns match every import, restoring the rewrite contract.
	//
	// Mirrors the same normalization already performed in
	// `core-sanitize.ts::normalizeStrayCoreStringLiterals` (`;\s*import` →
	// `;\nimport`) but applied universally at the rewriter entry point so
	// every caller benefits without having to opt in.
	result = result.replace(/;\s*import\s+/g, ';\nimport ');
	const httpOriginSafe = httpOrigin;
	const mixedRuntimePluginHttpRootPackages = collectMixedRuntimePluginHttpRootPackages(result, projectRoot);
	const isDynamicImportPrefix = (prefix: string): boolean => /import\(\s*["']?$/.test(prefix.trimStart());
	const importerDir = path.posix.dirname(importerPath);
	// Resolved once per `rewriteImports` call so the per-import `/@fs/` rewriter
	// can convert workspace-lib paths back into our `/ns/m/` pipeline. Memoized
	// upstream — calling here is cheap and we reuse the value below.
	const monorepoWorkspaceRootForRewrite = getMonorepoWorkspaceRoot(projectRoot);
	// Determine importer output relative path (project-relative .mjs) to compute relative imports consistently
	const importerOutRel = outputDirOverrideRel || getProjectRelativeImportPath(importerPath, projectRoot) || stripToProjectRelative(importerPath, projectRoot).replace(/\.(ts|js|tsx|jsx|mjs|mts|cts)$/i, '.mjs');
	const importerOutDir = importerOutRel ? path.posix.dirname(importerOutRel) : '';
	const ensureRel = (p: string) => (p.startsWith('.') ? p : `./${p}`);
	const isNsSfcSpecifier = (spec: string): boolean => /^(?:https?:\/\/[^/]+)?\/ns\/sfc(?:\/\d+)?(?:\/|$)/.test(spec.replace(PAT.QUERY_PATTERN, ''));

	// Normalize all @nativescript/core imports to the unified HTTP ESM core bridge to guarantee a single realm on device
	try {
		let coreAliasIdx = 0;
		const mkAlias = () => `__NSC${coreAliasIdx++}`;
		// Use the canonical PATH form `/ns/core/<sub>`. The iOS HTTP ESM
		// loader caches module records by URL string — every emitter
		// (`buildCoreUrl()` / `buildCoreUrlPath()`, the runtime import map,
		// vendor `require()` shims, app-side rewrites, the cold-boot
		// preload in `entry-runtime.ts`) MUST produce the same byte
		// string for the same logical core subpath. A divergence creates
		// two distinct V8 module records for the same source. Each gets
		// its own class
		// identities (TextBase, View, etc.), and side-effect patches
		// applied to one (e.g. @nativescript-community/text's
		// `TextBase.prototype.setTextDecorationAndTransform` override
		// installed when vendor.mjs evaluates `overrideSpanAndFormattedString()`
		// from `@nativescript-community/ui-label/index-common.js`) are
		// invisible to the other — manifesting as inconsistent line-height /
		// letter-spacing rendering between HMR and no-HMR.
		//
		// Mirrors `normalizeCoreSub()` (helpers/ns-core-url.ts) so the URL
		// produced here is byte-identical to what `buildCoreUrl()` produces
		// for the bundle entry, import map, and external-urls plugin.
		// Delegate to the ONE canonical URL builder so every emitter (this
		// rewriter, core-sanitize, the runtime import map, the ns-core-external-urls
		// build plugin, and main-entry) produces byte-identical URLs for
		// the same logical core module. Any drift here would re-introduce
		// the realm-split bug.
		const coreUrl = (sub?: string) => (httpOriginSafe ? buildCoreUrl(httpOriginSafe, sub) : buildCoreUrlPath(sub));
		// Case 1: import { A, B } from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s*\{\s*([^}]+?)\s*\}\s*from\s+["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, names: string, sub: string) => {
			const alias = mkAlias();
			const url = coreUrl(sub || '');
			const cleaned = names
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.join(', ');
			return `${pfx}import * as ${alias} from ${JSON.stringify(url)};\nconst { ${cleaned} } = ${alias};`;
		});
		// Case 2: import Default, { A, B } from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+?)\s*\}\s*from\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, defName: string, names: string, sub: string) => {
			const alias = mkAlias();
			const url = coreUrl(sub || '');
			const cleaned = names
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.join(', ');
			return `${pfx}import * as ${alias} from ${JSON.stringify(url)};\nconst ${defName} = (${alias}.default || ${alias});\nconst { ${cleaned} } = ${alias};`;
		});
		// Case 3: import Default from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s+([A-Za-z_$][\w$]*)\s+from\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, defName: string, sub: string) => {
			const alias = mkAlias();
			const url = coreUrl(sub || '');
			return `${pfx}import * as ${alias} from ${JSON.stringify(url)};\nconst ${defName} = (${alias}.default || ${alias});`;
		});
		// Case 4: import * as NS from '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, nsName: string, sub: string) => {
			const url = coreUrl(sub || '');
			return `${pfx}import * as ${nsName} from ${JSON.stringify(url)};`;
		});
		// Case 5: side-effect import '@nativescript/core[/sub]'
		result = result.replace(/(^|\n)\s*import\s*["']@nativescript\/core([^"'\n]*)["'];?/g, (_m, pfx: string, sub: string) => {
			const url = coreUrl(sub || '');
			return `${pfx}import ${JSON.stringify(url)};`;
		});
		// Case 6: dynamic import('@nativescript/core[/sub]')
		result = result.replace(/import\(\s*["']@nativescript\/core([^"'\n]*)["']\s*\)/g, (_m, sub: string) => {
			const url = coreUrl(sub || '');
			return `import(${JSON.stringify(url)})`;
		});
	} catch {}

	// Inline JSON imports (package.json, config.json, etc.)
	// This must happen BEFORE other rewrites because JSON imports get a ?import query added by Vite
	result = result.replace(/import\s+(\w+)\s+from\s+["']([^"']+\.json(?:\?[^"']*)?)["'];?/g, (match, varName, jsonPath) => {
		try {
			// Remove query params like ?import
			const cleanPath = jsonPath.split('?')[0];

			// Resolve the JSON file path relative to the importer
			let fullPath: string;
			if (cleanPath.startsWith('/@fs/')) {
				// Vite filesystem URL: `/@fs/<abs-path>`. Strip the `/@fs` prefix
				// (4 chars, leaving the leading `/`) to recover the absolute
				// path. This matches `rewriteFsAbsoluteToNsM`'s convention and
				// covers both bare specifiers Vite pre-resolved out of the
				// project root (e.g. `emojibase-data/en/compact.json` →
				// `/@fs/.../node_modules/.../compact.json`) and tsconfig
				// path-alias targets that resolve outside the project root
				// (e.g. `~shared/...metadata.json` → `/@fs/.../tools/...json`).
				// Without this branch the next `else if` would `path.join` the
				// `/@fs/...` URL onto `projectRoot`, collapsing the leading `/`
				// and producing a malformed nested path that always misses on
				// `existsSync` and triggers a `ReferenceError` at runtime when
				// the JSON-import-failed comment leaves the binding undefined.
				fullPath = cleanPath.slice('/@fs'.length);
			} else if (cleanPath.startsWith('/')) {
				// Absolute from project root
				fullPath = path.join(projectRoot, cleanPath);
			} else if (cleanPath.startsWith('./') || cleanPath.startsWith('../')) {
				// Relative to importer - resolve from importer's location in project
				const importerFullPath = path.join(projectRoot, importerDir);
				fullPath = path.resolve(importerFullPath, cleanPath);
			} else {
				// Skip node_modules JSON imports
				return match;
			}

			if (existsSync(fullPath)) {
				const jsonContent = readFileSync(fullPath, 'utf-8');
				if (verbose) {
					console.log(`[rewrite] JSON inline: ${jsonPath} → const ${varName} = {...}`);
				}
				// Inline the JSON as a const declaration
				return `const ${varName} = ${jsonContent};`;
			} else {
				console.warn(`[rewrite] JSON file not found: ${fullPath} (specifier=${jsonPath})`);
			}
		} catch (error) {
			console.warn(`[rewrite] Could not inline JSON import: ${jsonPath}`, error);
		}

		// If we can't inline it, remove the import to prevent runtime errors
		// The code will fail with "varName is not defined" which is more debuggable
		return `/* JSON import failed: ${match} */`;
	});

	// Helper to resolve .vue file imports to absolute project paths
	const resolveVueKey = (spec: string): string | null => {
		if (!spec || typeof spec !== 'string') {
			return null;
		}

		// Only process .vue files
		if (!PAT.VUE_FILE_PATTERN.test(spec)) {
			return null;
		}

		let key: string;
		if (spec.startsWith('/')) {
			key = spec;
		} else if (spec.startsWith('./') || spec.startsWith('../')) {
			key = path.posix.normalize(path.posix.join(importerDir, spec));
			if (!key.startsWith('/')) key = '/' + key;
		} else {
			return null;
		}

		// Strip query params
		key = key.replace(PAT.QUERY_PATTERN, '');
		return key;
	};

	// Replacement function for all imports
	const replaceVueImport = (_match: string, prefix: string, spec: string, suffix: string): string => {
		// Safety check
		if (!spec || typeof spec !== 'string') {
			return `${prefix}${spec}${suffix}`;
		}

		// Guard 0: leave fully-qualified HTTP(S) URLs alone
		if (/^https?:\/\//.test(spec)) {
			return `${prefix}${spec}${suffix}`;
		}

		// Guard: anomalous bare '@' spec should be rewritten to a safe stub module.
		// This can surface from upstream alias mishaps; mapping it here avoids device-side
		// "instantiate failed @" errors.
		if (spec === '@') {
			const stub = `/ns/m/__invalid_at__.mjs`;
			if (verbose) {
				console.warn(`[rewrite] mapped bare '@' spec to stub: ${stub}`);
			}
			return `${prefix}${stub}${suffix}`;
		}

		spec = normalizeNativeScriptCoreSpecifier(spec);

		// Pull `/@fs/<abs-path>` URLs back into the `/ns/m/` pipeline so they
		// hit our CJS/UMD-wrapping handler. Vite emits `/@fs/...` for any
		// resolved id outside the configured `root` — including hoisted
		// `node_modules/<pkg>` entries and workspace libs in monorepos. Left
		// untouched, the device fetches them through Vite's standard
		// middleware which never invokes `wrapCommonJsModuleForDevice`, so a
		// UMD module like papaparse crashes on `(this).Papa = factory()`
		// because top-level `this` is `undefined` in ESM context.
		if (spec.startsWith('/@fs/')) {
			const rewritten = rewriteFsAbsoluteToNsM(spec, projectRoot, monorepoWorkspaceRootForRewrite);
			if (rewritten) {
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${rewritten}${suffix}`;
				}
				return `${prefix}${rewritten}${suffix}`;
			}
			// Path resolves outside both roots — leave Vite's URL alone as a
			// last resort. The original behaviour was to fall through here
			// and let downstream branches (e.g. `normalizeNodeModulesSpecifier`)
			// handle paths whose abs form happens to contain `/node_modules/`,
			// so preserve that for the unrewritable case below.
		}

		// Route Vite virtual modules (/@solid-refresh, etc.) through /ns/m/ so their
		// internal imports (e.g. solid-js) get vendor-rewritten by our pipeline.
		// Skip known Vite internals (/@vite/, /@id/) which are handled elsewhere.
		// `/@fs/` is intentionally excluded above; if we ever reach here with a
		// `/@fs/` spec it means the rewrite-to-`/ns/m/` pass couldn't anchor it
		// under projectRoot or workspaceRoot, so we fall through and rely on the
		// `normalizeNodeModulesSpecifier` branch below for paths that still
		// contain a `/node_modules/<pkg>/` segment.
		if (spec.startsWith('/@') && !/^\/@(?:vite|id|fs)\//.test(spec)) {
			const out = `/ns/m${spec}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${out}${suffix}`;
			}
			return `${prefix}${out}${suffix}`;
		}

		// Route internal NS endpoints to absolute HTTP origin for device
		if (spec.startsWith('/ns/')) {
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${spec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
		}

		if (isNativeScriptCoreModule(spec)) {
			return `${prefix}${spec}${suffix}`;
		}

		const nodeModulesSpecifier = normalizeNodeModulesSpecifier(spec);
		const normalizedRuntimePluginSpec = nodeModulesSpecifier || spec.replace(PAT.QUERY_PATTERN, '').replace(/^\/+/, '');
		if (normalizedRuntimePluginSpec && mixedRuntimePluginHttpRootPackages.size > 0) {
			const { packageName } = resolveNodeModulesPackageBoundary(normalizedRuntimePluginSpec, projectRoot);
			if (packageName && mixedRuntimePluginHttpRootPackages.has(packageName)) {
				const httpNodeModulesSpecifier = nodeModulesSpecifier || normalizedRuntimePluginSpec;
				const httpSpec = `/ns/m/node_modules/${httpNodeModulesSpecifier}`;
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
				}
				return `${prefix}${httpSpec}${suffix}`;
			}
		}

		if (shouldPreserveBareRuntimePluginSubpathImport(spec, projectRoot)) {
			const httpSpec = `/ns/m/node_modules/${spec.replace(PAT.QUERY_PATTERN, '').replace(/^\/+/, '')}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
			}
			return `${prefix}${httpSpec}${suffix}`;
		}

		// ── Node modules routing ──────────────────────────────────────
		// Uses the package's own package.json exports field to determine
		// whether an import is the main entry (→ vendor bridge) or a
		// subpath entry (→ HTTP). This replaces the old heuristic-based
		// approach that tried to guess from file paths.
		if (nodeModulesSpecifier) {
			const vendorRouting = resolveVendorRouting(nodeModulesSpecifier, projectRoot);
			if (vendorRouting) {
				if (vendorRouting.route === 'vendor') {
					return `${prefix}${vendorRouting.bareSpec}${suffix}`;
				}
				// Vendor package but subpath/platform-specific → HTTP
				const httpSpec = `/ns/m/node_modules/${nodeModulesSpecifier}`;
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
				}
				return `${prefix}${httpSpec}${suffix}`;
			}
			// Not a vendor package → serve via HTTP from Vite dev server
			const httpSpec = `/ns/m/node_modules/${nodeModulesSpecifier}`;
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
			}
			return `${prefix}${httpSpec}${suffix}`;
		}

		// Handle .vue imports
		if (PAT.VUE_FILE_PATTERN.test(spec)) {
			// Case A: SFC submodule variant (template/script) must keep its query to avoid self-import cycles.
			const isVueVariant = /\bvue&type=/.test(spec);
			if (isVueVariant) {
				// Preserve the full ?vue&type=... query and route via /ns/sfc so sanitation applies
				const qIdx = spec.indexOf('?');
				const base = qIdx !== -1 ? spec.slice(0, qIdx) : spec;
				const query = qIdx !== -1 ? spec.slice(qIdx) : '';
				// Resolve to absolute project path if relative
				let abs = base;
				if (!abs.startsWith('/')) {
					const joined = path.posix.normalize(path.posix.join(importerDir, abs));
					abs = joined.startsWith('/') ? joined : `/${joined}`;
				}
				const out = `/ns/sfc${abs}${query}`;
				if (verbose) {
					console.log(`[rewrite] .vue variant routed (http): ${spec} → ${out}`);
				}
				return `${prefix}${out}${suffix}`;
			}
			// Case B: plain .vue module → rewrite to SFC endpoint or local artifact
			const vueKey = resolveVueKey(spec.replace(PAT.QUERY_PATTERN, '')) || '';
			if (vueKey) {
				if (true) {
					const absVue = vueKey.startsWith('/') ? vueKey : '/' + vueKey;
					const out = `/ns/sfc${absVue}`;
					if (verbose) {
						console.log(`[rewrite] .vue rewrite (http): ${spec} → ${out}`);
					}
					return `${prefix}${out}${suffix}`;
				} else {
					const vueFile = sfcFileMap.get(vueKey);
					if (vueFile) {
						const target = `_ns_hmr/${APP_ROOT_DIR}/sfc/${vueFile}`;
						const relPath = importerOutDir ? ensureRel(path.posix.relative(importerOutDir, target)) : ensureRel(target);
						if (verbose) {
							console.log(`[rewrite] .vue rewrite: ${spec} → ${relPath}`);
						}
						return `${prefix}${relPath}${suffix}`;
					} else if (verbose) {
						console.log(`[rewrite] .vue NOT in sfcFileMap: ${vueKey}`);
					}
				}
			}
			return `${prefix}${spec}${suffix}`;
		}

		// Rewrite relative application imports to HTTP for served modules
		if (spec.startsWith('./') || spec.startsWith('../')) {
			const absMaybe = normalizeImportPath(spec, importerDir);
			const nodeModulesHttpSpec = absMaybe ? toNodeModulesHttpModuleId(absMaybe) : null;
			if (nodeModulesHttpSpec) {
				if (isDynamicImportPrefix(prefix)) {
					if (verbose) console.log(`[rewrite][http] dynamic relative node_modules import → ${nodeModulesHttpSpec} (from ${spec})`);
					return `__nsDynamicHmrImport(${JSON.stringify(nodeModulesHttpSpec)})`;
				}
				if (verbose) console.log(`[rewrite][http] relative node_modules import → ${nodeModulesHttpSpec} (from ${spec})`);
				return `${prefix}${nodeModulesHttpSpec}${suffix}`;
			}
			const baseId = absMaybe ? toAppModuleBaseId(absMaybe, projectRoot) : null; // e.g. /src/foo.mjs
			if (baseId) {
				const httpSpec = `/ns/m${baseId}`;
				if (isDynamicImportPrefix(prefix)) {
					if (verbose) console.log(`[rewrite][http] dynamic relative app import → ${httpSpec} (from ${spec})`);
					return `__nsDynamicHmrImport(${JSON.stringify(httpSpec)})`;
				}
				if (verbose) console.log(`[rewrite][http] relative app import → ${httpSpec} (from ${spec})`);
				return `${prefix}${httpSpec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
		}
		// Note: Do NOT rewrite bare application specifiers (e.g. "core/foo").
		// These will be inlined during bundleDependenciesInline() to avoid static HTTP imports on device.
		if (isApplicationImport(spec)) {
			const baseId = toAppModuleBaseId(spec, projectRoot);
			if (baseId) {
				const httpSpec = `/ns/m${baseId}`;
				if (isDynamicImportPrefix(prefix)) {
					if (verbose) console.log(`[rewrite][http] dynamic app import → ${httpSpec} (from ${spec})`);
					return `__nsDynamicHmrImport(${JSON.stringify(httpSpec)})`;
				}
				if (verbose) console.log(`[rewrite][http] absolute app import → ${httpSpec} (from ${spec})`);
				return `${prefix}${httpSpec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
		}

		// In HTTP mode, avoid rewriting to dep-*.mjs; let imports resolve via server endpoints
		const depKey = normalizeImportPath(spec, importerDir);
		if (depKey && !httpOriginSafe) {
			if (isNativeScriptCoreModule(depKey)) {
				return `${prefix}${spec}${suffix}`;
			}
			if (isNativeScriptPluginModule(depKey)) {
				return `${prefix}${spec}${suffix}`;
			}
			const depFile = findDependencyFileName(depFileMap, depKey);
			if (depFile) {
				if (verbose) {
					console.log(`[rewrite] dep import: ${spec} → ./${depFile}`);
				}
				return `${prefix}./${depFile}${suffix}`;
			}
		}

		// ── Bare specifier vendor routing ────────────────────────────
		// Bare specifiers like `pinia`, `dayjs`, `lodash` never reach
		// the `nodeModulesSpecifier` branch above because
		// `normalizeNodeModulesSpecifier` keys on a literal
		// `/node_modules/` segment in the path. Without this check
		// they'd fall straight into the HTTP fallback below and get
		// rewritten to `/ns/m/node_modules/<spec>`, which serves the
		// package source over HTTP and bypasses the device-side import
		// map's `<pkg>` → `ns-vendor://<pkg>` entry. For CJS/UMD
		// packages (e.g. Pinia) the bare HTTP path doesn't expose the
		// full named-exports surface (only the default export round-
		// trips), so consumers like
		// `import { defineStore } from "pinia"` blow up at instantiate
		// time with `SyntaxError: ... does not provide an export named
		// 'defineStore'`. Preserving the bare spec lets the vendor
		// bridge serve it from the prebuilt `bundle.mjs`, which already
		// re-exports the full CJS surface. Subpath imports
		// (`pinia/plugins/foo`) intentionally fall through to the
		// HTTP fallback — `resolveVendorRouting` returns
		// `{ route: 'http' }` for non-main-entry subpaths even when the
		// root package is in the manifest, mirroring the
		// `nodeModulesSpecifier` branch.
		if (spec && !spec.startsWith('/') && !spec.startsWith('./') && !spec.startsWith('../') && !/^https?:\/\//i.test(spec) && !spec.startsWith('ns-vendor:') && !spec.startsWith('@nativescript/core')) {
			const bareNpmRe = /^(?:@[A-Za-z0-9][\w.-]*\/)?[A-Za-z0-9][\w.-]*(?:\/[\w.\-/]+)?$/;
			if (bareNpmRe.test(spec)) {
				const bareVendorRouting = resolveVendorRouting(spec, projectRoot);
				if (bareVendorRouting?.route === 'vendor') {
					if (verbose) {
						console.log(`[rewrite] bare vendor import: ${spec} → ${bareVendorRouting.bareSpec}`);
					}
					return `${prefix}${bareVendorRouting.bareSpec}${suffix}`;
				}
			}
		}

		// Bare npm package specifier fallback — route to /ns/m/node_modules/.
		// This catches specifiers like `source-map-js/lib/source-map-generator.js`
		// emitted by helpers such as the CommonJS compat transform, which Vite
		// would normally resolve to an absolute path but which pass through the
		// rewriter as bare strings here. Under HMR (core external) bundle.mjs
		// depends on these resolving over HTTP rather than via a filesystem
		// bare-specifier lookup, which iOS can't satisfy and which crashes with
		// "Module not found".
		if (spec && !spec.startsWith('/') && !spec.startsWith('./') && !spec.startsWith('../') && !/^https?:\/\//i.test(spec) && !spec.startsWith('ns-vendor:') && !spec.startsWith('@nativescript/core')) {
			// Only treat as a package spec if it looks like one — disallow
			// plain identifiers like `moment` unresolved (those are left alone
			// for existing vendor-routing paths to handle).
			const bareNpmRe = /^(?:@[A-Za-z0-9][\w.-]*\/)?[A-Za-z0-9][\w.-]*(?:\/[\w.\-/]+)?$/;
			if (bareNpmRe.test(spec)) {
				const httpSpec = `/ns/m/node_modules/${spec}`;
				if (httpOriginSafe) {
					return `${prefix}${httpOriginSafe}${httpSpec}${suffix}`;
				}
				return `${prefix}${httpSpec}${suffix}`;
			}
		}

		// Leave everything else unchanged (vendor imports, etc.)
		return `${prefix}${spec}${suffix}`;
	};

	// Apply to all import/export patterns (but only .vue files will be rewritten)
	result = result.replace(PAT.IMPORT_PATTERN_1, replaceVueImport);
	result = result.replace(PAT.IMPORT_PATTERN_2, replaceVueImport);
	result = result.replace(PAT.EXPORT_PATTERN, replaceVueImport);
	result = result.replace(PAT.IMPORT_PATTERN_3, replaceVueImport);
	// Side-effect imports (import "spec") — must run AFTER named-import patterns
	// since IMPORT_PATTERN_1 already handles `import ... from "spec"`.
	result = result.replace(PAT.IMPORT_PATTERN_SIDE_EFFECT, replaceVueImport);
	result = ensureDynamicHmrImportHelper(result);

	// Extra guard: map any lingering dynamic import('@') to a safe stub module path
	// to prevent device runtime normalization errors.
	// Example matched: import('@') or import("@") with optional whitespace before closing paren
	result = result.replace(/(import\(\s*['"])@(['"]\s*\))/g, (_m) => {
		const stubExpr = `import(new URL('/ns/m/__invalid_at__.mjs', import.meta.url).href)`;
		if (verbose) {
			console.warn(`[rewrite] mapped dynamic import('@') to /ns/m/__invalid_at__.mjs via import.meta.url`);
		}
		return stubExpr;
	});

	// Also guard static spec forms that could erroneously be '@'
	// 1) ESM: import { x } from '@'
	result = result.replace(/(from\s*['"])@(['"])/g, (_m, p1: string, p2: string) => {
		const stub = `/ns/m/__invalid_at__.mjs`;
		if (verbose) {
			console.warn(`[rewrite] mapped static from '@' to ${stub}`);
		}
		return `${p1}${stub}${p2}`;
	});
	// 2) ESM side-effect: import '@'
	result = result.replace(/(import\s*(?!\()\s*['"])@(['"])/g, (_m, p1: string, p2: string) => {
		const stub = `/ns/m/__invalid_at__.mjs`;
		if (verbose) {
			console.warn(`[rewrite] mapped side-effect import '@' to ${stub}`);
		}
		return `${p1}${stub}${p2}`;
	});

	// Handle .vue imports with queries
	// In HTTP mode, skip legacy local-path rewrite to avoid mixing module origins
	result = result.replace(PAT.VUE_FILE_IMPORT, (_m, p1, spec, p3) => {
		if (httpOrigin) {
			if (isNsSfcSpecifier(spec)) {
				if (verbose) console.log(`[rewrite] .vue already routed (VUE_FILE_IMPORT http): ${spec}`);
				return `${p1}${spec}${p3}`;
			}
			// Route via /ns/sfc with full query preserved
			try {
				let base = spec;
				const qIdx = base.indexOf('?');
				const query = qIdx !== -1 ? base.slice(qIdx) : '';
				base = qIdx !== -1 ? base.slice(0, qIdx) : base;
				// Resolve relative to importerDir
				let abs = base;
				if (!abs.startsWith('/')) {
					const joined = path.posix.normalize(path.posix.join(importerDir, abs));
					abs = joined.startsWith('/') ? joined : '/' + joined;
				}
				const out = `/ns/sfc${abs}${query}`;
				if (verbose) console.log(`[rewrite] .vue variant routed (VUE_FILE_IMPORT http): ${spec} → ${out}`);
				return `${p1}${out}${p3}`;
			} catch {}
			return `${p1}${spec}${p3}`;
		}
		const vueKey = resolveVueKey(spec);
		if (vueKey) {
			const vueFile = sfcFileMap.get(vueKey);
			if (vueFile) {
				const target = `_ns_hmr/${APP_ROOT_DIR}/sfc/${vueFile}`;
				const relPath = importerOutDir ? ensureRel(path.posix.relative(importerOutDir, target)) : ensureRel(target);
				if (verbose) {
					console.log(`[rewrite] .vue rewrite (VUE_FILE_IMPORT): ${spec} → ${relPath}`);
				}
				return `${p1}${relPath}${p3}`;
			} else if (verbose) {
				console.log(`[rewrite] .vue NOT in sfcFileMap (VUE_FILE_IMPORT): ${vueKey}`);
			}
		}
		return `${p1}${spec}${p3}`;
	});

	// Final safeguard: normalize any remaining absolute filesystem dynamic imports to HTTP origin spec
	const absoluteDynamicPattern = /(import\(\s*["'])([^"']+)(["']\s*\))/g;
	result = result.replace(absoluteDynamicPattern, (match, _prefix, spec, _suffix) => {
		if (!spec || !spec.startsWith('/')) return match;
		// Handle internal NS endpoints
		if (spec.startsWith('/ns/')) {
			const expr = `import(new URL('${spec}', import.meta.url).href)`;
			if (verbose) console.log(`[rewrite][http] internal ns import (dynamic) → ${spec} via import.meta.url`);
			return expr;
		}
		const nodeModulesHttpSpec = toNodeModulesHttpModuleId(spec);
		if (nodeModulesHttpSpec) {
			const expr = `import(new URL('${nodeModulesHttpSpec}', import.meta.url).href)`;
			if (verbose) console.log(`[rewrite][http] absolute dynamic node_modules import → ${nodeModulesHttpSpec} via import.meta.url (from ${spec})`);
			return expr;
		}
		const baseId = toAppModuleBaseId(spec, projectRoot);
		if (!baseId) return match;
		const expr = `import(new URL('/ns/m${baseId}', import.meta.url).href)`;
		if (verbose) console.log(`[rewrite][http] absolute dynamic import → /ns/m${baseId} via import.meta.url (from ${spec})`);
		return expr;
	});

	return result;
}

// Re-exports for the plugin closure + the spec suites that import from `./websocket.js`.
export { processCodeForDevice, cleanCode, collectImportDependencies, shouldRemapImport, processSfcCode };
