import fs from 'fs';
import os from 'os';
import path from 'path';
import webpack from 'webpack';

import {
	addBuiltinModule,
	BuiltinModulePolyfillPlugin,
	builtinModulesExternal,
	getBuiltinModulePolyfill,
	getBuiltinModuleTarget,
	polyfillBuiltinModule,
	resetBuiltinModules,
} from '../../src/helpers/builtinModules';

describe('builtinModules', () => {
	afterEach(() => resetBuiltinModules());

	it('keeps every ns: specifier for the runtime by default', () => {
		expect(getBuiltinModuleTarget('ns:util')).toBe('ns:util');
		expect(getBuiltinModuleTarget('ns:some_future_module')).toBe(
			'ns:some_future_module',
		);
	});

	it('bundles node: and bare specifiers by default', () => {
		expect(getBuiltinModuleTarget('node:worker_threads')).toBeUndefined();
		expect(getBuiltinModuleTarget('worker_threads')).toBeUndefined();
		expect(getBuiltinModuleTarget('./ns:util')).toBeUndefined();
	});

	it('adds exact specifiers, optionally forwarding them', () => {
		addBuiltinModule('node:worker_threads');
		addBuiltinModule('worker_threads', 'node:worker_threads');

		expect(getBuiltinModuleTarget('node:worker_threads')).toBe(
			'node:worker_threads',
		);
		expect(getBuiltinModuleTarget('worker_threads')).toBe(
			'node:worker_threads',
		);
		expect(getBuiltinModuleTarget('node:fs')).toBeUndefined();
	});

	it('adds RegExp matchers with replacement targets', () => {
		addBuiltinModule(/^(?:node:)?(url|util)$/g, 'node:$1');

		expect(getBuiltinModuleTarget('url')).toBe('node:url');
		expect(getBuiltinModuleTarget('node:util')).toBe('node:util');
		// a global RegExp must not carry lastIndex between calls
		expect(getBuiltinModuleTarget('url')).toBe('node:url');
		expect(getBuiltinModuleTarget('urls')).toBeUndefined();
	});

	it('lets a polyfill override the ns: default', () => {
		polyfillBuiltinModule('ns:url', '/abs/url-polyfill.js');

		expect(getBuiltinModuleTarget('ns:url')).toBeUndefined();
		expect(getBuiltinModuleTarget('ns:util')).toBe('ns:util');
	});

	it('applies a polyfill registered for a forwarded target', () => {
		addBuiltinModule('worker_threads', 'node:worker_threads');
		polyfillBuiltinModule('node:worker_threads', '/abs/worker-polyfill.js');

		expect(getBuiltinModuleTarget('worker_threads')).toBeUndefined();
		expect(getBuiltinModulePolyfill('worker_threads')).toBe(
			'/abs/worker-polyfill.js',
		);
	});

	describe('webpack output', () => {
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
					`console.log(inspect, Worker, url, runtime);`,
				].join('\n'),
			);
			fs.writeFileSync(
				path.join(dir, 'url-polyfill.js'),
				`export default 'url-polyfill';`,
			);
			addBuiltinModule('worker_threads', 'node:worker_threads');
			polyfillBuiltinModule('ns:url', path.join(dir, 'url-polyfill.js'));
		});

		afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

		function build(esm: boolean): Promise<string> {
			return new Promise((resolve, reject) => {
				webpack(
					{
						mode: 'development',
						devtool: false,
						target: 'node',
						context: dir,
						entry: './index.js',
						externalsPresets: { node: false },
						externals: [builtinModulesExternal],
						plugins: [new BuiltinModulePolyfillPlugin()],
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

		it('emits ESM imports of the runtime specifiers', async () => {
			const output = await build(true);

			expect(output).toMatch(/import \* as \w+ from "ns:util";/);
			expect(output).toMatch(/import \* as \w+ from "ns:runtime";/);
			expect(output).toMatch(/import \* as \w+ from "node:worker_threads";/);
			expect(output).not.toMatch(/from "ns:url"/);
			expect(output).toContain('url-polyfill');
		});

		it('emits CommonJS requires of the runtime specifiers', async () => {
			const output = await build(false);

			expect(output).toContain('module.exports = require("ns:util");');
			expect(output).toContain('module.exports = require("ns:runtime");');
			expect(output).toContain(
				'module.exports = require("node:worker_threads");',
			);
			expect(output).not.toContain('require("ns:url")');
			expect(output).toContain('url-polyfill');
		});
	});
});
