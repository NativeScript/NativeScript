import { getPackageJson, getProjectFilePath, getProjectRootPath } from './project.js';
import fs from 'fs';
import path from 'path';
import { preprocessCSS, type ResolvedConfig } from 'vite';
import { parseCssAst as parseCssToAst } from './css-ast.js';
import { getProjectFlavor } from './flavor.js';
import { getProjectAppPath, getProjectAppRelativePath, getProjectAppVirtualPath, resolveProjectGlobalCssPath } from './utils.js';
import { getResolvedAppComponents } from './app-components.js';
import { toStaticImportSpecifier } from './import-specifier.js';
import { resolveDeviceReachableOrigin } from './dev-host.js';
import { devWsTokenFile, devWsTokenForBundle } from './dev-ws-token.js';
import { devServerAddressOf, waitForDevServerListening } from './ns-cli-plugins.js';
import { rewritePlatformCssImports } from './css-platform-plugin.js';
import { BUNDLE_CSS_AST_SENTINEL, inlineBundleCss } from './bundle-css.js';
import { deviceUrlForGraphUrl } from '../hmr/server/vite-url.js';
import { IMPORT_MAP_PATH, NS_DEV_SESSION_PATH } from '../hmr/server/dev-routes.js';
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

// Under HMR, everything `bundle.mjs` boots with is this one module, served by
// the dev server: Vite's import analysis then writes every URL it imports,
// exactly as it does for the app graph, so each file has one device URL.
const DEV_BOOT_VIRTUAL_ID = 'virtual:ns-dev-boot';
const DEV_BOOT_RESOLVED = '\0' + DEV_BOOT_VIRTUAL_ID;
/** The root-relative URL the device requests the dev boot module under. */
const DEV_BOOT_DEVICE_PATH = deviceUrlForGraphUrl(DEV_BOOT_RESOLVED);

/** Bare `@nativescript/core[/sub]` specifier. */
function coreSpec(subpath?: string | null): string {
	const sub = subpath ? String(subpath).replace(/^\/+/, '') : '';
	return sub ? `@nativescript/core/${sub}` : '@nativescript/core';
}

/**
 * Opt-in strict mode for served code (`NS_VITE_STRICT_REQUIRE=1`): the dev boot
 * module first replaces the runtime's global `require` with one that throws
 * when called, so any served code still reaching it fails loudly.
 */
export function isStrictGlobalRequireEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	const raw = (env.NS_VITE_STRICT_REQUIRE ?? '').toString().trim().toLowerCase();
	return ['1', 'true', 'on', 'yes'].includes(raw);
}

type BootCodeOptions = { platform: 'ios' | 'android' | 'visionos'; isDevMode: boolean; verbose: boolean; hmrActive: boolean; flavor: string };

// appComponentsPlugin emits these as separate .mjs entry points; the Android
// runtime needs their classes registered before it instantiates them.
function appComponentImports(opts: Pick<BootCodeOptions, 'platform' | 'verbose'>): string {
	let code = '';
	if (opts.platform !== 'android') return code;
	try {
		for (const component of getResolvedAppComponents('android')) {
			code += `import ${JSON.stringify(`~/${component.outputName}.mjs`)};\n`;
			if (opts.verbose) {
				code += `console.info('[ns-entry] app component loaded: ${component.outputName}');\n`;
			}
		}
	} catch (err) {
		console.error('[main-entry] Error resolving app components:', err);
	}
	return code;
}

