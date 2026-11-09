import fs from 'fs';
import os from 'os';
import path from 'path';
import webpack, { NormalModuleReplacementPlugin } from 'webpack';

import { NativeScriptBuiltinModulesPlugin } from '../../src/plugins/NativeScriptBuiltinModulesPlugin';

describe('NativeScriptBuiltinModulesPlugin', () => {
	let dir: string;

	beforeEach(() => {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-builtin-modules-'));
		fs.writeFileSync(
			path.join(dir, 'index.js'),
			[
				`import { inspect } from 'ns:util';`,
				`import { Worker } from 'worker_threads';`,
				`import url from 'ns:url';`,
				`const runtime = require('ns:runtime');`,
				`import('ns:module').then(console.log);`,
				`console.log(inspect, Worker, url, runtime);`,
			].join('\n'),
		);
		fs.writeFileSync(
			path.join(dir, 'url-polyfill.js'),
			`export default 'url-polyfill';`,
		);
	});

	afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

	function build(esm: boolean, plugins: any[]): Promise<string> {
		return new Promise((resolve, reject) => {
			webpack(
				{
					mode: 'development',
					devtool: false,
					target: 'node',
					context: dir,
					entry: './index.js',
					externalsPresets: { node: false },
					plugins,
					experiments: { outputModule: esm },
					output: {
						path: path.join(dir, 'dist'),
						filename: 'bundle.js',
						module: esm,
						library: { type: esm ? 'module' : 'commonjs' },
					},
				},
				(err, stats) => {
					if (err) return reject(err);
					if (stats.hasErrors()) {
						return reject(new Error(stats.toString('errors-only')));
					}
					resolve(fs.readFileSync(path.join(dir, 'dist/bundle.js'), 'utf8'));
				},
			);
		});
	}

	const plugins = () => [
		new NativeScriptBuiltinModulesPlugin({
			include: [/^ns:/, 'node:worker_threads'],
		}),
		new NormalModuleReplacementPlugin(
			/^worker_threads$/,
			'node:worker_threads',
		),
		new NormalModuleReplacementPlugin(
			/^ns:url$/,
			path.join(dir, 'url-polyfill.js'),
		),
	];

	it('matches every ns: specifier by default', () => {
		const plugin = new NativeScriptBuiltinModulesPlugin();

		expect(plugin.matches('ns:util')).toBe(true);
		expect(plugin.matches('ns:some_future_module')).toBe(true);
		expect(plugin.matches('node:worker_threads')).toBe(false);
		expect(plugin.matches('worker_threads')).toBe(false);
	});

	it('emits ESM imports, honoring replacement plugins', async () => {
		const output = await build(true, plugins());

		expect(output).toMatch(/import \* as \w+ from "ns:util";/);
		expect(output).toMatch(/import \* as \w+ from "ns:runtime";/);
		expect(output).toMatch(/from "node:worker_threads";/);
		expect(output).toContain('"ns:module"');
		expect(output).not.toMatch(/from "ns:url"/);
		expect(output).toContain('url-polyfill');
	});

	it('emits CommonJS requires, honoring replacement plugins', async () => {
		const output = await build(false, plugins());

		expect(output).toContain('module.exports = require("ns:util");');
		expect(output).toContain('module.exports = require("ns:runtime");');
		expect(output).toContain(
			'module.exports = require("node:worker_threads");',
		);
		expect(output).not.toContain('require("ns:url")');
		expect(output).toContain('url-polyfill');
	});

	it('fails on ns: imports without the plugin', async () => {
		await expect(build(true, [])).rejects.toThrow(/ns:util/);
	});
});
