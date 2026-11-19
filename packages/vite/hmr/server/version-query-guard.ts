import type { DevEnvironment, Plugin } from 'vite';
import { nsVitePackageDir, servedDirForms } from './vite-plugin.js';

/** `id` without its `v` query param; `null` when it has none. */
export function stripVersionQuery(id: string): string | null {
	const at = id.indexOf('?');
	if (at < 0) return null;
	const parts = id.slice(at + 1).split('&');
	const kept = parts.filter((part) => part.split('=', 1)[0] !== 'v');
	if (kept.length === parts.length) return null;
	return kept.length ? `${id.slice(0, at)}?${kept.join('&')}` : id.slice(0, at);
}

export function isInsideDirs(id: string, dirs: readonly string[]): boolean {
	const file = id.split('?', 1)[0].replace(/\\/g, '/');
	return dirs.some((dir) => file.startsWith(`${dir}/`));
}

/**
 * Keeps `@nativescript/core` and `@nativescript/vite` files version-less in
 * the client environment. While a dep optimizer exists, Vite's resolver
 * appends `?v=<browserHash>` to files under `node_modules`; `bundle.mjs`
 * externals, the import map and the `/__ns_dev__/client` bootstrap name these
 * packages' files without it, and the device loads a `?v=` URL as a second
 * instance. Must run before Vite's resolver (`enforce: 'pre'`).
 */
export function nsVersionQueryGuardPlugin(opts: { nsCoreRoot: string }): Plugin {
	const dirs = servedDirForms([opts.nsCoreRoot, nsVitePackageDir()]);
	return {
		name: 'ns-version-query-guard',
		enforce: 'pre',
		apply: 'serve',
		applyToEnvironment: (environment) => environment.name === 'client',
		async resolveId(source, importer, options) {
			if (!(this.environment as DevEnvironment | undefined)?.depsOptimizer) return null;
			const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
			if (!resolved || resolved.external || !isInsideDirs(resolved.id, dirs)) return resolved;
			const id = stripVersionQuery(resolved.id);
			return id === null ? resolved : { ...resolved, id };
		},
	};
}
