import { getPackageJson, getProjectFilePath, getProjectRootPath } from './project.js';
import fs from 'fs';
import path from 'path';
import { preprocessCSS, type ResolvedConfig, type ViteDevServer } from 'vite';
import { parseCssAst as parseCssToAst } from './css-ast.js';
import { getProjectFlavor } from './flavor.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath, resolveProjectGlobalCssPath } from './utils.js';
import { getResolvedAppComponents } from './app-components.js';
import { toStaticImportSpecifier } from './import-specifier.js';
import { resolveDeviceReachableOrigin } from './dev-host.js';
import { setAppCssState } from './app-css-state.js';
import { createAppCssRefresher } from './app-css-refresh.js';
import { rewritePlatformCssImports } from './css-platform-plugin.js';
import { NS_DEV_EXPR } from '../hmr/shared/runtime/dev-globals.js';
import { BUNDLE_CSS_AST_SENTINEL, inlineBundleCss } from './bundle-css.js';
// Switched to runtime modules to avoid fragile string injection and enable TS checks
const projectRoot = getProjectRootPath();
const appRootDir = getProjectAppPath();

// main entry (always included regardless of HMR)
const packageJson = getPackageJson();
const mainEntry = getProjectFilePath(packageJson.main);
// Normalize to a project-relative posix path (e.g., "/src/app.ts") for HTTP ESM boot
const mainEntryRelPosix = (() => {
	try {
		const rel = path.relative(projectRoot, mainEntry).replace(/\\/g, '/');
		return ('/' + rel).replace(/\/+/g, '/');
	} catch {
		return getProjectAppVirtualPath('app.ts');
	}
})();
const mainEntryImportSpecifier = toStaticImportSpecifier(projectRoot, mainEntry);
const flavor = getProjectFlavor() as string;

// Optional polyfills support (non-HMR specific but dev friendly)
// Resolve polyfills relative to the main entry directory so it works both for standalone projects and monorepos/workspaces where the workspace root and app root differ.
// We keep both the absolute filesystem path (for existsSync) and a project-root-relative POSIX path (for the import specifier used in Vite).
const mainEntryDir = path.dirname(mainEntry);
const polyfillsFsPath = path.resolve(mainEntryDir, 'polyfills.ts');
const polyfillsExists = fs.existsSync(polyfillsFsPath);
const polyfillsImportSpecifier = (() => {
	try {
		// Normalize to "/..." posix-style (similar to mainEntryRelPosix)
		const rel = path.relative(projectRoot, polyfillsFsPath).replace(/\\/g, '/');
		return ('/' + rel).replace(/\/+/g, '/');
	} catch {
		// Fallback to a simple relative specifier next to main entry
		return './polyfills.ts';
	}
})();

const VIRTUAL_ID = 'virtual:entry-with-polyfills';
const RESOLVED = '\0' + VIRTUAL_ID;

const APP_CSS_VIRTUAL_ID = 'virtual:ns-app-css';
const APP_CSS_RESOLVED = '\0' + APP_CSS_VIRTUAL_ID;

// Build-only applier for SFC `<style>` + JS/TS-imported `.css`/`.scss` that Vite
// extracts into a CSS asset. NativeScript has no DOM to `<link>` it, so the
// `--no-hmr` build would otherwise drop those styles (HMR applies them at
// runtime). `load` emits the apply with a sentinel; `generateBundle` rewrites it
// to the collected rework-CSS AST (the form `app.css` uses). Replaces the per-app
// `nsSfcStylesPlugin` workaround — apps no longer need their own.
const BUNDLE_CSS_VIRTUAL_ID = 'virtual:ns-bundle-css';
const BUNDLE_CSS_RESOLVED = '\0' + BUNDLE_CSS_VIRTUAL_ID;

// Virtual module that installs the XHR polyfill from @nativescript/core/xhr.
// Rolldown tree-shakes the polyfill-xhr.ts side-effect import from @nativescript/core/globals,
// so XMLHttpRequest never gets registered as a global. This dedicated module ensures the XHR
// polyfill is installed during module evaluation (before zone.js patches run).
const XHR_POLYFILL_VIRTUAL_ID = 'virtual:ns-xhr-polyfill';
const XHR_POLYFILL_RESOLVED = '\0' + XHR_POLYFILL_VIRTUAL_ID;

