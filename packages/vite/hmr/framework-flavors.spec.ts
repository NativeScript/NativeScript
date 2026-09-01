import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getClientStrategyDevicePath, getFrameworkFlavor, registerFrameworkFlavor } from './framework-flavors.js';
import { typescriptServerStrategy } from './frameworks/typescript/server/strategy.js';

function fakeProject(): { root: string } {
	const root = mkdtempSync(path.join(tmpdir(), 'ns-vite-flavor-'));
	writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'app', dependencies: { '@acme/vite-fw': '*' } }));
	const pkg = path.join(root, 'node_modules', '@acme', 'vite-fw');
	mkdirSync(path.join(pkg, 'client'), { recursive: true });
	writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: '@acme/vite-fw', type: 'module', exports: { './client': './client/strategy.js' } }));
	writeFileSync(path.join(pkg, 'client', 'strategy.js'), 'export default { flavor: "fw", install() {} };');
	return { root };
}

const server = { ...typescriptServerStrategy, flavor: 'fw' };

describe('registerFrameworkFlavor', () => {
	it('rejects a built-in name, a mismatched server flavor, and a missing client', () => {
		expect(() => registerFrameworkFlavor({ flavor: 'vue', server: { ...server, flavor: 'vue' }, client: 'x' })).toThrow(/built-in/);
		expect(() => registerFrameworkFlavor({ flavor: 'fw', server: typescriptServerStrategy, client: 'x' })).toThrow(/declares flavor "typescript"/);
		expect(() => registerFrameworkFlavor({ flavor: 'fw', server, client: '' })).toThrow(/module specifier/);
	});

	it('registers and looks up a flavor', () => {
		registerFrameworkFlavor({ flavor: 'fw', server, client: '@acme/vite-fw/client' });
		expect(getFrameworkFlavor('fw')?.server).toBe(server);
		expect(getFrameworkFlavor('nope')).toBeUndefined();
	});
});

describe('getClientStrategyDevicePath', () => {
	it('is empty for a built-in or unknown flavor', () => {
		expect(getClientStrategyDevicePath('vue', '/nowhere')).toBe('');
		expect(getClientStrategyDevicePath('unknown', '/nowhere')).toBe('');
	});

	it('resolves a package subpath through the app root to its /ns/m/node_modules path', () => {
		const { root } = fakeProject();
		registerFrameworkFlavor({ flavor: 'fw', server, client: '@acme/vite-fw/client' });
		expect(getClientStrategyDevicePath('fw', root)).toBe('/ns/m/node_modules/@acme/vite-fw/client/strategy.js');
	});

	it('expresses a linked (symlinked) package relative to the package, not the real path', () => {
		const { root } = fakeProject();
		const real = mkdtempSync(path.join(tmpdir(), 'ns-vite-linked-'));
		mkdirSync(path.join(real, 'client'), { recursive: true });
		writeFileSync(path.join(real, 'package.json'), JSON.stringify({ name: '@acme/linked-fw', type: 'module', exports: { './client': './client/index.js' } }));
		writeFileSync(path.join(real, 'client', 'index.js'), 'export default { flavor: "linked", install() {} };');
		symlinkSync(real, path.join(root, 'node_modules', '@acme', 'linked-fw'), 'dir');
		registerFrameworkFlavor({ flavor: 'linked', server: { ...server, flavor: 'linked' }, client: '@acme/linked-fw/client' });
		expect(getClientStrategyDevicePath('linked', root)).toBe('/ns/m/node_modules/@acme/linked-fw/client/index.js');
	});
});
