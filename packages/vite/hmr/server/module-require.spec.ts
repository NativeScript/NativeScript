import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseAst } from 'vite';
import { createNodeModeCheck, findFreeRequireUse, isRuntimeRequireSpecifier, MODULE_REQUIRE_HELPER, nsModuleRequirePlugin } from './module-require.js';

const use = (code: string) => findFreeRequireUse(parseAst(code) as any);

describe('findFreeRequireUse', () => {
	it('finds free require calls and their literal specifiers', () => {
		expect(use("const a = require('a'); require(`b`); require('a'); require(name);")).toEqual({ require: true, nonWebpackRequire: false, specifiers: ['a', 'b'] });
	});

	it('counts non-call references (typeof, member access, values)', () => {
		expect(use("if (typeof require === 'function') {}").require).toBe(true);
		expect(use("require.resolve('x')").require).toBe(true);
		expect(use('const r = { require };').require).toBe(true);
		expect(use('use(require);')).toEqual({ require: true, nonWebpackRequire: false, specifiers: [] });
	});

	it('ignores property names, member properties, labels and method names', () => {
		expect(use("a.require('x'); ({ require: 1 }); class A { require() {} static require = 1 } require: for (;;) break require;").require).toBe(false);
	});

	it('leaves require bound by a function parameter (CommonJS / UMD wrappers)', () => {
		expect(use("(function (module, exports, require) { require('x'); })();").require).toBe(false);
		expect(use("const f = ({ require }) => require('x');").require).toBe(false);
		expect(use("function f(a, require = b) { return require('x'); }").require).toBe(false);
		expect(use("function f(...[require]) { return require('x'); }").require).toBe(false);
	});

	it('leaves require bound at module scope', () => {
		expect(use("import { createRequire } from 'module'; const require = createRequire(import.meta.url); require('x');").require).toBe(false);
		expect(use("import require from 'r'; require('x');").require).toBe(false);
		expect(use("require('x'); function require() {}").require).toBe(false);
		expect(use("{ var require = load(); } require('x');").require).toBe(false);
	});

	it('respects block scoping and catch parameters', () => {
		expect(use("{ const require = load(); require('x'); } require('y');")).toEqual({ require: true, nonWebpackRequire: false, specifiers: ['y'] });
		expect(use("try {} catch (require) { require('x'); }").require).toBe(false);
		expect(use("function f() { var require; if (a) { require('x'); } }").require).toBe(false);
		expect(use("for (const require of list) require('x');").require).toBe(false);
	});

	it('finds free __non_webpack_require__ and its literal specifiers', () => {
		expect(use("__non_webpack_require__('./config.json');")).toEqual({ require: false, nonWebpackRequire: true, specifiers: ['./config.json'] });
		expect(use("const __non_webpack_require__ = r; __non_webpack_require__('x');").nonWebpackRequire).toBe(false);
	});
});

describe('isRuntimeRequireSpecifier', () => {
	it('is true for ns: builtins and node: specifiers only', () => {
		expect(isRuntimeRequireSpecifier('ns:util')).toBe(true);
		expect(isRuntimeRequireSpecifier('node:module')).toBe(true);
		expect(isRuntimeRequireSpecifier('module')).toBe(false);
		expect(isRuntimeRequireSpecifier('./a')).toBe(false);
	});
});

describe('createNodeModeCheck', () => {
	it("follows Vite's isFilePathESM", () => {
		const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-node-mode-')));
		try {
			fs.mkdirSync(path.join(root, 'esm/src'), { recursive: true });
			fs.mkdirSync(path.join(root, 'cjs/src'), { recursive: true });
			fs.writeFileSync(path.join(root, 'esm/package.json'), JSON.stringify({ type: 'module' }));
			fs.writeFileSync(path.join(root, 'cjs/package.json'), JSON.stringify({}));
			const isNodeMode = createNodeModeCheck();
			expect(isNodeMode(path.join(root, 'cjs/src/a.mjs'))).toBe(true);
			expect(isNodeMode(path.join(root, 'esm/src/a.cts'))).toBe(false);
			expect(isNodeMode(path.join(root, 'esm/src/a.ts'))).toBe(true);
			expect(isNodeMode(path.join(root, 'esm/src/App.vue?vue&type=script&lang.ts'))).toBe(true);
			expect(isNodeMode(path.join(root, 'cjs/src/a.ts'))).toBe(false);
			expect(isNodeMode('\0virtual:x')).toBe(true);
			expect(isNodeMode('virtual:x')).toBe(false);
		} finally {
			fs.rmSync(root, { recursive: true, force: true });
		}
	});
});

