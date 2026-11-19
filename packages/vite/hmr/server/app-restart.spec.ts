import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppRestartRequester, isAppOwnedViteUrl, needsAppRestartForEdit, nsAppRestartPlugin } from './app-restart.js';
import { NS_RESTART_EVENT } from '../shared/protocol.js';

describe('createAppRestartRequester', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('sends one IPC message to the CLI for a burst of requests, and tells the devices', () => {
		const send = vi.fn();
		const notifyDevices = vi.fn();
		const log = vi.fn();
		const requester = createAppRestartRequester({ send, notifyDevices, log, debounceMs: 50 });
		requester.request('a.js changed');
		requester.request('a.js changed');
		requester.request('b.js changed');
		vi.advanceTimersByTime(49);
		expect(send).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(send).toHaveBeenCalledTimes(1);
		expect(send).toHaveBeenCalledWith({ type: 'nativescript:restart', reason: 'a.js changed; b.js changed' });
		expect(notifyDevices).toHaveBeenCalledWith({ reason: 'a.js changed; b.js changed' });
		expect(log).not.toHaveBeenCalled();
	});

	it('without IPC, logs a one-line instruction and tells the devices', () => {
		const notifyDevices = vi.fn();
		const log = vi.fn();
		const requester = createAppRestartRequester({ send: undefined, notifyDevices, log, debounceMs: 10 });
		requester.request('the Vite dev server restarted');
		vi.advanceTimersByTime(10);
		expect(log).toHaveBeenCalledWith('[NativeScript] restart the app to apply: the Vite dev server restarted');
		expect(notifyDevices).toHaveBeenCalledWith({ reason: 'the Vite dev server restarted' });
	});

	it('a later request after a flush restarts again', () => {
		const send = vi.fn();
		const requester = createAppRestartRequester({ send, notifyDevices: vi.fn(), log: vi.fn(), debounceMs: 10 });
		requester.request('x');
		vi.advanceTimersByTime(10);
		requester.request('x');
		vi.advanceTimersByTime(10);
		expect(send).toHaveBeenCalledTimes(2);
	});
});

describe('isAppOwnedViteUrl', () => {
	const keep = ['/@fs/repo/packages/core/'];
	it.each([
		['/src/app/home.ts?t=1', true],
		['/@fs/repo/libs/shared/x.ts', true],
		['/@id/__x00__virtual:app', true],
		['/node_modules/@nativescript/core/index.js', false],
		['/@fs/repo/node_modules/lib/x.js', false],
		['/@vite/client', false],
		['/@fs/repo/packages/core/ui/index.ts', false],
		['relative.ts', false],
	])('%s → %s', (url, expected) => {
		expect(isAppOwnedViteUrl(url, keep)).toBe(expected);
	});
});

describe('needsAppRestartForEdit', () => {
	const root = '/app';
	const keep = ['/@fs/repo/packages/core/', '/@fs/repo/packages/vite/'];
	const js = [{ type: 'js' as const }];

	it.each([
		['/app/node_modules/@nativescript/core/ui/core/view/index.js', js, true],
		['/repo/node_modules/some-lib/index.js', js, true],
		['/repo/packages/core/ui/core/view/index.ts', js, true],
		['/repo/packages/vite/hmr/client/index.js', js, true],
		['/app/src/app/home/home.component.ts', js, false],
		['/repo/libs/shared/src/util.ts', js, false],
		['/app/node_modules/@nativescript/theme/core.css', [{ type: 'css' as const }], false],
		['/app/node_modules/unloaded/index.js', [], false],
	])('%s → %s', (file, modules, expected) => {
		expect(needsAppRestartForEdit(file, modules, root, keep)).toBe(expected);
	});
});

describe('nsAppRestartPlugin', () => {
	function fakeServer() {
		const listeners = new Map<string, ((...args: any[]) => void)[]>();
		return {
			listeners,
			emit: (event: string, ...args: any[]) => listeners.get(event)?.forEach((fn) => fn(...args)),
			server: {
				config: { root: '/app', logger: { warn: vi.fn() } },
				ws: {
					on: (event: string, fn: (...args: any[]) => void) => listeners.set(event, [...(listeners.get(event) ?? []), fn]),
					send: vi.fn(),
				},
				environments: { client: { pluginContainer: { resolveId: async () => ({ id: '/app/node_modules/@nativescript/core/index.js' }) } } },
			},
		};
	}

	it('turns a device ns:restart into a restart request', () => {
		const request = vi.fn();
		const fake = fakeServer();
		(nsAppRestartPlugin({ request, state: { serverStarts: 0 } }) as any).configureServer(fake.server);
		fake.emit(NS_RESTART_EVENT, { reason: 'hot.decline() in /src/a.ts' });
		fake.emit(NS_RESTART_EVENT, undefined);
		expect(request.mock.calls).toEqual([['hot.decline() in /src/a.ts'], ['the device requested a restart']]);
	});

	it('after Vite restarted itself, requests one restart on the first device connection', () => {
		const request = vi.fn();
		const state = { serverStarts: 0 };
		const first = fakeServer();
		(nsAppRestartPlugin({ request, state }) as any).configureServer(first.server);
		first.emit('vite:client:connect');
		expect(request).not.toHaveBeenCalled();

		const restarted = fakeServer();
		(nsAppRestartPlugin({ request, state }) as any).configureServer(restarted.server);
		restarted.emit('vite:client:connect');
		restarted.emit('vite:client:connect');
		expect(request.mock.calls).toEqual([['the Vite dev server restarted']]);
	});

	it('swallows an edit to non-evictable code and requests a restart', async () => {
		const request = vi.fn();
		const fake = fakeServer();
		const plugin: any = nsAppRestartPlugin({ request, state: { serverStarts: 0 } });
		const run = (file: string) => plugin.hotUpdate.handler.call({ environment: { name: 'client' } }, { type: 'update', file, modules: [{ type: 'js' }], server: fake.server });

		expect(await run('/app/node_modules/@nativescript/core/ui/core/view/index.js')).toEqual([]);
		expect(request).toHaveBeenCalledWith('node_modules/@nativescript/core/ui/core/view/index.js changed');
		expect(await run('/app/src/app/app.component.ts')).toBeUndefined();
		expect(request).toHaveBeenCalledTimes(1);
	});
});
