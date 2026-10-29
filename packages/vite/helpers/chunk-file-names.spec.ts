import fs from 'fs';
import os from 'os';
import path from 'path';
import { build } from 'vite';
import { afterAll, describe, expect, it } from 'vitest';

import { chunkFileNames } from './chunk-file-names.js';

describe('chunkFileNames', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-chunk-names-'));
	afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

	const buildFileNames = async (activitySource: string): Promise<string[]> => {
		fs.mkdirSync(path.join(root, 'ui/frame'), { recursive: true });
		fs.writeFileSync(path.join(root, 'ui/frame/activity.android.js'), activitySource);
		fs.writeFileSync(path.join(root, 'entry.js'), "import('./ui/frame/activity.android.js');\n");
		const result: any = await build({
			root,
			configFile: false,
			logLevel: 'silent',
			build: {
				write: false,
				minify: false,
				rolldownOptions: { input: path.join(root, 'entry.js'), output: { format: 'es', entryFileNames: 'bundle.mjs', chunkFileNames } },
			},
		});
		return (Array.isArray(result) ? result[0] : result).output.map((file: any) => file.fileName).sort();
	};

	it('names the Android activity chunk without a hash, so a rebuild keeps the path the generated Java activity loads', async () => {
		expect(await buildFileNames('globalThis.activity = 1;\n')).toEqual(['activity.android.mjs', 'bundle.mjs']);
		expect(await buildFileNames('globalThis.activity = 2;\n')).toEqual(['activity.android.mjs', 'bundle.mjs']);
	});

	it('keeps the vendor, worker and hashed names for other chunks', () => {
		expect(chunkFileNames({ name: 'vendor' })).toBe('vendor.mjs');
		expect(chunkFileNames({ name: 'image-worker' })).toBe('[name]-[hash].js');
		expect(chunkFileNames({ name: 'page' })).toBe('[name]-[hash].mjs');
	});
});