type Resolved = { id: string } | null;
function setup(options: { resolve?: Record<string, string>; optimized?: Array<{ id: string; file: string; needsInterop?: boolean; hasModuleSyntax?: boolean }>; root?: string } = {}) {
	const plugin = nsModuleRequirePlugin() as any;
	const root = options.root ?? '/app';
	plugin.configResolved({ root, legacy: {} });
	const depInfoList = (options.optimized ?? []).map((dep) => ({ id: dep.id, file: dep.file, src: `/src/${dep.id}`, needsInterop: dep.needsInterop, exportsData: dep.hasModuleSyntax === undefined ? undefined : Promise.resolve({ hasModuleSyntax: dep.hasModuleSyntax, exports: [] }) }));
	const resolved: string[] = [];
	const ctx = {
		environment: {
			config: { optimizeDeps: {} },
			depsOptimizer: { isOptimizedDepFile: (id: string) => id.includes('/node_modules/.vite/deps/'), metadata: { depInfoList } },
		},
		async resolve(spec: string): Promise<Resolved> {
			resolved.push(spec);
			const id = options.resolve?.[spec];
			return id ? { id } : null;
		},
	};
	const transform = async (code: string, id = '/app/src/a.ts') => (await plugin.transform.call(ctx, code, id))?.code as string | undefined;
	return { plugin, transform, resolved };
}

