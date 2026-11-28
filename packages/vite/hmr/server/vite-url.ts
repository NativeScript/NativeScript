import path from 'node:path';

const toPosix = (value: string) => value.replace(/\\/g, '/');

/**
 * The URL Vite's dev server uses for a resolved file: root-relative inside
 * `root`, `/@fs/<abs>` outside it. Must mirror Vite's own rule exactly, or a
 * file reached from both sides gets two device URLs.
 */
export function viteUrlForFile(fileAbs: string, root: string): string {
	const file = toPosix(path.resolve(fileAbs));
	const rootPosix = toPosix(path.resolve(root)).replace(/\/+$/, '');
	if (file.startsWith(`${rootPosix}/`)) {
		return file.slice(rootPosix.length);
	}
	return `/@fs${file.startsWith('/') ? '' : '/'}${file}`;
}

/** The id `transformRequest` expects for a Vite URL (virtual modules are served as `/@id/__x00__<id>`). */
export function transformIdForViteUrl(viteUrl: string): string {
	if (!viteUrl.startsWith('/@id/')) return viteUrl;
	return viteUrl.slice('/@id/'.length).replace(/^__x00__/, '\0');
}

/**
 * The URL the device requests for a client module-graph URL: a graph URL that
 * isn't a path (a virtual or bare id) is served under `/@id/`, with a leading
 * `\0` encoded as `__x00__`, as Vite's import analysis writes it.
 */
export function deviceUrlForGraphUrl(graphUrl: string): string {
	if (graphUrl.startsWith('/') || graphUrl.startsWith('.')) return graphUrl;
	return `/@id/${graphUrl.replace(/^\0/, '__x00__')}`;
}
