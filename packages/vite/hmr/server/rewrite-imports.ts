// THE SINGLE import-rewrite function — used everywhere for consistency. Maps a
// served module's specifiers to device-reachable forms: the unified /ns/core
// bridge, /ns/m node_modules + app modules, /ns/sfc for Vue, vendor bare specs,
// inlined JSON, and import.meta.url-relative dynamic imports.
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import * as PAT from './constants.js';
import { getMonorepoWorkspaceRoot } from '../../helpers/project.js';
import { getProjectAppPath } from '../../helpers/utils.js';
import { buildCoreUrl, buildCoreUrlPath } from '../../helpers/ns-core-url.js';
import { resolveAngularCoreHmrImportSource, rewriteAngularEntryRegisterOnly } from '../frameworks/angular/server/websocket-angular-entry.js';
import { isNativeScriptCoreModule, isNativeScriptPluginModule, normalizeNativeScriptCoreSpecifier, normalizeNodeModulesSpecifier, resolveNodeModulesPackageBoundary, resolveVendorRouting, rewriteFsAbsoluteToNsM, shouldPreserveBareRuntimePluginSubpathImport } from './websocket-module-specifiers.js';
import { ensureDynamicHmrImportHelper } from './websocket-served-module-helpers.js';
import { collectMixedRuntimePluginHttpRootPackages, findDependencyFileName, getProjectRelativeImportPath, isApplicationImport, normalizeImportPath, stripToProjectRelative, toAppModuleBaseId, toNodeModulesHttpModuleId } from './device-transform-helpers.js';

const APP_ROOT_DIR = getProjectAppPath();

export function prepareAngularEntryForDevice(code: string, importerPath: string, sfcFileMap: Map<string, string>, depFileMap: Map<string, string>, projectRoot: string, verbose: boolean = false, outputDirOverrideRel?: string, httpOrigin?: string, resolveVendorAsHttp: boolean = false): string {
	const rewrittenCode = rewriteImports(code, importerPath, sfcFileMap, depFileMap, projectRoot, verbose, outputDirOverrideRel, httpOrigin, resolveVendorAsHttp);

	return rewriteAngularEntryRegisterOnly(rewrittenCode, resolveAngularCoreHmrImportSource(rewrittenCode, httpOrigin));
}

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

		// Vite 8 oxc runtime helpers (decorators etc.) — emitted as
		// `/@id/__x00__@oxc-project+runtime@<ver>/helpers/<name>.js`. These are
		// real dev-server URLs serving self-contained ESM, so just origin-prefix
		// them for the device; no /ns/m wrapping needed (processCodeForDevice
		// exempts them from the generic /@id/ strip for the same reason).
		if (spec.startsWith('/@id/__x00__@oxc-project+runtime')) {
			if (httpOriginSafe) {
				return `${prefix}${httpOriginSafe}${spec}${suffix}`;
			}
			return `${prefix}${spec}${suffix}`;
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
				// `.vue` modules are always rewritten to the `/ns/sfc` HTTP endpoint.
				const absVue = vueKey.startsWith('/') ? vueKey : '/' + vueKey;
				const out = `/ns/sfc${absVue}`;
				if (verbose) {
					console.log(`[rewrite] .vue rewrite (http): ${spec} → ${out}`);
				}
				return `${prefix}${out}${suffix}`;
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
				// `solid-js` is a hard singleton for the Solid flavor: it is kept
				// OUT of the vendor bundle (manifest-collect.ts) and pinned by the
				// framework strategy's import map to the canonical DEV build URL
				// `/ns/m/node_modules/solid-js/dist/dev.js` (see
				// frameworks/solid/server/strategy.ts → importMapEntries). App code
				// (resolve.alias in configuration/solid.ts) and vendor code
				// (externalized `import 'solid-js'` → import map) both converge on
				// that one URL, so V8 keeps a SINGLE reactive graph.
				//
				// Pre-built packages reached through the Solid JSX-runtime shim
				// (e.g. @tanstack/solid-router's `dist/source/*.jsx`,
				// @nativescript/tanstack-router/solid, and shims/solid-jsx-runtime
				// itself) import the bare root `solid-js`. Without this guard that
				// falls through to the generic `/ns/m/node_modules/solid-js`
				// package-ROOT URL, which is wrong twice over:
				//   1. It is a DIFFERENT URL string than the canonical
				//      `…/solid-js/dist/dev.js` every other importer uses. V8 keys
				//      ESM module records by URL, so the reactive core evaluates a
				//      SECOND time → "You appear to have multiple instances of
				//      Solid" + a dead second reactive graph.
				//   2. The package root resolves via solid-js's `module`/`node`
				//      export condition to `dist/server.js` (the SSR build), whose
				//      `createComponent` is an inert server stub. JSX created
				//      through the shim then never mounts → white screen.
				// Pin the exact root to the canonical dev URL so every importer
				// shares one module record. Subpaths (solid-js/web, /store,
				// /universal, /jsx-runtime) keep their own URLs and import the bare
				// root internally, which also lands here. Reached only after the
				// bare-vendor-routing block above, so a non-Solid project that
				// genuinely vendors solid-js is already handled and never gets here.
				const httpSpec = spec === 'solid-js' ? `/ns/m/node_modules/solid-js/dist/dev.js` : `/ns/m/node_modules/${spec}`;
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
