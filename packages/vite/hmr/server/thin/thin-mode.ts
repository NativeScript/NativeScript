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

/**
 * Device URLs to evict so the next import re-evaluates these files: the same
 * `<origin>/ns/v<vite-url>` the device loaded them under. Vendor and virtual
 * modules evaluate once per process and are never included.
 */
export function thinEvictionUrls(origin: string, root: string, files: Iterable<string | null | undefined>): string[] {
	const urls = new Set<string>();
	for (const raw of files) {
		if (!raw) continue;
		const file = toPosix(String(raw).split('?')[0]);
		if (!path.isAbsolute(file) || file.includes('\0') || file.includes('/node_modules/')) continue;
		urls.add(thinDeviceUrl(origin, viteUrlForFile(file, root)));
	}
	return Array.from(urls);
}

/** The id `transformRequest` expects for a Vite URL (virtual modules are served as `/@id/__x00__<id>`). */
export function transformIdForViteUrl(viteUrl: string): string {
	if (!viteUrl.startsWith('/@id/')) return viteUrl;
	return viteUrl.slice('/@id/'.length).replace(/^__x00__/, '\0');
}
