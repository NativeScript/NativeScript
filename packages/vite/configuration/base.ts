import { mergeConfig, type UserConfig } from 'vite';
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import ts from 'typescript';
import { getCliFlags } from '../helpers/cli-flags.js';
import NativeScriptPlugin from '../helpers/resolver.js';
import nsConfigAsJsonPlugin from '../helpers/config-as-json.js';
import { getProjectRootPath } from '../helpers/project.js';
import { aliasCssTree } from '../helpers/css-tree.js';
import { packagePlatformAliases } from '../helpers/package-platform-aliases.js';
import { getGlobalDefines } from '../helpers/global-defines.js';
import { getWorkerPlugins, workerUrlPlugin } from '../helpers/workers.js';
import { getTsConfigData } from '../helpers/ts-config-paths.js';
import { commonjsPlugins } from '../helpers/commonjs-plugins.js';
import { nativescriptPackageResolver } from '../helpers/nativescript-package-resolver.js';
import { cliPlugin } from '../helpers/ns-cli-plugins.js';
import { dynamicImportPlugin } from '../helpers/dynamic-import-plugin.js';
import { mainEntryPlugin } from '../helpers/main-entry.js';
import { getProjectFlavor } from '../helpers/flavor.js';
import { preserveImportsPlugin } from '../helpers/preserve-imports.js';
import { esbuildPlatformResolver } from '../helpers/esbuild-platform-resolver.js';
import { vendorManifestPlugin } from '../hmr/shared/vendor/manifest.js';
import { resolveVerboseFlag, createFilteredViteLogger } from '../helpers/logging.js';
import { externalConfigMerges, applyExternalConfigs } from '../helpers/external-configs.js';
import { getHMRPlugins } from '../hmr/server/index.js';
import { findPackageInNodeModules } from '../helpers/module-resolution.js';
import { createPlatformCssPlugin } from '../helpers/css-platform-plugin.js';
import { createNativeClassTransformerPlugin } from '../helpers/nativeclass-transformer-plugin.js';
import { getThemeCoreGenericAliases, createEnsureHoistedThemeLinkPlugin, createThemeCoreCssFallbackPlugin } from '../helpers/theme-core-plugins.js';
import { createPostCssConfig } from '../helpers/postcss-platform-config.js';
import { getProjectAppPath, getProjectAppRelativePath } from '../helpers/utils.js';
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

	const cliFlags = getCliFlags();
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
			{ find: /^@nativescript\/core\/(.+)\/index$/, replacement: (m: string, sub: string) => `${NS_CORE_ROOT}/${sub}` },
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
				replacement: path.resolve(path.dirname(new URL(import.meta.url).pathname), '../shims/node-module.js'),
			},
			// Ensure set-value resolves to an absolute shim to avoid alias warnings and duplication
			{ find: /^set-value$/, replacement: path.resolve(path.dirname(new URL(import.meta.url).pathname), '../shims/set-value.js') },
			// nativescript-theme-core root + deep paths (hoisted resolution)
			// Generic theme css -> platform specific variant
			...themeGenericAliases,
			...aliasCssTree,
			// 1) Catch exactly `~/package.json` → virtual module (MUST be first!)
			{ find: /^~\/package\.json$/, replacement: '~/package.json' },
			// TypeScript path aliases from tsconfig.json
			...tsConfig.aliases,
			// Generic platform resolution for any npm package
			packagePlatformAliases({ tsConfig, platform, verbose }),
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
	const staticCopyTargets = [];
	if (existsSync(assetsDir)) {
		// Replace \ with / to avoid issues with glob in windows
		staticCopyTargets.push({ src: `${assetsDir}/**/*`.replace(/\\/g,'/'), dest: 'assets' });
	}
	if (existsSync(fontsDir)) {
		staticCopyTargets.push({ src: `${fontsDir}/**/*`.replace(/\\/g,'/'), dest: 'fonts' });
	}

	let disableOptimizeDeps = false;
	// some flavor-specific adjustments for optimizing deps
	switch (flavor) {
		case 'angular':
			disableOptimizeDeps = hmrActive || process.env.NS_DISABLE_OPTIMIZEDEPS === '1' || process.env.NS_DISABLE_OPTIMIZEDEPS === 'true';
			break;
	}

	let baseViteConfig = {
		// Suppress logs during HMR development if desired:
		// ...(hmrActive ? { logLevel: "warn" as const } : {}),
		// Filter out noisy sourcemap warnings from dependencies while keeping other warnings intact
		customLogger: filteredLogger,
		resolve: resolveConfig,
		define: defineConfig,
		// Vite's built-in solution for CommonJS/ESM compatibility issues
		optimizeDeps: disableOptimizeDeps
			? {
					noDiscovery: true,
					include: [],
					entries: [],
					// Ensure rxjs and core are never treated as entries for pre-bundling
					exclude: ['@nativescript/core', 'rxjs', '@valor/nativescript-websockets', 'set-value', 'react', 'react-reconciler', 'react-nativescript'],
					esbuildOptions: {
						conditions: ['module', 'react-native', 'import', 'browser', 'default'],
						resolveExtensions: platformExtensions as any,
						define: {
							global: 'globalThis',
							'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
						},
						target: 'es2020',
						// Do not install the platform resolver inside optimizeDeps to avoid crawling node_modules
						plugins: [],
					},
				}
			: {
					// Force pre-bundling of problematic CommonJS packages (kept empty by default)
					include: [],
					esbuildOptions: {
						conditions: ['module', 'react-native', 'import', 'browser', 'default'],
						resolveExtensions: platformExtensions as any,
						define: {
							global: 'globalThis',
							'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
						},
						target: 'es2020',
						plugins: [esbuildPlatformResolver({ platform, verbose })],
					},
					exclude: ['@nativescript/core', '@valor/nativescript-websockets', 'set-value', 'react', 'react-reconciler', 'react-nativescript'],
				},
		esbuild: {
			define: {
				'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
			},
			// Keep target loosely aligned with tsconfig target (ES2020) to avoid reordering semantics
			target: 'es2020',
		},
		plugins: [
			createPlatformCssPlugin(platform),
			// TODO: move to per-project basis based on usage
			createEnsureHoistedThemeLinkPlugin(THEME_CORE_ROOT, projectRoot, platform),
			createNativeClassTransformerPlugin(),
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

			// Platform-specific package resolver - MUST come before commonjs plugin
			nativescriptPackageResolver(platform),
			// Simplified CommonJS handling - let Vite's optimizeDeps do the heavy lifting
			commonjs({
				include: [/node_modules/],
				// Force specific problematic modules to be treated as CommonJS
				requireReturnsDefault: 'auto',
				defaultIsModuleExports: 'auto',
				transformMixedEsModules: true,
				// Ignore optional dependencies that are meant to fail gracefully
				ignore: ['@nativescript/android', '@nativescript/ios'],
			}),
			nsConfigAsJsonPlugin(),
			NativeScriptPlugin({ platform }),
			// Ensure globals and Android activity are included early via virtual entry
			mainEntryPlugin({ platform, isDevMode, verbose, hmrActive }),
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
					// watch: {
					//   ignored: [
					//     '**/.DS_Store',
					//     '**/Documents/**',
					//     '**/hooks/**',
					//     '**/platforms/**'
					//   ]
					// }
				}
			: {},
		// Configure worker builds to bundle everything into standalone workers
		worker: {
			format: 'es',
			plugins: () => getWorkerPlugins(platform),
			rollupOptions: {
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
				chunkSizeWarningLimit: 2000,
			}),
			commonjsOptions: {
				include: [/node_modules/],
			},
			rollupOptions: {
				treeshake: {
					// Preserve side effects for NativeScript core so classes/functions
					// aren't tree-shaken out inadvertently. This does NOT cause cross‑chunk duplication;
					// it only prevents Rollup from dropping modules it considers side‑effect free.
					moduleSideEffects: (id) => /node_modules[\\\/]\@nativescript[\\\/]core[\\\/]/.test(id) || null,
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
							// Keep common dependencies in the main bundle
							if (id.includes('@angular/') || id.includes('@nativescript/angular') || id.includes('@nativescript/core')) {
								return undefined; // Keep in main bundle
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
