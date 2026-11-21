import path from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mergeConfig } from 'vite';

describe('baseConfig dev server host', () => {
	const originalHost = process.env.NS_HMR_HOST;
	let baseConfig: typeof import('./base.js').baseConfig;

	beforeAll(async () => {
		// The project root is cwd; baseConfig resolves @nativescript/core and the app entry from it.
		vi.spyOn(process, 'cwd').mockReturnValue(path.resolve(import.meta.dirname, '..'));
		({ baseConfig } = await import('./base.js'));
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		if (originalHost === undefined) delete process.env.NS_HMR_HOST;
		else process.env.NS_HMR_HOST = originalHost;
	});

	it('listens on every interface, IPv6 included', () => {
		delete process.env.NS_HMR_HOST;
		expect(baseConfig({ mode: 'development', flavor: 'typescript' }).server?.host).toBe(true);
	});

	it('ignores NS_HMR_HOST, which only names the host the device is told to use', () => {
		process.env.NS_HMR_HOST = 'fd00::2';
		expect(baseConfig({ mode: 'development', flavor: 'typescript' }).server?.host).toBe(true);
	});

	it('yields to an explicit server.host from the app config', () => {
		const config = mergeConfig(baseConfig({ mode: 'development', flavor: 'typescript' }), { server: { host: '192.168.1.5' } });
		expect(config.server.host).toBe('192.168.1.5');
	});
});
