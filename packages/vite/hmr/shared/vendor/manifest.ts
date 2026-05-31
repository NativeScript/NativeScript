import type { Plugin, ViteDevServer } from 'vite';
import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';
import path from 'path';
import fs, { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { createRequire } from 'node:module';
import { registerVendorManifest, clearVendorManifest, getVendorManifest } from './registry.js';
import { generatePlatformPolyfills } from '../runtime/platform-polyfills.js';
import type { Platform } from '../../../helpers/platform-types.js';
import { createNativeClassEsbuildPlugin } from '../../../helpers/nativeclass-esbuild-plugin.js';
import { getGlobalDefines } from '../../../helpers/global-defines.js';
import { createVendorEsbuildPlugin, createSolidJsxEsbuildPlugin, angularLinkerEsbuildPlugin } from './vendor-esbuild-plugins.js';

interface VendorManifestModuleEntry {
	id: string;
	exports: Record<string, boolean>;
}

interface VendorManifest {
	version: number;
	createdAt: string;
	hash: string;
	modules: Record<string, VendorManifestModuleEntry>;
	aliases: Record<string, string>;
}

interface VendorBundleResult {
	code: string;
	manifest: VendorManifest;
	entries: string[];
}

// Internal representation of resolved vendor inputs, including any metadata we
// need during esbuild bundling
interface CollectedVendorModules {
	entries: string[];
}

interface VendorManifestPluginOptions {
	projectRoot: string;
	platform: string;
	mode: 'development' | 'production';
	verbose?: boolean;
	// When false, do not emit ns-vendor.mjs/ns-vendor-manifest.json into the build outDir.
	// Useful during HMR to avoid duplicate on-disk vendor bundles that can confuse SBG.
	emitAssets?: boolean;
	// Optional framework flavor (vue, angular, react, solid, etc.) so the vendor
	// bundle can tailor which framework runtimes are included.
	flavor?: string;
}

interface GenerateVendorOptions {
	projectRoot: string;
	platform: string;
	mode: 'development' | 'production';
	verbose?: boolean;
	flavor?: string;
}

export const VENDOR_MANIFEST_ID = '@nativescript/vendor-manifest';
export const VENDOR_MANIFEST_VIRTUAL_ID = '\0' + VENDOR_MANIFEST_ID;
export const VENDOR_BUNDLE_ID = '@nativescript/vendor';
export const VENDOR_BUNDLE_VIRTUAL_ID = '\0' + VENDOR_BUNDLE_ID;
export const SERVER_VENDOR_PATH = '/@nativescript/vendor.mjs';
export const SERVER_MANIFEST_PATH = '/@nativescript/vendor-manifest.json';
export const DEFAULT_VENDOR_FILENAME = 'ns-vendor.mjs';
export const DEFAULT_MANIFEST_FILENAME = 'ns-vendor-manifest.json';

// Do not force-include @nativescript/core in the dev vendor bundle.
// Keeping core out of vendor avoids duplicate side-effect registrations (e.g.,
// com.tns.FragmentClass, com.tns.NativeScriptActivity) across bundle.mjs and vendor.
// Force runtime-sensitive packages onto the vendor path so they do not drift
// between startup bundle, HTTP-wrapped CommonJS, and base-require semantics
// during HMR sessions.
const ALWAYS_INCLUDE = new Set<string>(['stacktrace-js']);
const ALWAYS_EXCLUDE = new Set<string>([
	'@nativescript/android',
	'@nativescript/ios',
	'@nativescript/types',
	'@nativescript/webpack',
	// Angular browser animations are not used in NativeScript; excluding reduces
	// memory pressure and avoids bringing partial declarations into vendor.
	'@angular/animations',
	'@angular/platform-browser/animations',
	// Not needed at runtime with linked partials; reduce vendor size/memory.
	'@angular/platform-browser-dynamic',
	// Native add-on helpers pulled by ws or others; exclude in NS dev vendor
	'bufferutil',
	'utf-8-validate',
	'node-gyp-build',
	'bufferutil',
	'utf-8-validate',
	'node-gyp-build',
	// All @babel/* and babel-* packages are build-time tools, never runtime deps.
	// They get pulled in as peer deps of packages like @nativescript-community/solid-js
	// but should never be in the vendor bundle (they require 'fs', 'path', etc.).
	'@babel/core',
	'@babel/helper-plugin-utils',
	'@babel/generator',
	'@babel/helper-string-parser',
	'@babel/helper-validator-identifier',
	'@babel/parser',
	'@babel/plugin-syntax-typescript',
	'@babel/plugin-transform-typescript',
	'@babel/preset-typescript',
	'@babel/preset-env',
	'@babel/types',
	'babel-preset-solid',
	'babel-plugin-jsx-dom-expressions',
	// Heavy dependency not needed in vendor dev bundle; fetch via HTTP loader instead
	'rxjs',
	'nativescript',
	'typescript',
	'ts-node',
	'vue-tsc',
	'ws',
	'@types/node',
	'nativescript-theme-core',
	// Build-time tools that get pulled in as transitive dependencies but should
	// never be in the device vendor bundle (they require Node built-ins like fs,
	// path, child_process, etc.). Now that we collect transitive runtime deps,
	// these need explicit exclusion.
	'esbuild',
	'prettier',
	'acorn',
	'recast',
	'source-map',
	'source-map-js',
	'tsx',
	'diff',
	'esprima',
	// TanStack build-time router tooling (code generation, file-based routing)
	'@tanstack/router-plugin',
	'@tanstack/router-generator',
	'@tanstack/router-utils',
	'@tanstack/virtual-file-routes',
	// File system / glob utilities — build-time only, require Node fs
	'fdir',
	'picomatch',
	'tinyglobby',
	// SSR-only library (bot detection) — not needed on device
	'isbot',
	// Type-only packages with no runtime JavaScript
	'csstype',
	// NativeScript CLI hook system — build-time only, requires Node os/path
	'@nativescript/hook',
	// Test runner uses webpack's require.context API which doesn't exist in Vite.
	// Including it in the vendor bundle causes __require.context crashes at runtime.
	'@nativescript/unit-test-runner',
	'nativescript-unit-test-runner',
	// CSS build tools — postcss, tailwindcss, and related tooling are exclusively
	// build-time processors. They require Node APIs (process, fs, path) and must
	// never run on device. esbuild bundles their transitive deps (picocolors,
	// nanoid, etc.) which reference `process` and crash at runtime.
	'tailwindcss',
	'@nativescript/tailwind',
	'postcss',
	'autoprefixer',
	'postcss-import',
	'postcss-url',
	'postcss-nested',
	'picocolors',
	'nanoid',
	// Server-side SDKs that require Node networking APIs (net, tls, dns, crypto).
	// These are backend tools, not device-side.
	'mongodb',
]);

const INDEX_ALIAS_SUFFIXES = ['/index', '/index.js', '/index.android.js', '/index.ios.js', '/index.visionos.js'];

export function vendorManifestPlugin(options: VendorManifestPluginOptions): Plugin {
	let cachedResult: VendorBundleResult | null = null;
	let generating: Promise<VendorBundleResult> | null = null;

	const ensureResult = async (reason: string) => {
		if (cachedResult) {
			if (!getVendorManifest()) {
				registerVendorManifest(cachedResult.manifest);
			}
			return cachedResult;
		}
		if (!generating) {
			if (options.verbose) {
				console.log(`[vendor] generating vendor bundle (${reason}) for platform ${options.platform}...`);
			}
			generating = generateVendorBundle({
				projectRoot: options.projectRoot,
				platform: options.platform,
				mode: options.mode,
				verbose: options.verbose,
				flavor: options.flavor,
			})
				.then((result) => {
					cachedResult = result;
					registerVendorManifest(result.manifest);
					generating = null;
					if (options.verbose) {
						console.log(`[vendor] generated bundle with ${result.entries.length} modules`);
					}
					return result;
				})
				.catch((error) => {
					generating = null;
					console.error('[vendor] failed to generate vendor bundle', error);
					throw error;
				});
		}
		return generating;
	};

	const resetCache = () => {
		cachedResult = null;
		clearVendorManifest();
	};

	const respondWithVendor = async (_server: ViteDevServer, req: any, res: any) => {
		try {
			const result = await ensureResult('server');
			if (req.url === SERVER_VENDOR_PATH) {
				res.setHeader('Content-Type', 'application/javascript');
				res.end(createVendorBundleRuntimeModule(result));
				return true;
			}
			if (req.url === SERVER_MANIFEST_PATH) {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(result.manifest, null, 2));
				return true;
			}
		} catch (error) {
			console.error('[vendor] error serving vendor artifacts', error);
			res.statusCode = 500;
			res.end('// vendor manifest generation failed');
			return true;
		}
		return false;
	};

	return {
		name: 'nativescript-vendor-manifest',
		enforce: 'pre',

		configResolved() {},

		async configureServer(server) {
			await ensureResult('server-start');

			server.middlewares.use(async (req, res, next) => {
				if (req.url === SERVER_VENDOR_PATH || req.url === SERVER_MANIFEST_PATH) {
					const handled = await respondWithVendor(server, req, res);
					if (!handled) {
						next();
					}
					return;
				}
				next();
			});

			const packageJsonPath = path.resolve(options.projectRoot, 'package.json');
			server.watcher.add(packageJsonPath);
			server.watcher.on('change', (file) => {
				if (path.resolve(file) !== packageJsonPath) {
					return;
				}
				resetCache();
				ensureResult('package.json change').catch((error) => {
					console.error('[vendor] failed to regenerate vendor bundle', error);
				});
			});
		},

		async buildStart() {
			await ensureResult('build-start');
		},

		resolveId(source) {
			if (source === VENDOR_MANIFEST_ID || source === VENDOR_MANIFEST_VIRTUAL_ID) {
				return VENDOR_MANIFEST_VIRTUAL_ID;
			}
			if (source === VENDOR_BUNDLE_ID || source === VENDOR_BUNDLE_VIRTUAL_ID) {
				return VENDOR_BUNDLE_VIRTUAL_ID;
			}
			return null;
		},

		async load(id) {
			if (id === VENDOR_MANIFEST_VIRTUAL_ID) {
				const result = await ensureResult('load-manifest');
				return {
					code: `export default ${JSON.stringify(result.manifest)};`,
					moduleType: 'js',
				};
			}
			if (id === VENDOR_BUNDLE_VIRTUAL_ID) {
				const result = await ensureResult('load-bundle');
				return {
					code: createVendorBundleRuntimeModule(result),
					moduleType: 'js',
				};
			}
			return null;
		},

		async generateBundle() {
			// Default to emitting assets unless explicitly disabled.
			const shouldEmit = options.emitAssets !== false;
			if (!shouldEmit) {
				if (options.verbose) {
					console.log('[vendor] skip emitting ns-vendor assets (HMR/dev mode)');
				}
				return;
			}
			// Emit a MINIMAL on-disk vendor asset for Android SBG to scan, to avoid
			// duplicate Java proxy generation with bundle.mjs. The dev server will
			// still serve the full vendor bundle from memory for HMR.
			const minimalVendorCode = createSbgVendorAssetCode(options.platform);
			this.emitFile({
				type: 'asset',
				fileName: DEFAULT_VENDOR_FILENAME,
				source: minimalVendorCode,
			});
			// Also emit a manifest (debug aid); not consumed by SBG.
			const result = await ensureResult('generate-bundle-manifest');
			this.emitFile({
				type: 'asset',
				fileName: DEFAULT_MANIFEST_FILENAME,
				source: JSON.stringify(result.manifest, null, 2),
			});
		},
	};
}