describe('nsModuleRequirePlugin', () => {
	it('is a serve-only, client-only post transform', () => {
		const plugin = nsModuleRequirePlugin() as any;
		expect(plugin.apply).toBe('serve');
		expect(plugin.enforce).toBe('post');
		expect(plugin.applyToEnvironment({ config: { consumer: 'client' } })).toBe(true);
		expect(plugin.applyToEnvironment({ config: { consumer: 'server' } })).toBe(false);
	});

	it('drops the __non_webpack_require__ define and keeps the others', () => {
		const plugin = nsModuleRequirePlugin() as any;
		const config = { define: { __non_webpack_require__: 'globalThis.require', __DEV__: 'true' } };
		plugin.config(config);
		expect(config.define).toEqual({ __DEV__: 'true' });
	});

	it('hoists an import of each resolvable literal specifier and binds a module-scoped require', async () => {
		const { transform } = setup({ resolve: { '@nativescript/core/color': '/app/node_modules/@nativescript/core/color/index.js' } });
		const out = await transform("const { Color } = require('@nativescript/core/color');\nrequire(dynamic);\n");
		const prelude = `import { createModuleRequire as __nsCreateModuleRequire } from ${JSON.stringify(MODULE_REQUIRE_HELPER)};import * as __nsRequireDep0 from "@nativescript/core/color";const require = __nsCreateModuleRequire("src/a.ts",{"@nativescript/core/color":[__nsRequireDep0,"esm"]});`;
		expect(out).toBe(`${prelude}const { Color } = require('@nativescript/core/color');\nrequire(dynamic);\n`);
		expect(out!.split('\n')).toHaveLength(3);
	});

	it('leaves unresolvable and runtime builtin specifiers to call time, without resolving builtins', async () => {
		const { transform, resolved } = setup();
		const out = await transform("require('ns:util'); require('node:module'); require('missing');");
		expect(resolved).toEqual(['missing']);
		expect(out).toContain('const require = __nsCreateModuleRequire("src/a.ts",{});');
		expect(out).not.toContain('import * as');
	});

	it('maps JSON to its default export', async () => {
		const { transform } = setup({ resolve: { './data.json': '/app/src/data.json' } });
		expect(await transform("require('./data.json')")).toContain('{"./data.json":[__nsRequireDep0,"default"]}');
	});

	it('shapes CommonJS pre-bundles the way import analysis does for the importer', async () => {
		const optimized = [
			{ id: 'cjs-dep', file: '/app/node_modules/.vite/deps/cjs-dep.js', needsInterop: true },
			{ id: 'esm-dep', file: '/app/node_modules/.vite/deps/esm-dep.js', needsInterop: false },
			{ id: 'discovered-cjs', file: '/app/node_modules/.vite/deps/discovered-cjs.js', hasModuleSyntax: false },
		];
		const resolve = { 'cjs-dep': '/app/node_modules/.vite/deps/cjs-dep.js?v=1', 'esm-dep': '/app/node_modules/.vite/deps/esm-dep.js?v=1', 'discovered-cjs': '/app/node_modules/.vite/deps/discovered-cjs.js?v=1' };
		const { transform } = setup({ resolve, optimized });
		const code = "require('cjs-dep'); require('esm-dep'); require('discovered-cjs');";
		expect(await transform(code)).toContain('{"cjs-dep":[__nsRequireDep0,"interop"],"esm-dep":[__nsRequireDep1,"esm"],"discovered-cjs":[__nsRequireDep2,"interop"]}');
		expect(await transform(code, '/app/src/a.mjs')).toContain('{"cjs-dep":[__nsRequireDep0,"default"],"esm-dep":[__nsRequireDep1,"esm"],"discovered-cjs":[__nsRequireDep2,"default"]}');
	});

	it('binds __non_webpack_require__ to the same require, or alone when require is bound locally', async () => {
		const { transform } = setup();
		expect(await transform("require('a'); __non_webpack_require__('b');")).toContain('const require = __nsCreateModuleRequire("src/a.ts",{});const __non_webpack_require__ = require;');
		const alone = await transform("const require = createRequire(x); __non_webpack_require__('b');");
		expect(alone).toContain('const __non_webpack_require__ = __nsCreateModuleRequire("src/a.ts",{});');
		expect(alone).not.toContain('const require = __ns');
	});

	it('skips modules without free require, pre-bundles, the Vite client and CSS', async () => {
		const { transform } = setup();
		expect(await transform('const required = 1;')).toBeUndefined();
		expect(await transform("(function (require) { require('x') })")).toBeUndefined();
		expect(await transform("require('x')", '/app/node_modules/.vite/deps/x.js?v=1')).toBeUndefined();
		expect(await transform("require('x')", '/app/node_modules/vite/dist/client/client.mjs')).toBeUndefined();
		expect(await transform("require('x')", '/app/src/a.css')).toBeUndefined();
	});

	it('keeps a hashbang first', async () => {
		const { transform } = setup();
		expect(await transform("#!/usr/bin/env node\nrequire('x');")).toMatch(/^#!\/usr\/bin\/env node\nimport \{ createModuleRequire/);
	});

	it('resolves its helper as the app root does, whatever the importer', async () => {
		const plugin = nsModuleRequirePlugin() as any;
		plugin.configResolved({ root: '/app', legacy: {} });
		const calls: unknown[][] = [];
		const ctx = { resolve: async (...args: unknown[]) => (calls.push(args), { id: '/app/node_modules/@nativescript/vite/runtime/module-require.js' }) };
		expect(await plugin.resolveId.handler.call(ctx, MODULE_REQUIRE_HELPER, '/app/node_modules/lib/index.js')).toEqual({ id: '/app/node_modules/@nativescript/vite/runtime/module-require.js' });
		expect(calls).toEqual([[MODULE_REQUIRE_HELPER, path.join('/app', 'package.json'), { skipSelf: true }]]);
		expect(await plugin.resolveId.handler.call(ctx, 'other', '/app/src/a.ts')).toBeNull();
	});
});
