import { type UserConfig } from 'vite';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import replace from '@rollup/plugin-replace';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import ts from 'typescript';
import { getCliFlags } from '../helpers/cli-flags.js';
import NativeScriptPlugin from '../helpers/resolver.js';
import nsConfigAsJsonPlugin from '../helpers/config-as-json.js';
import { findMonorepoWorkspaceRoot, getProjectRootPath } from '../helpers/project.js';
import { aliasCssTree } from '../helpers/css-tree.js';
import { getGlobalDefines } from '../helpers/global-defines.js';
import { getWorkerPlugins, workerHmrUrlPlugin, workerUrlPlugin, nativescriptWorkerLoaderStubPlugin } from '../helpers/workers.js';
import { tsFallbackTransformPlugin } from '../hmr/frameworks/angular/build/ts-fallback-transform.js';
import { angularWorkerUrlPreservePlugin } from '../hmr/frameworks/angular/build/worker-url-preserve.js';
import { createTsConfigPathsResolver, getTsConfigData } from '../helpers/ts-config-paths.js';
import { commonjsPlugins } from '../helpers/commonjs-plugins.js';
import { nativescriptPackageResolver } from '../helpers/nativescript-package-resolver.js';
import { cliPlugin } from '../helpers/ns-cli-plugins.js';
import { dynamicImportPlugin } from '../helpers/dynamic-import-plugin.js';
import { mainEntryPlugin } from '../helpers/main-entry.js';
import { createUiRegistrationPlugin } from '../helpers/ui-registration.js';
import { nsCoreExternalUrlsPlugin } from '../helpers/ns-core-external-urls.js';
import { getProjectFlavor, setProjectFlavor } from '../helpers/flavor.js';
import { preserveImportsPlugin } from '../helpers/preserve-imports.js';
import { optimizeDepsPlatformResolver } from '../helpers/esbuild-platform-resolver.js';
import { vendorManifestPlugin } from '../hmr/shared/vendor/manifest.js';
import { resolveVerboseFlag, createFilteredViteLogger } from '../helpers/logging.js';
import { externalConfigsPlugin } from '../helpers/external-configs.js';
import { getHMRPlugins } from '../hmr/server/index.js';
import type { Platform } from '../helpers/platform-types.js';
import { packagePlatformResolverPlugin } from '../helpers/package-platform-aliases.js';
import { findPackageInNodeModules } from '../helpers/module-resolution.js';
import { createPlatformCssPlugin } from '../helpers/css-platform-plugin.js';
import { createNativeClassTransformerPlugin } from '../helpers/nativeclass-transformer-plugin.js';
import { getThemeCoreGenericAliases, createEnsureHoistedThemeLinkPlugin, createThemeCoreCssFallbackPlugin } from '../helpers/theme-core-plugins.js';
import { createPostCssConfig } from '../helpers/postcss-platform-config.js';
import { getProjectAppPath, getProjectAppRelativePath } from '../helpers/utils.js';
import { appComponentsPlugin } from '../helpers/app-components.js';
import { resolveRelativeToImportMeta } from '../helpers/import-meta-path.js';
import { normalizeModuleId } from '../helpers/normalize-id.js';
import { getHmrWatchIgnoreGlobs } from '../helpers/hmr-scope.js';
import { NS_OPTIMIZE_DEPS_EXCLUDE } from '../helpers/optimize-deps.js';
const require = createRequire(import.meta.url);
// Optional PostCSS import plugin (only used if available)
// Try to load postcss-import to control CSS @import resolution simply
let postcssImport: any = null;
try {
	// use CommonJS require to load from workspace
	postcssImport = require('postcss-import');
} catch {}

const distOutputFolder = process.env.NS_VITE_DIST_DIR || '.ns-vite-build';
const hmrPort = process.env.NS_HMR_PORT ? Number(process.env.NS_HMR_PORT) : 5173;
// HMR dev server options with socket
const useHttps = process.env.NS_HTTPS === '1' || process.env.NS_HTTPS === 'true';

const projectRoot = getProjectRootPath();
const appSourceDir = getProjectAppPath();
const resolveFromAppRoot = (subPath: string) => path.resolve(projectRoot, getProjectAppRelativePath(subPath));
const appGlobPattern = `${appSourceDir}/**`;

