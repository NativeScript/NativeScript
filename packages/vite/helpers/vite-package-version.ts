import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

let cachedVersion: string | null = null;

/**
 * Version of this @nativescript/vite package (not the app's dependency
 * declaration) — used by the startup banner and disk-cache keys. Resolution
 * prefers the package export map, then walks up from this module to the
 * package root (the export map does not always expose package.json).
 */
export function getVitePackageVersion(): string {
	if (cachedVersion) return cachedVersion;
	try {
		const req = createRequire(import.meta.url);
		const pkg = req('@nativescript/vite/package.json');
		if (typeof pkg?.version === 'string') {
			cachedVersion = pkg.version;
			return cachedVersion;
		}
	} catch {}
	try {
		let dir = path.dirname(new URL(import.meta.url).pathname);
		for (let i = 0; i < 6; i++) {
			const candidate = path.join(dir, 'package.json');
			if (existsSync(candidate)) {
				const parsed = JSON.parse(readFileSync(candidate, 'utf-8'));
				if (parsed?.name === '@nativescript/vite' && typeof parsed.version === 'string') {
					cachedVersion = parsed.version;
					return cachedVersion;
				}
			}
			const parent = path.dirname(dir);
			if (parent === dir) break;
			dir = parent;
		}
	} catch {}
	cachedVersion = 'unknown';
	return cachedVersion;
}
