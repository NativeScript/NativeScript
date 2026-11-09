import fs from 'fs';
import os from 'os';
import path from 'path';
import * as esbuild from 'esbuild';
import { build, type Plugin, type UserConfig } from 'vite';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

import { builtinModulesEsbuildPlugin, isBuiltinModuleId, nativescriptBuiltinModules, resetBuiltinModules, unwrapBuiltinModuleIds } from './builtin-modules.js';

describe('builtin modules', () => {
	afterEach(() => resetBuiltinModules());

	describe('matching', () => {
		it('matches every ns: specifier by default', () => {
			expect(isBuiltinModuleId('ns:util')).toBe(true);
			expect(isBuiltinModuleId('ns:some_future_module')).toBe(true);
			expect(isBuiltinModuleId('node:worker_threads')).toBe(false);
			expect(isBuiltinModuleId('worker_threads')).toBe(false);
		});

		it('adds the specifiers another plugin instance includes', () => {
			nativescriptBuiltinModules({ include: ['node:worker_threads', /^node:(url|util)$/g] });

			expect(isBuiltinModuleId('node:worker_threads')).toBe(true);
			expect(isBuiltinModuleId('node:url')).toBe(true);
			// a global RegExp must not carry lastIndex between calls
			expect(isBuiltinModuleId('node:url')).toBe(true);
			expect(isBuiltinModuleId('node:fs')).toBe(false);
		});

		it('restores /@id/-wrapped builtin specifiers only', () => {
			nativescriptBuiltinModules({ include: ['node:worker_threads'] });
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

		const bundle = async (entry: string, plugins: Plugin[] = [nativescriptBuiltinModules()], resolve?: UserConfig['resolve']): Promise<string> => {
			const result: any = await build({
				root,
				configFile: false,
				logLevel: 'silent',
				plugins,
				resolve,
				build: {
					write: false,
					minify: false,
					rolldownOptions: { input: path.join(root, entry), output: { format: 'es', codeSplitting: false } },
				},
			});
			return (Array.isArray(result) ? result[0] : result).output.map((file: any) => file.code ?? '').join('\n');
		};

		it('emits runtime builtin imports verbatim', async () => {
			write('esm.js', [`import { inspect } from 'ns:util';`, `import { Worker } from 'worker_threads';`, `console.log(inspect, Worker, import('ns:runtime'));`].join('\n'));

			const output = await bundle('esm.js', [nativescriptBuiltinModules(), nativescriptBuiltinModules({ include: ['node:worker_threads'] })], { alias: { worker_threads: 'node:worker_threads' } });

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

		it('lets resolve.alias polyfill a builtin', async () => {
			write('url-polyfill.js', `export const URL = 'url-polyfill';`);
			write('polyfill.js', `import { URL } from 'ns:url';\nconsole.log(URL);`);

			const output = await bundle('polyfill.js', undefined, { alias: { 'ns:url': path.join(root, 'url-polyfill.js') } });

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
			nativescriptBuiltinModules({ include: ['node:worker_threads'] });
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
