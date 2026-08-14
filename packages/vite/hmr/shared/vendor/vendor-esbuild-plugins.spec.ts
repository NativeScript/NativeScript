import * as esbuild from 'esbuild';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { createNodeBuiltinPolyfillEsbuildPlugin, createWebpackLoaderStubEsbuildPlugin } from './vendor-esbuild-plugins.js';

// --- createWebpackLoaderStubEsbuildPlugin --------------------------------
//
// Legacy NS 6/7-era plugins ship dead webpack-4 branches like
// `require("nativescript-worker-loader!./commercial-worker.js")`. esbuild
// resolves require() specifiers eagerly, so without the stub a single such
// specifier anywhere in the dependency closure hard-fails the entire
// vendor/deps bundle — even for packages the app never imports (observed with
// `nativescript-sqlite-commercial` retained as a pod-only dependency).
describe('createWebpackLoaderStubEsbuildPlugin', () => {
	const build = (contents: string) =>
		esbuild.build({
			stdin: { contents, resolveDir: process.cwd(), sourcefile: 'entry.js', loader: 'js' },
			bundle: true,
			write: false,
			format: 'esm',
			platform: 'neutral',
			logLevel: 'silent',
			plugins: [createWebpackLoaderStubEsbuildPlugin()],
		});

	it('stubs the classic NS 6/7 worker-loader require to undefined instead of failing the build', async () => {
		// Mirrors nativescript-sqlite-commercial's commercial-multi.js dead branch.
		const result = await build(['let worker;', 'if (globalThis.TNS_WEBPACK && globalThis.TNS_WEBPACK < 5) {', '  const SqliteWorker = require("nativescript-worker-loader!./commercial-worker.js");', '  worker = new SqliteWorker();', '}', 'export { worker };'].join('\n'));
		expect(result.errors).toHaveLength(0);
		const output = result.outputFiles?.[0]?.text ?? '';
		// The stub module must land in the bundle in place of the loader
		// request (esbuild wraps the CJS stub in a __commonJS closure and tags
		// it with the plugin namespace).
		expect(output).toContain('ns-webpack-loader-stub:nativescript-worker-loader!./commercial-worker.js');
		// ...and evaluating the bundle must yield undefined for the require.
		expect(output).toContain('module.exports = void 0;');
	});

	it('stubs chained and prefixed loader syntax (a!b!./x, !!loader!./x, -!loader!./x)', async () => {
		const result = await build(['export const a = require("raw-loader!css-loader!./styles.css");', 'export const b = require("!!my-loader!./thing.js");', 'export const c = require("-!other-loader!./thing.js");'].join('\n'));
		expect(result.errors).toHaveLength(0);
	});

	it('leaves relative and absolute specifiers containing "!" to the normal resolver', async () => {
		// A relative path that happens to contain `!` is NOT loader syntax; the
		// normal resolver must see it (and fail here, since the file doesn't
		// exist — proving the stub did not swallow it).
		const result = await build('export const x = require("./weird!name.js");').catch((e) => e);
		const messages = (result.errors ?? []).map((e: { text: string }) => e.text).join('\n');
		expect(messages).toContain('Could not resolve');
	});

	it('does not interfere with specifiers that contain no "!" at all', async () => {
		// The plugin's /!/ resolve filter must not be consulted for ordinary
		// specifiers — an unresolvable bare import still fails resolution
		// normally instead of being stubbed to undefined.
		const result = await build('import * as m from "some-nonexistent-package"; export const ok = m;').catch((e) => e);
		const messages = (result.errors ?? []).map((e: { text: string }) => e.text).join('\n');
		expect(messages).toContain('Could not resolve');
		expect(messages).not.toContain('ns-webpack-loader-stub');
	});
});

// --- createNodeBuiltinPolyfillEsbuildPlugin -------------------------------
//
// Builtin names that are ALSO installed npm polyfill packages (feross/buffer
// being the canonical case) must be bundled from node_modules instead of
// externalized — a bare `from "buffer"` left in the served ESM bundle is
// unresolvable on device and fails instantiation of the whole dev session.
describe('createNodeBuiltinPolyfillEsbuildPlugin', () => {
	function makeFixtureProject(): string {
		const root = mkdtempSync(path.join(tmpdir(), 'ns-builtin-polyfill-'));
		writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'fixture', dependencies: { buffer: '*' } }));
		const bufferDir = path.join(root, 'node_modules', 'buffer');
		mkdirSync(bufferDir, { recursive: true });
		writeFileSync(path.join(bufferDir, 'package.json'), JSON.stringify({ name: 'buffer', version: '9.9.9', main: 'index.js' }));
		writeFileSync(path.join(bufferDir, 'index.js'), 'exports.Buffer = function PolyfillBuffer() {};\nexports.__isPolyfill = true;\n');
		return root;
	}

	const build = (root: string, contents: string) =>
		esbuild.build({
			stdin: { contents, resolveDir: root, sourcefile: 'entry.js', loader: 'js' },
			bundle: true,
			write: false,
			format: 'esm',
			platform: 'neutral',
			logLevel: 'silent',
			external: ['buffer', 'node:buffer', 'fs', 'node:fs'],
			plugins: [createNodeBuiltinPolyfillEsbuildPlugin(root)],
		});

	it('bundles the installed buffer polyfill instead of leaving a bare external', async () => {
		const root = makeFixtureProject();
		const result = await build(root, 'import { Buffer } from "buffer"; export const b = new Buffer();');
		expect(result.errors).toHaveLength(0);
		const output = result.outputFiles?.[0]?.text ?? '';
		expect(output).not.toMatch(/from\s+["']buffer["']/);
		expect(output).toContain('__isPolyfill');
	});

	it('resolves the node:-prefixed spelling to the same installed polyfill', async () => {
		const root = makeFixtureProject();
		const result = await build(root, 'import { Buffer } from "node:buffer"; export const b = Buffer;');
		expect(result.errors).toHaveLength(0);
		const output = result.outputFiles?.[0]?.text ?? '';
		expect(output).not.toMatch(/from\s+["']node:buffer["']/);
		expect(output).toContain('__isPolyfill');
	});

	it('leaves builtins with no installed polyfill external (status quo)', async () => {
		const root = makeFixtureProject();
		const result = await build(root, 'import * as fs from "fs"; export const f = fs;');
		expect(result.errors).toHaveLength(0);
		const output = result.outputFiles?.[0]?.text ?? '';
		expect(output).toMatch(/from\s+["']fs["']/);
	});
});
