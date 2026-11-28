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

	async function createPlugin(hmrActive: boolean, waitForDevServer: (address: { port: number; host?: string; https?: boolean }) => Promise<boolean> = async () => true) {
		const { cliPlugin } = await import('./ns-cli-plugins.js');
		const plugin: any = cliPlugin({ distOutputFolder: distDir, isDevMode: true, verbose: false, hmrActive, waitForDevServer });
		plugin.configResolved({ server: { port: 5199 } });
		return (bundle: Bundle) => {
			plugin.generateBundle({ dir: distDir }, bundle);
			plugin.writeBundle({ dir: distDir }, bundle);
			return plugin.closeBundle();
		};
	}

	it('under HMR, notifies the CLI after the initial build and then only when bundle.mjs changes', async () => {
		const build = await createPlugin(true);
		await build({ 'bundle.mjs': chunk('boot v1'), 'bundle.mjs.map': asset('map 1') });
		await build({ 'bundle.mjs': chunk('boot v1'), 'bundle.mjs.map': asset('map 2') });
		await build({ 'bundle.mjs': chunk('boot v2'), 'bundle.mjs.map': asset('map 3'), 'chunk-a.mjs': chunk('chunk') });

		expect(sent.map((m) => m.buildType)).toEqual(['initial', 'incremental']);
		expect(sent[1]).toMatchObject({ isHMR: false, emittedFiles: ['bundle.mjs', 'bundle.mjs.map', 'chunk-a.mjs'] });
	});

	it('without HMR, notifies the CLI after every build', async () => {
		const build = await createPlugin(false);
		await build({ 'bundle.mjs': chunk('boot v1') });
		await build({ 'bundle.mjs': chunk('boot v1') });
		expect(sent.map((m) => m.buildType)).toEqual(['initial', 'incremental']);
	});

	it('under HMR, holds the initial notification until the dev server reports its boot graph warm', async () => {
		let markWarm!: (warm: boolean) => void;
		const waitForDevServer = vi.fn(() => new Promise<boolean>((resolve) => (markWarm = resolve)));
		const build = await createPlugin(true, waitForDevServer);
		const initial = build({ 'bundle.mjs': chunk('boot v1') });
		await Promise.resolve();
		expect(waitForDevServer).toHaveBeenCalledWith({ port: 5199, host: undefined, https: false });
		expect(sent).toEqual([]);
		markWarm(true);
		await initial;
		expect(sent.map((m) => m.buildType)).toEqual(['initial']);
		await build({ 'bundle.mjs': chunk('boot v2') });
		expect(waitForDevServer).toHaveBeenCalledTimes(1);
	});
});

describe('devServerAddressOf', () => {
	it('reaches a wildcard bind on loopback and keeps a named host and https', async () => {
		const { devServerAddressOf } = await import('./ns-cli-plugins.js');
		expect(devServerAddressOf({ port: 5173, host: '0.0.0.0' })).toEqual({ port: 5173, host: undefined, https: false });
		expect(devServerAddressOf({ host: true })).toEqual({ port: 5173, host: undefined, https: false });
		expect(devServerAddressOf({ host: '::' })).toEqual({ port: 5173, host: undefined, https: false });
		expect(devServerAddressOf({ port: 5180, host: '192.168.1.5', https: {} })).toEqual({ port: 5180, host: '192.168.1.5', https: true });
	});
});

describe('waitForDevServerListening', () => {
	it('resolves once the port accepts connections, and false after the deadline', async () => {
		const net = await import('node:net');
		const { waitForDevServerListening } = await import('./ns-cli-plugins.js');
		const server = net.createServer((socket) => socket.destroy());
		await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
		const port = (server.address() as { port: number }).port;
		expect(await waitForDevServerListening({ port })).toBe(true);
		await new Promise((resolve) => server.close(resolve));
		expect(await waitForDevServerListening({ port }, Date.now() + 300)).toBe(false);
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
