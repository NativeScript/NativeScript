import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectPreBundleSources, installedPackageDir, isPreBundleSource, nsPreBundleWatchPlugin, preBundleSourceFiles } from './prebundle-watch.js';

describe('installedPackageDir', () => {
	it('returns the package directory after the last node_modules segment', () => {
		expect(installedPackageDir('/app/node_modules/tslib/tslib.es6.mjs', '/')).toBe('/app/node_modules/tslib');
		expect(installedPackageDir('/app/node_modules/@angular/core/fesm2022/core.mjs', '/')).toBe('/app/node_modules/@angular/core');
		expect(installedPackageDir('/app/node_modules/a/node_modules/b/index.js', '/')).toBe('/app/node_modules/a/node_modules/b');
	});

	it('is undefined outside an installed package', () => {
		expect(installedPackageDir('/repo/packages/core/index.ts', '/')).toBeUndefined();
		expect(installedPackageDir('/app/node_modules/tslib', '/')).toBeUndefined();
		expect(installedPackageDir('/app/node_modules/@scope/pkg', '/')).toBeUndefined();
	});
});

describe('preBundleSourceFiles', () => {
	it('resolves sources against the map file and its sourceRoot, dropping virtual modules', () => {
		const map = { sources: ['../../tslib/tslib.es6.mjs', '\0rolldown/runtime.js', 'rolldown:runtime', null], sourceRoot: '' };
		expect(preBundleSourceFiles(map, '/app/node_modules/.vite/deps/tslib.js.map')).toEqual(['/app/node_modules/tslib/tslib.es6.mjs']);
		expect(preBundleSourceFiles({ sources: ['tslib/index.js'], sourceRoot: '../..' }, '/app/node_modules/.vite/deps/tslib.js.map')).toEqual(['/app/node_modules/tslib/index.js']);
	});
});

describe('isPreBundleSource', () => {
	const sources = collectPreBundleSources(['/app/node_modules/rxjs/dist/esm/index.js', '/ws/node_modules/@scope/kit/index.js', '/repo/libs/included/index.js']);

	it('matches the listed files and the code files of the packages they belong to', () => {
		expect(isPreBundleSource('/app/node_modules/rxjs/dist/esm/index.js', sources)).toBe(true);
		expect(isPreBundleSource('/app/node_modules/rxjs/dist/esm/internal/folded.js', sources)).toBe(true);
		expect(isPreBundleSource('/app/node_modules/rxjs/package.json', sources)).toBe(true);
		expect(isPreBundleSource('/ws/node_modules/@scope/kit/lib/a.mjs', sources)).toBe(true);
		expect(isPreBundleSource('/repo/libs/included/index.js', sources)).toBe(true);
	});

	it('rejects other packages, non-code files and files outside node_modules the maps do not list', () => {
		expect(isPreBundleSource('/app/node_modules/rxjs/README.md', sources)).toBe(false);
		expect(isPreBundleSource('/app/node_modules/rxjs/node_modules/other/index.js', sources)).toBe(false);
		expect(isPreBundleSource('/app/node_modules/exlib/index.js', sources)).toBe(false);
		expect(isPreBundleSource('/repo/libs/included/other.js', sources)).toBe(false);
		expect(isPreBundleSource('/app/src/main.ts', sources)).toBe(false);
	});

	it('compares Windows paths in POSIX form', () => {
		const windows = collectPreBundleSources(['C:\\app\\node_modules\\rxjs\\index.js']);
		expect(isPreBundleSource('C:/app/node_modules/rxjs/operators/map.js', windows)).toBe(true);
	});
});

describe('nsPreBundleWatchPlugin hotUpdate', () => {
	function setup() {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-prebundle-watch-'));
		const file = path.join(dir, 'node_modules/.vite/deps/prelib.js');
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(`${file}.map`, JSON.stringify({ version: 3, sources: ['../../prelib/index.js'], mappings: '' }));
		const graph = new Map([[`${dir}/src/main.ts`, new Set([{}])]]);
		const environment = {
			name: 'client',
			depsOptimizer: { metadata: { depInfoList: [{ file, src: path.join(dir, 'node_modules/prelib/index.js') }] } },
			moduleGraph: { getModulesByFile: (f: string) => graph.get(f) },
		};
		const plugin: any = nsPreBundleWatchPlugin();
		const run = (f: string, modules: unknown[] = []) => plugin.hotUpdate.handler.call({ environment }, { type: 'update', file: f, modules });
		return { dir, run, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
	}

	it('claims an edit to a pre-bundle input, served or not, and leaves everything else to Vite', async () => {
		const { dir, run, cleanup } = setup();
		try {
			expect(await run(`${dir}/node_modules/prelib/index.js`)).toEqual([]);
			expect(await run(`${dir}/node_modules/prelib/deep/folded.js`, [{ type: 'js' }])).toEqual([]);
			expect(await run(`${dir}/node_modules/exlib/index.js`, [{ type: 'js' }])).toBeUndefined();
			expect(await run(`${dir}/src/main.ts`, [{ type: 'js' }])).toBeUndefined();
		} finally {
			cleanup();
		}
	});
});