// The boot sequence: the non-HMR bundle.mjs, or under HMR the served dev
// boot module, whose bare specifiers Vite's import analysis rewrites.
function generateBootCode(opts: BootCodeOptions, bootOrigin: string): string {
	// `?ns-keep` is a build-only tree-shaking marker; served, it would give the
	// module a second URL.
	const androidActivitySpecifier = opts.hmrActive ? '@nativescript/core/ui/frame/activity.android' : '@nativescript/core/ui/frame/activity.android.js?ns-keep';
	let imports = '';
	// Before anything else in the boot graph evaluates.
	if (opts.hmrActive && isStrictGlobalRequireEnabled()) {
		imports += "import '@nativescript/vite/runtime/strict-global-require.js';\n";
	}
	// consistent verbose flag to easily reference below
	imports += "const __nsVerboseLog = typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__;\n";

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

	// `installCoreAliasesEarly` below reads `globalThis.Application`.
	imports += `import { Application as __nsEarlyApplication } from ${JSON.stringify(coreSpec('application'))};\n`;
	imports += `try { if (__nsEarlyApplication && (typeof __nsEarlyApplication.run === 'function' || typeof __nsEarlyApplication.on === 'function' || typeof __nsEarlyApplication.resetRootView === 'function')) { globalThis.Application = __nsEarlyApplication; } } catch {}\n`;
	if (opts.verbose) {
		imports += `console.info('[ns-entry] early Application seeded', { hasRun: typeof globalThis.Application?.run === 'function', hasOn: typeof globalThis.Application?.on === 'function', hasResetRootView: typeof globalThis.Application?.resetRootView === 'function' });\n`;
	}

	// In dev mode for Angular apps, ensure @angular/compiler (JIT) is loaded.
	// With experimentalDecorators:true, TypeScript emits __decorate patterns.
	// On watch-mode rebuilds the Angular compiler may not re-emit ɵfac for
	// cached files, so the JIT compiler must be available as a fallback.
	if (opts.isDevMode && opts.flavor === 'angular') {
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
	if (opts.flavor === 'typescript' || opts.flavor === 'javascript') {
		imports += "import 'virtual:ns-ui-registration';\n";
	}
	// Under HMR the served app entry imports it instead.
	if (opts.flavor === 'typescript' && !opts.hmrActive) {
		// Statically import bundler context synchronously before app code
		imports += "import 'virtual:ns-bundler-context';\n";
	}

	// ---- Custom App Components (Activity/Application) ----
	// Under HMR they are local build outputs, imported by bundle.mjs itself.
	if (!opts.hmrActive) {
		imports += appComponentImports(opts);
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

	// ---- Global CSS injection (non-HMR, if the file exists) ----
	// Prefer `app.css`, fall back to `styles.css` (common in web projects).
	// Under HMR the app entry imports it as a Vite CSS module instead.
	const hasAppCss = !opts.hmrActive && !!resolveProjectGlobalCssPath(projectRoot);

	// Import Application statically if needed for CSS or Android activity defer
	if (hasAppCss || needsAndroidActivityDefer) {
		if (hasAppCss) {
			// The virtual module's body calls `addTaggedAdditionalCSS(ast,
			// 'app.css')` as an import-time side effect, landing the CSS in
			// NS's selector tables before any view is created.
			imports += `// Apply global CSS before app bootstrap (AST under non-HMR; AST published for HMR cold boot)\n`;
			imports += `import appCssContent from '${APP_CSS_VIRTUAL_ID}';\n`;
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

	// ---- Deferred Android activity import ----
	// Uses the statically imported Application to avoid mixing dynamic and static imports
	if (needsAndroidActivityDefer) {
		imports += `
            (function __nsDeferAndroidActivityImport(){
              const load = () => { try { import(${JSON.stringify(androidActivitySpecifier)}); } catch (e) { console.error('[ns-entry] failed to import android activity module', e); } };
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
		const sessionUrls = { sessionUrl: bootOrigin + NS_DEV_SESSION_PATH, importMapUrl: bootOrigin + IMPORT_MAP_PATH };
		imports += "import { startBrowserRuntimeSession } from '@nativescript/vite/hmr/shared/runtime/session-bootstrap.js';\n";
		// `bundle.mjs` awaits this module and shows a failure itself.
		imports += `export const bootFailure = await startBrowserRuntimeSession(${JSON.stringify(sessionUrls)}, __nsVerboseLog);\n`;
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

	return imports;
}

/** The HMR dev boot module's code, as the dev server serves it (origin aside). */
export function generateDevBootCode(opts: Omit<BootCodeOptions, 'isDevMode' | 'hmrActive'>): string {
	return generateBootCode({ ...opts, isDevMode: true, hmrActive: true }, '');
}

export function mainEntryPlugin(opts: { platform: 'ios' | 'android' | 'visionos'; isDevMode: boolean; verbose: boolean; hmrActive: boolean; useHttps: boolean; flavor?: string }) {
	let resolvedConfig: ResolvedConfig;
	// Prefer the flavor the active config DECLARES (threaded from baseConfig)
	// over deps-based detection: in workspaces whose app package.json doesn't
	// list the framework package (hoisted to the root), detection falls through
	// to 'typescript', whose entry imports ts-only virtual modules.
	const effectiveFlavor = opts.flavor || flavor;
	// The dev server origin the device reaches (wildcard binds and Android
	// loopback are remapped), computed the same way for the HMR build and the
	// dev server: the runtime keys an HTTP module by its URL.
	const resolveBootOrigin = (): string => {
		let origin = '';
		try {
			origin = resolveDeviceReachableOrigin({
				host: resolvedConfig.server.host,
				platform: opts.platform,
				protocol: resolvedConfig.server.https || opts.useHttps ? 'https' : 'http',
				port: Number(resolvedConfig.server.port || 5173),
			}).origin;
		} catch (error: any) {
			throw new Error(`[ns-entry] cannot resolve a device-reachable dev server origin for bundle.mjs: ${error?.message || error}`);
		}
		if (!origin) {
			throw new Error('[ns-entry] cannot resolve a device-reachable dev server origin for bundle.mjs');
		}
		return origin;
	};

	const bootOptions: BootCodeOptions = { ...opts, flavor: effectiveFlavor };

	// bundle.mjs under HMR: the bundled dev boot loader, which imports the
	// served graph dynamically so an unreachable dev server can be shown
	// instead of failing the main module's link. It runs before
	// session-bootstrap's `configureLoader` installs the import map, so it
	// names absolute URLs only.
	const generateHmrBundleEntry = (bootOrigin: string, token: string): string => {
		const loaderOptions = { origin: bootOrigin, bootUrl: bootOrigin + DEV_BOOT_DEVICE_PATH, token, verbose: opts.verbose };
		return `import { bootFromDevServer } from '@nativescript/vite/runtime/dev-boot-loader.js';\nawait bootFromDevServer(${JSON.stringify(loaderOptions)});\n` + appComponentImports(opts);
	};

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
		resolveId(id: string) {
			if (id === VIRTUAL_ID) return RESOLVED;
			if (id === APP_CSS_VIRTUAL_ID) return APP_CSS_RESOLVED;
			if (id === BUNDLE_CSS_VIRTUAL_ID) return BUNDLE_CSS_RESOLVED;
			if (id === XHR_POLYFILL_VIRTUAL_ID) return XHR_POLYFILL_RESOLVED;
			if (opts.hmrActive && (id === DEV_BOOT_VIRTUAL_ID || id === DEV_BOOT_RESOLVED)) return DEV_BOOT_RESOLVED;
			return null;
		},
		async load(id: string) {
			// Virtual module that processes app.css through PostCSS/Tailwind, applies
			// the result as a rework AST under the `app.css` tag before any view is
			// created, and default-exports the processed CSS text. Not used under
			// HMR, where the app entry imports the stylesheet as a Vite CSS module
			// (`hmr/server/app-css-module.ts`).
			//
			// Background: Vite's default `?inline` CSS handling collides with
			// @analogjs/vite-plugin-angular's load hook in Vite 8 (it converts ?inline
			// CSS to JS without setting moduleType:'js', so vite:css still tries to run
			// PostCSS on the JS output). This virtual module sidesteps that.
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
				const lines = [`import { addTaggedAdditionalCSS } from ${JSON.stringify(coreSpec('ui/styling/style-scope'))};`, `addTaggedAdditionalCSS(${astJson}, 'app.css');`, `export default ${JSON.stringify(result.code)};`];
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
			if (id === DEV_BOOT_RESOLVED) {
				return { code: generateBootCode(bootOptions, resolveBootOrigin()), moduleType: 'js' };
			}
			if (id !== RESOLVED) return null;
			if (opts.hmrActive) {
				const token = await devWsTokenForBundle({
					file: devWsTokenFile(resolvedConfig.root, devServerAddressOf(resolvedConfig.server).port),
					underCli: typeof process.send === 'function',
					waitForServer: () => waitForDevServerListening(devServerAddressOf(resolvedConfig.server)),
					warn: (message) => console.warn(message),
				});
				return { code: generateHmrBundleEntry(resolveBootOrigin(), token), moduleType: 'js' };
			}
			return { code: generateBootCode(bootOptions, ''), moduleType: 'js' };
		},
	};
}
