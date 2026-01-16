import type { Plugin, ViteDevServer } from 'vite';
import * as esbuild from 'esbuild';
import { readFile } from 'fs/promises';
import path from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { createRequire } from 'node:module';
import { registerVendorManifest, clearVendorManifest, getVendorManifest } from './registry.js';

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
// Reserved for any future always-include packages; keep empty by default so
// framework-specific tooling like @angular/compiler are only pulled in when
// the corresponding framework is actually used.
const ALWAYS_INCLUDE = new Set<string>([]);
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
	'@babel/core',
	'@babel/helper-plugin-utils',
	'@babel/generator',
	'@babel/helper-string-parser',
	'@babel/helper-validator-identifier',
	'@babel/parser',
	'@babel/plugin-syntax-typescript',
	'@babel/plugin-transform-typescript',
	'@babel/types',
	// Heavy dependency not needed in vendor dev bundle; fetch via HTTP loader instead
	'rxjs',
	'nativescript',
	'typescript',
	'ts-node',
	'vue-tsc',
	'ws',
	'@types/node',
	'nativescript-theme-core',
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
				res.end(result.code);
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
				return `export default ${JSON.stringify(result.manifest)};`;
			}
			if (id === VENDOR_BUNDLE_VIRTUAL_ID) {
				const result = await ensureResult('load-bundle');
				// Return a single self-contained module that includes both the vendor module map
				// and the vendor manifest to avoid extra imports that can influence chunking.
				// - result.code exports `__nsVendorModuleMap`
				// - we append an inline manifest export
				return `${result.code}
export const vendorManifest = ${JSON.stringify(result.manifest)};
export default vendorManifest;
`;
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

	const plugins: esbuild.Plugin[] = [
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
		conditions: ['module', 'import', platform, mode],
		mainFields: ['module', 'browser', 'main'],
		resolveExtensions: resolveExtensionsForPlatform(platform),
		loader: {
			'.css': 'text',
			'.json': 'json',
		},
		define: {
			'process.env.NODE_ENV': JSON.stringify(mode),
		},
		plugins,
		external: ['fs', 'fs/promises', 'path', 'url', 'module', 'node:fs', 'node:fs/promises', 'node:path', 'node:url', 'node:module', 'assert', 'process', 'v8', 'util'],
	});

	if (!buildResult.outputFiles?.length) {
		throw new Error('Vendor bundle generation produced no output');
	}

	const vendorCode = buildResult.outputFiles[0].text;
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

	const vendor = new Set<string>();
	const visited = new Set<string>();
	const queue: string[] = [];

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
		const isRoot = isPackageRootSpecifier(name);
		if (!visited.has(name)) {
			visited.add(name);
		}
		vendor.add(name);
		// Only traverse peer deps for package roots; subpaths should not attempt package.json resolution
		if (isRoot) {
			queue.push(name);
		}
	};

	const addDeps = (deps: Record<string, unknown> | undefined) => {
		if (!deps) {
			return;
		}
		for (const name of Object.keys(deps)) {
			addCandidate(name);
		}
	};

	addDeps(pkg.dependencies);
	addDeps(pkg.optionalDependencies);

	for (const name of ALWAYS_INCLUDE) {
		addCandidate(name);
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

	if (pkg.dependencies?.['@nativescript/angular']) {
		if (pkg.dependencies?.['@angular/core']) {
			addCandidate('@angular/core');
		}
		if (pkg.dependencies?.['@angular/common']) {
			addCandidate('@angular/common');
		}
		// RxJS is large and not required inside the vendor bundle for dev HMR.
		// Avoid bundling to reduce memory pressure; let app import via HTTP loader.
	}

	if (pkg.dependencies?.['react-nativescript']) {
		if (pkg.dependencies?.react) {
			addCandidate('react');
		}
		if (pkg.dependencies?.['react-dom']) {
			addCandidate('react-dom');
		}
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
			if (shouldSkipDependency(peer)) {
				continue;
			}
			if (projectDeps.dependencies.has(peer) || projectDeps.optional.has(peer) || projectDeps.dev.has(peer)) {
				addCandidate(peer);
			}
		}
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

	const imports = entries.map((specifier, index) => `import * as __nsVendor_${index} from ${JSON.stringify(specifier)};`).join('\n');

	const modules = entries.map((specifier, index) => `${JSON.stringify(specifier)}: __nsVendor_${index}`).join(',\n  ');

	return `${imports}\n\nexport const __nsVendorModuleMap = {\n  ${modules}\n};\n`;
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

function createVendorEsbuildPlugin(projectRoot: string): esbuild.Plugin {
	return {
		name: 'ns-vendor-resolver',
		setup(build) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			build.onResolve({ filter: /^~\/package\.json$/ }, () => ({
				path: path.resolve(projectRoot, 'package.json'),
			}));

			build.onResolve({ filter: /^module$/ }, () => ({
				path: 'ns-vendor-module-shim',
				namespace: 'ns-vendor',
			}));

			build.onLoad({ filter: /^ns-vendor-module-shim$/, namespace: 'ns-vendor' }, () => ({
				contents: vendorModuleShim,
				loader: 'js',
			}));

			// Stub Angular animations in vendor to avoid bundling browser-only code.
			// Provide named exports expected by @nativescript/angular to satisfy esbuild.
			const PB_ANIMATIONS_ID = 'ns-animations-pb-shim';
			const ANIMATIONS_BROWSER_ID = 'ns-animations-browser-shim';
			const ANIMATIONS_ID = 'ns-animations-noop';
			// @angular/platform-browser/animations -> provide concrete named stubs
			build.onResolve({ filter: /^@angular\/platform-browser\/animations(?:\/.*)?$/ }, (args) => {
				if (debug) {
					try {
						console.log('[vendor] map', args.path, '->', PB_ANIMATIONS_ID);
					} catch {}
				}
				return { path: PB_ANIMATIONS_ID, namespace: 'ns-vendor' };
			});
			build.onLoad({ filter: new RegExp(`^${PB_ANIMATIONS_ID}$`), namespace: 'ns-vendor' }, () => ({
				contents: [
					'export default {};',
					// Commonly imported symbols by @nativescript/angular
					'export class AnimationBuilder {};',
					'export const \u0275BrowserAnimationBuilder = class {};',
					'export const \u0275AnimationEngine = class {};',
					'export const \u0275AnimationRendererFactory = class {};',
					'export const \u0275WebAnimationsStyleNormalizer = class {};',
					// Typical platform-browser/animations APIs exported; safe no-ops
					'export class BrowserAnimationsModule {};',
					'export class NoopAnimationsModule {};',
					'export const provideAnimations = (..._args) => [];',
					'export const provideNoopAnimations = (..._args) => [];',
					// Marker used by some Angular internals
					'export const ANIMATION_MODULE_TYPE = void 0;',
				].join('\n'),
				loader: 'js',
			}));
			// @angular/animations/browser -> provide ɵ* engine/renderer/style normalizer stubs
			build.onResolve({ filter: /^@angular\/animations\/browser(?:\/.*)?$/ }, (args) => {
				if (debug) {
					try {
						console.log('[vendor] map', args.path, '->', ANIMATIONS_BROWSER_ID);
					} catch {}
				}
				return { path: ANIMATIONS_BROWSER_ID, namespace: 'ns-vendor' };
			});
			build.onLoad({ filter: new RegExp(`^${ANIMATIONS_BROWSER_ID}$`), namespace: 'ns-vendor' }, () => ({
				contents: [
					'export default {};',
					'export class AnimationDriver {};',
					'export const \u0275AnimationRendererFactory = class {};',
					'export const \u0275AnimationStyleNormalizer = class {};',
					'export const \u0275WebAnimationsStyleNormalizer = class {};',
					'export const \u0275AnimationEngine = class {};',
					// Convenience alias if any consumers import non-ɵ name
					'export const AnimationStyleNormalizer = \u0275AnimationStyleNormalizer;',
				].join('\n'),
				loader: 'js',
			}));

			// @angular/animations -> broad no-op surface
			build.onResolve(
				// Keep generic mapping for @angular/animations base; /browser is handled above
				{ filter: /^@angular\/animations(?:$|\/)$/ },
				(args) => {
					if (debug) {
						try {
							console.log('[vendor] map', args.path, '->', ANIMATIONS_ID);
						} catch {}
					}
					return { path: ANIMATIONS_ID, namespace: 'ns-vendor' };
				},
			);
			build.onLoad({ filter: new RegExp(`^${ANIMATIONS_ID}$`), namespace: 'ns-vendor' }, () => ({
				contents: [
					'export default {};',
					// Provide names sometimes (incorrectly) imported from @angular/animations by wrappers
					'export class AnimationBuilder {};',
					'export const \u0275BrowserAnimationBuilder = class {};',
					'export const \u0275AnimationEngine = class {};',
					'export const \u0275AnimationRendererFactory = class {};',
					'export const \u0275WebAnimationsStyleNormalizer = class {};',
					'export const ANIMATION_MODULE_TYPE = void 0;',
					// Export a few common tokens as harmless stubs
					'export const animate = (..._a) => ({});',
					'export const state = (..._a) => ({});',
					'export const style = (..._a) => ({});',
					'export const transition = (..._a) => ({});',
					'export const trigger = (..._a) => ({});',
					'export const sequence = (..._a) => ({});',
					'export const group = (..._a) => ({});',
					'export const query = (..._a) => ({});',
					'export const stagger = (..._a) => ({});',
					'export const keyframes = (..._a) => ({});',
				].join('\n'),
				loader: 'js',
			}));
		},
	};
}

