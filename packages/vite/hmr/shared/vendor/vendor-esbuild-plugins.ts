import * as esbuild from 'esbuild';
import path from 'path';
import { readFile } from 'fs/promises';
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
						unicodePropertyRegexPlugin = (await import('@babel/plugin-transform-unicode-property-regex')).default;
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
