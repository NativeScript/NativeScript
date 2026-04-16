import { getPackageJson, getProjectFilePath, getProjectRootPath } from './project.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { preprocessCSS, type ResolvedConfig } from 'vite';
import { getProjectFlavor } from './flavor.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath } from './utils.js';
import { getResolvedAppComponents } from './app-components.js';
import { toStaticImportSpecifier } from './import-specifier.js';
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

export function mainEntryPlugin(opts: { platform: 'ios' | 'android' | 'visionos'; isDevMode: boolean; verbose: boolean; hmrActive: boolean }) {
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
					code: ["import * as xhrImpl from '@nativescript/core/xhr';", "var polyfills = ['XMLHttpRequest','FormData','Blob','File','FileReader'];", 'for (var i = 0; i < polyfills.length; i++) {', '  var n = polyfills[i];', '  if (!(n in globalThis) && xhrImpl[n]) globalThis[n] = xhrImpl[n];', '}'].join('\n'),
					moduleType: 'js',
				};
			}
			if (id !== RESOLVED) return null;

			// consistent verbose flag to easily reference below
			let imports = "const __nsVerboseLog = typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__;\n";

			// Ensure any CommonJS-style tooling requires (e.g. from Babel or other
			// build-time libraries that may be accidentally bundled) do not attempt
			// to resolve Node built-ins like 'fs' or 'path' on device. These modules
			// are not used at runtime for NativeScript apps, so we safely return an
			// empty object from a global require shim when present.
			imports += "try { if (typeof globalThis !== 'undefined') { var _nsReq = function () { return {}; }; _nsReq.context = function() { var _c = { keys: function() { return []; } }; _c.__esModule = true; return _c; }; globalThis.require = _nsReq; } } catch {}\n";

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
				// ---- Vendor manifest bootstrap ----
				// Use single self-contained vendor module to avoid extra imports affecting chunking
				imports += "import vendorManifest, { __nsVendorModuleMap } from '@nativescript/vendor';\n";
				imports += "import { installVendorBootstrap } from '@nativescript/vite/hmr/shared/runtime/vendor-bootstrap.js';\n";
				if (opts.verbose) {
					imports += `console.info('[ns-entry] vendor manifest imported', { keys: Object.keys(vendorManifest||{}).length, hasMap: typeof __nsVendorModuleMap === 'object' });\n`;
				}
				imports += 'installVendorBootstrap(vendorManifest, __nsVendorModuleMap, __nsVerboseLog);\n';
				if (opts.verbose) {
					imports += `console.info('[ns-entry] vendor bootstrap installed');\n`;
				}
			}

			// ---- Core runtime globals (always-needed) ----
			// Install XHR polyfill FIRST — its virtual module body runs during import evaluation,
			// before any subsequent import (like zone.js) can reference XMLHttpRequest.
			imports += `import '${XHR_POLYFILL_VIRTUAL_ID}';\n`;
			// Load globals early
			imports += "import '@nativescript/core/globals/index';\n";
			if (opts.verbose) {
				imports += `console.info('[ns-entry] core globals loaded');\n`;
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
			imports += "import '@nativescript/core/bundle-entry-points';\n";
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
			// Track if we need to defer Android activity import (non-HMR only)
			let needsAndroidActivityDefer = false;
			if (opts.platform === 'android') {
				if (opts.hmrActive) {
					/**
					 * Ensure the Java Activity class exists by executing the vendor-packed
					 * activity registration module via the vendor registry (not ESM import).
					 * This avoids any on-disk vendor.mjs export mismatches and guarantees the
					 * class is registered before Android tries to instantiate it.
					 */
					imports += `
            (function __nsEnsureAndroidActivityForHMR(){
              try {
                const g = globalThis;
                const req = (g.__nsVendorRequire || g.__nsRequire);
                if (!req) {
                  ${opts.verbose ? "console.warn('[ns-entry] vendor require not available yet; activity registration may be deferred');" : ''}
                  return;
                }
                const candidates = [
                  '@nativescript/core/ui/frame/activity.android',
                  '@nativescript/core/ui/frame/activity.android.js'
                ];
                for (const id of candidates) {
                  try {
                    req(id);
                    ${opts.verbose ? "console.info('[ns-entry] android activity registered via vendor', id);" : ''}
                    break;
                  } catch {}
                }
              } catch (e) {
                try { console.error('[ns-entry] failed to require android activity from vendor', e); } catch {}
              }
            })();\n`;
				} else {
					/**
					 * Non-HMR: Defer activity lifecycle wiring until native Application is ready
					 * to avoid "application is null" errors at production boot.
					 * We set a flag here and emit the actual code after the static Application import
					 * to avoid mixing dynamic and static imports of @nativescript/core.
					 */
					needsAndroidActivityDefer = true;
				}
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
				// Load HMR client for WebSocket connection to Vite dev server before HTTP-only boot attempts.
				imports += "import 'virtual:ns-hmr-client';\n";
				imports += "console.info('@nativescript/vite HMR client loaded.');\n";
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
				imports += `import { Application } from '@nativescript/core';\n`;
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
				// HTTP-only dev boot: try to import the entire app over HTTP; if not reachable, keep retrying.
				if (opts.verbose) {
					imports += `console.info('[ns-entry] including HTTP-only boot', { platform: ${JSON.stringify(opts.platform)}, mainRel: ${JSON.stringify(mainEntryRelPosix)} });\n`;
				}
				const guessLanHost = (): string | undefined => {
					try {
						const nets = os.networkInterfaces();
						for (const name of Object.keys(nets)) {
							const addrs = nets[name] || [];
							for (const a of addrs) {
								if (!a) continue;
								const family = (a as any).family;
								const internal = !!(a as any).internal;
								const address = String((a as any).address || '');
								if (internal) continue;
								if ((family === 'IPv4' || family === 4) && address && address !== '127.0.0.1') return address;
							}
						}
					} catch {}
					return undefined;
				};
				// Prefer LAN IP so physical devices work by default; emulator will still be tried as a fallback.
				const defaultHost = opts.platform === 'android' ? guessLanHost() || '10.0.2.2' : guessLanHost() || 'localhost';
				imports += "import { startHttpOnlyBoot } from '@nativescript/vite/hmr/shared/runtime/http-only-boot.js';\n";
				imports += `startHttpOnlyBoot(${JSON.stringify(opts.platform)}, ${JSON.stringify(mainEntryRelPosix)}, ${JSON.stringify((process.env.NS_HMR_HOST || '') as string) || JSON.stringify('')} || ${JSON.stringify(defaultHost)}, __nsVerboseLog);\n`;
				if (opts.verbose) {
					imports += `console.info('[ns-entry] HTTP-only boot code appended');\n`;
				}
			} else {
				if (opts.verbose) {
					imports += `console.info('[ns-entry] Importing main entry', ${JSON.stringify(mainEntryImportSpecifier)});\n`;
				}
				imports += `import ${JSON.stringify(mainEntryImportSpecifier)};\n`;
			}

			if (opts.isDevMode) {
				// debug tools support
				imports += "import '@nativescript/core/inspector_modules';\n";
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
