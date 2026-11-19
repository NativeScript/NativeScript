import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UpdatePayload } from 'vite';
import { HMRClient, HMRContext } from './hmr-client.js';
import { clientDispatchOf, defineViteHmrCompatGlobals, resetViteHmrCompatWarnings, VITE_HMR_GLOBAL_DEPRECATIONS, type ViteHmrCompatDeps } from './compat-globals.js';

const silentLogger = { error: () => {}, debug: () => {} };

function setup(target: Record<string, any> = {}) {
	const client = new HMRClient(silentLogger);
	const hot = new HMRContext(client, '/node_modules/@nativescript/vite/hmr-compat.js');
	const warn = vi.fn();
	const deps: ViteHmrCompatDeps = { hot, dispatch: clientDispatchOf(hot), origin: 'http://192.168.1.2:5173', warn };
	defineViteHmrCompatGlobals(target, deps);
	return { target, client, warn };
}

function update(timestamp: number, ...paths: string[]): UpdatePayload {
	return { type: 'update', updates: paths.map((path) => ({ type: 'js-update', path, acceptedPath: path, timestamp })) };
}

describe('@nativescript/vite HMR compat globals', () => {
	beforeEach(() => resetViteHmrCompatWarnings());

	it('forwards __NS_HOT_REGISTRY__ to the hot context and the device client, warning once', async () => {
		const { target, client, warn } = setup();
		const listener = vi.fn();
		target.__NS_HOT_REGISTRY__.on('app:event', listener);
		expect(target.__NS_HOT_REGISTRY__.dispatchHotEvent('app:event', { a: 1 })).toBe(1);
		await client.notifyListeners('app:event', { b: 2 });
		target.__NS_HOT_REGISTRY__.off('app:event', listener);
		expect(target.__NS_HOT_REGISTRY__.dispatchHotEvent('app:event', {})).toBe(0);
		await Promise.resolve();
		expect(listener.mock.calls).toEqual([[{ a: 1 }], [{ b: 2 }]]);
		expect(warn.mock.calls).toEqual([[VITE_HMR_GLOBAL_DEPRECATIONS.__NS_HOT_REGISTRY__]]);
	});

	it('calls __NS_HMR_ON_UPDATE__ once per update with the announced edits', async () => {
		const { target, client, warn } = setup();
		const hook = vi.fn();
		target.__NS_HMR_ON_UPDATE__ = hook;
		await client.notifyListeners('ns:rerun', { timestamp: 7, changed: ['/src/app/home.component.ts'], rerun: [], root: '/' });
		await client.notifyListeners('vite:afterUpdate', update(7, '/src/main.ts'));
		await client.notifyListeners('vite:afterUpdate', update(8, '/src/a.ts', '/src/a.ts'));
		expect(hook.mock.calls.map(([p]) => [p.type, p.version, p.changedIds])).toEqual([
			['delta', 1, ['/src/app/home.component.ts']],
			['delta', 2, ['/src/a.ts']],
		]);
		expect(target.__NS_HMR_ON_UPDATE__).toBe(hook);
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it('serves __NS_DEV_ORIGIN__ and leaves globals the runtime defines alone', () => {
		const { target, warn } = setup({ __NS_HTTP_ORIGIN__: 'http://runtime:5173', __NS_HOT_REGISTRY__: 'existing' });
		expect(target.__NS_DEV_ORIGIN__).toBe('http://192.168.1.2:5173');
		expect(target.__NS_HTTP_ORIGIN__).toBe('http://runtime:5173');
		expect(target.__NS_HOT_REGISTRY__).toBe('existing');
		expect(warn.mock.calls).toEqual([[VITE_HMR_GLOBAL_DEPRECATIONS.__NS_DEV_ORIGIN__]]);
	});

	it('installs once per target', () => {
		const { target, client } = setup();
		const registry = target.__NS_HOT_REGISTRY__;
		defineViteHmrCompatGlobals(target, { hot: new HMRContext(client, '/other'), origin: 'x' });
		expect(target.__NS_HOT_REGISTRY__).toBe(registry);
	});

	it('keeps the client out of the compat entry, so release builds drop it', () => {
		const imports = (file: string) => Array.from(readFileSync(new URL(file, import.meta.url), 'utf8').matchAll(/^import\s+(?!type\b)[^;]*from\s+'([^']+)'/gm), (m) => m[1]);
		expect(imports('../../hmr-compat.ts')).toEqual(['./hmr/client/compat-globals.js']);
		expect(imports('./compat-globals.ts')).toEqual(['../shared/protocol.js']);
	});
});
