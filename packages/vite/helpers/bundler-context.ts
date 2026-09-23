import type { Plugin } from 'vite';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import type { Platform } from './platform-types.js';

export type BundlerPlatform = Platform | undefined;

/** Recursively collect every file under `dir` (posix paths), tolerating unreadable entries. */
export function walkAppFiles(dir: string, out: string[] = []): string[] {
	let entries: string[] = [];
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const entry of entries) {
		const full = path.posix.join(dir, entry);
		let st: ReturnType<typeof statSync> | undefined;
		try {
			st = statSync(full);
		} catch {
			continue;
		}
		if (st.isDirectory()) walkAppFiles(full, out);
		else out.push(full);
	}
	return out;
}

/** Skip partials (`_`-prefixed), `.d.ts`, worker modules, and platform-mismatched files. */
export function shouldExcludePlatformFile(p: string, platform: BundlerPlatform): boolean {
	const file = p.split('/').pop() || '';
	if (file.startsWith('_')) return true;
	if (/\.d\.ts$/.test(p)) return true;
	if (/([.-]worker)\.(ts|js)$/.test(file)) return true;
	const isAndroidTagged = /\.android\./.test(p);
	const isIosTagged = /\.ios\./.test(p) || /\.visionos\./.test(p);
	if (platform === 'android' && isIosTagged) return true;
	if ((platform === 'ios' || platform === 'visionos') && isAndroidTagged) return true;
	return false;
}

/** Absolute app path → root-anchored import specifier the dev server can serve. */
export function toContextImportSpecifier(abs: string): string {
	return '/' + abs.replace(/^\/+/, '');
}

/** Loads `.xml` files as default-exported strings (shared by the JS and TS configs). */
export function createXmlLoaderPlugin(name: string): Plugin {
	return {
		name,
		enforce: 'pre',
		load(id) {
			if (!id.endsWith('.xml')) return null;
			try {
				const src = readFileSync(id, 'utf-8');
				const xml = JSON.stringify(src)
					.replace(/\u2028/g, '\\u2028')
					.replace(/\u2029/g, '\\u2029');
				const code = `const ___XML___ = ${xml};\nexport default ___XML___;`;
				return { code, map: null } as any;
			} catch {
				return null;
			}
		},
	};
}
