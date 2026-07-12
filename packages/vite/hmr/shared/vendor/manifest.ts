import type { Plugin, ViteDevServer } from 'vite';
import * as esbuild from 'esbuild';
import path from 'path';
import { createHash } from 'crypto';
import { registerVendorManifest, clearVendorManifest, getVendorManifest, getVendorRuntimeModule } from './registry.js';
import { collectVendorModules } from './manifest-collect.js';
import { generatePlatformPolyfills } from '../runtime/platform-polyfills.js';
import type { Platform } from '../../../helpers/platform-types.js';
import { createNativeClassEsbuildPlugin } from '../../../helpers/nativeclass-esbuild-plugin.js';
import { getGlobalDefines } from '../../../helpers/global-defines.js';
import { createVendorEsbuildPlugin, createSolidJsxEsbuildPlugin, angularLinkerEsbuildPlugin, createUnicodeRegexEsbuildPlugin, createWebpackLoaderStubEsbuildPlugin, createNodeBuiltinPolyfillEsbuildPlugin, createOptionalDependencyStubEsbuildPlugin, createNativeAddonStubEsbuildPlugin } from './vendor-esbuild-plugins.js';

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

	// Manifest registration without the esbuild payload build. The dev serve
	// process only needs the manifest (module ids + aliases) for the import
	// map and vendor-routing decisions — the payload itself is deps-backed
	// (see getVendorRuntimeModule). The full build stays lazy, reached only
	// through the fallback serving path or the build-process virtual modules.
	const ensureManifestRegistered = () => {
		if (getVendorManifest()) return;
		const collected = collectVendorModules(options.projectRoot, options.platform, options.flavor);
		const hash = createHash('sha1').update(JSON.stringify(collected.entries)).digest('hex');
		registerVendorManifest(buildManifest(collected.entries, hash));
	};

	const respondWithVendor = async (_server: ViteDevServer, req: any, res: any) => {
		try {
			if (req.url === SERVER_VENDOR_PATH) {
				// ONE node_modules payload: when the deps bundle is active, the
				// vendor module is a thin view over /ns/deps-bundle.mjs.
				const depsBacked = getVendorRuntimeModule();
				if (depsBacked !== null) {
					res.setHeader('Content-Type', 'application/javascript');
					res.end(depsBacked);
					return true;
				}
				const result = await ensureResult('server');
				res.setHeader('Content-Type', 'application/javascript');
				res.end(createVendorBundleRuntimeModule(result));
				return true;
			}
			if (req.url === SERVER_MANIFEST_PATH) {
				const registered = getVendorManifest();
				if (registered) {
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(registered, null, 2));
					return true;
				}
				const result = await ensureResult('server');
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
			try {
				ensureManifestRegistered();
			} catch (error) {
				console.error('[vendor] failed to register vendor manifest at server start', error);
			}

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
				try {
					ensureManifestRegistered();
				} catch (error) {
					console.error('[vendor] failed to regenerate vendor manifest', error);
				}
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
		// Stub legacy webpack-loader-prefixed requires (dead NS 6/7 branches in
		// plugins) BEFORE resolution — a single `loader!./x` specifier would
		// otherwise hard-fail the whole bundle. See the plugin for details.
		createWebpackLoaderStubEsbuildPlugin(),
		createOptionalDependencyStubEsbuildPlugin(options.projectRoot),
		// Stub compiled `.node` addons (fsevents & co.) — unloadable by esbuild and
		// unrunnable on device; a throwing stub preserves optional-dep semantics.
		createNativeAddonStubEsbuildPlugin(),
		// Bundle installed npm polyfills for node-builtin names (buffer, events,
		// ...) instead of leaving bare externals the device cannot resolve.
		createNodeBuiltinPolyfillEsbuildPlugin(projectRoot),
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
	// Registered last so the framework-specific passes above own their files
	// first (esbuild stops at the first onLoad that returns a result). Applies
	// to every flavor: any vendored dependency (e.g. highlight.js) may ship
	// `\p{…}` regexes that NativeScript's non-ICU V8 cannot compile, which would
	// otherwise abort the entire vendor.mjs compile. See the plugin for details.
	plugins.push(createUnicodeRegexEsbuildPlugin(projectRoot));

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
			// webpack-HMR idiom carried by ESM-published packages — a FREE
			// `module.hot` reference is a ReferenceError in the ESM bundle the
			// moment it evaluates (see the matching define in deps-bundle.ts).
			out['module.hot'] = 'undefined';
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

export function createVendorBundleRuntimeModule(result: VendorBundleResult): string {
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
