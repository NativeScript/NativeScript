import path from 'node:path';

/**
 * Device module path: the device loads Vite's own client-environment output
 * under `/ns/v`, with one URL rule for every module — `<origin>/ns/v<vite-url>`
 * — so each file has exactly one device URL.
 */
export const THIN_PREFIX = '/ns/v';

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

export function thinDeviceUrl(origin: string, viteUrl: string): string {
	return `${origin.replace(/\/+$/, '')}${THIN_PREFIX}${viteUrl.startsWith('/') ? '' : '/'}${viteUrl}`;
}

/** The id `transformRequest` expects for a Vite URL (virtual modules are served as `/@id/__x00__<id>`). */
export function transformIdForViteUrl(viteUrl: string): string {
	if (!viteUrl.startsWith('/@id/')) return viteUrl;
	return viteUrl.slice('/@id/'.length).replace(/^__x00__/, '\0');
}
