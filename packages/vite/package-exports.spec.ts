import { describe, expect, it } from 'vitest';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
	exports?: Record<string, unknown>;
};

describe('@nativescript/vite package exports', () => {
	it('exports required HMR runtime helpers', () => {
		const exportsMap = packageJson.exports || {};

		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/vendor-bootstrap');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/vendor-bootstrap.js');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/root-placeholder');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/root-placeholder.js');
	});

	it('exports the opt-in HMR compat entry', () => {
		expect(packageJson.exports?.['./hmr-compat']).toEqual({ types: './hmr-compat.d.ts', import: './hmr-compat.js', default: './hmr-compat.js' });
	});
});
