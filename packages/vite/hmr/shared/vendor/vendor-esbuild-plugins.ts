import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';
import { createRequire } from 'node:module';
import { getAngularLinkerFactory, runAngularLinker } from '../../frameworks/angular/build/shared-linker.js';
import { vendorModuleShim } from './vendor-device-shim.js';

export function createVendorEsbuildPlugin(projectRoot: string): esbuild.Plugin {
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
					console.log('[vendor] map', args.path, '->', PB_ANIMATIONS_ID);
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
					console.log('[vendor] map', args.path, '->', ANIMATIONS_BROWSER_ID);
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
						console.log('[vendor] map', args.path, '->', ANIMATIONS_ID);
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
 * esbuild plugin to compile .jsx/.tsx files from Solid packages through
 * babel-preset-solid. Without this, esbuild uses its default React JSX
 * transform, producing React.createElement calls that crash at runtime.
 *
 * Only applied to files inside node_modules that have .jsx or .tsx extension.
 */
export function createSolidJsxEsbuildPlugin(projectRoot: string): esbuild.Plugin {
	// Lazy-load Babel and the Solid preset so they're only required when
	// the Solid flavor is active.
	let babel: any;
	let solidPreset: any;
	return {
		name: 'ns-vendor-solid-jsx',
		setup(build) {
			// Intercept .jsx and .tsx files from node_modules
			build.onLoad({ filter: /node_modules[\\/].*\.[jt]sx$/ }, async (args) => {
				try {
					if (!babel) {
						babel = await import('@babel/core');
						// babel-preset-solid is the standard Solid JSX transform
						solidPreset = (await import('babel-preset-solid')).default;
					}
					const source = await readFile(args.path, 'utf-8');
					const result = await babel.transformAsync(source, {
						filename: args.path,
						presets: [
							[
								solidPreset,
								{
									generate: 'universal',
									hydratable: false,
									moduleName: '@nativescript-community/solid-js',
								},
							],
						],
						parserOpts: {
							plugins: ['jsx', ...(args.path.endsWith('.tsx') ? ['typescript'] : [])],
						},
						ast: false,
						sourceMaps: false,
						configFile: false,
						babelrc: false,
					});
					if (result?.code) {
						return { contents: result.code, loader: 'js' };
					}
				} catch (e: any) {
					console.warn(`[ns-vendor-solid-jsx] failed to transform ${args.path}:`, e?.message || e);
				}
				// Fall through to esbuild's default handling
				return undefined;
			});
		},
	};
}

/**
 * esbuild plugin that rewrites Unicode property-escape regular expressions
 * (`\p{…}` / `\P{…}` used with the `u`/`v` flag) in vendored `node_modules`
 * code into explicit character ranges, via
 * `@babel/plugin-transform-unicode-property-regex`.
 *
 * NativeScript's V8 is compiled WITHOUT ICU/Intl, so Unicode property escapes
 * are unrecognized and throw `SyntaxError: Invalid property name in character
 * class` at *compile* time — not at match time. Because the HMR vendor bundle
 * is a single large module, one offending regex (e.g. highlight.js's
 * `TAG_NAME_RE = regex.concat(/[\p{L}_]/u, …)`) aborts the whole `vendor.mjs`
 * compile and takes the entire dev session down with the misleading
 * "ES module returned empty namespace" error.
 *
 * Babel expands the escapes to explicit ranges (`[A-Za-z\xAA…]`) that compile
 * on a non-ICU engine while preserving match semantics — the `u` flag itself
 * works fine without ICU; only the `\p{…}` property lookups need it. The
 * transform is gated on a cheap substring check so only files that actually
 * contain `\p{` / `\P{` pay the parse/regenerate cost, and any failure falls
 * through to the untransformed source rather than aborting the build.
 */
/**
 * Resolve node-builtin specifiers to the project's installed npm polyfill
 * package when one exists (`buffer`, `events`, `process`, `punycode`, ...).
 *
 * The deps/vendor builds externalize node builtins because the device runtime
 * cannot resolve them — but several builtin names are ALSO real npm packages
 * that browser-targeting dependencies install and import by name (e.g.
 * feross/buffer: `import { Buffer } from 'buffer'`). Leaving those external
 * emits a bare `from "buffer"` in the served ESM bundle, which the device
 * cannot resolve either — instantiation of the ENTIRE dev-session graph then
 * fails ("The requested module 'buffer' does not provide an export named
 * 'Buffer'"). When the project has the package installed, bundle it like any
 * other dependency; only truly unresolvable builtins stay external.
 *
 * Node's `require.resolve('buffer')` prefers the CORE module over an
 * installed package of the same name, so the probe goes through
 * `<name>/package.json` (which core modules don't have) and lets esbuild
 * finish entry resolution from the package directory.
 */
// Builtin names that commonly exist as installed npm polyfill packages.
// Mirrors the NODE_BUILTINS externalization lists in deps-bundle/core-bundle.
export const NODE_BUILTIN_POLYFILL_CANDIDATES: readonly string[] = ['assert', 'buffer', 'console', 'constants', 'domain', 'events', 'http', 'https', 'os', 'path', 'process', 'punycode', 'querystring', 'stream', 'string_decoder', 'sys', 'timers', 'tty', 'url', 'util', 'vm', 'zlib'];

export function createNodeBuiltinPolyfillEsbuildPlugin(projectRoot: string, builtins: readonly string[] = NODE_BUILTIN_POLYFILL_CANDIDATES): esbuild.Plugin {
	const projectRequire = createRequire(path.join(projectRoot, 'package.json'));
	// name → package dir, or null when no installed polyfill exists.
	const pkgDirCache = new Map<string, string | null>();
	const escaped = builtins.map((b) => b.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'));
	const filter = new RegExp(`^(?:node:)?(?:${escaped.join('|')})$`);
	return {
		name: 'ns-node-builtin-polyfill',
		setup(build) {
			build.onResolve({ filter }, async (args) => {
				if (args.pluginData?.nsBuiltinPolyfillProbe) return undefined;
				const name = args.path.replace(/^node:/, '');
				let pkgDir = pkgDirCache.get(name);
				if (pkgDir === undefined) {
					try {
						pkgDir = path.dirname(projectRequire.resolve(`${name}/package.json`));
					} catch {
						pkgDir = null;
					}
					pkgDirCache.set(name, pkgDir);
				}
				if (!pkgDir) return undefined; // no installed polyfill → stay external
				const probe = await build.resolve('./', {
					resolveDir: pkgDir,
					kind: args.kind,
					importer: args.importer,
					pluginData: { nsBuiltinPolyfillProbe: true },
				});
				if (probe.errors.length > 0 || !probe.path || probe.external) return undefined;
				return { path: probe.path };
			});
		},
	};
}

/**
 * Stub webpack-loader-prefixed specifiers (`nativescript-worker-loader!./x`,
 * `raw-loader!...`, chained `a!b!./x`) to an empty module.
 *
 * Legacy NS 6/7-era plugins still ship branches like
 * `require("nativescript-worker-loader!./commercial-worker.js")` that are
 * dead code at runtime behind `global.TNS_WEBPACK >= 5` checks. webpack
 * tolerates the syntax; esbuild resolves `require()` specifiers eagerly, so a
 * single loader-prefixed specifier anywhere in a dependency hard-fails the
 * ENTIRE vendor/deps bundle with "Could not resolve" — even when the app
 * never imports that package (the deps closure scans every app dependency).
 *
 * Loader syntax can never be valid outside webpack, so resolve such
 * specifiers into a stub module that evaluates to `undefined` — exactly what
 * the dead webpack-4 branch would observe on a webpack-5/vite runtime.
 */
export function createWebpackLoaderStubEsbuildPlugin(): esbuild.Plugin {
	return {
		name: 'ns-webpack-loader-stub',
		setup(build) {
			build.onResolve({ filter: /!/ }, (args) => {
				const spec = args.path;
				// Only treat it as webpack loader syntax when the request starts
				// with a loader reference: optional `!`/`!!`/`-!` prefix followed
				// by a bare (non-relative, non-absolute) name containing `!`.
				// Relative/absolute paths that merely contain `!` are left to the
				// normal resolver.
				const withoutPrefix = spec.replace(/^-?!!?/, '');
				const bang = withoutPrefix.indexOf('!');
				if (bang <= 0) return undefined;
				const loaderRef = withoutPrefix.slice(0, bang);
				if (loaderRef.startsWith('.') || loaderRef.startsWith('/') || /^[A-Za-z]:[\\/]/.test(loaderRef)) {
					return undefined;
				}
				return { path: spec, namespace: 'ns-webpack-loader-stub' };
			});
			build.onLoad({ filter: /.*/, namespace: 'ns-webpack-loader-stub' }, () => ({
				contents: 'module.exports = undefined;',
				loader: 'js',
			}));
		},
	};
}

export function createUnicodeRegexEsbuildPlugin(projectRoot: string): esbuild.Plugin {
	// Lazy-load Babel and the transform so the cost is only paid when a vendored
	// package actually ships property-escape regexes.
	let babel: any;
	let unicodePropertyRegexPlugin: any;
	let toolingUnavailable = false;
	return {
		name: 'ns-vendor-unicode-regex',
		setup(build) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			// .js/.mjs/.cjs only — .jsx/.tsx are owned by the Solid JSX pass and
			// Angular partials by the linker pass.
			build.onLoad({ filter: /node_modules[\\/].*\.[mc]?js$/ }, async (args) => {
				// Angular framework files are handled by the linker pass; leave them
				// to it to avoid double-processing the same module.
				if (/[\\/](?:@angular|@nativescript[\\/]angular)[\\/]/.test(args.path)) {
					return undefined;
				}
				let source: string;
				try {
					source = await readFile(args.path, 'utf-8');
				} catch {
					return undefined;
				}
				// Fast path: skip files that cannot contain a property escape.
				if (!source.includes('\\p{') && !source.includes('\\P{')) {
					return undefined;
				}
				if (toolingUnavailable) {
					return undefined;
				}
				try {
					if (!babel) {
						babel = await import('@babel/core');
						// CJS interop: under a CJS-compiled host, `import()` of this
						// package yields { default: { default: fn } } (__importStar
						// wraps module.exports, which itself carries a transpiled
						// `default`). Unwrap both layers or Babel rejects the plugin
						// entry ("plugins[0] must be a string, object, function").
						const mod: any = await import('@babel/plugin-transform-unicode-property-regex');
						unicodePropertyRegexPlugin = mod.default?.default ?? mod.default ?? mod;
					}
				} catch (e: any) {
					// Don't fail the build if the optional transform tooling is
					// missing — leave the regex as-is (it only matters if the
					// package is actually evaluated on-device).
					toolingUnavailable = true;
					console.warn(`[ns-vendor-unicode-regex] @babel/plugin-transform-unicode-property-regex unavailable; leaving \\p{} regexes untransformed:`, e?.message || e);
					return undefined;
				}
				try {
					const result = await babel.transformAsync(source, {
						filename: args.path,
						// node_modules dist files may be ESM or CJS/UMD; let Babel decide.
						sourceType: 'unambiguous',
						plugins: [unicodePropertyRegexPlugin],
						ast: false,
						sourceMaps: false,
						configFile: false,
						babelrc: false,
					});
					if (result?.code) {
						if (debug) {
							console.log('[ns-vendor-unicode-regex] transformed', args.path);
						}
						return { contents: result.code, loader: 'js' };
					}
				} catch (e: any) {
					console.warn(`[ns-vendor-unicode-regex] failed to transform ${args.path}:`, e?.message || e);
				}
				return undefined;
			});
		},
	};
}

/**
 * Minimal esbuild plugin to run Angular linker (Babel) over partial-compiled
 * Angular packages in node_modules. This converts ɵɵngDeclare* calls into
 * ɵɵdefine* so runtime doesn't require the JIT compiler.
 */
export function angularLinkerEsbuildPlugin(projectRoot: string): esbuild.Plugin {
	// Restrict to Angular framework packages to minimize esbuild memory usage.
	const FILTER = /node_modules[\\/](?:@angular|@nativescript[\\/]angular)[\\/].*\.[mc]?js$/;

	return {
		name: 'ns-angular-linker',
		async setup(build) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			const { babel, createLinker } = await getAngularLinkerFactory(projectRoot);
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
					if (debug) {
						console.log('[ns-angular-linker][vendor] linking', args.path);
					}
					const linked = await runAngularLinker(source, { filename: args.path, projectRoot, freshPlugin: true });
					return { contents: linked || source, loader: 'js' };
				} catch {
					return { contents: await readFile(args.path, 'utf8'), loader: 'js' };
				}
			});
		},
	};
}

