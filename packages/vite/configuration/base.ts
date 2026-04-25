import { mergeConfig, type UserConfig } from 'vite';
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
import { getProjectRootPath } from '../helpers/project.js';
import { aliasCssTree } from '../helpers/css-tree.js';
import { getGlobalDefines } from '../helpers/global-defines.js';
import { getWorkerPlugins, workerUrlPlugin } from '../helpers/workers.js';
import { createTsConfigPathsResolver, getTsConfigData } from '../helpers/ts-config-paths.js';
import { commonjsPlugins } from '../helpers/commonjs-plugins.js';
import { nativescriptPackageResolver } from '../helpers/nativescript-package-resolver.js';
import { cliPlugin } from '../helpers/ns-cli-plugins.js';
import { dynamicImportPlugin } from '../helpers/dynamic-import-plugin.js';
import { mainEntryPlugin } from '../helpers/main-entry.js';
import { buildCoreUrl, specToCoreSub } from '../helpers/ns-core-url.js';
import { getProjectFlavor } from '../helpers/flavor.js';
import { preserveImportsPlugin } from '../helpers/preserve-imports.js';
import { optimizeDepsPlatformResolver } from '../helpers/esbuild-platform-resolver.js';
import { vendorManifestPlugin } from '../hmr/shared/vendor/manifest.js';
import { resolveVerboseFlag, createFilteredViteLogger } from '../helpers/logging.js';
import { externalConfigMerges, applyExternalConfigs } from '../helpers/external-configs.js';
import { getHMRPlugins } from '../hmr/server/index.js';
import { packagePlatformResolverPlugin } from '../helpers/package-platform-aliases.js';
import { findPackageInNodeModules } from '../helpers/module-resolution.js';
import { createPlatformCssPlugin } from '../helpers/css-platform-plugin.js';
import { createNativeClassTransformerPlugin } from '../helpers/nativeclass-transformer-plugin.js';
import { getThemeCoreGenericAliases, createEnsureHoistedThemeLinkPlugin, createThemeCoreCssFallbackPlugin } from '../helpers/theme-core-plugins.js';
import { createPostCssConfig } from '../helpers/postcss-platform-config.js';
import { getProjectAppPath, getProjectAppRelativePath } from '../helpers/utils.js';
import { appComponentsPlugin } from '../helpers/app-components.js';
import { resolveRelativeToImportMeta } from '../helpers/import-meta-path.js';
// Load HMR plugins lazily to avoid compiling dev-only sources during library build
// This prevents TypeScript from traversing the heavy HMR implementation graph when not needed
// function getHMRPluginsSafe(opts: {
//   platform: string;
//   flavor: string;
//   verbose: boolean;
// }): any[] {
//   try {
//     // Use eval("require") so TypeScript doesn't statically resolve the TS sources
//     // This prevents the compiler from traversing dev-only HMR code during library builds
//     const req = eval("require") as NodeRequire;
//     const mod = req("../hmr/server/index.js");
//     if (mod && typeof mod.getHMRPlugins === "function") {
//       return mod.getHMRPlugins(opts) || [];
//     }
//   } catch {
//     /* ignore: HMR not available or excluded */
//   }
//   return [];
// }
const require = createRequire(import.meta.url);
// Optional PostCSS import plugin (only used if available)
// Try to load postcss-import to control CSS @import resolution simply
let postcssImport: any = null;
try {
	// use CommonJS require to load from workspace
	postcssImport = require('postcss-import');
} catch {}

const distOutputFolder = process.env.NS_VITE_DIST_DIR || '.ns-vite-build';
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
	NS_CORE_ROOT = path.dirname(workspaceCorePkg).replace(/\\/g, '/');
} else {
	const corePkg = require.resolve('@nativescript/core/package.json', { paths: [projectRoot] });
	NS_CORE_ROOT = path.dirname(corePkg).replace(/\\/g, '/');
}

// Attempt to resolve hoisted workspace dependency roots from the app's project root.
// This enables monorepo usage where dependencies are declared at the workspace root
// but consumed within an app package without its own node_modules copy.
let THEME_CORE_ROOT: string | undefined;
const themePkgDir = findPackageInNodeModules('nativescript-theme-core', projectRoot);
if (themePkgDir && existsSync(themePkgDir)) {
	THEME_CORE_ROOT = themePkgDir.replace(/\\/g, '/');
}

/**
 * Plugins can define nativescript.vite.mjs
 * which export Vite configs to merge into the base config.
 */
applyExternalConfigs();

type PlatformType = 'android' | 'ios' | 'visionos';

