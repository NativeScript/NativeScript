import type { Rolldown } from 'vite';

/**
 * Specifiers the dev dep optimizer never pre-bundles: they stay served
 * source, one instance shared by the dev boot module, the dev client and
 * every pre-bundle that imports them.
 *
 * - `@nativescript/core`, `@nativescript/vite`: one instance per app.
 * - `module` / `node:module` / `set-value`: aliased to shims inside this
 *   package (`helpers/css-tree.ts`, `resolveConfig.alias` in
 *   `configuration/base.ts`). The optimizer applies aliases too, so it would
 *   inline a copy of the shim into each pre-bundle importing them.
 */
export const NS_OPTIMIZE_DEPS_EXCLUDE = ['@nativescript/core', '@nativescript/vite', 'set-value', 'module', 'node:module'] as const;

/**
 * `define`s for the dev dep optimizer's Rolldown build. Webpack's
 * `__non_webpack_require__` becomes a plain `require`, which the pre-bundle
 * resolves like any other `require()`: bundled, or an ESM import of an
 * excluded package (see {@link optimizeDepsEsmRequirePlugin}). A call with a
 * non-literal argument still compiles to Rolldown's `__require`, which falls
 * back to the runtime's global `require`.
 */
export function getOptimizeDepsDefine(nodeEnv: 'development' | 'production'): Record<string, string> {
	return {
		global: 'globalThis',
		'process.env.NODE_ENV': JSON.stringify(nodeEnv),
		__non_webpack_require__: 'require',
	};
}

/** True when `spec` is one of `names` or a subpath of one. */
export function isExcludedSpecifier(spec: string, names: readonly string[]): boolean {
	return names.some((name) => spec === name || spec.startsWith(`${name}/`));
}

/** A RegExp matching each of `names` and its subpaths. */
export function excludedSpecifierPattern(names: readonly string[]): RegExp {
	const alternatives = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	return new RegExp(`^(?:${alternatives.join('|')})(?:/|$)`);
}

const REQUIRE_FACADE_PREFIX = '\0ns-require-esm:';
const FACADE_IMPORT_PREFIX = 'ns-require-esm-import:';

/**
 * The Rolldown plugin that compiles a pre-bundle's `require()` of an excluded
 * package, or of one of its subpaths, to an ESM import of it; import analysis
 * then points that import at the served module. Without it Rolldown emits
 * `__require(...)`, which needs a global `require` the device doesn't have
 * (Vite's own `cjs-external` facade covers exact package names only).
 *
 * `require()` returns what Node's `require()` of an ES module returns: the
 * `'module.exports'` export when there is one, else the exports, flagged
 * `__esModule` when one of them is a default export.
 *
 * Rolldown's built-in `esmExternalRequirePlugin` does the same, but a
 * built-in plugin is silently ignored by another Rolldown copy, and the
 * Vite running the dev server need not be the one this package imports.
 */
export function optimizeDepsEsmRequirePlugin(exclude: readonly string[]): Rolldown.Plugin {
	return {
		name: 'ns-optimize-deps-esm-require',
		resolveId: {
			filter: { id: [excludedSpecifierPattern(exclude), new RegExp(`^${FACADE_IMPORT_PREFIX}`)] },
			handler(id, _importer, options) {
				if (id.startsWith(FACADE_IMPORT_PREFIX)) return { id: id.slice(FACADE_IMPORT_PREFIX.length), external: 'absolute' };
				return options.kind === 'require-call' ? { id: REQUIRE_FACADE_PREFIX + id } : null;
			},
		},
		load: {
			filter: { id: new RegExp(`^${REQUIRE_FACADE_PREFIX}`) },
			handler(id) {
				const spec = id.slice(REQUIRE_FACADE_PREFIX.length);
				return {
					code: [`import * as m from ${JSON.stringify(FACADE_IMPORT_PREFIX + spec)};`, `module.exports = Object.prototype.hasOwnProperty.call(m, 'module.exports') ? m['module.exports'] : 'default' in m && !('__esModule' in m) ? { __esModule: true, ...m } : { ...m };`].join('\n'),
				};
			},
		},
	};
}
