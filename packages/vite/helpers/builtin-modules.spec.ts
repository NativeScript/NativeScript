import fs from 'fs';
import os from 'os';
import path from 'path';
import * as esbuild from 'esbuild';
import { build, type Plugin } from 'vite';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

import { addBuiltinModule, builtinModulesEsbuildPlugin, builtinModulesPlugin, getBuiltinModulePolyfill, getBuiltinModuleTarget, isBuiltinModuleId, polyfillBuiltinModule, resetBuiltinModules, unwrapBuiltinModuleIds } from './builtin-modules.js';

describe('builtin modules', () => {
	afterEach(() => resetBuiltinModules());

	describe('rules', () => {
		it('keeps every ns: specifier for the runtime by default', () => {
			expect(getBuiltinModuleTarget('ns:util')).toBe('ns:util');
			expect(getBuiltinModuleTarget('ns:some_future_module')).toBe('ns:some_future_module');
			expect(getBuiltinModuleTarget('node:worker_threads')).toBeUndefined();
			expect(getBuiltinModuleTarget('worker_threads')).toBeUndefined();
		});

		it('adds exact and RegExp specifiers with optional targets', () => {
			addBuiltinModule('node:worker_threads');
			addBuiltinModule(/^(?:node:)?(url|util)$/g, 'node:$1');

			expect(getBuiltinModuleTarget('node:worker_threads')).toBe('node:worker_threads');
			expect(getBuiltinModuleTarget('url')).toBe('node:url');
			// a global RegExp must not carry lastIndex between calls
			expect(getBuiltinModuleTarget('url')).toBe('node:url');
			expect(getBuiltinModuleTarget('node:fs')).toBeUndefined();
		});

		it('lets a polyfill override the ns: default', () => {
			polyfillBuiltinModule('ns:url', '/abs/url-polyfill.js');

			expect(getBuiltinModuleTarget('ns:url')).toBeUndefined();
			expect(isBuiltinModuleId('ns:url')).toBe(false);
			expect(isBuiltinModuleId('ns:util')).toBe(true);
		});

		it('applies a polyfill registered for a forwarded target', () => {
			addBuiltinModule('worker_threads', 'node:worker_threads');
			polyfillBuiltinModule('node:worker_threads', '/abs/worker-polyfill.js');

			expect(getBuiltinModuleTarget('worker_threads')).toBeUndefined();
			expect(getBuiltinModulePolyfill('worker_threads')).toBe('/abs/worker-polyfill.js');
		});

		it('restores /@id/-wrapped builtin specifiers only', () => {
			addBuiltinModule('node:worker_threads');
			const code = [`import { inspect } from "/@id/ns:util";`, `export * from '/@id/node:worker_threads';`, `import("/@id/ns:runtime");`, `import z from "/@id/ns:util?t=123";`, `import x from "/@id/__x00__virtual";`, `import y from "/@id/node:fs";`].join('\n');

			expect(unwrapBuiltinModuleIds(code)).toBe([`import { inspect } from "ns:util";`, `export * from 'node:worker_threads';`, `import("ns:runtime");`, `import z from "ns:util";`, `import x from "/@id/__x00__virtual";`, `import y from "/@id/node:fs";`].join('\n'));
		});
	});

	describe('vite build', () => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-builtin-modules-'));
		afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

		const write = (file: string, code: string) => {
			fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
			fs.writeFileSync(path.join(root, file), code);
		};

		const bundle = async (entry: string, plugins: Plugin[] = [builtinModulesPlugin()]): Promise<string> => {
			const result: any = await build({
				root,
				configFile: false,
				logLevel: 'silent',
				plugins,
				build: {
					write: false,
					minify: false,
					rolldownOptions: { input: path.join(root, entry), output: { format: 'es', codeSplitting: false } },
				},
			});
			return (Array.isArray(result) ? result[0] : result).output.map((file: any) => file.code ?? '').join('\n');
		};

		it('emits runtime builtin imports verbatim', async () => {
			addBuiltinModule('worker_threads', 'node:worker_threads');
			write('esm.js', [`import { inspect } from 'ns:util';`, `import { Worker } from 'worker_threads';`, `console.log(inspect, Worker, import('ns:runtime'));`].join('\n'));

			const output = await bundle('esm.js');

			expect(output).toMatch(/from "ns:util"/);
			expect(output).toMatch(/from "node:worker_threads"/);
			expect(output).toContain('import("ns:runtime")');
		});

		it('keeps require() of builtins in CommonJS dependencies', async () => {
			write('node_modules/cjs-dep/package.json', JSON.stringify({ name: 'cjs-dep', main: 'index.js' }));
			write('node_modules/cjs-dep/index.js', `module.exports = require('ns:util').inspect;`);
			write('cjs.js', `import inspect from 'cjs-dep';\nconsole.log(inspect);`);

			expect(await bundle('cjs.js')).toMatch(/require\("ns:util"\)/);
		});

		it('bundles a polyfill in place of a builtin', async () => {
			write('url-polyfill.js', `export const URL = 'url-polyfill';`);
			polyfillBuiltinModule('ns:url', path.join(root, 'url-polyfill.js'));
			write('polyfill.js', `import { URL } from 'ns:url';\nconsole.log(URL);`);

			const output = await bundle('polyfill.js');

			expect(output).not.toContain('"ns:url"');
			expect(output).toContain('url-polyfill');
		});

		it('fails to resolve ns: specifiers without the plugin', async () => {
			write('plain.js', `import { inspect } from 'ns:util';\nconsole.log(inspect);`);

			await expect(bundle('plain.js', [])).rejects.toThrow(/ns:util/);
		});
	});

	describe('esbuild bundles', () => {
		it('externalizes builtins ahead of other resolvers', async () => {
			addBuiltinModule('node:worker_threads');
			const result = await esbuild.build({
				stdin: { contents: `import { inspect } from 'ns:util';\nimport { Worker } from 'node:worker_threads';\nconsole.log(inspect, Worker);`, loader: 'js' },
				bundle: true,
				write: false,
				format: 'esm',
				plugins: [
					builtinModulesEsbuildPlugin(),
					{
						name: 'stub-everything',
						setup(b) {
							b.onResolve({ filter: /.*/ }, () => ({ path: 'stub', namespace: 'stub' }));
							b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'throw new Error("stubbed")' }));
						},
					},
				],
			});
			const output = result.outputFiles[0].text;

			expect(output).toContain('from "ns:util"');
			expect(output).toContain('from "node:worker_threads"');
			expect(output).not.toContain('stubbed');
		});
	});
});