// Resolve @nativescript/core root.
// Prefer monorepo source (packages/core) when present to match webpack5 behavior,
// else fall back to node_modules resolution.
let NS_CORE_ROOT = '' as string;
const workspaceCorePkg = path.resolve(projectRoot, '../../packages/core/package.json');
if (existsSync(workspaceCorePkg)) {
	NS_CORE_ROOT = normalizeModuleId(path.dirname(workspaceCorePkg));
} else {
	const corePkg = require.resolve('@nativescript/core/package.json', { paths: [projectRoot] });
	NS_CORE_ROOT = normalizeModuleId(path.dirname(corePkg));
}

// Attempt to resolve hoisted workspace dependency roots from the app's project root.
// This enables monorepo usage where dependencies are declared at the workspace root
// but consumed within an app package without its own node_modules copy.
let THEME_CORE_ROOT: string | undefined;
const themePkgDir = findPackageInNodeModules('nativescript-theme-core', projectRoot);
if (themePkgDir && existsSync(themePkgDir)) {
	THEME_CORE_ROOT = normalizeModuleId(themePkgDir);
}

export const baseConfig = ({ mode, flavor }: { mode: string; flavor?: string }): UserConfig => {
	const targetMode = mode === 'development' ? 'development' : 'production';

	const cliFlags = getCliFlags()!;
	const verbose = resolveVerboseFlag({ env: process.env, cliFlags });
	// console.log("cliFlags:", cliFlags);
	const isDevMode = targetMode === 'development';
	const debug = !!process.env.DEBUG || isDevMode;
	const hmrActive = isDevMode && !!cliFlags.hmr;
	let platform = cliFlags.platform as Platform;
	if (cliFlags.android) {
		platform = 'android';
	} else if (cliFlags.ios) {
		platform = 'ios';
	} else if (cliFlags.visionos) {
		platform = 'visionos';
	}
	if (verbose) {
		console.log('--------------');
		// console.log("Vite config mode:", mode);
		console.log('Platform:', platform);
		console.log('Mode:', targetMode);
		console.log('HMR active:', hmrActive);
		console.log('--------------');
	}

	flavor = flavor || (getProjectFlavor() as string);
	// Seed the flavor singleton with the config-declared flavor so every later
	// getProjectFlavor() consumer (deps-bundle linker gating, boot recorder,
	// worker serving) sees the truth even when package.json detection can't —
	// see setProjectFlavor for the hoisted-monorepo failure this prevents.
	setProjectFlavor(flavor);
	if (verbose) {
		console.log(`Building for ${flavor}.`);
	}

	// Filtered logger to suppress noisy warnings
	const filteredLogger = createFilteredViteLogger();

	// Create TypeScript aliases with platform support
	const tsConfig = getTsConfigData({ platform, verbose });
	const tsConfigResolver = createTsConfigPathsResolver({
		paths: tsConfig.paths,
		baseUrl: tsConfig.baseUrl,
		platform,
		verbose,
	});

	// Common resolve configuration for both main and worker builds
	// Build platform-aware extension preference order and exclude the opposite platform
	const platformExtensions = (() => {
		const base = ['.tsx', '.jsx', '.ts', '.js'] as const;
		const exts: string[] = [];
		if (platform === 'android') {
			exts.push('.android.tsx', '.tsx', '.android.jsx', '.jsx', '.android.ts', '.ts', '.android.js', '.js');
		} else if (platform === 'ios' || platform === 'visionos') {
			// Treat visionOS like iOS for file resolution
			exts.push('.ios.tsx', '.tsx', '.ios.jsx', '.jsx', '.ios.ts', '.ts', '.ios.js', '.js');
		} else {
			// Fallback: no platform-specific preference
			exts.push(...base);
		}
		// Always allow these last
		exts.push('.mjs', '.json');
		return exts;
	})();

	// Dynamic aliases for nativescript-theme-core generic theme filenames
	// TODO: move to per-project basis based on usage
	const themeGenericAliases = getThemeCoreGenericAliases(THEME_CORE_ROOT, platform);

	const resolveConfig = {
		// ensures Vite prefers ESM entry‑points
		// A few packages have react-native specifiers which work well for NS as well
		mainFields: ['module', 'react-native', 'main'],
		conditions: ['module', 'react-native', 'import', 'browser', 'default'],
		// use this with merge config if need
		// we list common dedupes here
		dedupe: ['@nativescript/core', 'nativescript-vue', 'vue', '@tanstack/solid-router', '@tanstack/react-router', '@tanstack/router-core', '@tanstack/history'],
		// Alias "@" and "~" to your src directory for cleaner imports
		alias: [
			// Hard dedupe for @nativescript/core across monorepos / linked workspaces
			// Map all specifiers to the single resolved root under the app's node_modules
			// Canonicalize trailing /index subpath imports so '@nativescript/core/foo' and '@nativescript/core/foo/index'
			// resolve to the exact same module id. This prevents duplicate evaluation of core submodules (profiling, layouts)
			// which can break timers, decorators and alignment tests under Vite.
			{ find: /^@nativescript\/core\/(.+)\/index$/, replacement: `${NS_CORE_ROOT}/$1` },
			{ find: /^@nativescript\/core$/, replacement: NS_CORE_ROOT },
			{
				find: /^@nativescript\/core\/(.*)$/,
				// Keep capture group to preserve deep paths
				replacement: `${NS_CORE_ROOT}/$1`,
			},
			// Resolve hoisted nativescript-theme-core if present at workspace root
			// Support both exact package and deep paths like nativescript-theme-core/css/core.light.css
			...(THEME_CORE_ROOT
				? [
						{ find: /^nativescript-theme-core$/, replacement: THEME_CORE_ROOT },
						{ find: /^nativescript-theme-core\/(.*)$/, replacement: `${THEME_CORE_ROOT}/$1` },
					]
				: []),
			// Provide a shim for node:module to avoid runtime crashes in NS
			{
				find: /^node:module$/,
				replacement: resolveRelativeToImportMeta(import.meta.url, '../shims/node-module.js'),
			},
			// Ensure set-value resolves to an absolute shim to avoid alias warnings and duplication
			{ find: /^set-value$/, replacement: resolveRelativeToImportMeta(import.meta.url, '../shims/set-value.js') },
			// nativescript-theme-core root + deep paths (hoisted resolution)
			// Generic theme css -> platform specific variant
			...themeGenericAliases,
			...aliasCssTree,
			// 1) Catch exactly `~/package.json` → virtual module (MUST be first!)
			{ find: /^~\/package\.json$/, replacement: '~/package.json' },
			// 2) Catch everything else under "~/" → your src/
			//    Normalize so app-file ids use the same forward-slash + uppercase-drive
			//    form as core/Vite-resolved ids — otherwise a Windows backslash app id
			//    importing core could anchor a divergent relative-resolution chain.
			{ find: /^~\/(.*)$/, replacement: normalizeModuleId(path.resolve(projectRoot, `${appSourceDir}/$1`)) },
			// optional: "@" → src/
			{ find: '@', replacement: normalizeModuleId(path.resolve(projectRoot, appSourceDir)) },
		],
		extensions: platformExtensions,
		preserveSymlinks: true,
	};

	// Common define configuration for both main and worker builds
	const defineConfig = getGlobalDefines({
		platform,
		targetMode,
		verbose,
		flavor,
		isCI: !!process.env.CI,
	});

	// Default static copy: copy/merge assets and fonts when present
	const assetsDir = resolveFromAppRoot('assets');
	const fontsDir = resolveFromAppRoot('fonts');
	const staticCopyTargets: any[] = [];
	// vite-plugin-static-copy v4 preserves directory structure relative to the glob match.
	// Since our src globs resolve to absolute paths (e.g. /abs/src/assets/**/*),
	// matched paths include the app-relative prefix (e.g. src/assets/images/file.png).
	// Use rename.stripBase with the exact segment count of that prefix to strip it
	// while preserving any subdirectory structure within the source folder itself.
	// e.g. src/assets/images/foo.png → strip 2 ("src","assets") → images/foo.png → dest: assets/images/foo.png
	const assetsStripBase = getProjectAppRelativePath('assets').replace(/\\/g, '/').split('/').length;
	const fontsStripBase = getProjectAppRelativePath('fonts').replace(/\\/g, '/').split('/').length;
	if (existsSync(assetsDir)) {
		// Replace \ with / to avoid issues with glob in windows
		staticCopyTargets.push({ src: `${assetsDir}/**/*`.replace(/\\/g, '/'), dest: 'assets', rename: { stripBase: assetsStripBase } });
	}
	if (existsSync(fontsDir)) {
		staticCopyTargets.push({ src: `${fontsDir}/**/*`.replace(/\\/g, '/'), dest: 'fonts', rename: { stripBase: fontsStripBase } });
	}

	let disableOptimizeDeps = false;
	// some flavor-specific adjustments for optimizing deps
	switch (flavor) {
		case 'angular':
		// Solid joins Angular in disabling Vite's dep optimizer under HMR.
		// Under HMR the device fetches every module through the `/ns/m/`
		// transform pipeline, NEVER through Vite's `.vite/deps` prebundle — so
		// discovery buys nothing on-device and actively HURTS: Vite discovers
		// `solid-js` (+ `solid-js/web`, `solid-js/jsx-runtime`) mid-boot, emits
		// `optimized dependencies changed. reloading`, and that full reload
		// re-evaluates the solid-js reactive core while `globalThis.Solid$$`
		// from the first evaluation still persists. The result is the
		// "You appear to have multiple instances of Solid" warning, a split
		// reactive graph, and a flaky white screen on cold boot (the renderer
		// and the app's signals end up in different Owner realms). `noDiscovery`
		// keeps `solid-js` resolving through the stable resolve.alias →
		// `dist/dev.js` URL for the whole session, so there is a single core and
		// no mid-boot reload. Mirrors Angular, which has run this way reliably.
		case 'solid':
		// React (rendering through dominative via @nativescript-community/react)
		// has the same single-instance requirement as Solid: two copies of `react`
		// — one pre-bundled by Vite's depscanner, one served through `/ns/m/` —
		// means two reconciler/dispatcher realms, so hooks/context silently break.
		// Disable discovery under HMR so `react` resolves through one stable path.
		case 'react':
			disableOptimizeDeps = hmrActive || process.env.NS_DISABLE_OPTIMIZEDEPS === '1' || process.env.NS_DISABLE_OPTIMIZEDEPS === 'true';
			break;
	}

	// `module` / `node:module` are aliased to local polyfills (see
	// `aliasCssTree` and the `node:module` entry in `resolveConfig.alias`).
	// Vite's depscanner has no awareness of these aliases and, when discovery
	// is enabled (every non-Angular flavor), happily pre-bundles them at
	// `/node_modules/.vite/deps/module.js`. The HMR `/ns/m/` pipeline then
	// runs `rewriteVitePrebundleImportsForDevice`, which maps pre-bundle URLs
	// back to bare specifiers via the vendor manifest. Because `module` is
	// NOT a real package (no manifest entry), the mapping returns `null` and
	// the entire `import { createRequire } from 'module'` line is dropped —
	// leaving `createRequire` undefined when `css-tree/lib/data-patch.js`
	// executes on device:
	//
	//   ReferenceError: createRequire is not defined
	//       at .../node_modules/css-tree/lib/data-patch.js
	//
	// Excluding both specifiers from optimizeDeps keeps the alias path
	// intact end-to-end. Angular sets `noDiscovery: true` so it never hits
	// this in the first place, but adding it here is still safe because the
	// Angular config rebuilds `optimizeDeps.exclude` from a different list.
	const optimizeDepsExclude = [...NS_OPTIMIZE_DEPS_EXCLUDE];
	const optimizeDepsConditions = ['module', 'react-native', 'import', 'browser', 'default'];
	const optimizeDepsConfig = disableOptimizeDeps
		? {
				noDiscovery: true,
				include: [],
				entries: [],
				exclude: [...optimizeDepsExclude, 'rxjs'],
				rolldownOptions: {
					resolve: {
						conditionNames: optimizeDepsConditions,
						extensions: platformExtensions as any,
					},
					transform: {
						define: {
							global: 'globalThis',
							'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
						},
					},
					plugins: [],
				},
			}
		: {
				include: [],
				exclude: optimizeDepsExclude,
				rolldownOptions: {
					resolve: {
						conditionNames: optimizeDepsConditions,
						extensions: platformExtensions as any,
					},
					transform: {
						define: {
							global: 'globalThis',
							'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
						},
					},
					plugins: [optimizeDepsPlatformResolver({ platform, verbose })],
				},
			};

	const baseViteConfig = {
		// Suppress logs during HMR development if desired:
		// ...(hmrActive ? { logLevel: "warn" as const } : {}),
		// Filter out noisy sourcemap warnings from dependencies while keeping other warnings intact
		customLogger: filteredLogger,
		resolve: resolveConfig,
		define: defineConfig,
		optimizeDeps: optimizeDepsConfig,
		plugins: [
			// Merge any dependency-provided `nativescript.vite.mjs` configs. Runs
			// in an awaited `config` hook so ESM configs load correctly.
			externalConfigsPlugin(),
			// Under HMR, rewrite every bare `@nativescript/core*` specifier to
			// the full /ns/core HTTP URL so bundle.mjs contains NO bundled copy
			// of the core runtime (see helpers/ns-core-external-urls.ts).
			...(hmrActive ? [nsCoreExternalUrlsPlugin({ platform, projectRoot, nsCoreRoot: NS_CORE_ROOT, hmrPort, useHttps })] : []),
			createPlatformCssPlugin(platform),
			// TODO: move to per-project basis based on usage
			createEnsureHoistedThemeLinkPlugin(THEME_CORE_ROOT, projectRoot, platform),
			...createNativeClassTransformerPlugin(),
			createThemeCoreCssFallbackPlugin(THEME_CORE_ROOT, projectRoot, platform),
			// Ensure Rollup phase replaces in node_modules too
			// Important for various vendor handling
			replace({
				'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
				preventAssignment: true,
			}),
			// Ensure explicit keep markers are honored
			preserveImportsPlugin(),
			hmrActive
				? vendorManifestPlugin({
						projectRoot,
						platform,
						mode: targetMode,
						verbose,
						emitAssets: true,
						flavor,
					})
				: undefined,
			// Vue HMR plugins for development mode
			// HMR plugins (source streaming replaces prior exploded source plugin when enabled)
			...(hmrActive ? [...getHMRPlugins({ platform, flavor, verbose })] : []),
			// TODO: make flavor plugins dynamic
			// ...flavorPlugins,
			...commonjsPlugins,
			tsConfigResolver,
			packagePlatformResolverPlugin({ tsConfig, platform, verbose }),

			// Platform-specific package resolver - MUST come before commonjs plugin
			nativescriptPackageResolver(platform),
			// Stub legacy webpack `nativescript-worker-loader!` imports so they don't
			// fail static resolution under Rolldown (see helper for full rationale).
			nativescriptWorkerLoaderStubPlugin(),
			nsConfigAsJsonPlugin(),
			NativeScriptPlugin({ platform }),
			// XML-driven flavors: provide the virtual UI-registration module the
			// entry imports (see main-entry.ts). Registered HERE, from the same
			// authoritative flavor the entry's emission gate uses, so the import
			// and its resolver can never diverge — deps-based flavor detection
			// alone misfires in workspaces whose app package.json doesn't list
			// the framework package (hoisted to the workspace root).
			...(flavor === 'typescript' || flavor === 'javascript' ? [createUiRegistrationPlugin(flavor as 'typescript' | 'javascript')] : []),
			// Ensure globals and Android activity are included early via virtual entry
			mainEntryPlugin({ platform, isDevMode, verbose, hmrActive, useHttps, flavor }),
			// Handle custom Android Activity/Application components (auto-detected or configured)
			appComponentsPlugin({ platform, verbose }),
			dynamicImportPlugin(),
			// Dev/HMR only: rewrite `new Worker(new URL('./foo', import.meta.url))`
			// to a `/ns/m/`-routed string URL before Vite's built-in worker plugin
			// produces a `?worker_file&type=classic` URL that the NS runtime can't
			// load (see `workerHmrUrlPlugin` for the full rationale).
			...(hmrActive ? [workerHmrUrlPlugin({ verbose })] : []),
			// `vite build` only (production / `--no-hmr`): neutralize Angular's
			// internal TS transformer so it stops blanking the worker URL.
			//
			// Without this, Analog's `processWebWorker` host callback returns
			// `''` and Angular's worker transformer rewrites the original
			// `new Worker(new URL('./foo.worker', import.meta.url))` into
			// `new Worker(new URL("", import.meta.url), { type: "module" })`.
			// Vite's own `workerImportMetaUrlPlugin` then doesn't match the
			// empty URL, no worker asset is emitted, and the shipped bundle
			// crashes on device with a `ReadText("")` assertion inside V8's
			// module loader. See `angularWorkerUrlPreservePlugin` in
			// `hmr/frameworks/angular/build/worker-url-preserve.ts` for the full
			// rationale. Monkey-patch is idempotent and a no-op in non-Angular
			// projects.
			...(!hmrActive ? [angularWorkerUrlPreservePlugin({ verbose })] : []),
			// Transform Vite worker URLs to NativeScript format AFTER bundling
			workerUrlPlugin(),
			// Dev/HMR only: safety-net TypeScript transform for `.ts`/`.tsx` files
			// that escape the Angular plugin's fileEmitter (e.g. worker entry files
			// loaded via `new Worker(new URL('./foo.worker', import.meta.url))`,
			// which are not in the Angular TypeScript program). Without this, the
			// Analog Angular plugin's config hook disables Vite's oxc transformer
			// in HMR mode and any non-Angular `.ts` file reaches the device with
			// type annotations intact. See `tsFallbackTransformPlugin` for the
			// detection heuristic and the full rationale.
			...(hmrActive ? [tsFallbackTransformPlugin({ verbose })] : []),
			// Copy static assets and fonts when present in project app root
			...((staticCopyTargets == null ? void 0 : staticCopyTargets.length)
				? [
						viteStaticCopy({
							targets: staticCopyTargets,
							watch: { reloadPageOnChange: true },
						}),
					]
				: []),
			// NativeScript CLI integration
			cliPlugin({ distOutputFolder, isDevMode, verbose, hmrActive }),
		],
		css: {
			postcss: createPostCssConfig({
				platform,
				projectRoot,
				themeCoreRoot: THEME_CORE_ROOT,
				postcssImport,
			}),
		},
		// Development server configuration for HMR
		server: isDevMode
			? {
					// Bind all interfaces so every consumer can connect: Android
					// emulator NAT / adb-reverse, the iOS Simulator (loopback),
					// AND physical devices fetching over the LAN. Vite prints
					// both `Local:` and `Network:` URLs with this bind, so the
					// LAN address devices use is visible at startup. The URL
					// host devices are told to use is decided separately by
					// `resolveDeviceReachableHost`. `NS_HMR_HOST` overrides.
					host: process.env.NS_HMR_HOST || '0.0.0.0',
					// Use the configured stable port so multiple platform sessions can coexist.
					port: hmrPort,
					strictPort: true,
					https: useHttps
						? {
								// Optional: allow self-signed certs via env paths
								key: process.env.NS_HTTPS_KEY && readFileSync(process.env.NS_HTTPS_KEY),
								cert: process.env.NS_HTTPS_CERT && readFileSync(process.env.NS_HTTPS_CERT),
							}
						: undefined,
					// Keep HMR on the primary server port (Vite browser client stays on /vite-hmr)
					hmr: {
						protocol: useHttps ? 'wss' : 'ws',
						path: '/vite-hmr',
					},
					cors: true,
					watch: {
						ignored: getHmrWatchIgnoreGlobs(distOutputFolder),
					},
					// Widen `fs.allow` to the detected monorepo workspace root.
					//
					// Vite's default `searchForWorkspaceRoot` recognises pnpm /
					// lerna / `package.json#workspaces` / Deno workspaces, but
					// not Nx / Rush / Turborepo. In an Nx layout where the app
					// lives at `apps/<name>/`, Vite's default falls back to
					// the app dir as the fs-serving root, so any
					// `transformRequest` for a file in the *hoisted* root
					// `node_modules/…` (e.g. `@nativescript/core/bundle-entry-points.js`)
					// trips `isFileLoadingAllowed` and fails with
					// `Failed to load url … Does the file exist?` — even
					// though the file is right there on disk.
					//
					// Detect the real workspace root once at config time and
					// add it to `fs.allow`. `mergeConfig` concatenates arrays,
					// so apps that pass their own `server.fs.allow` keep
					// their entries on top of this baseline.
					...(() => {
						const monorepoRoot = findMonorepoWorkspaceRoot(projectRoot);
						if (!monorepoRoot || monorepoRoot === projectRoot) return {};
						return { fs: { allow: [monorepoRoot, projectRoot] } };
					})(),
				}
			: {},
		// Configure worker builds to bundle everything into standalone workers
		worker: {
			format: 'es',
			// `worker.plugins` is a factory that's called fresh per worker bundle, so
			// each Rolldown worker build gets its own resolver instances.
			plugins: () => getWorkerPlugins({ platform, verbose }),
			rolldownOptions: {
				// Don't externalize anything - bundle everything into the worker
				external: [],
				output: {
					// Inline all dynamic imports into a single worker bundle.
					// `codeSplitting: false` is the modern Rolldown spelling of the
					// deprecated `inlineDynamicImports: true`. See:
					// https://rolldown.rs/options/output#codesplitting
					codeSplitting: false,
				},
			},
		},
		build: {
			// Ensure Vite and plugins (like vite-plugin-static-copy) use the same output directory
			outDir: path.resolve(projectRoot, distOutputFolder),
			target: 'esnext',
			minify: !debug,
			// NativeScript apps commonly produce larger single-file bundles than web apps.
			// Keep the default threshold high, while still allowing standard Vite per-project override
			// through `build.chunkSizeWarningLimit` in the app's vite.config.ts.
			chunkSizeWarningLimit: 2000,
			// Generate source maps for debugging
			// External sourcemaps so DevTools loads small .mjs files and fetches maps on demand
			sourcemap: debug,
			// Disable module preloading to avoid browser APIs
			modulePreload: false,
			// Under HMR, avoid rebuilds on app root changes — device consumes updates via /ns-hmr
			...(hmrActive && {
				watch: {
					exclude: [appGlobPattern],
				},
			}),
			// Optimize for development speed
			...(isDevMode && {
				// Faster builds in development
				reportCompressedSize: false,
			}),
			rolldownOptions: {
				onwarn(warning, defaultHandler) {
					// Suppress COMMONJS_VARIABLE_IN_ESM from the vendor virtual module.
					// The esbuild-bundled vendor code may contain CommonJS `exports` references
					// inside ESM wrapper code which Rolldown flags but is harmless at runtime.
					if (warning.code === 'COMMONJS_VARIABLE_IN_ESM' && (warning.id?.includes('@nativescript/vendor') || warning.message?.includes('@nativescript/vendor'))) {
						return;
					}
					defaultHandler(warning);
				},
				treeshake: {
					// Preserve side effects for NativeScript core so classes/functions
					// aren't tree-shaken out inadvertently. This does NOT cause cross‑chunk duplication;
					// it only prevents Rollup from dropping modules it considers side‑effect free.
					// Also preserve side effects for .android and .ios files which may contain
					// other decorated classes that register with the native runtime
					moduleSideEffects: (id) => {
						if (/node_modules[\\\/]\@nativescript[\\\/]core[\\\/]/.test(id)) return true;
						// Activity and Application files have side effects (class registration)
						if (/\.(android|ios)\.(ts|js)$/.test(id)) return true;
						return null;
					},
				},
				input: 'virtual:entry-with-polyfills',
				output: {
					format: 'es', // Emit ES modules (.mjs)
					entryFileNames: 'bundle.mjs',
					// Prepend a tiny polyfill prelude to every emitted chunk so timer
					// globals (`setTimeout`, `setInterval`, `clearTimeout`,
					// `clearInterval`) are available at module-instantiation time —
					// BEFORE `@nativescript/core/globals` runs from inside the entry.
					//
					// Why this is needed. ESM evaluates dependency chunks DFS-post-order
					// before the importing module's body. `bundle.mjs` declares
					// `import './vendor.mjs'` at the top, so `vendor.mjs` evaluates first
					// — but the official timer polyfills live in
					// `@nativescript/core/globals` which is bundled into `bundle.mjs`'s
					// body. Any vendor package that captures a timer global at module
					// top-level hits `ReferenceError: setTimeout is
					// not defined` because `globalThis.setTimeout` is still undefined
					// during vendor.mjs evaluation.
					//
					// When the runtime eventually exposes the unprefixed timer names
					// directly (removing the chicken-and-egg at the source), this
					// prelude becomes a no-op and can be removed.
					banner: [`typeof globalThis !== 'undefined' && typeof globalThis.setTimeout === 'undefined' && typeof globalThis.__ns__setTimeout === 'function' && (`, `  globalThis.setTimeout = globalThis.__ns__setTimeout,`, `  globalThis.setInterval = globalThis.__ns__setInterval,`, `  globalThis.clearTimeout = globalThis.__ns__clearTimeout,`, `  globalThis.clearInterval = globalThis.__ns__clearInterval`, `);`].join('\n'),
					// Point source map URLs to absolute file:// paths on the host so
					// Chrome DevTools can fetch them even though the running code comes
					// from file:///app on the simulator/device.
					sourcemapBaseUrl: pathToFileURL(path.resolve(projectRoot, distOutputFolder)).toString() + '/',
					chunkFileNames: (chunk) => {
						if (chunk.name === 'vendor') return 'vendor.mjs';
						// Place worker files at root level, not in assets/
						if (chunk.name && chunk.name.includes('worker')) {
							return '[name]-[hash].js';
						}
						return '[name]-[hash].mjs';
					},
					assetFileNames: 'assets/[name][extname]',
					// Create single vendor chunk for most third-party modules.
					// Keep critical NativeScript core bootstrap/lifecycle modules in the main bundle
					// so they evaluate AFTER bundle-entry-points initialize Application.
					manualChunks(id) {
						// In HMR, avoid emitting a Rollup vendor chunk on disk. The dev server
						// serves vendor over HTTP and we separately emit a single ns-vendor.mjs
						// for Android SBG to scan via the vendorManifestPlugin above.
						if (hmrActive) {
							return undefined;
						}
						const normalizedId = id.split('?')[0].replace(/\\/g, '/');
						// Ensure virtual vendor modules live in vendor.mjs
						if (normalizedId.includes('@nativescript/vendor') || normalizedId.includes('@nativescript/vendor-manifest')) {
							return 'vendor';
						}
						if (id.includes('node_modules')) {
							// Keep Angular, NativeScript core, and Angular ecosystem packages
							// (ngrx, etc.) in the main bundle. These contain ɵɵngDeclare*
							// partial declarations that must be linked by the Angular linker.
							// Splitting them into a separate vendor chunk can cause the linker
							// to miss them during watch-mode rebuilds.
							if (id.includes('@angular/') || id.includes('@nativescript/angular') || id.includes('@nativescript/core')) {
								return undefined; // Keep in main bundle
							}
							if (id.includes('@ngrx/')) {
								return undefined; // Keep in main bundle — has ɵɵngDeclare* partials
							}
							// Zone.js and NativeScript zone patches must stay in the main bundle
							// because they depend on @nativescript/core/globals polyfills (XMLHttpRequest, etc.)
							// which are only available after the main entry imports them.
							if (id.includes('zone.js') || id.includes('@nativescript/zone-js')) {
								return undefined;
							}
							return 'vendor';
						}
					},
				},
				// When HMR is active, prevent Vite's build watcher from reacting to source folder changes.
				// The device will get updates via socket /ns-hmr instead.
				...(hmrActive
					? {
							watch: {
								exclude: [appGlobPattern],
							},
						}
					: {}),
			},
		},
	} as UserConfig;

	return baseViteConfig;
};