async function generateVendorBundle(options: GenerateVendorOptions): Promise<VendorBundleResult> {
	const { projectRoot, platform, mode, flavor } = options;
	const collected = collectVendorModules(projectRoot, platform, flavor);
	const entryCode = createVendorEntry(collected.entries);

	// Externalize @nativescript/core and its subpaths in the vendor bundle so
	// vendored packages (e.g. @nativescript-community/ui-material-bottomsheet)
	// do NOT bring their own copy of core with them. The iOS import map maps
	// `@nativescript/core` → `/ns/core` (the core bridge) at runtime, and the
	// bridge delegates to the canonical Application/View/etc. already set up
	// by bundle.mjs via installCoreAliasesEarly + the globalThis.Application
	// seed. Without this externalization, vendor.mjs bundles a second copy of
	// iOSApplication/View/LayoutBase — the second iosApp never receives the
	// iOS launch event (bundle.mjs's iosApp registered first as
	// UIApplication.delegate), so Application.getRootView() on it returns
	// undefined, and any vendor-internal code that reads .getRootView() or
	// checks `instanceof View` against bundle's classes fails under HMR.
	const nsCoreExternalPlugin: esbuild.Plugin = {
		name: 'ns-core-external',
		setup(build) {
			build.onResolve({ filter: /^@nativescript\/core(?:\/.*)?$/ }, (args) => ({
				path: args.path,
				external: true,
			}));
		},
	};

	// Externalize the `solid-js` root specifier for the Solid flavor so
	// vendor-bundled packages (e.g. `@nativescript-community/solid-js`,
	// `solid-navigation`, transitively `solid-js/universal` and
	// `solid-js/store`) don't bake their own copy of solid-js into
	// vendor.mjs. The dev server's import map (see `import-map.ts`)
	// redirects bare `solid-js` to the same `/ns/m/node_modules/solid-js/...`
	// URL that Vite's alias produces for user code and `@solid-refresh`,
	// so V8 dedupes the three import paths down to a single module
	// instance — one `Owner` module-local, one reactive graph, one
	// `$DEVCOMP`/`$PROXY` symbol identity across the whole app.
	//
	// Important: scope this to the EXACT bare `solid-js` specifier. Subpaths
	// like `solid-js/store`, `solid-js/universal`, `solid-js/web` stay
	// bundleable so vendor packages that import them keep working out of
	// the box; those subpaths still go through the unified solid-js
	// runtime via their own `import 'solid-js'` statements (which we just
	// externalized).
	const nsSolidJsExternalPlugin: esbuild.Plugin = {
		name: 'ns-solid-js-external',
		setup(build) {
			build.onResolve({ filter: /^solid-js$/ }, (args) => ({
				path: args.path,
				external: true,
			}));
		},
	};

	const plugins: esbuild.Plugin[] = [
		// Mark @nativescript/core external BEFORE other plugins so esbuild never
		// tries to read/transform core's source files. See comment above.
		nsCoreExternalPlugin,
		// For the Solid flavor, externalize `solid-js` so vendor.mjs and the
		// HTTP-served `@solid-refresh` / user code converge on one runtime
		// realm. See `nsSolidJsExternalPlugin`'s definition for the full
		// duplicate-instance rationale.
		...(flavor === 'solid' ? [nsSolidJsExternalPlugin] : []),
		// Apply NativeClass transformer to convert @NativeClass decorated classes to ES5 IIFE pattern.
		// This MUST run before other plugins to ensure proper transformation.
		createNativeClassEsbuildPlugin(platform as Platform),
		// Resolve virtual modules and Angular shims used by the vendor entry.
		createVendorEsbuildPlugin(projectRoot),
	];
	// Only run the Angular linker in the vendor bundle when the active flavor
	// is Angular. Solid and other flavors do not require @angular/compiler,
	// and attempting to bundle it pulls in Babel tooling that depends on
	// Node built-ins like fs/path/url in a browser-like environment.
	if (flavor === 'angular') {
		plugins.push(angularLinkerEsbuildPlugin(projectRoot));
	}
	// Solid packages (e.g. solid-navigation) may ship raw .jsx/.tsx source
	// files instead of pre-compiled .js. esbuild's default JSX transform
	// targets React (React.createElement), which crashes at runtime with
	// "React is not defined". Add a plugin that compiles .jsx/.tsx through
	// babel-preset-solid so the vendor bundle gets proper Solid output.
	if (flavor === 'solid') {
		plugins.push(createSolidJsxEsbuildPlugin(projectRoot));
	}

	const buildResult = await esbuild.build({
		stdin: {
			contents: entryCode,
			resolveDir: projectRoot,
			sourcefile: 'ns-vendor-entry.ts',
			loader: 'ts',
		},
		platform: 'neutral',
		format: 'esm',
		bundle: true,
		target: 'es2019',
		treeShaking: false,
		sourcemap: false,
		write: false,
		logLevel: 'silent',
		// Move license comments to the end of the file to avoid mid-module annotations
		// that Rollup warns it "cannot interpret due to the position of the comment".
		// This preserves license text while preventing noisy warnings.
		legalComments: 'eof',
		// NativeScript is always a client environment — never server-side. The conditions
		// must include 'browser' so packages with conditional exports (e.g.,
		// @tanstack/router-core/isServer) resolve to client-side variants.
		//
		// 'development'/'production' (mode) is intentionally excluded: esbuild resolves
		// conditions in the order they appear in the package.json exports object, and
		// many packages list 'development' before 'browser'. Including it would cause
		// environment-ambiguous stubs (e.g., isServer = undefined) to win over the
		// correct client-side value (isServer = false). The 'import' condition already
		// provides the correct ESM entry points, and process.env.NODE_ENV (set via
		// define below) handles dev/prod branching at runtime.
		//
		// This aligns with the non-HMR Vite build: ['module', 'react-native', 'import', 'browser', 'default'].
		conditions: ['module', 'react-native', 'import', 'browser', 'default'],
		mainFields: ['module', 'browser', 'main'],
		resolveExtensions: resolveExtensionsForPlatform(platform),
		loader: {
			'.css': 'text',
			'.json': 'json',
		},
		// Mirror Vite's main-bundle DefinePlugin in the vendor esbuild build.
		//
		// esbuild's `define` requires every value to be a JS expression
		// expressed as a string (the same constraint Vite normalises away).
		// `getGlobalDefines()` returns a few raw `boolean` values for
		// historical reasons (e.g. `__COMMONJS__: false`,
		// `__UI_USE_XML_PARSER__: true`), so coerce any non-string entries
		// through `JSON.stringify` before handing the table to esbuild.
		define: (() => {
			const raw = getGlobalDefines({
				platform,
				targetMode: mode,
				verbose: !!options.verbose,
				flavor: flavor ?? '',
				isCI: !!process.env.CI,
			}) as Record<string, unknown>;
			const out: Record<string, string> = {};
			for (const [key, value] of Object.entries(raw)) {
				out[key] = typeof value === 'string' ? value : JSON.stringify(value);
			}
			// Belt-and-suspenders: keep the original NODE_ENV define explicit so
			// future changes to `getGlobalDefines()` can't silently drop it.
			out['process.env.NODE_ENV'] = JSON.stringify(mode);
			return out;
		})(),
		plugins,
		// Externalize ALL Node built-in modules. The vendor bundle runs on the
		// NativeScript device runtime, not Node, so any Node API reference must
		// be external. Using both bare and 'node:' prefixed forms.
		external: [
			'assert',
			'async_hooks',
			'buffer',
			'child_process',
			'cluster',
			'console',
			'constants',
			'crypto',
			'dgram',
			'diagnostics_channel',
			'dns',
			'domain',
			'events',
			'fs',
			'fs/promises',
			'http',
			'http2',
			'https',
			'inspector',
			'module',
			'net',
			'os',
			'path',
			'path/posix',
			'path/win32',
			'perf_hooks',
			'process',
			'punycode',
			'querystring',
			'readline',
			'repl',
			'stream',
			'stream/web',
			'stream/promises',
			'string_decoder',
			'sys',
			'timers',
			'timers/promises',
			'tls',
			'trace_events',
			'tty',
			'url',
			'util',
			'v8',
			'vm',
			'wasi',
			'worker_threads',
			'zlib',
			// node: prefixed variants
			'node:assert',
			'node:async_hooks',
			'node:buffer',
			'node:child_process',
			'node:cluster',
			'node:console',
			'node:constants',
			'node:crypto',
			'node:dgram',
			'node:diagnostics_channel',
			'node:dns',
			'node:domain',
			'node:events',
			'node:fs',
			'node:fs/promises',
			'node:http',
			'node:http2',
			'node:https',
			'node:inspector',
			'node:module',
			'node:net',
			'node:os',
			'node:path',
			'node:path/posix',
			'node:path/win32',
			'node:perf_hooks',
			'node:process',
			'node:punycode',
			'node:querystring',
			'node:readline',
			'node:repl',
			'node:stream',
			'node:stream/web',
			'node:stream/promises',
			'node:string_decoder',
			'node:sys',
			'node:timers',
			'node:timers/promises',
			'node:tls',
			'node:trace_events',
			'node:tty',
			'node:url',
			'node:util',
			'node:v8',
			'node:vm',
			'node:wasi',
			'node:worker_threads',
			'node:zlib',
		],
	});

	if (!buildResult.outputFiles?.length) {
		throw new Error('Vendor bundle generation produced no output');
	}

	const rawVendorCode = buildResult.outputFiles[0].text;

	// Prepend platform polyfills so they run BEFORE any vendor module code.
	// This ensures globals like AbortController and self are available when
	// frameworks (TanStack Router, etc.) first execute inside the bundle.
	const polyfillPrelude = generatePlatformPolyfills();
	const vendorCode = polyfillPrelude + rawVendorCode;

	const hash = createHash('sha1').update(vendorCode).digest('hex');
	const manifest = buildManifest(collected.entries, hash);

	return {
		code: vendorCode,
		manifest,
		entries: collected.entries,
	};
}

