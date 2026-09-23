import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadPrebuiltVendorManifest } from './manifest-loader.js';
import { clearVendorManifest } from './registry.js';

describe('loadPrebuiltVendorManifest', () => {
	const roots: string[] = [];
	const originalDistDir = process.env.NS_VITE_DIST_DIR;

	afterEach(() => {
		if (originalDistDir === undefined) {
			delete process.env.NS_VITE_DIST_DIR;
		} else {
			process.env.NS_VITE_DIST_DIR = originalDistDir;
		}
		clearVendorManifest();
		while (roots.length) {
			rmSync(roots.pop()!, { recursive: true, force: true });
		}
	});

	it('loads a prebuilt manifest from NS_VITE_DIST_DIR when configured', () => {
		const root = mkdtempSync(join(tmpdir(), 'ns-vendor-loader-'));
		roots.push(root);
		process.env.NS_VITE_DIST_DIR = '.ns-vite-build/android';
		const buildDir = join(root, '.ns-vite-build', 'android');
		mkdirSync(buildDir, { recursive: true });
		writeFileSync(
			join(buildDir, 'ns-vendor-manifest.json'),
			JSON.stringify({
				version: 1,
				createdAt: '2026-05-26T00:00:00.000Z',
				hash: 'android-test',
				modules: {},
				aliases: {},
			}),
		);

		expect(loadPrebuiltVendorManifest(root)?.hash).toBe('android-test');
	});
});