export const baseConfig = ({ mode, flavor }: { mode: string; flavor?: string }): UserConfig => {
	const targetMode = mode === 'development' ? 'development' : 'production';

	const cliFlags = getCliFlags()!;
	const verbose = resolveVerboseFlag({ env: process.env, cliFlags });
	// console.log("cliFlags:", cliFlags);
	const isDevMode = targetMode === 'development';
	const debug = !!process.env.DEBUG || isDevMode;
	const hmrActive = isDevMode && !!cliFlags.hmr;
	let platform = cliFlags.platform as PlatformType;
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
		// use this with merge config instead or could list common dedupes in base here altogether
		dedupe: ['@nativescript/core', 'nativescript-vue', 'vue'],
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
			{ find: /^~\/(.*)$/, replacement: path.resolve(projectRoot, `${appSourceDir}/$1`) },
			// optional: "@" → src/
			{ find: '@', replacement: path.resolve(projectRoot, appSourceDir) },
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
			disableOptimizeDeps = hmrActive || process.env.NS_DISABLE_OPTIMIZEDEPS === '1' || process.env.NS_DISABLE_OPTIMIZEDEPS === 'true';
			break;
	}

	const optimizeDepsExclude = ['@nativescript/core', '@valor/nativescript-websockets', 'set-value', 'react', 'react-reconciler', 'react-nativescript'];
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

	let baseViteConfig = {
		// Suppress logs during HMR development if desired:
		// ...(hmrActive ? { logLevel: "warn" as const } : {}),
		// Filter out noisy sourcemap warnings from dependencies while keeping other warnings intact
		customLogger: filteredLogger,
		resolve: resolveConfig,
		define: defineConfig,
		optimizeDeps: optimizeDepsConfig,
		plugins: [
			// Under HMR, rewrite every bare `@nativescript/core*` specifier to
			// the full /ns/core HTTP URL so bundle.mjs contains NO bundled copy
			// of the core runtime. The plugin runs with enforce:'pre' so it
			// fires BEFORE Vite's alias resolution converts bare specifiers to
			// absolute filesystem paths, and apply:'build' so the dev-server
			// transform pipeline (which has its own import-map) is unaffected.
			//
			// Why this is necessary: core's transitively-bundled helpers (e.g.
			// `@nativescript/zone-js` patches) write `import '@nativescript/core/globals'`
			// in their source. Without this interception, rolldown leaves those
			// as bare specifiers in the emitted bundle.mjs output, iOS's ESM
			// loader can't resolve bare specifiers at module-instantiation time
			// (the runtime import map is installed later by the HMR client), and
			// it falls back to a filesystem lookup that crashes with
			// "Module not found: Cannot find module @nativescript/core/globals".
			//
			// The broader architecture: Vite is the single source of truth for
			// every `@nativescript/core` URL on the device, so a build-time
			// pre-resolver routes every reference into the runtime bridge.
			...(hmrActive
				? [
						((): any => {
							const host = (process.env.NS_HMR_HOST as string) || 'localhost';
							const port = process.env.NS_HMR_PORT || '5173';
							const proto = (process.env.NS_HMR_PROTO as string) || 'http';
							const origin = `${proto}://${host}:${port}`;
							return {
								name: 'ns-core-external-urls',
								enforce: 'pre',
								apply: 'build',
								resolveId(source: string, importer: string | undefined) {
									// Route every `@nativescript/core*` reference
									// (bare specifier OR absolute path into the
									// installed @nativescript/core package OR its
									// subpath import-map aliases) through the ONE
									// canonical URL generator. URL proliferation
									// (`?p=`, versioned, mixed query vs path
									// forms) produces distinct iOS HTTP ESM cache
									// entries for the same module, yielding
									// double evaluation.
									const sub = specToCoreSub(source);
									if (sub === null) return null;
									if (process.env.NS_CORE_EXTERNAL_DEBUG) {
										try {
											console.log('[ns-core-external]', 'source=', source, 'sub=', sub, 'importer=', importer?.slice(-80));
										} catch {}
									}
									const url = buildCoreUrl(origin, sub);
									return { id: url, external: 'absolute' };
								},
							};
						})(),
					]
				: []),
			createPlatformCssPlugin(platform),
			// TODO: move to per-project basis based on usage
			createEnsureHoistedThemeLinkPlugin(THEME_CORE_ROOT, projectRoot, platform),
			...createNativeClassTransformerPlugin(),
			createThemeCoreCssFallbackPlugin(THEME_CORE_ROOT, projectRoot, platform),
			// Redirect fragment.android to a single virtual id before other resolvers
			// androidBootRedirectPlugin(),
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
			nsConfigAsJsonPlugin(),
			NativeScriptPlugin({ platform }),
			// Ensure globals and Android activity are included early via virtual entry
			mainEntryPlugin({ platform, isDevMode, verbose, hmrActive, useHttps }),
			// Handle custom Android Activity/Application components (auto-detected or configured)
			appComponentsPlugin({ platform, verbose }),
			dynamicImportPlugin(),
			// Transform Vite worker URLs to NativeScript format AFTER bundling
			workerUrlPlugin(),
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
					// Expose dev server to local network so simulator or device can connect
					host: process.env.NS_HMR_HOST || (platform === 'android' ? '0.0.0.0' : 'localhost'),
					// Use a stable port so the device URL remains correct
					port: 5173,
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
						ignored: ['**/.DS_Store', '**/hooks/**', '**/platforms/**'],
					},
				}
			: {},
		// Configure worker builds to bundle everything into standalone workers
		worker: {
			format: 'es',
			plugins: () => getWorkerPlugins(platform),
			rolldownOptions: {
				// Don't externalize anything - bundle everything into the worker
				external: [],
				output: {
					// Inline all dynamic imports to create standalone bundle
					inlineDynamicImports: true,
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

	if (externalConfigMerges?.length) {
		externalConfigMerges.forEach((config) => {
			baseViteConfig = mergeConfig(baseViteConfig, config);
		});
	}
	return baseViteConfig;
};
