import { getPackageJson, getProjectFilePath, getProjectRootPath } from './project.js';
import fs from 'fs';
import path from 'path';
import { preprocessCSS, type ResolvedConfig } from 'vite';
import { getProjectFlavor } from './flavor.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath } from './utils.js';
import { getResolvedAppComponents } from './app-components.js';
import { toStaticImportSpecifier } from './import-specifier.js';
import { buildCoreUrl } from './ns-core-url.js';
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

// Virtual module that installs the XHR polyfill from @nativescript/core/xhr.
// Rolldown tree-shakes the polyfill-xhr.ts side-effect import from @nativescript/core/globals,
// so XMLHttpRequest never gets registered as a global. This dedicated module ensures the XHR
// polyfill is installed during module evaluation (before zone.js patches run).
const XHR_POLYFILL_VIRTUAL_ID = 'virtual:ns-xhr-polyfill';
const XHR_POLYFILL_RESOLVED = '\0' + XHR_POLYFILL_VIRTUAL_ID;

export function mainEntryPlugin(opts: { platform: 'ios' | 'android' | 'visionos'; isDevMode: boolean; verbose: boolean; hmrActive: boolean; useHttps: boolean }) {
	let resolvedConfig: ResolvedConfig;
	return {
		name: 'main-entry',
		configResolved(config: ResolvedConfig) {
			resolvedConfig = config;
		},
		resolveId(id: string) {
			if (id === VIRTUAL_ID) return RESOLVED;
			if (id === APP_CSS_VIRTUAL_ID) return APP_CSS_RESOLVED;
			if (id === XHR_POLYFILL_VIRTUAL_ID) return XHR_POLYFILL_RESOLVED;
			return null;
		},
		async load(id: string) {
			// Compute the dev server origin for HMR mode. Under HMR we emit
			// `@nativescript/core*` imports as FULL HTTP URLs so iOS's ESM loader
			// can fetch them directly during bundle.mjs module instantiation —
			// the import map isn't installed yet at that phase. For non-HMR
			// builds, we keep bare specifiers so production bundlers inline core
			// the normal way.
			const getBootOrigin = (): string | null => {
				if (!opts.hmrActive) return null;
				try {
					const configuredHost = typeof resolvedConfig.server.host === 'string' && resolvedConfig.server.host ? resolvedConfig.server.host : 'localhost';
					const bootHost = ((process.env.NS_HMR_HOST || '') as string) || configuredHost;
					const bootProtocol = resolvedConfig.server.https || opts.useHttps ? 'https' : 'http';
					const bootPort = Number(resolvedConfig.server.port || 5173);
					return `${bootProtocol}://${bootHost}:${bootPort}`;
				} catch {
					return null;
				}
			};
			// Return a spec string for @nativescript/core or a subpath that is
			// guaranteed to resolve at iOS module-instantiation time. Under HMR
			// this is always a full HTTP URL into the /ns/core bridge (no
			// import-map dependency). Under non-HMR it's the bare specifier for
			// the bundler to handle.
			//
			// Under HMR, delegates to buildCoreUrl() — the ONE canonical URL
			// generator. Every URL emitter in the build/runtime pipeline (this
			// function, ns-core-external-urls, rewriteSpec, runtime import map)
			// uses the same function so iOS's HTTP ESM cache sees byte-identical
			// URLs.
			const coreSpec = (subpath?: string | null): string => {
				const origin = getBootOrigin();
				if (origin) {
					return buildCoreUrl(origin, subpath);
				}
				const sub = subpath ? String(subpath).replace(/^\/+/, '') : '';
				return sub ? `@nativescript/core/${sub}` : '@nativescript/core';
			};

			// Virtual module that processes app.css through PostCSS/Tailwind and returns as a JS string.
			// This avoids using ?inline which conflicts with @analogjs/vite-plugin-angular's CSS
			// interception in Vite 8 — the Angular plugin converts ?inline CSS to JS via its load hook
			// but doesn't set moduleType:'js', so vite:css still tries to run PostCSS on the JS output.
			if (id === APP_CSS_RESOLVED) {
				const appCssPath = path.resolve(projectRoot, getProjectAppRelativePath('app.css'));
				const code = fs.readFileSync(appCssPath, 'utf-8');
				const result = await preprocessCSS(code, appCssPath, resolvedConfig);
				return {
					code: `export default ${JSON.stringify(result.code)};`,
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

			// consistent verbose flag to easily reference below
			let imports = "const __nsVerboseLog = typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__;\n";

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
			//   - Otherwise, delegate to the preserved original
			//     `globalThis.require` (NativeScript's native CJS loader),
			//     which routes `@nativescript/core*` through the HTTP bridge
			//     or, for already-HTTP-loaded modules, through the
			//     `globalThis.__NS_CORE_MODULES__` registry populated by the
			//     `/ns/core` bridge preamble.
			imports += "try { if (typeof globalThis !== 'undefined') {\n";
			imports += "  var __nsOrigRequire = typeof globalThis.require === 'function' ? globalThis.require : null;\n";
			imports += '  var __nsNodeBuiltins = { fs: 1, path: 1, os: 1, url: 1, crypto: 1, util: 1, stream: 1, events: 1, buffer: 1, http: 1, https: 1, net: 1, tls: 1, dns: 1, child_process: 1, module: 1, zlib: 1, querystring: 1, assert: 1, constants: 1, vm: 1 };\n';
			// Mirror helpers/ns-core-url.ts normalizeCoreSub() inline so the
			// lookup against __NS_CORE_MODULES__ uses the same keys the
			// /ns/core handler registers under.
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
			// Install a global, idempotent shape function that converts
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
			//   - Installed ONCE on globalThis so the /ns/core handler's
			//     registration footer, the vendor shim's createRequire, and
			//     any other consumer share the same cache and see
			//     mutation-consistent shapes.
			imports += '  var __nsShapeCache = globalThis.__NS_CJS_SHAPE_CACHE__ || (globalThis.__NS_CJS_SHAPE_CACHE__ = new WeakMap());\n';
			imports += '  var __nsShapeCjs = globalThis.__NS_CJS_SHAPE__ || (globalThis.__NS_CJS_SHAPE__ = function __nsShape(obj) {\n';
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
			imports += "      var stripped = n.indexOf('node:') === 0 ? n.slice(5) : n;\n";
			imports += '      if (__nsNodeBuiltins[stripped]) return {};\n';
			imports += "      if (n === '@nativescript/core' || n.indexOf('@nativescript/core/') === 0) {\n";
			imports += '        var table = globalThis.__NS_CORE_MODULES__;\n';
			imports += '        if (table) {\n';
			// Table entries are ALREADY shaped (the /ns/core footer stores
			// the shape, not the raw namespace). But we pass through
			// __nsShapeCjs anyway — it's a no-op on already-shaped values
			// (fast path: `proto !== null && !isNsModule` returns obj as-is)
			// and guards against future changes to how the registry is
			// populated (e.g., by direct assignment from test code).
			imports += '          if (table[n]) return __nsShapeCjs(table[n]);\n';
			imports += "          var rawSub = n === '@nativescript/core' ? '' : n.slice('@nativescript/core/'.length);\n";
			imports += '          var normSub = __nsNormSub(rawSub);\n';
			imports += "          var bareKey = normSub ? '@nativescript/core/' + normSub : '@nativescript/core';\n";
			imports += '          if (table[bareKey]) return __nsShapeCjs(table[bareKey]);\n';
			imports += '          if (table[normSub]) return __nsShapeCjs(table[normSub]);\n';
			imports += '        }\n';
			imports += '      }\n';
			// Fallback to native require (NativeScript CJS loader via HTTP
			// bridge). Shape the result too — the native loader may return
			// a raw ESM namespace for core subpaths served before the /ns/core
			// footer runs.
			imports += '      if (__nsOrigRequire) return __nsShapeCjs(__nsOrigRequire(id));\n';
			imports += '    } catch (e) {}\n';
			imports += '    return {};\n';
			imports += '  };\n';
			imports += '  _nsReq.context = function () { var _c = { keys: function () { return []; } }; _c.__esModule = true; return _c; };\n';
			imports += '  if (__nsOrigRequire) { try { _nsReq.resolve = __nsOrigRequire.resolve ? __nsOrigRequire.resolve.bind(__nsOrigRequire) : function (id) { return id; }; } catch (e) {} }\n';
			imports += '  globalThis.require = _nsReq;\n';
			imports += '  globalThis.__nsOrigRequire = __nsOrigRequire;\n';
			imports += '} } catch {}\n';

			// Banner diagnostics for visibility at runtime
			if (opts.verbose) {
				imports += `console.info('[ns-entry] begin', { platform: ${JSON.stringify(opts.platform)}, dev: ${JSON.stringify(opts.isDevMode)}, hmr: ${JSON.stringify(opts.hmrActive)}, verbose: ${JSON.stringify(opts.verbose)}, mainEntry: ${JSON.stringify(mainEntry)}, mainRel: ${JSON.stringify(mainEntryRelPosix)}, time: new Date().toISOString() });\n`;
			}

			if (opts.hmrActive) {
				// Seed ALL compile-time defines on globalThis so that every execution
				// context — the primary bundle, HTTP ESM modules, and cross-realm
				// calls — can reliably access them. The per-module injection in
				// processCodeForDevice() reads from globalThis as the source of truth;
				// these seeds ensure the values are always available.
				imports += `globalThis.__DEV__ = ${opts.isDevMode ? 'true' : 'false'};\n`;
				imports += `globalThis.__ANDROID__ = ${opts.platform === 'android' ? 'true' : 'false'};\n`;
				imports += `globalThis.__IOS__ = ${opts.platform === 'ios' ? 'true' : 'false'};\n`;
				imports += `globalThis.__VISIONOS__ = ${opts.platform === 'visionos' ? 'true' : 'false'};\n`;
				imports += `globalThis.__APPLE__ = ${opts.platform === 'ios' || opts.platform === 'visionos' ? 'true' : 'false'};\n`;
				imports += `globalThis.__COMMONJS__ = false;\n`;
				imports += `globalThis.__NS_WEBPACK__ = false;\n`;
				imports += `globalThis.__NS_ENV_VERBOSE__ = ${opts.verbose ? 'true' : 'false'};\n`;
				imports += `globalThis.__UI_USE_XML_PARSER__ = true;\n`;
				imports += `globalThis.__UI_USE_EXTERNAL_RENDERER__ = false;\n`;
				imports += `globalThis.__CSS_PARSER__ = 'css-tree';\n`;
				imports += `globalThis.__TEST__ = false;\n`;
				imports += "import { installModuleProvenanceRecorder } from '@nativescript/vite/hmr/shared/runtime/module-provenance.js';\n";
				imports += 'installModuleProvenanceRecorder(__nsVerboseLog);\n';
			}

			// ---- Core runtime globals (always-needed) ----
			// Install XHR polyfill FIRST — its virtual module body runs during import evaluation,
			// before any subsequent import (like zone.js) can reference XMLHttpRequest.
			imports += `import '${XHR_POLYFILL_VIRTUAL_ID}';\n`;
			// Load globals early. Under HMR we use a full HTTP URL so iOS's
			// ESM loader can fetch it directly at module-instantiation time —
			// the import map isn't installed yet at that phase.
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
			if (opts.isDevMode && flavor === 'angular') {
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
			if (flavor === 'typescript') {
				// Statically import bundler context synchronously before app code
				imports += "import 'virtual:ns-bundler-context';\n";
				if (opts.hmrActive) {
					// Snapshot original module registry functions for HMR diagnostics
					imports += `(function() {
  globalThis.__NS_ORIG_GET_REGISTERED_MODULES__ = globalThis.getRegisteredModules;
  globalThis.__NS_ORIG_MODULE_EXISTS__ = globalThis.moduleExists;
  globalThis.__NS_ORIG_LOAD_MODULE__ = globalThis.loadModule;
})();\n`;
				}
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
			const appCssPath = path.resolve(projectRoot, getProjectAppRelativePath('app.css'));
			const hasAppCss = fs.existsSync(appCssPath);

			// Import Application statically if needed for CSS or Android activity defer
			if (hasAppCss || needsAndroidActivityDefer) {
				if (hasAppCss) {
					imports += `// Import and apply global CSS before app bootstrap\n`;
					imports += `import appCssContent from '${APP_CSS_VIRTUAL_ID}';\n`;
					if (opts.hmrActive) {
						imports += `try { globalThis.__NS_HMR_APP_CSS__ = appCssContent; } catch {}\n`;
					}
				}
				imports += `import { Application } from ${JSON.stringify(coreSpec())};\n`;
				if (hasAppCss) {
					imports += `if (appCssContent) { try { Application.addCss(appCssContent); } catch (error) { console.error('Error applying CSS:', error); } }\n`;
					if (opts.verbose) {
						imports += `console.info('[ns-entry] app.css applied');\n`;
					}
				}
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
				const configuredHost = typeof resolvedConfig.server.host === 'string' && resolvedConfig.server.host ? resolvedConfig.server.host : 'localhost';
				const bootHost = ((process.env.NS_HMR_HOST || '') as string) || configuredHost;
				const bootProtocol = resolvedConfig.server.https || opts.useHttps ? 'https' : 'http';
				const bootPort = Number(resolvedConfig.server.port || 5173);
				const sessionUrl = bootProtocol + '://' + bootHost + ':' + String(bootPort) + '/__ns_dev__/session';
				imports += "import { startBrowserRuntimeSession } from '@nativescript/vite/hmr/shared/runtime/session-bootstrap.js';\n";
				imports += `startBrowserRuntimeSession(${JSON.stringify(sessionUrl)}, __nsVerboseLog).catch((error) => {\n`;
				imports += `  try { globalThis.__NS_ENTRY_ERROR__ = { phase: 'deterministic-dev-session', message: String(error && (error.message || error)), stack: error && error.stack ? String(error.stack) : '' }; } catch {}\n`;
				imports += `  try { console.error('[ns-entry] deterministic dev session bootstrap failed', error && error.stack ? error.stack : error); } catch {}\n`;
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
