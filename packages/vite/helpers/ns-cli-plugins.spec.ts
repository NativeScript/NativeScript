import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Bundle = Record<string, { type: string; code?: string; source?: string }>;

const chunk = (code: string) => ({ type: 'chunk', code });
const asset = (source: string) => ({ type: 'asset', source });

describe('cliPlugin build notifications', () => {
	let distDir: string;
	let sent: any[];
	const originalSend = process.send;

	beforeEach(() => {
		vi.resetModules();
		distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-cli-plugin-'));
		sent = [];
		process.send = ((message: unknown) => {
			sent.push(message);
			return true;
		}) as typeof process.send;
	});

	afterEach(() => {
		process.send = originalSend;
		fs.rmSync(distDir, { recursive: true, force: true });
	});

	async function createPlugin(hmrActive: boolean) {
		const { cliPlugin } = await import('./ns-cli-plugins.js');
		const plugin: any = cliPlugin({ distOutputFolder: distDir, isDevMode: true, verbose: false, hmrActive });
		return (bundle: Bundle) => {
			plugin.generateBundle({ dir: distDir }, bundle);
			plugin.writeBundle({ dir: distDir }, bundle);
			plugin.closeBundle();
		};
	}

	it('under HMR, notifies the CLI after the initial build and then only when bundle.mjs changes', async () => {
		const build = await createPlugin(true);
		build({ 'bundle.mjs': chunk('boot v1'), 'bundle.mjs.map': asset('map 1') });
		build({ 'bundle.mjs': chunk('boot v1'), 'bundle.mjs.map': asset('map 2') });
		build({ 'bundle.mjs': chunk('boot v2'), 'bundle.mjs.map': asset('map 3'), 'ns-vendor.mjs': chunk('vendor') });

		expect(sent.map((m) => m.buildType)).toEqual(['initial', 'incremental']);
		expect(sent[1]).toMatchObject({ isHMR: false, emittedFiles: ['bundle.mjs', 'bundle.mjs.map', 'ns-vendor.mjs'] });
	});

	it('without HMR, notifies the CLI after every build', async () => {
		const build = await createPlugin(false);
		build({ 'bundle.mjs': chunk('boot v1') });
		build({ 'bundle.mjs': chunk('boot v1') });
		expect(sent.map((m) => m.buildType)).toEqual(['initial', 'incremental']);
	});
});

describe('hashBootBundle', () => {
	it('hashes bundle.mjs from a chunk or an asset, and nothing else', async () => {
		const { hashBootBundle } = await import('./ns-cli-plugins.js');
		expect(hashBootBundle({ 'bundle.mjs': chunk('a') })).toBe(hashBootBundle({ 'bundle.mjs': asset('a') }));
		expect(hashBootBundle({ 'bundle.mjs': chunk('a') })).not.toBe(hashBootBundle({ 'bundle.mjs': chunk('b') }));
		expect(hashBootBundle({ 'other.mjs': chunk('a') })).toBeUndefined();
	});
});