/**
 * Minimal esbuild plugin to run Angular linker (Babel) over partial-compiled
 * Angular packages in node_modules. This converts ɵɵngDeclare* calls into
 * ɵɵdefine* so runtime doesn't require the JIT compiler.
 */
function angularLinkerEsbuildPlugin(projectRoot: string): esbuild.Plugin {
	// Lazily resolve Babel and Angular linker from the project to avoid hard deps
	let babel: typeof import('@babel/core') | null = null;
	let createLinker: any = null;

	async function ensureDeps() {
		if (babel && createLinker) return;
		try {
			const req = createRequire(projectRoot + '/package.json');
			// Resolve from the application project first
			const babelPath = req.resolve('@babel/core');
			const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
			babel = (await import(babelPath)) as any;
			const linkerMod = await import(linkerPath);
			createLinker = (linkerMod as any).createLinkerPlugin || (linkerMod as any).createEs2015LinkerPlugin || null;
		} catch {
			// As a fallback, try local resolution (hoisted installs)
			try {
				babel = (await import('@babel/core')) as any;
			} catch {}
			try {
				const linkerMod = await import('@angular/compiler-cli/linker/babel');
				createLinker = (linkerMod as any).createLinkerPlugin || (linkerMod as any).createEs2015LinkerPlugin || null;
			} catch {}
		}
	}

	// Restrict to Angular framework packages to minimize esbuild memory usage.
	const FILTER = /node_modules\/(?:@angular|@nativescript\/angular)\/.*\.[mc]?js$/;

	return {
		name: 'ns-angular-linker',
		async setup(build) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			await ensureDeps();
			if (!babel || !createLinker) {
				// Nothing to do if deps unavailable
				return;
			}
			build.onLoad({ filter: FILTER }, async (args) => {
				try {
					const source = await readFile(args.path, 'utf8');
					// Fast-path: only run linker when partial declarations are present
					if (!(source.includes('\u0275\u0275ngDeclare') || source.includes('ɵɵngDeclare'))) {
						return { contents: source, loader: 'js' };
					}
					const plugin = createLinker({
						// Link everything the filter captures; plugin will no-op otherwise
						// shouldLink is inferred by plugin when left unset for Babel version
						sourceMapping: false,
					});
					if (debug) {
						try {
							console.log('[ns-angular-linker][vendor] linking', args.path);
						} catch {}
					}
					const result = await (babel as any).transformAsync(source, {
						filename: args.path,
						configFile: false,
						babelrc: false,
						sourceMaps: false,
						compact: false,
						plugins: [plugin],
					});
					return {
						contents: (result && result.code) || source,
						loader: 'js',
					};
				} catch (e) {
					// On any failure, return original source to avoid breaking the build
					return { contents: await readFile(args.path, 'utf8'), loader: 'js' };
				}
			});
		},
	};
}

