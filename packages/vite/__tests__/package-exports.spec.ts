import { describe, expect, it } from 'vitest';
import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
	exports?: Record<string, unknown>;
};

describe('@nativescript/vite package exports', () => {
	it('exports required HMR runtime helpers', () => {
		const exportsMap = packageJson.exports || {};

		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/vendor-bootstrap');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/vendor-bootstrap.js');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/root-placeholder');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/root-placeholder.js');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/http-only-boot');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/http-only-boot.js');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/module-provenance');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/module-provenance.js');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/hooks');
		expect(exportsMap).toHaveProperty('./hmr/shared/runtime/hooks.js');
	});
});
