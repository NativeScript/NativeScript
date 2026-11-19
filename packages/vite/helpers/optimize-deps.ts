import type { Plugin } from 'vite';

/**
 * Specifiers kept external to every pre-bundle Vite's dep optimizer builds
 * from `optimizeDeps.include`: a package inlined into a pre-bundle and also
 * served as its own files evaluates twice on device.
 *
 * - `@nativescript/core`, `@nativescript/vite`, `@valor/nativescript-websockets`:
 *   one instance per app, shared with `bundle.mjs` and the dev client.
 * - `module` / `node:module` / `set-value`: aliased to local shims
 *   (`helpers/css-tree.ts`, `resolveConfig.alias` in `configuration/base.ts`);
 *   the optimizer does not apply those aliases, and css-tree's
 *   `import { createRequire } from 'module'` then crashes on device.
 */
export const NS_OPTIMIZE_DEPS_EXCLUDE = ['@nativescript/core', '@nativescript/vite', '@valor/nativescript-websockets', 'set-value', 'module', 'node:module'] as const;

type OptimizeDepsLike = { noDiscovery?: boolean; entries?: string | string[]; include?: string[] };
type ConfigWithOptimizeDeps = { optimizeDeps?: OptimizeDepsLike; environments?: Record<string, { optimizeDeps?: OptimizeDepsLike } | undefined> };

/** The `include` entries of the app's own config: top level and the client environment's. */
export function collectOwnOptimizeDepsInclude(config: ConfigWithOptimizeDeps): string[] {
	return [...new Set([...(config.optimizeDeps?.include ?? []), ...(config.environments?.client?.optimizeDeps?.include ?? [])])];
}

/**
 * Applies the dev policy to the resolved client `optimizeDeps` (the object
 * Vite's client environment reads when it decides whether to create a dep
 * optimizer). Returns the include entries it dropped.
 */
export function enforceOptimizeDepsPolicy(optimizeDeps: OptimizeDepsLike, include: readonly string[]): string[] {
	const allowed = new Set(include);
	const dropped = (optimizeDeps.include ?? []).filter((id) => !allowed.has(id));
	optimizeDeps.noDiscovery = true;
	optimizeDeps.entries = [];
	optimizeDeps.include = [...allowed];
	return dropped;
}

/**
 * Dev-server dependency policy: no discovery, and only what the app's config
 * (the flavor config plus the app's own `vite.config`) lists in
 * `optimizeDeps.include` is pre-bundled. With nothing listed, Vite creates no
 * dep optimizer and every dependency is served as its own file at a
 * version-less URL, the same URL `bundle.mjs` and the import map use.
 *
 * Includes added by other plugins (Analog adds Angular's) are dropped: the
 * list is captured in a `config` hook ordered before every other plugin's,
 * and enforced again after all `config`/`configEnvironment` hooks ran.
 * The plugin must stay first in the base config's plugin list.
 */
export function nsOptimizeDepsPolicyPlugin(opts: { verbose?: boolean } = {}): Plugin {
	let include: string[] = [];
	return {
		name: 'ns-optimize-deps-policy',
		enforce: 'pre',
		apply: 'serve',
		config: {
			order: 'pre',
			handler(config) {
				include = collectOwnOptimizeDepsInclude(config as ConfigWithOptimizeDeps);
			},
		},
		configResolved(resolved) {
			const dropped = enforceOptimizeDepsPolicy(resolved.optimizeDeps as OptimizeDepsLike, include);
			if (dropped.length && opts.verbose) {
				resolved.logger.info(`[ns-vite] optimizeDeps.include entries added by plugins were dropped: ${dropped.join(', ')}`);
			}
		},
	};
}
