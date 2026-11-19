/**
 * The module sets the device hands to `nativescript:beforeReboot`,
 * `nativescript:afterReboot` and `nativescript:beforeRerun` listeners, with
 * lookups that accept any id a module has for itself.
 *
 * Pure: shared by the device client and its specs.
 */

/** `'changed'`: an edited file. `'rerun'`: re-evaluated only because something it imports changed. */
export type HmrModuleChange = 'changed' | 'rerun';

export interface UpdateModules {
	/** Vite URLs of the edited files. */
	readonly changed: readonly string[];
	/** Vite URLs of every module the update re-evaluates, edited ones included. */
	readonly rerun: readonly string[];
	/** Every re-evaluated module by Vite URL, with why it re-runs. */
	readonly modules: ReadonlyMap<string, HmrModuleChange>;
	/**
	 * True when the module re-evaluates in this update. `id` may be the
	 * module's own `import.meta.url` (`<origin>/ns/v/src/x.ts?t=…`), its Vite
	 * URL or hot-context owner path (`/src/x.ts`, `/@fs/…`), or its absolute
	 * file path.
	 */
	isRerun(id: string): boolean;
	/** True when the module's own file was edited; same `id` forms as {@link isRerun}. */
	isChanged(id: string): boolean;
}

const THIN_PREFIX = '/ns/v';

// Vite's `t` stamp and `import` marker never identify a module; any other
// param does (`?vue&type=style`), so it is kept in its original order.
function stripVolatileParams(url: string): string {
	const q = url.indexOf('?');
	if (q < 0) return url;
	const hashAt = url.indexOf('#', q);
	const query = url.slice(q + 1, hashAt < 0 ? undefined : hashAt);
	const kept = query.split('&').filter((pair) => {
		const name = pair.split('=', 1)[0];
		return pair && name !== 't' && name !== 'import';
	});
	return url.slice(0, q) + (kept.length ? `?${kept.join('&')}` : '');
}

/**
 * The Vite URLs `id` may stand for. A device URL drops its origin and `/ns/v`;
 * an absolute file path becomes root-relative inside `root` and `/@fs/…`
 * outside it. A root-relative path is already a Vite URL, so a path that
 * isn't under `root` is tried both as is and as `/@fs/…`.
 */
export function viteUrlCandidates(id: string, root: string | undefined): string[] {
	if (typeof id !== 'string' || !id) return [];
	let path = id.replace(/\\/g, '/');
	const remote = /^[a-z][a-z0-9+.-]*:\/\/[^/]*/i.exec(path);
	if (remote) {
		path = path.slice(remote[0].length) || '/';
		if (path === THIN_PREFIX || path.startsWith(`${THIN_PREFIX}/`)) path = path.slice(THIN_PREFIX.length) || '/';
		return [stripVolatileParams(path)];
	}
	if (path.startsWith('file://')) path = path.slice('file://'.length);
	path = stripVolatileParams(path);
	const rootPosix = root ? root.replace(/\\/g, '/').replace(/\/+$/, '') : '';
	if (rootPosix && path.startsWith(`${rootPosix}/`)) return [path.slice(rootPosix.length)];
	if (path.startsWith('/@')) return [path];
	return path.startsWith('/') ? [path, `/@fs${path}`] : [];
}

export function createUpdateModules(data: { changed?: readonly string[]; rerun?: readonly string[]; root?: string }): UpdateModules {
	const changed = [...(data.changed ?? [])];
	const rerun = [...new Set([...(data.rerun ?? []), ...changed])];
	const modules = new Map<string, HmrModuleChange>();
	for (const url of rerun) modules.set(url, 'rerun');
	for (const url of changed) modules.set(url, 'changed');
	const lookup = (id: string) =>
		viteUrlCandidates(id, data.root)
			.map((url) => modules.get(url))
			.find((change) => change !== undefined);
	return {
		changed,
		rerun,
		modules,
		isRerun: (id) => lookup(id) !== undefined,
		isChanged: (id) => lookup(id) === 'changed',
	};
}
