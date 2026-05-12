import path from 'path';

export interface CollectCssHotUpdatePathsOptions {
	/** Absolute path of the file the watcher saw change. */
	file: string;
	/** Vite dev server `config.root` (project root for the NS app). */
	root: string;
	/** `nativescript.config#appPath` value. Defaults to `'src'`. */
	appRootDir?: string;
	/**
	 * Absolute path to the project's primary CSS entry
	 * (`<root>/<appRootDir>/app.css`). Required to broadcast for
	 * out-of-scope CSS saves — workspace deps `@import`'d from
	 * `app.css` invalidate the `virtual:ns-app-css` module, which has
	 * no real `.file` to broadcast on its own.
	 */
	appEntryCss?: string | null;
}

const CSS_EXTENSION = /\.css(?:[?#].*)?$/i;

function toPosix(value: string): string {
	return value.replace(/\\/g, '/');
}

function stripQuery(value: string): string {
	const idx = value.search(/[?#]/);
	return idx === -1 ? value : value.slice(0, idx);
}

function isInProjectScope(absPath: string, root: string, appRootDir?: string): boolean {
	if (!absPath || !root) return false;
	const absPosix = stripQuery(toPosix(absPath));
	const rootPosix = toPosix(root).replace(/\/$/, '');
	const dirs = [`${rootPosix}/src`, `${rootPosix}/core`];
	if (appRootDir && appRootDir !== 'src') {
		dirs.push(`${rootPosix}/${appRootDir}`);
	}
	return dirs.some((dir) => absPosix === dir || absPosix.startsWith(`${dir}/`));
}

function toRootRelative(absPath: string, root: string): string | null {
	if (!absPath || !root) return null;
	const cleaned = stripQuery(toPosix(absPath));
	const rootPosix = toPosix(root).replace(/\/$/, '');
	if (cleaned !== rootPosix && !cleaned.startsWith(`${rootPosix}/`)) {
		return null;
	}
	const rel = path.posix.normalize(path.posix.relative(rootPosix, cleaned));
	if (!rel || rel === '.' || rel.startsWith('..')) return null;
	return rel.startsWith('/') ? rel : `/${rel}`;
}

/**
 * Compute the root-relative POSIX path to broadcast in `ns:css-updates`
 * for a given CSS hot-update.
 *
 * - **In-scope CSS edit** (`<root>/src|core|<appRootDir>/...css`):
 *   broadcast that file's path.
 * - **Out-of-scope CSS edit** (workspace dep `@import`'d via
 *   `app.css`): broadcast `appEntryCss`. The runtime fetches
 *   `app.css?direct=1`, Vite re-runs PostCSS through the `@import`
 *   chain, and the merged CSS lands.
 *
 * NS only ever fetches the entry CSS at runtime, so a single
 * `appEntryCss` broadcast covers every workspace-dep CSS save —
 * regardless of how deep the `@import` chain goes. Returns `[]` for
 * non-CSS files or when no broadcast target is available.
 */
export function collectCssHotUpdatePaths(options: CollectCssHotUpdatePathsOptions): string[] {
	const { file, root, appRootDir, appEntryCss } = options;
	if (!file || !root) return [];
	if (!CSS_EXTENSION.test(file)) return [];

	if (isInProjectScope(file, root, appRootDir)) {
		const rel = toRootRelative(file, root);
		return rel ? [rel] : [];
	}

	if (!appEntryCss) return [];
	const rel = toRootRelative(appEntryCss, root);
	return rel ? [rel] : [];
}