function collectVendorModules(projectRoot: string, platform: string, flavor?: string): CollectedVendorModules {
	const packageJsonPath = path.resolve(projectRoot, 'package.json');
	const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	const projectRequire = createRequire(packageJsonPath);
	const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';

	const vendor = new Set<string>();
	const visited = new Set<string>();
	const queue: string[] = [];
	// Local-source deps (file: pointing to a directory, link:, workspace:) are
	// app code, not pre-packaged libraries. esbuild's vendor pipeline has none
	// of the user's tsconfig path aliases or other Vite plugin resolvers, so
	// any aliased import inside their source will fail with "Could not
	// resolve". We collect their names here so that peer-dep traversal can
	// also skip them.
	const localSourceNames = new Set<string>();

	const isPackageRootSpecifier = (name: string): boolean => {
		if (!name) return false;
		if (name.startsWith('@')) {
			// Scoped: @scope/name is root; anything deeper is subpath
			const parts = name.split('/');
			return parts.length === 2;
		}
		// Unscoped: no slash means root; any slash means subpath
		return !name.includes('/');
	};

	const isAngularFlavor = flavor === 'angular';
	const isSolidFlavor = flavor === 'solid';
	const addCandidate = (name: string) => {
		if (!name || shouldSkipDependency(name)) {
			return;
		}
		// Avoid pulling Angular compiler/runtime into the dev vendor bundle when
		// the current project flavor is not Angular (for example, solid). This
		// prevents esbuild from trying to bundle @angular/compiler and its Babel
		// toolchain, which requires Node built-ins like fs/path/url.
		if (!isAngularFlavor && (name === '@angular/compiler' || name.startsWith('@angular/'))) {
			return;
		}
		// For the Solid flavor, keep `solid-js` itself OUT of the vendor bundle.
		//
		// Both `@solid-refresh` (served via HTTP) and Vite-aliased user code
		// import `solid-js` through the dev server, while the vendor bundle
		// pulls it in as a peerDependency of `@nativescript-community/solid-js`.
		// Two copies → two `Owner` module-locals → the proxy memo created by
		// `solid-refresh`'s `HMRComp` is registered on the HTTP copy's Owner
		// (which is always null — hence the
		// `computations created outside a createRoot or render` warning), while
		// `render(App, doc)` runs against the vendor copy's Owner. Same chain
		// breaks HMR propagation: `patchRegistry`'s `setComp` ticks the HTTP
		// copy's signal but the live page tree subscribes through the vendor
		// copy's reactive graph, so the new component body never reaches the
		// screen.
		//
		// We pair this skip with the matching esbuild externalization
		// (`nsSolidJsExternalPlugin`) and an import-map redirect in
		// `import-map.ts` that points `solid-js` at the HTTP URL. All three
		// converge on the same dev-server URL, V8 dedupes by URL, and the
		// app sees a single `solid-js` realm.
		if (isSolidFlavor && name === 'solid-js') {
			return;
		}
		// Skip already-visited packages to avoid redundant queue processing
		if (visited.has(name)) {
			return;
		}
		visited.add(name);
		vendor.add(name);
		const isRoot = isPackageRootSpecifier(name);
		// Only traverse deps for package roots; subpaths should not attempt package.json resolution
		if (isRoot) {
			queue.push(name);
		}
	};

	const addDeps = (deps: Record<string, unknown> | undefined) => {
		if (!deps) {
			return;
		}
		for (const [name, spec] of Object.entries(deps)) {
			if (isUnvendorableLocalSource(name, spec, projectRequire, platform)) {
				// Defer to the regular Vite/Rolldown pipeline (HTTP-served in
				// dev, bundled in production) where the
				// ns-tsconfig-paths-resolver and the rest of the plugin chain
				// can handle aliased imports. Local .tgz file: refs ARE proper
				// packaged libraries and DO stay in vendor; so do file:
				// directory refs that point at packages with compiled JS
				// entry points (a common NativeScript monorepo pattern that
				// hoists installs and re-exposes them from the app's
				// package.json via `file:../../node_modules/<name>`).
				localSourceNames.add(name);
				if (debug) {
					console.log(`[vendor] skipping local source dependency ${name} (spec: ${String(spec)})`);
				}
				continue;
			}
			addCandidate(name);
		}
	};

	addDeps(pkg.dependencies);
	addDeps(pkg.optionalDependencies);

	for (const name of ALWAYS_INCLUDE) {
		// Some force-included packages are only present transitively in apps that
		// actually use them. Skip missing packages quietly so unrelated projects do
		// not fail vendor collection just because the policy list names them.
		if (canResolveDependencyPackageJson(name, projectRequire)) {
			addCandidate(name);
		}
	}

	// Ensure Android Activity proxy is present for SBG scanning in dev/HMR
	// and non-HMR builds alike: explicitly include the side-effect module
	// that registers `com.tns.NativeScriptActivity`.
	if (platform === 'android') {
		addCandidate('@nativescript/core/ui/frame/activity.android');
	}

	if (pkg.dependencies?.['nativescript-vue'] && pkg.devDependencies?.vue) {
		addCandidate('vue');
	}

	// Angular framework packages are intentionally NOT added to vendor. They are
	// served via HTTP only so every importer resolves to a single module realm.
	// See shouldSkipDependency() for the full rationale. RxJS is also left out of
	// vendor (large, and not required in the vendor bundle for dev HMR).

	if (pkg.dependencies?.['react-nativescript']) {
		if (pkg.dependencies?.react) {
			addCandidate('react');
		}
		if (pkg.dependencies?.['react-dom']) {
			addCandidate('react-dom');
		}
	}

	// SolidJS / TanStack Router: when @nativescript/tanstack-router is a dependency,
	// its runtime deps (@tanstack/solid-router, @tanstack/router-core, @tanstack/history)
	// MUST be in the vendor bundle. These packages:
	// 1. Use browser APIs (window.dispatchEvent) that don't exist in NativeScript — they
	//    must be bundled where the NativeScript wrapper intercepts those calls
	// 2. Contain JSX source that needs Solid compilation (dist/source/*.jsx) — the HTTP
	//    fallback can't compile node_modules JSX since vite-plugin-solid skips it
	// 3. Import solid-js internally — loading via HTTP creates a separate solid-js instance
	// esbuild uses the 'import' condition (not 'solid'), resolving to pre-compiled
	// dist/esm/*.js which avoids all three issues.
	if (pkg.dependencies?.['@nativescript/tanstack-router']) {
		addCandidate('@tanstack/solid-router');
		addCandidate('@tanstack/router-core');
		addCandidate('@tanstack/history');
	}

	parseEnvList(process.env.NS_VENDOR_INCLUDE).forEach(addCandidate);

	const projectDeps = {
		dependencies: new Set(Object.keys(pkg.dependencies ?? {})),
		optional: new Set(Object.keys(pkg.optionalDependencies ?? {})),
		dev: new Set(Object.keys(pkg.devDependencies ?? {})),
	};

	while (queue.length) {
		const specifier = queue.shift()!;
		const dependencyPkg = readDependencyPackageJson(specifier, projectRequire);
		if (!dependencyPkg) {
			continue;
		}

		const peerDependencies = Object.keys(dependencyPkg.peerDependencies ?? {});
		for (const peer of peerDependencies) {
			if (shouldSkipDependency(peer) || localSourceNames.has(peer)) {
				continue;
			}
			if (projectDeps.dependencies.has(peer) || projectDeps.optional.has(peer) || projectDeps.dev.has(peer)) {
				addCandidate(peer);
			}
		}

		// NOTE: We intentionally do NOT collect transitive runtime dependencies
		// here. The import map + runtime specifier normalization handles non-vendor
		// packages by routing them through HTTP to the Vite dev server. This avoids
		// the fragility of trying to esbuild-bundle every transitive dep (which can
		// fail due to Node built-ins, type-only packages, duplicate module instances,
		// etc.). Only direct project dependencies go into the vendor bundle.
	}

	parseEnvList(process.env.NS_VENDOR_EXCLUDE).forEach((name) => {
		vendor.delete(name);
	});

	return {
		entries: Array.from(vendor).sort(),
	};
}

