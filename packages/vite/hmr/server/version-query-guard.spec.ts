import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { isInsideDirs, nsVersionQueryGuardPlugin, stripVersionQuery } from './version-query-guard.js';

describe('stripVersionQuery', () => {
	it('removes only the `v` param and keeps the rest of the query as written', () => {
		expect(stripVersionQuery('/a/x.js?v=abc')).toBe('/a/x.js');
		expect(stripVersionQuery('/a/x.vue?vue&v=abc&type=script')).toBe('/a/x.vue?vue&type=script');
		expect(stripVersionQuery('/a/x.js?import&v=1')).toBe('/a/x.js?import');
	});

	it('returns null when there is nothing to strip', () => {
		expect(stripVersionQuery('/a/x.js')).toBeNull();
		expect(stripVersionQuery('/a/x.js?import')).toBeNull();
		expect(stripVersionQuery('/a/x.js?version=1')).toBeNull();
	});
});

describe('isInsideDirs', () => {
	it('matches files below a directory, not siblings sharing its prefix', () => {
		const dirs = ['/app/node_modules/@nativescript/core'];
		expect(isInsideDirs('/app/node_modules/@nativescript/core/ui/index.js?v=1', dirs)).toBe(true);
		expect(isInsideDirs('/app/node_modules/@nativescript/core-extra/index.js', dirs)).toBe(false);
	});
});

// A project with core installed as a real directory under node_modules and one
// included CommonJS dependency, so the client environment has a dep optimizer.
describe('nsVersionQueryGuardPlugin with a dep optimizer', () => {
	let tmp: string;
	let server: ViteDevServer;
	let coreDir: string;

	beforeAll(async () => {
		tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-version-guard-')));
		coreDir = path.join(tmp, 'node_modules/@nativescript/core');
		const files: Record<string, string> = {
			'node_modules/@nativescript/core/package.json': JSON.stringify({ name: '@nativescript/core', version: '1.0.0', main: 'index.js' }),
			'node_modules/@nativescript/core/index.js': "export * from './ui/index.js';\n",
			'node_modules/@nativescript/core/ui/index.js': 'export const ui = 1;\n',
			'node_modules/other-esm/package.json': JSON.stringify({ name: 'other-esm', version: '1.0.0', main: 'index.js', type: 'module' }),
			'node_modules/other-esm/index.js': 'export const other = 1;\n',
			'node_modules/cjs-dep/package.json': JSON.stringify({ name: 'cjs-dep', version: '1.0.0', main: 'index.js' }),
			'node_modules/cjs-dep/index.js': 'module.exports = { cjs: 1 };\n',
			'src/app.js': "import { ui } from '@nativescript/core';\nimport { other } from 'other-esm';\nimport { cjs } from 'cjs-dep';\nexport default [ui, other, cjs];\n",
		};
		for (const [rel, content] of Object.entries(files)) {
			fs.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true });
			fs.writeFileSync(path.join(tmp, rel), content);
		}
		server = await createServer({
			root: tmp,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			cacheDir: path.join(tmp, 'node_modules/.vite'),
			optimizeDeps: { noDiscovery: true, entries: [], include: ['cjs-dep'], exclude: ['@nativescript/core'] },
			server: { middlewareMode: true, ws: false, watch: null },
			plugins: [nsVersionQueryGuardPlugin({ nsCoreRoot: coreDir })],
		});
		await server.environments.client.depsOptimizer?.init?.();
	}, 60000);

	afterAll(async () => {
		await server?.close();
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	const importsOf = async (url: string) => {
		const result = await server.environments.client.transformRequest(url);
		return [...(result?.code ?? '').matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
	};

	it('has a dep optimizer', () => {
		expect(server.environments.client.depsOptimizer).toBeDefined();
	});

	it('serves core imports without `v`, while other node_modules files keep it', async () => {
		const imports = await importsOf('/src/app.js');
		const core = imports.find((u) => u.includes('/@nativescript/core/'));
		const other = imports.find((u) => u.includes('/other-esm/'));
		expect(core).toBe('/node_modules/@nativescript/core/index.js');
		expect(other).toMatch(/\/node_modules\/other-esm\/index\.js\?v=/);
	});

	it('does not inherit a version into core-relative imports', async () => {
		const imports = await importsOf('/node_modules/@nativescript/core/index.js');
		expect(imports).toContain('/node_modules/@nativescript/core/ui/index.js');
	});

	it('resolves core for the import map without `v`', async () => {
		const resolved = await server.environments.client.pluginContainer.resolveId('@nativescript/core', path.join(tmp, 'index.html'));
		expect(resolved?.id).toBe(path.join(coreDir, 'index.js'));
	});
});
