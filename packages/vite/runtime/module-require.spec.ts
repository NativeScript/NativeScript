import { describe, expect, it, vi } from 'vitest';

// Vite's import analysis wraps a namespace import of a CommonJS pre-bundle in this helper.
const viteInteropHelper = (m: any, n: number) => (n || !m?.__esModule ? { ...((typeof m === 'object' && !Array.isArray(m)) || typeof m === 'function' ? m : {}), default: m } : m);

const { createRequire } = vi.hoisted(() => ({ createRequire: vi.fn((base: string) => (specifier: string) => ({ base, specifier })) }));
vi.mock('ns:module', () => ({ createRequire }));
vi.mock('@nativescript/core/file-system', () => ({ knownFolders: { currentApp: () => ({ path: '/data/app' }) } }));

const load = () => import('./module-require.js');

describe('createModuleRequire', () => {
	it('returns a live CommonJS view of an ES module namespace without reading it up front, the same object every time', async () => {
		const { createModuleRequire } = await load();
		let counter: number | undefined = undefined;
		const defaultExport = { name: 'default' };
		// Stands in for a namespace whose `counter` binding is still uninitialized (an import cycle).
		const ns = Object.freeze({
			__proto__: null,
			get counter() {
				if (counter === undefined) throw new ReferenceError('counter is not initialized');
				return counter;
			},
			default: defaultExport,
			[Symbol.toStringTag]: 'Module',
		});
		const require = createModuleRequire('src/a.ts', { './fixture': [ns, 'esm'] });
		const view = require('./fixture');
		expect(view).toBe(require('./fixture'));
		expect(view).toBe(createModuleRequire('src/b.ts', { x: [ns, 'esm'] })('x'));
		expect(view.__esModule).toBe(true);
		expect(Object.keys(view).sort()).toEqual(['counter', 'default']);
		expect(view.default).toBe(defaultExport);
		expect(() => view.counter).toThrow(ReferenceError);
		counter = 1;
		expect(view.counter).toBe(1);
	});

	it('marks the view __esModule only next to a default export the namespace does not mark itself', async () => {
		const { createModuleRequire } = await load();
		const namedOnly = Object.freeze({ __proto__: null, a: 1, [Symbol.toStringTag]: 'Module' });
		const selfMarked = Object.freeze({ __proto__: null, __esModule: false, default: 'd', [Symbol.toStringTag]: 'Module' });
		const require = createModuleRequire('src/a.ts', { namedOnly: [namedOnly, 'esm'], selfMarked: [selfMarked, 'esm'] });
		expect('__esModule' in require('namedOnly')).toBe(false);
		expect(require('namedOnly').a).toBe(1);
		expect(require('selfMarked').__esModule).toBe(false);
		expect(require('selfMarked').default).toBe('d');
	});

	it("returns a namespace's 'module.exports' export as is", async () => {
		const { createModuleRequire } = await load();
		const exportsValue = { a: 1 };
		const ns = Object.freeze({ __proto__: null, 'module.exports': exportsValue, a: 1 });
		expect(createModuleRequire('src/a.ts', { x: [ns, 'esm'] })('x')).toBe(exportsValue);
	});

	it('returns module.exports of a CommonJS pre-bundle for both import analysis shapes', async () => {
		const { createModuleRequire } = await load();
		const plain = { tag: 'plain' };
		const esModule = Object.defineProperty({ tag: 'es', default: 'd' }, '__esModule', { value: true });
		const fn = Object.assign(() => 1, { tag: 'fn' });
		for (const m of [plain, esModule, fn]) {
			const require = createModuleRequire('src/a.ts', { nonNode: [viteInteropHelper(m, 0), 'interop'], node: [viteInteropHelper(m, 1), 'default'] });
			expect(require('nonNode')).toBe(m);
			expect(require('node')).toBe(m);
		}
	});

	it('returns the default export for JSON', async () => {
		const { createModuleRequire } = await load();
		const data = { a: 1 };
		expect(createModuleRequire('src/a.ts', { './d.json': [{ default: data, a: 1 }, 'default'] })('./d.json')).toBe(data);
	});

	it('delegates ns: and node: specifiers to the runtime createRequire with an app-root base', async () => {
		const { createModuleRequire } = await load();
		const require = createModuleRequire('src/a.ts', {});
		expect(require('ns:util')).toEqual({ base: '/data/app/', specifier: 'ns:util' });
		expect(require('node:module')).toEqual({ base: '/data/app/', specifier: 'node:module' });
		expect(createRequire).toHaveBeenCalledTimes(1);
	});

	it('delegates files on disk (absolute path or file: URL) to the same runtime require', async () => {
		const { createModuleRequire } = await load();
		const require = createModuleRequire('src/a.ts', {});
		const file = ['/data', 'app', 'config.json'].join('/');
		const url = `file://${file}`;
		expect(require(file)).toEqual({ base: '/data/app/', specifier: file });
		expect(require(url)).toEqual({ base: '/data/app/', specifier: url });
		const relative = ['.', 'config.json'].join('/');
		expect(() => require(relative)).toThrow(/require\("\.\/config\.json"\) in src\/a\.ts/);
	});

	it('throws at call time for anything else, naming the module and the specifier', async () => {
		const { createModuleRequire } = await load();
		const require = createModuleRequire('src/a.ts', {});
		expect(typeof require).toBe('function');
		expect(() => require('lodash')).toThrow(/require\("lodash"\) in src\/a\.ts/);
		expect(() => require(42 as any)).toThrow(/require\(42\) in src\/a\.ts/);
		// Not a literal: Nx's dependency scan would record `toString` as a project dependency.
		const prototypeKey = ['to', 'String'].join('');
		expect(() => require(prototypeKey)).toThrow(/require\("toString"\)/);
	});

	it('rejects require.resolve, require.context and require.cache', async () => {
		const { createModuleRequire } = await load();
		const require = createModuleRequire('src/a.ts', {});
		expect(() => require.resolve('x')).toThrow(/require\.resolve is not supported in dev \(in src\/a\.ts\)/);
		expect(() => require.context('./', true)).toThrow(/require\.context is not supported/);
		expect(() => require.cache).toThrow(/require\.cache is not supported/);
	});
});
