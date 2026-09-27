import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { typescriptCheckPlugin } from './typescript-check.js';

const FAKE_TSRX_TSC = `
const fs = require('node:fs');
const configPath = process.argv[process.argv.indexOf('-p') + 1];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
fs.writeFileSync(process.env.NS_TSRX_TEST_OUT, JSON.stringify({ argv: process.argv.slice(2), configPath, config }));
process.exit(Number(process.env.NS_TSRX_TEST_EXIT || 0));
`;

interface RecordedRun {
	argv: string[];
	configPath: string;
	config: { extends: string; files: string[]; tsrx?: { platform: string }; compilerOptions: { moduleSuffixes: string[] } };
}

function createProject(): string {
	const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ns-vite-tsrx-check-'));
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'tsrx-check-app', private: true }));
	fs.writeFileSync(
		path.join(root, 'tsconfig.json'),
		JSON.stringify({
			compilerOptions: { target: 'es2020', module: 'esnext', moduleResolution: 'bundler', strict: true, noEmit: true, noEmitOnError: true, skipLibCheck: true, lib: ['es2020'], types: [] },
			include: ['src/**/*.ts'],
		}),
	);
	fs.mkdirSync(path.join(root, 'src'));
	fs.writeFileSync(path.join(root, 'src', 'main.ts'), "import { Greeting } from './Greeting.tsrx';\nexport const el = Greeting();\n");
	fs.writeFileSync(path.join(root, 'src', 'Greeting.tsrx'), 'export function Greeting() @{ <p>hi</p> }\n');
	fs.writeFileSync(path.join(root, 'src', 'util.ios.ts'), "export const platform = 'ios';\n");
	fs.writeFileSync(path.join(root, 'src', 'util.android.ts'), "export const platform = 'android';\n");
	return root;
}

function installFakeTsrxPlugin(root: string): void {
	const pkgDir = path.join(root, 'node_modules', '@tsrx', 'typescript-plugin');
	fs.mkdirSync(pkgDir, { recursive: true });
	fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({ name: '@tsrx/typescript-plugin', version: '0.0.0', bin: { 'tsrx-tsc': './tsc.js' } }));
	fs.writeFileSync(path.join(pkgDir, 'tsc.js'), FAKE_TSRX_TSC);
}

async function runCheck(opts: Parameters<typeof typescriptCheckPlugin>[0]): Promise<void> {
	const plugin = typescriptCheckPlugin(opts);
	await (plugin.buildStart as unknown as () => Promise<void>)();
}

function readRun(outFile: string): RecordedRun {
	return JSON.parse(fs.readFileSync(outFile, 'utf8'));
}

function baseNames(run: RecordedRun): string[] {
	return run.config.files.map((file) => path.basename(file));
}

describe('typescriptCheckPlugin with .tsrx imports', () => {
	let cwd: string;
	let root: string;
	let outFile: string;

	beforeEach(() => {
		cwd = process.cwd();
		root = createProject();
		outFile = path.join(root, 'tsrx-tsc-run.json');
		process.env.NS_TSRX_TEST_OUT = outFile;
		process.chdir(root);
	});

	afterEach(() => {
		process.chdir(cwd);
		delete process.env.NS_TSRX_TEST_OUT;
		delete process.env.NS_TSRX_TEST_EXIT;
		vi.restoreAllMocks();
		fs.rmSync(root, { recursive: true, force: true });
	});

	it('delegates to tsrx-tsc with a platform-filtered config inside the project', async () => {
		installFakeTsrxPlugin(root);

		await runCheck({ platform: 'ios' });

		const run = readRun(outFile);
		expect(run.argv).toEqual(['--pretty', '-p', run.configPath]);
		expect(run.configPath.startsWith(path.join(root, 'node_modules', '.ns-vite') + path.sep)).toBe(true);
		expect(run.config.extends).toBe(path.join(root, 'tsconfig.json'));
		expect(baseNames(run)).toEqual(expect.arrayContaining(['main.ts', 'util.ios.ts']));
		expect(baseNames(run)).not.toContain('util.android.ts');
		expect(run.config.compilerOptions.moduleSuffixes).toEqual(['.ios', '.native', '']);
		expect(run.config.tsrx).toEqual({ platform: 'ios' });
		expect(fs.existsSync(path.dirname(run.configPath))).toBe(false);
	});

	it('selects the android files and maps visionOS onto the ios tsrx platform', async () => {
		installFakeTsrxPlugin(root);

		await runCheck({ platform: 'android' });
		const android = readRun(outFile);
		expect(baseNames(android)).toContain('util.android.ts');
		expect(baseNames(android)).not.toContain('util.ios.ts');
		expect(android.config.tsrx).toEqual({ platform: 'android' });

		await runCheck({ platform: 'visionos' });
		const visionos = readRun(outFile);
		expect(visionos.config.tsrx).toEqual({ platform: 'ios' });
		expect(visionos.config.compilerOptions.moduleSuffixes).toEqual(['.visionos', '.ios', '.native', '']);
	});

	it('leaves tsrx.platform to the project when no platform is selected', async () => {
		installFakeTsrxPlugin(root);

		await runCheck({});

		expect(readRun(outFile).config.tsrx).toBeUndefined();
	});

	it('fails the build when tsrx-tsc reports errors and removes its scratch config', async () => {
		installFakeTsrxPlugin(root);
		process.env.NS_TSRX_TEST_EXIT = '2';
		vi.spyOn(console, 'error').mockImplementation(() => {});

		await expect(runCheck({ platform: 'ios' })).rejects.toThrow('tsrx-tsc reported type errors');

		expect(fs.readdirSync(path.join(root, 'node_modules', '.ns-vite'))).toEqual([]);
	});

	it('hints at @tsrx/typescript-plugin when the in-process check cannot resolve .tsrx imports', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		await runCheck({ platform: 'ios', failOnError: false });

		expect(warn.mock.calls.flat().join('\n')).toContain('install @tsrx/typescript-plugin');
		expect(fs.existsSync(outFile)).toBe(false);
		expect(fs.existsSync(path.join(root, 'node_modules', '.ns-vite'))).toBe(false);
	});
});