function shouldSkipDependency(name: string): boolean {
	if (!name) {
		return true;
	}
	if (ALWAYS_EXCLUDE.has(name)) {
		return true;
	}
	// Angular framework packages must only be served via the HTTP path so every
	// importer resolves to a single module realm. When these packages are present
	// in the vendor bundle AND imported by app modules via HTTP subpath, every
	// @Component/@Injectable gets defined twice (once per realm), producing NG0912
	// selector collisions, cross-realm `instanceof` failures, and dual class
	// identities throughout Angular's DI container. HTTP-only is the single-realm
	// invariant for user-level framework code.
	if (name === '@nativescript/angular' || name === 'nativescript-angular' || name.startsWith('@angular/')) {
		return true;
	}
	// All Babel packages are build tools — never bundle into device runtime.
	// They require Node built-ins (fs, path, url) that don't exist on device.
	if (name.startsWith('@babel/') || name.startsWith('babel-')) {
		return true;
	}
	// Dev tools and type-only packages — not needed on device
	if (name.startsWith('@solid-devtools/')) {
		return true;
	}
	if (name.startsWith('@types/')) {
		return true;
	}
	// PostCSS ecosystem — all build-time CSS processing
	if (name === 'postcss' || name.startsWith('postcss-')) {
		return true;
	}
	// Tailwind ecosystem — build-time only CSS framework
	if (name.includes('tailwind')) {
		return true;
	}
	// Test runners and frameworks — never needed on device
	if (name.includes('test-runner') || name.includes('unit-test')) {
		return true;
	}
	// Linters and formatters — build-time tools
	if (name.includes('eslint') || name.includes('stylelint')) {
		return true;
	}
	if (name.startsWith('.')) {
		return true;
	}
	if (name.startsWith('file:')) {
		return true;
	}
	if (name.startsWith('workspace:')) {
		return true;
	}
	if (name.startsWith('link:')) {
		return true;
	}
	return false;
}

