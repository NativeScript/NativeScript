import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDevApplication, collectDevApplicationOutput, createDevApplicationChunk, type DevApplicationOutput, type DevApplicationState } from './dev-application-build.js';

const component = { absolutePath: '/app/src/custom-application.android.ts', outputName: 'custom-application' };

describe('collectDevApplicationOutput', () => {
	it('keeps chunks and their source maps, and the files bundled into them or loaded by the build', () => {
		const output = collectDevApplicationOutput(
			[
				{ type: 'chunk', fileName: 'custom-application.mjs', code: 'app', moduleIds: ['/app/src/custom-application.android.ts', '/app/src/base.ts?raw', '\0rolldown/runtime.js'] },
				{ type: 'chunk', fileName: 'chunk-a.mjs', code: 'lazy', moduleIds: ['/app/node_modules/lib/index.js'] },
				{ type: 'asset', fileName: 'custom-application.mjs.map', source: '{}' },
				{ type: 'asset', fileName: 'package.json', source: '{}' },
			],
			['/app/src/inlined-constants.ts', '/app/src/custom-application.android.ts'],
		);
		expect(output.files).toEqual({ 'custom-application.mjs': 'app', 'chunk-a.mjs': 'lazy', 'custom-application.mjs.map': '{}' });
		expect(output.sources).toEqual(['/app/src/inlined-constants.ts', '/app/src/custom-application.android.ts', '/app/src/base.ts', '/app/node_modules/lib/index.js']);
	});
});