/**
 * Resolve-fallback for OPTIONAL bare imports inside node_modules code.
 *
 * Server-leaning packages guard optional peers with try/catch requires —
 * e.g. `@nestjs/core` lazily requires `@nestjs/microservices` and
 * `@nestjs/websockets/socket-module` and degrades gracefully when they're
 * absent. esbuild resolves eagerly, so ONE such unresolvable specifier fails
 * the entire vendor/deps bundle ("Could not resolve ..."). This plugin lets
 * default resolution run first (onResolve returns undefined when the id
 * resolves); only genuinely unresolvable bare ids — requested FROM inside
 * node_modules — map to a stub module that THROWS on evaluation, preserving
 * the try/catch-optional semantics instead of masking real missing modules
 * with `undefined` exports.
 */
export function createOptionalDependencyStubEsbuildPlugin(projectRoot: string): esbuild.Plugin {
	const requireFromProject = createRequire(path.join(projectRoot, 'package.json'));
	// `@scope/name/sub` → `@scope/name`; `pkg/sub` → `pkg`; `.prisma/client/…` → `.prisma`.
	const packageNameOf = (spec: string): string => {
		const parts = spec.split('/');
		return spec.startsWith('@') && parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
	};
	// Is the package physically installed? Walk Node's node_modules lookup
	// chain from the importer, then the project root. Presence is judged by the
	// package DIRECTORY (its package.json file), never by entry resolution.
	const presenceCache = new Map<string, boolean>();
	const isPackageInstalled = (pkgName: string, fromDir: string): boolean => {
		const cacheKey = `${pkgName}\0${fromDir}`;
		const cached = presenceCache.get(cacheKey);
		if (cached !== undefined) return cached;
		let present = false;
		let dir = fromDir;
		for (;;) {
			if (fs.existsSync(path.join(dir, 'node_modules', pkgName, 'package.json'))) {
				present = true;
				break;
			}
			const parent = path.dirname(dir);
			if (parent === dir) break;
			dir = parent;
		}
		if (!present) present = fs.existsSync(path.join(projectRoot, 'node_modules', pkgName, 'package.json'));
		presenceCache.set(cacheKey, present);
		return present;
	};
	const stubbed = new Set<string>();
	return {
		name: 'ns-optional-dependency-stub',
		setup(build) {
			// Bare-specifier classification mirrors Node's: only `./x`, `../x`, `.`,
			// `..` and absolute paths are non-bare. A leading dot does NOT make a
			// specifier relative — `.prisma/client/index-browser` (Prisma's generated
			// client, required by `@prisma/client`) is a bare id that resolves through
			// node_modules, and must be stub-eligible when the generated package is
			// absent. esbuild plugin filters are Go RE2 (no lookahead), hence the
			// three-alternation form: bare start, `.x…`, `..x…`.
			build.onResolve({ filter: /^[^./]|^\.[^./]|^\.\.[^/]/ }, (args) => {
				// Only bare ids requested by node_modules code; app-code imports
				// should keep failing loudly so misconfiguration stays visible.
				if (!args.importer || !/node_modules[\\/]/.test(args.importer)) return undefined;
				if (args.path.startsWith('node:')) return undefined;
				try {
					requireFromProject.resolve(args.path, { paths: [path.dirname(args.importer)] });
					return undefined; // resolvable — let esbuild handle it normally
				} catch {
					// Node's resolver failing is NOT proof the package is missing:
					// NativeScript plugins commonly ship extensionless platform mains
					// (`"main": "./index"` with only index.ios.js/index.android.js on
					// disk) that only esbuild's platform resolveExtensions can resolve.
					// Stubbing an INSTALLED package plants an eagerly-thrown bomb in
					// the bundle (ESM imports of the stub evaluate at bundle start —
					// observed killing dev-session bootstrap via
					// @nativescript-community/text under @nativescript-community/
					// ui-label). Only genuinely ABSENT packages are stub-eligible;
					// present-but-unresolvable ones fall through to esbuild, which
					// either resolves them or fails the BUILD loudly with importer
					// attribution — a diagnosable build error instead of a device
					// bootstrap fatal.
					if (isPackageInstalled(packageNameOf(args.path), path.dirname(args.importer))) {
						return undefined;
					}
					stubbed.add(args.path);
					return { path: args.path, namespace: 'ns-optional-dep-stub' };
				}
			});
			build.onLoad({ filter: /.*/, namespace: 'ns-optional-dep-stub' }, (args) => ({
				contents: `throw new Error(${JSON.stringify(`Cannot find module '${args.path}'`)});`,
				loader: 'js',
			}));
			// Loud, counted summary (fail-open safety nets must not be silent):
			// every stub is a module that will THROW if its importer's try/catch
			// guard doesn't cover it on device.
			build.onEnd(() => {
				if (stubbed.size) {
					console.log(`[ns-vendor] stubbed ${stubbed.size} absent optional dependenc${stubbed.size === 1 ? 'y' : 'ies'} (throw-on-evaluate): ${Array.from(stubbed).sort().join(', ')}`);
					stubbed.clear();
				}
			});
		},
	};
}

/**
 * Stub native Node addons (`*.node` binaries) in vendored node_modules code.
 *
 * Compiled addons can never evaluate on the device runtime, and esbuild has no
 * loader for them — a single `require('./fsevents.node')` reached transitively
 * (fsevents is an optional dep of file watchers like chokidar) hard-fails the
 * ENTIRE vendor/deps bundle with "No loader is configured for .node files".
 * Loading such a file as a module that THROWS mirrors exactly what happens on
 * any platform where the binary is absent/incompatible (e.g. fsevents on
 * Linux), so consumers' try/catch-optional guards keep working.
 *
 * onLoad (not onResolve) so only real resolved `.node` FILES are stubbed — a
 * package whose name merely ends in `.node` still resolves to its JS entry and
 * never hits this filter.
 */
export function createNativeAddonStubEsbuildPlugin(): esbuild.Plugin {
	return {
		name: 'ns-native-addon-stub',
		setup(build) {
			build.onLoad({ filter: /node_modules[\\/].*\.node$/ }, (args) => ({
				contents: `throw new Error(${JSON.stringify(`Cannot load native addon '${path.basename(args.path)}' on the NativeScript runtime`)});`,
				loader: 'js',
			}));
		},
	};
}