const COMPILED_JS_ENTRY_EXTENSIONS = ['.js', '.mjs', '.cjs'];
const COMPILED_JS_ENTRY_REGEX = /\.(?:c|m)?jsx?$/;

function compiledJsExtensionsForPlatform(platform: string | undefined): string[] {
	const exts = [...COMPILED_JS_ENTRY_EXTENSIONS];
	switch (platform) {
		case 'android':
			exts.push('.android.js');
			break;
		case 'ios':
			exts.push('.ios.js', '.visionos.js');
			break;
		case 'visionos':
			exts.push('.visionos.js', '.ios.js');
			break;
	}
	return exts;
}

/**
 * Determine whether a `package.json` dependency must be excluded from the
 * HMR vendor bundle because esbuild's standalone vendor pipeline can't
 * resolve its source.
 *
 * The HMR vendor bundle is generated by a standalone esbuild build that
 * has none of the Vite plugin chain (most notably
 * `ns-tsconfig-paths-resolver`), so any aliased import inside the
 * package's **source** files will fail with "Could not resolve" and abort
 * the whole bundle.
 *
 * Skip:
 *  - `link:` and `workspace:` refs (always app-side source).
 *  - `file:` refs to a directory whose installed package only ships
 *    TypeScript/JSX source (no compiled `.js`/`.mjs`/`.cjs` entry).
 *
 * Keep (return false):
 *  - Regular semver / git / url specs (normal third-party libraries).
 *  - Local `.tgz` file refs (pre-packaged libraries extracted at install).
 *  - `file:` directory refs that resolve to a package with a compiled JS
 *    entry — a common NativeScript monorepo convention where the app's
 *    `package.json` redirects to `../../node_modules/<name>` to avoid
 *    duplicate installs while letting the NativeScript CLI discover
 *    plugins from the app directory.
 */