const vendorModuleShim = `
const g = globalThis;
const BACKSLASH = String.fromCharCode(92);

function toForwardSlashes(input) {
  return String(input ?? '').split(BACKSLASH).join('/');
}

function getNativeScriptRequire() {
  const nsRequire = typeof g.require === "function" ? g.require : null;
  if (nsRequire) {
    return nsRequire;
  }
  const legacy = g.__nsRequire;
  if (typeof legacy === "function") {
    return legacy;
  }
  return null;
}

function getDocumentsPath() {
  const cached = g.__NS_DOCUMENTS_PATH__;
  if (typeof cached === "string" && cached.length) {
    return toForwardSlashes(cached);
  }
  try {
    const core = g.require ? g.require("@nativescript/core") : null;
    const docsFolder = core?.knownFolders?.documents?.();
    const docPath = docsFolder?.path;
    if (docPath) {
      const normalized = toForwardSlashes(docPath);
      g.__NS_DOCUMENTS_PATH__ = normalized;
      return normalized;
    }
  } catch (_err) {
    // ignore - fallback to raw specifier
  }
  return null;
}

function collapseSegments(input) {
  const segments = [];
  const parts = input.split('/');
  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      if (segments.length && segments[segments.length - 1] !== "..") {
        segments.pop();
        continue;
      }
    }
    segments.push(part);
  }
  const leadingSlash = input.startsWith('/');
  return (leadingSlash ? '/' : '') + segments.join('/');
}

function normalizeSpecifier(spec) {
  let value = String(spec ?? "");
  value = toForwardSlashes(value);
  const docsPath = getDocumentsPath();
  if (value.startsWith("__NSDOC__/")) {
    if (docsPath) {
      value = docsPath + '/' + value.slice("__NSDOC__/".length);
    } else {
      value = value.slice("__NSDOC__/".length);
    }
  }
  if (value.startsWith("~/") && docsPath) {
    value = docsPath + '/' + value.slice(2);
  }
  if (value.startsWith("file://")) {
    const stripped = value.slice("file://".length);
    value = stripped.startsWith('/') ? stripped : '/' + stripped;
  }
  if (value.includes("/../") || value.includes("/./")) {
    value = collapseSegments(value);
  }
  return value;
}

export function createRequire(_url) {
  const nsRequire = getNativeScriptRequire();
  if (!nsRequire) {
    return function () {
      throw new Error("NativeScript require() is not available in this context");
    };
  }
  const req = function (id) {
    const normalizedId = normalizeSpecifier(id);
    if (
      normalizedId.includes("../data/patch.json") ||
      normalizedId.includes("css-tree/lib/data/patch.json")
    ) {
      return {
        atrules: {},
        properties: {},
        types: {},
      };
    }
    if (normalizedId.includes("mdn-data/")) {
      return {};
    }
    if (
      normalizedId.endsWith("/package.json") ||
      normalizedId.includes("../package.json")
    ) {
      return { version: "0.0.0" };
    }
    if (normalizedId.endsWith(".json")) {
      return {};
    }
    return nsRequire(normalizedId);
  };
  req.resolve = nsRequire.resolve
    ? function (id) {
        return nsRequire.resolve(id);
      }
    : function (id) {
        return id;
      };
  return req;
}

export default { createRequire };
`;

function stripIndexSuffix(specifier: string): string {
	return specifier.replace(/\/(?:(?:index)(?:\.[^.\/]+)?)$/, '');
}

export type { VendorManifest, VendorManifestModuleEntry, VendorBundleResult };