export function mainEntryPlugin(opts: { platform: 'ios' | 'android' | 'visionos'; isDevMode: boolean; verbose: boolean; hmrActive: boolean; useHttps: boolean; flavor?: string }) {
	let resolvedConfig: ResolvedConfig;
	// Prefer the flavor the active config DECLARES (threaded from baseConfig)
	// over deps-based detection: in workspaces whose app package.json doesn't
	// list the framework package (hoisted to the root), detection falls through
	// to 'typescript', whose entry imports ts-only virtual modules.
	const effectiveFlavor = opts.flavor || flavor;
	return {
		name: 'main-entry',
		configResolved(config: ResolvedConfig) {
			resolvedConfig = config;
		},
		// Fill the `virtual:ns-bundle-css` sentinel with the extracted CSS and drop
		// the orphan asset (non-HMR builds only; HMR delivers this CSS at runtime).
		generateBundle(_outputOptions: unknown, bundle: Record<string, any>) {
			if (opts.hmrActive) return;
			try {
				// Rework AST, position-stripped (the form app.css uses; ~halves size).
				const result = inlineBundleCss(bundle, (cssText) => JSON.stringify(parseCssToAst(cssText, { silent: true }), (key, value) => (key === 'position' ? undefined : value)));
				if (opts.verbose) {
					console.info(`[ns-entry] bundle CSS: ${result.assetCount} asset(s), ${result.bytes} bytes, applied=${result.replaced}`);
				}
			} catch (e: any) {
				if (opts.verbose) console.warn('[ns-entry] bundle CSS injection failed:', e?.message || e);
			}
		},
		// Warm chokidar with `app.css`'s @import dependency tree at
		// server startup. Without this, the FIRST save to a workspace
		// `@import` dep (e.g. `<repo>/libs/.../index.css`) is silently
		// dropped: nothing in the cold-boot path causes the dev server
		// to transform `app.css`, so `vite:css` never registers
		// `@import`-resolved deps with the watcher. Eagerly resolving
		// them here breaks the chicken-and-egg.
		//
		// We ALSO stash the resolved dep set on the server itself so
		// the HMR websocket handler can recognize when a non-CSS edit
		// (e.g. a `.html` template or `.ts` file scanned by Tailwind's
		// content config) should trigger a fresh `app.css` fetch. The
		// `preprocessCSS` deps include every file PostCSS reported as
		// a `dependency` message — for Tailwind 3 with content globs,
		// Vite's `compileCSS` expands the `dir-dependency` glob into
		// the individual file paths, so we get the full content set.
		//
		// `app.css` is NEVER a real Vite module in NS HMR (the virtual
		// `:ns-app-css` module re-runs `preprocessCSS` in its load
		// hook), so the standard moduleGraph `addWatchFile` →
		// `_addedImports` → file-only-entry-importer chain doesn't
		// populate, and `ctx.modules` for a content-file edit never
		// links back to a CSS module. The dep set fills that gap.
		configureServer(server: ViteDevServer) {
			if (server.config.command !== 'serve') return;
			// Prefer `app.css`, fall back to `styles.css` (common in web projects).
			const appCssPath = resolveProjectGlobalCssPath(projectRoot);
			if (!appCssPath) return;

			const normalizeFsPath = (p: string): string => path.resolve(p).replace(/\\/g, '/');
			const normalizedAppCssPath = normalizeFsPath(appCssPath);
			const watchedDeps = new Set<string>([normalizedAppCssPath]);

			// The refresher owns serialization, previous-output comparison, and the
			// startup baseline (see helpers/app-css-refresh.ts). This thunk owns the
			// generation itself plus the watcher/dep-set side effects of a scan.
			const generate = async (): Promise<string> => {
				const rawCode = fs.readFileSync(appCssPath, 'utf-8');
				// Same platform @import rewrite as the virtual:ns-app-css load hook —
				// this raw read also bypasses the ns-css-platform transform.
				const code = rewritePlatformCssImports(rawCode, path.dirname(appCssPath), opts.platform) ?? rawCode;
				const result = await preprocessCSS(code, appCssPath, server.config);
				server.watcher.add(appCssPath);
				const next = new Set<string>([normalizedAppCssPath]);
				for (const dep of result?.deps ?? []) {
					if (typeof dep === 'string' && dep) {
						server.watcher.add(dep);
						next.add(normalizeFsPath(dep));
					}
				}
				// Atomic-ish replace: clear + repopulate the existing
				// Set so any concurrent reader sees a consistent view
				// when iterating with `.has()`.
				watchedDeps.clear();
				for (const f of next) watchedDeps.add(f);
				return result?.code ?? '';
			};
			const refresh = createAppCssRefresher({ generate, verbose: opts.verbose });

			setAppCssState(server, { path: normalizedAppCssPath, deps: watchedDeps, refresh });

			void refresh();

			// Re-scan when `app.css` itself or a Tailwind config file
			// changes — Tailwind's content list and utility definitions
			// can both shift, so the dep set has to follow. Debounced
			// because watcher events for the same edit can fire in
			// quick succession (chokidar's atomic save handling).
			let pendingRefresh: NodeJS.Timeout | null = null;
			const scheduleRefresh = (): void => {
				if (pendingRefresh) clearTimeout(pendingRefresh);
				pendingRefresh = setTimeout(() => {
					pendingRefresh = null;
					void refresh();
				}, 50);
			};
			const isAppCssOrTailwindConfig = (file: string): boolean => {
				const normalized = normalizeFsPath(file);
				if (normalized === normalizedAppCssPath) return true;
				return /\/tailwind\.config\.[mc]?[jt]s$/.test(normalized);
			};
			server.watcher.on('change', (file) => {
				if (isAppCssOrTailwindConfig(file)) scheduleRefresh();
			});
			// `add`/`unlink` cover Tailwind's content set growing or
			// shrinking — new template files, deleted partials, etc.
			// Re-running `preprocessCSS` is the safest way to keep the
			// glob expansion accurate without re-implementing the
			// match.
			server.watcher.on('add', scheduleRefresh);
			server.watcher.on('unlink', scheduleRefresh);
		},
		resolveId(id: string) {
			if (id === VIRTUAL_ID) return RESOLVED;
			if (id === APP_CSS_VIRTUAL_ID) return APP_CSS_RESOLVED;
			if (id === BUNDLE_CSS_VIRTUAL_ID) return BUNDLE_CSS_RESOLVED;
			if (id === XHR_POLYFILL_VIRTUAL_ID) return XHR_POLYFILL_RESOLVED;
			return null;
		},
		async load(id: string) {
			// Bare `@nativescript/core[/sub]` specifier. Under HMR the
			// `ns-core-external-urls` build plugin externalizes it to its device URL.
			const coreSpec = (subpath?: string | null): string => {
				const sub = subpath ? String(subpath).replace(/^\/+/, '') : '';
				return sub ? `@nativescript/core/${sub}` : '@nativescript/core';
			};

			// Virtual module that processes app.css through PostCSS/Tailwind and emits a
			// JS module that BOTH applies the CSS as a side-effect AND exports the raw
			// CSS string as default.
			//
			// Background: Vite's default `?inline` CSS handling collides with
			// @analogjs/vite-plugin-angular's load hook in Vite 8 (it converts ?inline
			// CSS to JS without setting moduleType:'js', so vite:css still tries to run
			// PostCSS on the JS output). This virtual module sidesteps that.
			//
			// The default export is the raw CSS text: the served entry runtime's
			// fallback when no AST is available (`appCss` on the dev globals).
			//
			// We always pre-parse with rework `css` and either:
			//   - non-HMR: call `addTaggedAdditionalCSS(astJson, 'app.css')` directly
			//     so the bundled `style-scope` realm gets the styles before any view
			//     is created.
			//   - HMR: publish the AST as the dev globals' `appCssAst` so
			//     `installHttpCoreCssSupport` applies it via the SAME AST path in
			//     the served-core realm. Applying the raw text there goes through
			//     `cssTreeParse`, which renders differently from the rework AST
			//     (e.g. `.text-sm { line-height: 20 }` gains extra line spacing).
			//     Live HMR edits still arrive as raw text over the dev-server
			//     WebSocket, so `installHttpCoreCssSupport` keeps the raw-text path.
			if (id === APP_CSS_RESOLVED) {
				// Same resolver as the entry generator (app.css → styles.css fallback)
				// so both always pick the same file. Only reached when a global
				// stylesheet exists, but guard defensively against a mid-session delete.
				const appCssPath = resolveProjectGlobalCssPath(projectRoot);
				if (!appCssPath) {
					return { code: 'export default "";', moduleType: 'js' };
				}
				const rawCode = fs.readFileSync(appCssPath, 'utf-8');
				// Rewrite platform-suffixed @imports (foo.css -> foo.ios.css) BEFORE
				// preprocessCSS: this raw read bypasses the plugin transform chain, so
				// the ns-css-platform plugin never sees this content, and Vite's
				// internal postcss-import (which runs ahead of any user postcss
				// plugins) can't resolve the generic specifier on its own.
				const code = rewritePlatformCssImports(rawCode, path.dirname(appCssPath), opts.platform) ?? rawCode;
				const result = await preprocessCSS(code, appCssPath, resolvedConfig);
				const ast = parseCssToAst(result.code, { silent: true });
				// `css` emits `position` metadata on every AST node. NS doesn't
				// use it, and stripping it ~halves the inlined JSON size — same
				// thing webpack's css2json-loader does.
				const astJson = JSON.stringify(ast, (key, value) => (key === 'position' ? undefined : value));
				const lines: string[] = [];
				if (opts.hmrActive) {
					lines.push(`try { ${NS_DEV_EXPR}.appCssAst = ${astJson}; } catch {}`);
				} else {
					lines.push(`import { addTaggedAdditionalCSS } from ${JSON.stringify(coreSpec('ui/styling/style-scope'))};`, `addTaggedAdditionalCSS(${astJson}, 'app.css');`);
				}
				lines.push(`export default ${JSON.stringify(result.code)};`);
				return {
					code: lines.join('\n'),
					moduleType: 'js',
				};
			}
			// Emit the bundle-CSS apply with a sentinel that generateBundle fills in
			// (the CSS isn't known until then). No-op under HMR (dev server applies
			// it at runtime, and the entry skips this import in HMR mode).
			if (id === BUNDLE_CSS_RESOLVED) {
				if (opts.hmrActive) {
					return { code: 'export default "";', moduleType: 'js' };
				}
				return {
					code: [`import { addTaggedAdditionalCSS } from ${JSON.stringify(coreSpec('ui/styling/style-scope'))};`, `try { addTaggedAdditionalCSS(${JSON.stringify(BUNDLE_CSS_AST_SENTINEL)}, 'ns-bundle-css'); } catch (e) {}`, `export default "";`].join('\n'),
					moduleType: 'js',
				};
			}
			// Virtual module that installs XHR polyfill. Its module body runs during import evaluation,
			// guaranteeing XMLHttpRequest is on globalThis before zone.js or any other code accesses it.
			if (id === XHR_POLYFILL_RESOLVED) {
				return {
					code: [`import * as xhrImpl from ${JSON.stringify(coreSpec('xhr'))};`, "var polyfills = ['XMLHttpRequest','FormData','Blob','File','FileReader'];", 'for (var i = 0; i < polyfills.length; i++) {', '  var n = polyfills[i];', '  if (!(n in globalThis) && xhrImpl[n]) globalThis[n] = xhrImpl[n];', '}'].join('\n'),
					moduleType: 'js',
				};
			}
			if (id !== RESOLVED) return null;

			// Dev server origin baked into bundle.mjs.
			//
			// bundle.mjs is a local ES module entry, so its static import graph is
			// fetched and keyed by the runtime BEFORE its body runs
			// `configureLoader` (session-bootstrap). Unconfigured, the runtime keys
			// an HTTP module by its URL verbatim (fragment stripped, nothing else).
			// Every URL reachable from this entry's static graph must therefore be
			// canonical on its own — absolute, query-free, resolvable without the
			// import map — or the same module requested after configuration lands
			// under a second registry key and evaluates twice.
			//
			// Routes through `resolveDeviceReachableOrigin` so the URL is something
			// the DEVICE can reach: wildcard binds (`0.0.0.0`) and Android loopback
			// get remapped to a real LAN IP (preferred) or the platform's reachable
			// fallback (`10.0.2.2` for the Android emulator).
			let bootOrigin = '';
			if (opts.hmrActive) {
				try {
					bootOrigin = resolveDeviceReachableOrigin({
						host: resolvedConfig.server.host,
						platform: opts.platform,
						protocol: resolvedConfig.server.https || opts.useHttps ? 'https' : 'http',
						port: Number(resolvedConfig.server.port || 5173),
					}).origin;
				} catch (error: any) {
					throw new Error(`[ns-entry] cannot resolve a device-reachable dev server origin for bundle.mjs: ${error?.message || error}`);
				}
				if (!bootOrigin) {
					throw new Error('[ns-entry] cannot resolve a device-reachable dev server origin for bundle.mjs');
				}
			}

			let imports = '';
			if (opts.hmrActive) {
				// `/@vite/env` installs `config.define` on globalThis for served
				// modules: Vite's client environment does no define substitution.
				// It must stay an external import placed first, so it evaluates
				// before the externalized core graph (a bundled module's body would
				// run after it).
				imports += `import '${bootOrigin}/@vite/env';\n`;
			}
			// consistent verbose flag to easily reference below
			imports += "const __nsVerboseLog = typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__;\n";

			// Ensure any CommonJS-style tooling requires (e.g. from Babel or
			// other build-time libraries that may be accidentally bundled) do
			// not attempt to resolve Node built-ins like 'fs' or 'path' on
			// device. These modules are not used at runtime for NativeScript
			// apps, so we safely return an empty object from a shim.
			//
			// IMPORTANT: Under HMR, vendor packages call the real NativeScript
			// CommonJS require() with `@nativescript/core/<sub>` specifiers
			// (e.g. `require('@nativescript/core/ui/core/view').View` in
			// `@nativescript-community/gesturehandler`). If we overwrite
			// globalThis.require with a blanket stub, every such call returns
			// `{}` and any property access on the result (e.g. `.View`) is
			// `undefined`, cascading into `TypeError: Cannot read properties
			// of undefined (reading 'prototype')` inside `applyMixins` when
			// vendor install() hooks run.
			//
			// Instead, install a DELEGATING shim:
			//   - If the specifier is a Node built-in (fs, path, os, …) or
			//     a webpack-only runtime hook (require.context), return a
			//     safe empty stub.
			//   - Otherwise (HMR only), consult the served core modules registered
			//     on the dev globals (`coreModules`), then delegate to the
			//     preserved original `globalThis.require` (NativeScript's native
			//     CJS loader).
			imports += "try { if (typeof globalThis !== 'undefined') {\n";
			if (opts.hmrActive) {
				imports += `  var __nsDev = ${NS_DEV_EXPR};\n`;
			}
			imports += "  var __nsOrigRequire = typeof globalThis.require === 'function' ? globalThis.require : null;\n";
			imports += '  var __nsNodeBuiltins = { fs: 1, path: 1, os: 1, url: 1, crypto: 1, util: 1, stream: 1, events: 1, buffer: 1, http: 1, https: 1, net: 1, tls: 1, dns: 1, child_process: 1, module: 1, zlib: 1, querystring: 1, assert: 1, constants: 1, vm: 1 };\n';
			// Mirrors normalizeCoreSub() in helpers/ns-core-url.ts.
			imports += '  var __nsNormSub = function (s) {\n';
			imports += "    if (!s) return '';\n";
			imports += "    var t = String(s).split('?')[0].split('#')[0].trim();\n";
			imports += "    t = t.replace(/^\\/+/, '').replace(/\\/+$/, '');\n";
			imports += "    t = t.replace(/\\.(?:mjs|cjs|js)$/, '');\n";
			imports += "    if (t.length >= 6 && t.substring(t.length - 6) === '/index') t = t.substring(0, t.length - 6);\n";
			imports += "    if (!t || t === 'index') return '';\n";
			imports += '    return t;\n';
			imports += '  };\n';
			// Invariant D: CJS/ESM interop shape helper.
			//
			// A shape function that converts
			// ESM Module Namespace Objects (which have [[Prototype]] = null
			// per spec §9.4.6) into plain Objects that inherit from
			// Object.prototype. CJS consumers — especially zone.js's
			// patchMethod() — call `hasOwnProperty`, `toString`, etc. on
			// their require() result; a null-proto namespace throws
			// "X is not a function" on the first such call.
			//
			// Properties:
			//   - Recursive: @nativescript/core re-exports Utils/Http/Trace
			//     as nested namespaces (`export * as Utils from './utils'`),
			//     each also null-proto. Shallow wrapping leaves those.
			//   - Identity-preserving via a WeakMap cache keyed on the
			//     underlying namespace. zone.js MUTATES its target (stashes
			//     delegate symbols, overwrites methods); a fresh copy per
			//     require() would lose those mutations on the next lookup.
			//   - Under HMR, published as the dev globals' `cjsShape` so the served
			//     core's registration footer and the deps bundle's createRequire
			//     share this one cache and see mutation-consistent shapes.
			imports += '  var __nsShapeCache = new WeakMap();\n';
			imports += `  var __nsShapeCjs = ${opts.hmrActive ? '__nsDev.cjsShape || (__nsDev.cjsShape = ' : '('}function __nsShape(obj) {\n`;
			imports += "    if (!obj || typeof obj !== 'object') return obj;\n";
			imports += '    var proto = Object.getPrototypeOf(obj);\n';
			imports += '    var isNsModule = false;\n';
			imports += "    try { isNsModule = obj[Symbol.toStringTag] === 'Module'; } catch (e) {}\n";
			imports += '    if (proto !== null && !isNsModule) return obj;\n';
			imports += '    if (__nsShapeCache.has(obj)) return __nsShapeCache.get(obj);\n';
			imports += '    var out = {};\n';
			imports += '    __nsShapeCache.set(obj, out);\n';
			imports += '    try {\n';
			imports += '      var keys = Object.keys(obj);\n';
			imports += '      for (var i = 0; i < keys.length; i++) {\n';
			imports += '        var k = keys[i];\n';
			imports += '        try { out[k] = __nsShape(obj[k]); } catch (e) {}\n';
			imports += '      }\n';
			imports += '    } catch (e) {}\n';
			imports += '    return out;\n';
			imports += '  });\n';
			imports += '  var _nsReq = function (id) {\n';
			imports += '    try {\n';
			imports += "      var n = String(id || '');\n";
			// Kept-external builtins must reach the runtime before the stub table.
			imports += "      if (__nsOrigRequire && (n.indexOf('ns:') === 0 || n.indexOf('node:') === 0)) {\n";
			imports += '        try { return __nsOrigRequire(n); } catch (e) {}\n';
			imports += '      }\n';
			imports += "      var stripped = n.indexOf('node:') === 0 ? n.slice(5) : n;\n";
			imports += '      if (__nsNodeBuiltins[stripped]) return {};\n';
			if (opts.hmrActive) {
				imports += "      if (n === '@nativescript/core' || n.indexOf('@nativescript/core/') === 0) {\n";
				imports += '        var table = __nsDev.coreModules;\n';
				imports += '        if (table) {\n';
				// The served core's footer can register namespaces before this
				// shim installs `cjsShape`, so entries may be unshaped; shape on read.
				imports += '          if (table[n]) return __nsShapeCjs(table[n]);\n';
				imports += "          var rawSub = n === '@nativescript/core' ? '' : n.slice('@nativescript/core/'.length);\n";
				imports += '          var normSub = __nsNormSub(rawSub);\n';
				imports += "          var bareKey = normSub ? '@nativescript/core/' + normSub : '@nativescript/core';\n";
				imports += '          if (table[bareKey]) return __nsShapeCjs(table[bareKey]);\n';
				imports += '          if (table[normSub]) return __nsShapeCjs(table[normSub]);\n';
				imports += '        }\n';
				imports += '      }\n';
			}
			// The native loader may return a raw (null-proto) ESM namespace.
			imports += '      if (__nsOrigRequire) return __nsShapeCjs(__nsOrigRequire(id));\n';
			imports += '    } catch (e) {}\n';
			imports += '    return {};\n';
			imports += '  };\n';
			imports += '  _nsReq.context = function () { var _c = { keys: function () { return []; } }; _c.__esModule = true; return _c; };\n';
			imports += '  if (__nsOrigRequire) { try { _nsReq.resolve = __nsOrigRequire.resolve ? __nsOrigRequire.resolve.bind(__nsOrigRequire) : function (id) { return id; }; } catch (e) {} }\n';
			imports += '  globalThis.require = _nsReq;\n';
			imports += '} } catch {}\n';

			// Banner diagnostics for visibility at runtime
			if (opts.verbose) {
				imports += `console.info('[ns-entry] begin', { platform: ${JSON.stringify(opts.platform)}, dev: ${JSON.stringify(opts.isDevMode)}, hmr: ${JSON.stringify(opts.hmrActive)}, verbose: ${JSON.stringify(opts.verbose)}, mainEntry: ${JSON.stringify(mainEntry)}, mainRel: ${JSON.stringify(mainEntryRelPosix)}, time: new Date().toISOString() });\n`;
			}

			// ---- Core runtime globals (always-needed) ----
			// Install XHR polyfill FIRST — its virtual module body runs during import evaluation,
			// before any subsequent import (like zone.js) can reference XMLHttpRequest.
			imports += `import '${XHR_POLYFILL_VIRTUAL_ID}';\n`;
			// Load globals early.
			imports += `import ${JSON.stringify(coreSpec('globals/index'))};\n`;
			if (opts.verbose) {
				imports += `console.info('[ns-entry] core globals loaded');\n`;
			}

			// Seed the real NativeScript Application singleton before any early HMR/placeholder
			// code runs. Dynamic discovery is too late for iOS placeholder startup.
			imports += `import { Application as __nsEarlyApplication } from ${JSON.stringify(coreSpec('application'))};\n`;
			imports += `try { if (__nsEarlyApplication && (typeof __nsEarlyApplication.run === 'function' || typeof __nsEarlyApplication.on === 'function' || typeof __nsEarlyApplication.resetRootView === 'function')) { globalThis.Application = __nsEarlyApplication; } } catch {}\n`;
			if (opts.verbose) {
				imports += `console.info('[ns-entry] early Application seeded', { hasRun: typeof globalThis.Application?.run === 'function', hasOn: typeof globalThis.Application?.on === 'function', hasResetRootView: typeof globalThis.Application?.resetRootView === 'function' });\n`;
			}

			// In dev mode for Angular apps, ensure @angular/compiler (JIT) is loaded.
			// With experimentalDecorators:true, TypeScript emits __decorate patterns.
			// On watch-mode rebuilds the Angular compiler may not re-emit ɵfac for
			// cached files, so the JIT compiler must be available as a fallback.
			if (opts.isDevMode && effectiveFlavor === 'angular') {
				imports += "import { publishFacade as __nsPublishAngularCompilerFacade } from '@angular/compiler';\n";
				imports += '__nsPublishAngularCompilerFacade(globalThis);\n';
				if (opts.verbose) {
					imports += `console.info('[ns-entry] @angular/compiler (JIT) loaded for dev mode');\n`;
				}
			}

			/**
			 * Ensure the canonical @nativescript/core classes are available on globalThis
			 * before any other framework modules execute (like bundle-entry-points) to avoid duplicate realms
			 * and lifecycle registration using an uninitialized Application instance.
			 * We do this for both HMR and non-HMR builds to guarantee stable bootstrap.
			 */
			imports += "import { installCoreAliasesEarly } from '@nativescript/vite/runtime/core-aliases-early.js';\n";
			imports += 'installCoreAliasesEarly(__nsVerboseLog);\n';

			if (opts.hmrActive) {
				// Placeholder root for HMR to show prior to http loaded es modules take over
				if (opts.verbose) {
					imports += `console.info('[ns-entry] installing placeholder...');\n`;
				}
				imports += "import { installRootPlaceholder } from '@nativescript/vite/hmr/shared/runtime/root-placeholder.js';\n";
				imports += 'installRootPlaceholder(__nsVerboseLog);\n';
				if (opts.verbose) {
					imports += `console.info('[ns-entry] placeholder installed');\n`;
				}
			}

			// Load NS bundle entry points after early hook
			imports += `import ${JSON.stringify(coreSpec('bundle-entry-points'))};\n`;
			if (opts.verbose) {
				imports += `console.info('[ns-entry] bundle-entry-points loaded');\n`;
			}
			// XML-driven flavors: register @nativescript/core/ui + element nicknames
			// with the bundler module registry, import the bundler context, and apply
			// View prototype guards. Provided as a virtual module by
			// createUiRegistrationPlugin (wired in typescript.ts / javascript.ts) —
			// imported HERE, right after bundle-entry-points, instead of being
			// string-injected into this generated entry by a marker-matching
			// transform (the marker drifted once and silently broke all XML builds
			// with "Module 'Frame' not found").
			if (effectiveFlavor === 'typescript' || effectiveFlavor === 'javascript') {
				imports += "import 'virtual:ns-ui-registration';\n";
			}
			if (effectiveFlavor === 'typescript') {
				// Statically import bundler context synchronously before app code
				imports += "import 'virtual:ns-bundler-context';\n";
			}

			// ---- Custom App Components (Activity/Application) ----
			// These must be loaded early so the JS class is registered before Android instantiates them
			if (opts.platform === 'android') {
				try {
					const appComponents = getResolvedAppComponents('android');
					for (const component of appComponents) {
						// The appComponentsPlugin bundles these as separate .mjs entry points
						// We must import the output file, not the source, since it's a separate entry
						imports += `import ${JSON.stringify(`~/${component.outputName}.mjs`)};\n`;
						if (opts.verbose) {
							imports += `console.info('[ns-entry] app component loaded: ${component.outputName}');\n`;
						}
					}
				} catch (err) {
					console.error('[main-entry] Error resolving app components:', err);
				}
			}

			// ---- Platform-specific always-needed modules ----
			let needsAndroidActivityDefer = false;
			if (opts.platform === 'android') {
				/**
				 * Defer activity lifecycle wiring until native Application is ready
				 * to avoid "application is null" errors during startup.
				 */
				needsAndroidActivityDefer = true;
			}

			// ---- Optional polyfills ----
			if (polyfillsExists) {
				imports += `import ${JSON.stringify(polyfillsImportSpecifier)};\n`;
				if (opts.verbose) {
					imports += `console.info('[ns-entry] polyfills imported from', ${JSON.stringify(polyfillsImportSpecifier)});\n`;
				}
			} else if (opts.verbose) {
				imports += "console.info('[ns-entry] no polyfills file found');\n";
			}

			// ---- HMR bootstrap prerequisites ----
			if (opts.hmrActive) {
				// WebSocket polyfill needed for dev hot reload messaging
				imports += "import '@valor/nativescript-websockets';\n";
				if (opts.verbose) {
					imports += "console.info('[ns-entry] websockets polyfill imported');\n";
				}
			}

			// ---- Global CSS injection (always-needed if file exists) ----
			// Prefer `app.css`, fall back to `styles.css` (common in web projects).
			const appCssPath = resolveProjectGlobalCssPath(projectRoot);
			const hasAppCss = !!appCssPath;

			// Import Application statically if needed for CSS or Android activity defer
			if (hasAppCss || needsAndroidActivityDefer) {
				if (hasAppCss) {
					// The virtual module's body either:
					//   - non-HMR: calls `addTaggedAdditionalCSS(ast, 'app.css')`
					//     as an import-time side-effect, landing CSS in NS's
					//     selector tables before any view is created.
					//   - HMR: publishes the rework AST as the dev globals'
					//     `appCssAst` for `installHttpCoreCssSupport` in the
					//     served-core realm. The raw CSS text (the default export)
					//     goes to `appCss` as the fallback when no AST is present.
					imports += `// Apply global CSS before app bootstrap (AST under non-HMR; AST published for HMR cold boot)\n`;
					imports += `import appCssContent from '${APP_CSS_VIRTUAL_ID}';\n`;
					if (opts.hmrActive) {
						imports += `try { ${NS_DEV_EXPR}.appCss = appCssContent; } catch {}\n`;
					}
					if (opts.verbose) {
						imports += `console.info('[ns-entry] app.css applied as AST');\n`;
					}
				}
				if (needsAndroidActivityDefer) {
					imports += `import { Application } from ${JSON.stringify(coreSpec())};\n`;
				}
			}

			// SFC/imported CSS (non-HMR build). After app.css so component rules win
			// specificity ties. generateBundle fills it in; HMR applies at runtime.
			if (!opts.hmrActive) {
				imports += `import '${BUNDLE_CSS_VIRTUAL_ID}';\n`;
			}

			// ---- Deferred Android activity import (non-HMR only) ----
			// Uses the statically imported Application to avoid mixing dynamic and static imports
			if (needsAndroidActivityDefer) {
				imports += `
            (function __nsDeferAndroidActivityImport(){
              const load = () => { try { import('@nativescript/core/ui/frame/activity.android.js?ns-keep'); } catch (e) { console.error('[ns-entry] failed to import android activity module', e); } };
              try {
                const hasApp = !!(Application && Application.android && Application.android.nativeApp);
                if (hasApp) {
                  ${opts.verbose ? "console.info('[ns-entry] android activity import: nativeApp present, loading now');" : ''}
                  load();
                } else {
                  ${opts.verbose ? "console.info('[ns-entry] android activity import: deferring until launch/nativeApp');" : ''}
                  try { Application.on && Application.on(Application.launchEvent, load); } catch {}
                  try { setTimeout(load, 0); } catch {}
                }
              } catch { try { setTimeout(load, 0); } catch {} }
            })();\n`;
			}

			// ---- Application main entry ----
			if (opts.hmrActive) {
				// Deterministic dev boot: fetch one session descriptor and let the runtime
				// import the session client + app entry over HTTP.
				if (opts.verbose) {
					imports += `console.info('[ns-entry] including deterministic dev session bootstrap', { platform: ${JSON.stringify(opts.platform)}, mainRel: ${JSON.stringify(mainEntryRelPosix)} });\n`;
				}
				const sessionUrl = bootOrigin + '/__ns_dev__/session';
				imports += "import { startBrowserRuntimeSession } from '@nativescript/vite/hmr/shared/runtime/session-bootstrap.js';\n";
				imports += `startBrowserRuntimeSession(${JSON.stringify(sessionUrl)}, __nsVerboseLog).catch((error) => {\n`;
				imports += `  console.error('[ns-entry] deterministic dev session bootstrap failed', error && error.stack ? error.stack : error);\n`;
				imports += `});\n`;
				if (opts.verbose) {
					imports += `console.info('[ns-entry] deterministic dev session bootstrap appended');\n`;
				}
			} else {
				if (opts.verbose) {
					imports += `console.info('[ns-entry] Importing main entry', ${JSON.stringify(mainEntryImportSpecifier)});\n`;
				}
				imports += `import ${JSON.stringify(mainEntryImportSpecifier)};\n`;
			}

			if (opts.isDevMode) {
				// debug tools support
				imports += `import ${JSON.stringify(coreSpec('inspector_modules'))};\n`;
				if (opts.verbose) {
					imports += "console.info('[ns-entry] inspector modules imported');\n";
				}
			}

			if (opts.verbose) {
				imports += `console.info('[ns-entry] end', { time: new Date().toISOString() });\n`;
			}

			return {
				code: imports,
				moduleType: 'js',
			};
		},
	};
}
