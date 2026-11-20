import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CliBuildMessage } from '../../helpers/ns-cli-plugins.js';
import { SINGLE_PROCESS_DEV_ENV, SINGLE_PROCESS_DEV_PLATFORMS, createDevOutputWriter, isSingleProcessDev, type DevOutputProcessState, type DevOutputWriterOptions } from './dev-output.js';

describe('isSingleProcessDev', () => {
	it('holds only when the CLI asks for it, on the platforms this package supports', () => {
		const asked = { [SINGLE_PROCESS_DEV_ENV]: '1' };
		expect(isSingleProcessDev('ios', asked)).toBe(true);
		expect(isSingleProcessDev('visionos', asked)).toBe(true);
		expect(isSingleProcessDev('android', asked)).toBe(true);
		expect(isSingleProcessDev('web', asked)).toBe(false);
		expect(isSingleProcessDev('ios', {})).toBe(false);
		expect(isSingleProcessDev('ios', { [SINGLE_PROCESS_DEV_ENV]: '0' })).toBe(false);
	});

	it('matches the platforms package.json declares to the CLI', () => {
		const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
		expect(pkg.nativescriptCli.singleProcessDev).toEqual([...SINGLE_PROCESS_DEV_PLATFORMS]);
	});
});

describe('createDevOutputWriter', () => {
	let root: string;
	let outDir: string;
	let assets: string;
	let sent: CliBuildMessage[];
	let state: DevOutputProcessState;
	let files: Record<string, string>;

	const write = (file: string, content: string) => {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.writeFileSync(file, content);
	};
	const read = (rel: string) => fs.readFileSync(path.join(outDir, rel), 'utf8');
	const exists = (rel: string) => fs.existsSync(path.join(outDir, rel));
	const writer = (overrides: Partial<DevOutputWriterOptions> = {}) =>
		createDevOutputWriter({
			root,
			outDir,
			copyDirs: [
				{ dir: assets, dest: 'assets' },
				{ dir: path.join(root, 'app/fonts'), dest: 'fonts' },
			],
			files: () => files,
			send: (message) => sent.push(message),
			warn: (message) => {
				throw new Error(message);
			},
			debounceMs: 5,
			state,
			...overrides,
		});
	const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

	beforeEach(() => {
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-dev-output-'));
		outDir = path.join(root, '.ns-vite-build/ios');
		assets = path.join(root, 'app/assets');
		sent = [];
		state = { initialSent: false };
		files = { 'bundle.mjs': 'boot', 'package.json': '{}' };
		write(path.join(assets, 'logo.png'), 'png');
		write(path.join(assets, 'img/nested.txt'), 'nested');
		write(path.join(assets, '.DS_Store'), 'junk');
	});

	afterEach(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	it('writes the generated files and the copies, drops stale output, and sends the initial build', () => {
		write(path.join(outDir, 'bundle.mjs.map'), 'stale map');
		write(path.join(outDir, 'assets/removed.png'), 'stale');
		writer().sync();
		expect(read('bundle.mjs')).toBe('boot');
		expect(read('package.json')).toBe('{}');
		expect(read('assets/logo.png')).toBe('png');
		expect(read('assets/img/nested.txt')).toBe('nested');
		expect(exists('assets/.DS_Store')).toBe(false);
		expect(exists('bundle.mjs.map')).toBe(false);
		expect(exists('assets/removed.png')).toBe(false);
		expect(sent).toHaveLength(1);
		expect(sent[0]).toMatchObject({ buildType: 'initial', isHMR: false });
		expect(sent[0].emittedFiles.sort()).toEqual(['assets/img/nested.txt', 'assets/logo.png', 'bundle.mjs', 'package.json']);
		expect(sent[0].removedFiles).toBeUndefined();
	});

	it('sends the initial build once per process, then only what a later sync changed', () => {
		writer().sync();
		writer().sync();
		expect(sent).toHaveLength(1);
		files = { ...files, 'bundle.mjs': 'boot 2' };
		fs.rmSync(path.join(assets, 'logo.png'));
		writer().sync();
		expect(sent).toHaveLength(2);
		expect(sent[1]).toMatchObject({ buildType: 'incremental', emittedFiles: ['bundle.mjs'], removedFiles: ['assets/logo.png'] });
	});

	it('keeps the copies current from watcher events, in one message per burst', async () => {
		const output = writer();
		write(path.join(assets, 'early.png'), 'early');
		output.onFileEvent('add', path.join(assets, 'early.png'));
		expect(exists('assets/early.png')).toBe(false);
		output.sync();
		sent = [];

		write(path.join(assets, 'new.png'), 'new');
		output.onFileEvent('add', path.join(assets, 'new.png'));
		write(path.join(assets, 'logo.png'), 'png 2');
		output.onFileEvent('change', path.join(assets, 'logo.png'));
		fs.rmSync(path.join(assets, 'img/nested.txt'));
		output.onFileEvent('unlink', path.join(assets, 'img/nested.txt'));
		await settle();

		expect(read('assets/new.png')).toBe('new');
		expect(read('assets/logo.png')).toBe('png 2');
		expect(exists('assets/img/nested.txt')).toBe(false);
		expect(sent).toHaveLength(1);
		expect(sent[0]).toMatchObject({ buildType: 'incremental', emittedFiles: ['assets/new.png', 'assets/logo.png'], removedFiles: ['assets/img/nested.txt'] });
	});

	it('ignores files outside the copied directories, dot files and saves that change nothing', async () => {
		const output = writer();
		output.sync();
		sent = [];
		write(path.join(root, 'app/app.ts'), 'code');
		output.onFileEvent('change', path.join(root, 'app/app.ts'));
		output.onFileEvent('change', path.join(assets, '.DS_Store'));
		output.onFileEvent('change', path.join(assets, 'logo.png'));
		await settle();
		expect(sent).toEqual([]);
	});

	it('creates a copied directory that appears during the session', async () => {
		const output = writer();
		output.sync();
		sent = [];
		write(path.join(root, 'app/fonts/icons.ttf'), 'ttf');
		output.onFileEvent('add', path.join(root, 'app/fonts/icons.ttf'));
		await settle();
		expect(read('fonts/icons.ttf')).toBe('ttf');
		expect(sent[0].emittedFiles).toEqual(['fonts/icons.ttf']);
	});

	it('deletes nothing in an output directory outside the project', () => {
		const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-dev-output-outside-'));
		try {
			write(path.join(outside, 'keep.txt'), 'keep');
			outDir = outside;
			writer().sync();
			expect(read('keep.txt')).toBe('keep');
			expect(read('bundle.mjs')).toBe('boot');
		} finally {
			fs.rmSync(outside, { recursive: true, force: true });
		}
	});
});