export function isUnvendorableLocalSource(name: string, spec: unknown, projectRequire: ReturnType<typeof createRequire>, platform?: string): boolean {
	if (typeof spec !== 'string') return false;
	if (spec.startsWith('link:') || spec.startsWith('workspace:')) return true;
	if (!spec.startsWith('file:')) return false;
	// Tarballs are already pre-packaged libraries — install extracts them
	// into a normal node_modules entry.
	if (/\.t(?:ar\.)?gz(?:[?#].*)?$/.test(spec)) return false;
	// Directory file: refs need a deeper check: peek at the installed
	// package.json and ask "does this ship compiled JS?". If yes, vendor
	// it. If no (TS source only), defer to the regular Vite pipeline.
	return !packageHasCompiledJsEntry(name, projectRequire, platform);
}

function packageHasCompiledJsEntry(name: string, projectRequire: ReturnType<typeof createRequire>, platform?: string): boolean {
	let pkgJsonPath: string;
	try {
		pkgJsonPath = projectRequire.resolve(`${name}/package.json`);
	} catch {
		return false;
	}
	let pkg: any;
	try {
		pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
	} catch {
		return false;
	}
	const pkgDir = path.dirname(pkgJsonPath);
	const candidates: string[] = [];
	const pushCandidate = (value: unknown) => {
		if (typeof value === 'string' && value) candidates.push(value);
	};
	pushCandidate(pkg.module);
	pushCandidate(pkg.main);
	// Recursively flatten conditional `exports` maps to surface concrete
	// file paths. We only need `string` leaves; anything else (function-
	// based exports, etc.) doesn't apply to esbuild's resolution.
	const visitExports = (node: any) => {
		if (!node) return;
		if (typeof node === 'string') {
			pushCandidate(node);
			return;
		}
		if (Array.isArray(node)) {
			for (const item of node) visitExports(item);
			return;
		}
		if (typeof node === 'object') {
			for (const value of Object.values(node)) visitExports(value);
		}
	};
	visitExports(pkg.exports);
	if (candidates.length === 0) {
		// node's default lookup falls back to `index.js`.
		candidates.push('index');
	}
	const extensionsToTry = compiledJsExtensionsForPlatform(platform);
	for (const cand of candidates) {
		const abs = path.resolve(pkgDir, cand);
		const ext = path.extname(cand);
		if (COMPILED_JS_ENTRY_REGEX.test(cand)) {
			// Explicit JS extension. If the file exists, vendor it. If not
			// (a NativeScript plugin commonly declares `main: "index.js"`
			// but ships only platform variants like `index.ios.js`), try
			// the platform-specific variants which esbuild's
			// `resolveExtensions` will pick up at bundle time.
			if (fs.existsSync(abs)) return true;
			const baseAbs = abs.slice(0, -ext.length);
			for (const e of extensionsToTry) {
				if (fs.existsSync(baseAbs + e)) return true;
			}
			continue;
		}
		if (!ext) {
			// Extensionless main — try plain JS variants AND the
			// platform-specific variants NativeScript plugins commonly use
			// (`index.ios.js`, `index.android.js`, `index.visionos.js`).
			for (const e of extensionsToTry) {
				if (fs.existsSync(abs + e)) return true;
			}
			continue;
		}
		// A non-JS extension (typically `.ts`/`.tsx`) means the package
		// only ships TS source — esbuild's vendor pipeline can't resolve
		// any tsconfig-aliased imports inside it.
	}
	return false;
}

export const __test_collectVendorModules = collectVendorModules;
export const __test_createVendorBundleRuntimeModule = createVendorBundleRuntimeModule;
export const __test_isUnvendorableLocalSource = isUnvendorableLocalSource;
export const __test_packageHasCompiledJsEntry = packageHasCompiledJsEntry;

function canResolveDependencyPackageJson(specifier: string, projectRequire: ReturnType<typeof createRequire>): boolean {
	try {
		projectRequire.resolve(`${specifier}/package.json`);
		return true;
	} catch {
		return false;
	}
}

function readDependencyPackageJson(specifier: string, projectRequire: ReturnType<typeof createRequire>) {
	try {
		const packageJsonPath = projectRequire.resolve(`${specifier}/package.json`);
		return JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	} catch (error) {
		if (process.env.VITE_DEBUG_LOGS) {
			console.warn(`[vendor] unable to resolve ${specifier} package.json`, error);
		}
		return null;
	}
}

function parseEnvList(value: string | undefined): string[] {
	if (!value) {
		return [];
	}
	return value
		.split(',')
		.map((token) => token.trim())
		.filter(Boolean);
}

function createVendorEntry(entries: string[]): string {
	if (!entries.length) {
		return `export const __nsVendorModuleMap = {};
`;
	}

	// Emit a side-effect-only import FIRST for each entry, then the namespace
	// import we actually expose through `__nsVendorModuleMap`. Per the ESM
	// spec, `import "pkg";` (no clause) guarantees module body evaluation, and
	// esbuild treats these as DCE-immune even when the package declares
	// `"sideEffects": false`. Without this, packages whose top-level
	// statements install runtime patches (e.g. `@nativescript-community/text`
	// monkey-patching `TextBase.prototype.setTextDecorationAndTransform` via
	// `overrideSpanAndFormattedString()` invoked from
	// `@nativescript-community/ui-label/index-common.js` line 12) can have
	// their bodies elided by esbuild — exports stay resolvable via the
	// namespace, but the runtime patches never fire, producing line-height /
	// letter-spacing / formatted-text rendering divergence between HMR
	// (vendor.mjs via HTTP) and no-HMR (single Rolldown bundle that inlines
	// everything anyway). This affects any NS plugin that relies on top-level
	// side-effects to wire up renderer behavior.
	const sideEffectImports = entries.map((specifier) => `import ${JSON.stringify(specifier)};`).join('\n');
	const namespaceImports = entries.map((specifier, index) => `import * as __nsVendor_${index} from ${JSON.stringify(specifier)};`).join('\n');

	const modules = entries.map((specifier, index) => `${JSON.stringify(specifier)}: __nsVendor_${index}`).join(',\n  ');

	return `${sideEffectImports}\n\n${namespaceImports}\n\nexport const __nsVendorModuleMap = {\n  ${modules}\n};\n`;
}

function createVendorBundleRuntimeModule(result: VendorBundleResult): string {
	return `${result.code}
export const vendorManifest = ${JSON.stringify(result.manifest)};
export default vendorManifest;
`;
}

function resolveExtensionsForPlatform(platform: string): string[] {
	const base = ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.json'];
	const extensions = new Set<string>(base);

	if (platform === 'android') {
		['.android.tsx', '.android.jsx', '.android.ts', '.android.js'].forEach((ext) => extensions.add(ext));
	} else {
		['.ios.tsx', '.ios.jsx', '.ios.ts', '.ios.js', '.visionos.tsx', '.visionos.jsx', '.visionos.ts', '.visionos.js'].forEach((ext) => extensions.add(ext));
	}

	return Array.from(extensions);
}

function buildManifest(entries: string[], hash: string): VendorManifest {
	const modules: Record<string, VendorManifestModuleEntry> = {};
	const aliases: Record<string, string> = {};

	for (const specifier of entries) {
		modules[specifier] = {
			id: specifier,
			exports: { '*': true },
		};

		const canonical = stripIndexSuffix(specifier);
		if (canonical !== specifier) {
			modules[canonical] ??= {
				id: canonical,
				exports: { '*': true },
			};
			aliases[specifier] = canonical;
			aliases[canonical] = canonical;
		}

		for (const suffix of INDEX_ALIAS_SUFFIXES) {
			const alias = canonical + suffix;
			if (alias !== specifier) {
				aliases[alias] ||= canonical;
			}
		}
	}

	return {
		version: 1,
		createdAt: new Date().toISOString(),
		hash,
		modules,
		aliases,
	};
}

// Produce a tiny vendor file for Android SBG scanning to generate required Java proxies
// without duplicating other proxies already present in bundle.mjs.
function createSbgVendorAssetCode(platform: string): string {
	const lines: string[] = [];
	lines.push('// ns-vendor.mjs (minimal) - emitted for Android SBG scanning only');
	lines.push('// Avoid importing @nativescript/core root to prevent duplicate Java proxies.');
	if (platform === 'android') {
		// Ensure Activity proxy is generated by SBG.
		lines.push("import '@nativescript/core/ui/frame/activity.android';");
	}
	// Export an empty vendor module map for consistency; unused by SBG.
	lines.push('export const __nsVendorModuleMap = {};\nexport default {};\n');
	return lines.join('\n');
}

function stripIndexSuffix(specifier: string): string {
	return specifier.replace(/\/(?:(?:index)(?:\.[^.\/]+)?)$/, '');
}

export type { VendorManifest, VendorManifestModuleEntry, VendorBundleResult };