describe('buildDevApplication', () => {
	let root: string;

	beforeEach(() => {
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-dev-application-'));
		fs.writeFileSync(path.join(root, 'base.js'), "export const tag = 'base';\n");
		fs.writeFileSync(path.join(root, 'unused.js'), "export const unused = 'unused';\n");
		fs.writeFileSync(path.join(root, 'custom-application.android.js'), "import { tag } from './base.js';\nimport { unused } from './unused.js';\nglobalThis.appTag = tag;\n");
		fs.writeFileSync(path.join(root, 'main.js'), 'globalThis.main = true;\n');
		// A watch build of another entry, written to disk with a cleared outDir, as HMR configs build.
		fs.writeFileSync(path.join(root, 'vite.config.mjs'), ['export default {', "\tlogLevel: 'silent',", "\tbuild: { watch: {}, write: true, emptyOutDir: true, outDir: 'dist', rolldownOptions: { input: 'main.js', output: { entryFileNames: '[name].mjs' } } },", '};', ''].join('\n'));
		fs.mkdirSync(path.join(root, 'dist'));
		fs.writeFileSync(path.join(root, 'dist/keep.txt'), 'keep');
	});

	afterEach(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	it("builds only the component, once and in memory, with the app's own config", async () => {
		const server = { config: { configFile: path.join(root, 'vite.config.mjs'), root, mode: 'development' } } as ViteDevServer;
		const output = await buildDevApplication(server, { absolutePath: path.join(root, 'custom-application.android.js'), outputName: 'custom-application' });
		expect(Object.keys(output.files)).toEqual(['custom-application.mjs']);
		expect(output.files['custom-application.mjs']).toMatch(/appTag\s*=\s*[`'"]base/);
		expect(output.files['custom-application.mjs']).not.toContain('import ');
		expect(output.files['custom-application.mjs']).not.toContain('unused');
		expect(output.sources.map((file) => fs.realpathSync(file)).sort()).toEqual([path.join(root, 'base.js'), path.join(root, 'custom-application.android.js'), path.join(root, 'unused.js')].map((file) => fs.realpathSync(file)).sort());
		expect(fs.readdirSync(path.join(root, 'dist'))).toEqual(['keep.txt']);
	});
});

describe('createDevApplicationChunk', () => {
	const built = (code: string, sources: string[] = []): DevApplicationOutput => ({ files: { 'custom-application.mjs': code }, sources: [component.absolutePath, ...sources] });

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('rebuilds once per burst of changes to its sources and reports it', async () => {
		const build = vi
			.fn()
			.mockResolvedValueOnce(built('v1', ['/app/src/base.ts']))
			.mockResolvedValueOnce(built('v2', ['/app/src/base.ts']));
		const onRebuilt = vi.fn();
		const watch = vi.fn();
		const chunk = createDevApplicationChunk({ component, build, onRebuilt, error: vi.fn(), watch, state: {} });
		expect(chunk.files()).toEqual({});
		expect(await chunk.build()).toBe(true);
		expect(chunk.files()).toEqual({ 'custom-application.mjs': 'v1' });
		expect(watch).toHaveBeenCalledWith([component.absolutePath, '/app/src/base.ts']);
		expect(onRebuilt).not.toHaveBeenCalled();

		expect(chunk.isSource('/app/src/base.ts')).toBe(true);
		expect(chunk.isSource('/app/src/other.ts')).toBe(false);
		chunk.onFileEvent('/app/src/other.ts');
		chunk.onFileEvent('/app/src/base.ts');
		chunk.onFileEvent(component.absolutePath);
		await vi.runAllTimersAsync();
		expect(build).toHaveBeenCalledTimes(2);
		expect(chunk.files()).toEqual({ 'custom-application.mjs': 'v2' });
		expect(onRebuilt).toHaveBeenCalledTimes(1);
		expect(onRebuilt).toHaveBeenCalledWith(['/app/src/base.ts', component.absolutePath]);
	});

	it('keeps the last good chunk, across instances, when a rebuild fails', async () => {
		const state: DevApplicationState = {};
		const error = vi.fn();
		const onRebuilt = vi.fn();
		await createDevApplicationChunk({ component, build: async () => built('v1'), onRebuilt, error, state }).build();
		const next = createDevApplicationChunk({ component, build: vi.fn().mockRejectedValue(new Error('Unexpected token')), onRebuilt, error, state });
		expect(next.files()).toEqual({ 'custom-application.mjs': 'v1' });
		next.onFileEvent(component.absolutePath);
		await vi.runAllTimersAsync();
		expect(next.files()).toEqual({ 'custom-application.mjs': 'v1' });
		expect(onRebuilt).not.toHaveBeenCalled();
		expect(error.mock.calls[0][0]).toContain('Unexpected token');
	});

	it('reports the changes a failed rebuild left with the next successful one', async () => {
		const build = vi
			.fn()
			.mockResolvedValueOnce(built('v1', ['/app/src/base.ts']))
			.mockRejectedValueOnce(new Error('Unexpected token'))
			.mockResolvedValueOnce(built('v2', ['/app/src/base.ts']));
		const onRebuilt = vi.fn();
		const chunk = createDevApplicationChunk({ component, build, onRebuilt, error: vi.fn(), state: {} });
		await chunk.build();
		chunk.onFileEvent('/app/src/base.ts');
		await vi.runAllTimersAsync();
		expect(onRebuilt).not.toHaveBeenCalled();
		chunk.onFileEvent(component.absolutePath);
		await vi.runAllTimersAsync();
		expect(onRebuilt).toHaveBeenCalledExactlyOnceWith(['/app/src/base.ts', component.absolutePath]);
	});

	it('runs one build at a time', async () => {
		let release!: () => void;
		const order: string[] = [];
		const build = vi
			.fn()
			.mockImplementationOnce(async () => {
				order.push('first start');
				await new Promise<void>((resolve) => (release = resolve));
				order.push('first end');
				return built('v1');
			})
			.mockImplementationOnce(async () => {
				order.push('second');
				return built('v2');
			});
		const chunk = createDevApplicationChunk({ component, build, onRebuilt: vi.fn(), error: vi.fn(), state: {} });
		const first = chunk.build();
		const second = chunk.build();
		await vi.waitFor(() => expect(order).toEqual(['first start']));
		release();
		await Promise.all([first, second]);
		expect(order).toEqual(['first start', 'first end', 'second']);
		expect(chunk.files()).toEqual({ 'custom-application.mjs': 'v2' });
	});
});
