import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppRestartRequester, isOncePerProcessViteUrl, needsAppRestartForEdit, nsAppRestartPlugin, updateReachesOncePerProcessModule, type PropagationNode } from './app-restart.js';
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

interface FakeNode extends PropagationNode {
	type: string;
	importers: Set<FakeNode>;
	acceptedHmrDeps: Set<FakeNode>;
}

function node(url: string, opts: { type?: string; selfAccepting?: boolean; importers?: FakeNode[] } = {}): FakeNode {
	return { url, type: opts.type ?? 'js', isSelfAccepting: opts.selfAccepting, importers: new Set(opts.importers), acceptedHmrDeps: new Set() };
}

describe('isOncePerProcessViteUrl', () => {
	const keep = ['/@fs/repo/packages/core/'];
	it.each([
		['/src/app/home.ts?t=1', false],
		['/@fs/repo/libs/shared/x.ts', false],
		['/@id/__x00__virtual:app', false],
		['/node_modules/some-lib/index.js?v=1', false],
		['/@fs/repo/node_modules/lib/x.js', false],
		['/node_modules/@nativescript/core/index.js', true],
		['/@fs/repo/node_modules/@nativescript/vite/hmr/client/index.js', true],
		['/node_modules/some-lib/node_modules/@nativescript/core/index.js', true],
		['/@vite/client', true],
		['/@fs/repo/packages/core/ui/index.ts', true],
		['relative.ts', true],
	])('%s → %s', (url, expected) => {
		expect(isOncePerProcessViteUrl(url, keep)).toBe(expected);
	});
});

describe('updateReachesOncePerProcessModule', () => {
	const once = (url: string) => url.startsWith('/node_modules/.vite/');

	it('stops at a self-accepting module and at an importer that accepts the module', () => {
		const prebundle = node('/node_modules/.vite/deps/x.js');
		const entry = node('/src/app.ts', { selfAccepting: true, importers: [prebundle] });
		const accepting = node('/src/accepting.ts', { importers: [prebundle] });
		const lib = node('/node_modules/lib/index.js', { importers: [entry, accepting] });
		accepting.acceptedHmrDeps.add(lib);
		expect(updateReachesOncePerProcessModule([lib], once)).toBe(false);
	});

	it('finds a once-per-process importer below the boundary, across import cycles', () => {
		const entry = node('/src/app.ts', { selfAccepting: true });
		const prebundle = node('/node_modules/.vite/deps/ui-kit.js', { importers: [entry] });
		const lib = node('/node_modules/lib/index.js', { importers: [entry, prebundle] });
		const cyclic = node('/node_modules/lib/b.js', { importers: [lib] });
		lib.importers.add(cyclic);
		expect(updateReachesOncePerProcessModule([cyclic], once)).toBe(true);
	});
});

describe('needsAppRestartForEdit', () => {
	const root = '/app';
	const keep = ['/node_modules/@nativescript/core/', '/@fs/repo/packages/core/', '/@fs/repo/packages/vite/'];
	const options = { root, keepPrefixes: keep, isOptimizedDepUrl: (url: string) => url.startsWith('/node_modules/.vite/deps/') };
	const entry = () => node('/src/app.ts', { selfAccepting: true });

	it.each([
		['/app/node_modules/@nativescript/core/ui/core/view/index.js', true],
		['/repo/packages/core/ui/core/view/index.ts', true],
		['/repo/packages/vite/hmr/client/index.js', true],
		['/repo/node_modules/some-lib/index.js', false],
		['/app/node_modules/some-lib/index.js', false],
		['/app/src/app/home/home.component.ts', false],
		['/repo/libs/shared/src/util.ts', false],
	])('%s → %s (imported only by the entry boundary)', (file, expected) => {
		expect(needsAppRestartForEdit(file, [node('/any', { importers: [entry()] })], options)).toBe(expected);
	});

	it('ignores files the device did not load as JavaScript', () => {
		expect(needsAppRestartForEdit('/app/node_modules/@nativescript/theme/core.css', [node('/node_modules/@nativescript/theme/core.css', { type: 'css' })], options)).toBe(false);
		expect(needsAppRestartForEdit('/app/node_modules/@nativescript/core/index.js', [], options)).toBe(false);
	});

	it('restarts for a served package whose update climbs into a pre-bundle or core', () => {
		const prebundle = node('/node_modules/.vite/deps/ui-kit.js?v=1', { importers: [entry()] });
		expect(needsAppRestartForEdit('/app/node_modules/plugin/index.ios.js', [node('/node_modules/plugin/index.ios.js?v=1', { importers: [prebundle] })], options)).toBe(true);
		const core = node('/node_modules/@nativescript/core/index.js?v=1');
		expect(needsAppRestartForEdit('/app/node_modules/helper/index.js', [node('/node_modules/helper/index.js?v=1', { importers: [core] })], options)).toBe(true);
	});

	it('leaves an app file to Vite whatever imports it', () => {
		const core = node('/node_modules/@nativescript/core/index.js');
		expect(needsAppRestartForEdit('/app/src/app.ts', [node('/src/app.ts', { importers: [core] })], options)).toBe(false);
	});
});

describe('cliLaunchesAppAfterServerStart', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	it("holds for a CLI-spawned process's first server start only", async () => {
		vi.stubGlobal('process', Object.assign(Object.create(process), { send: vi.fn() }));
		vi.resetModules();
		const mod = await import('./app-restart.js');
		const server = { config: { root: '/app', logger: { warn: vi.fn() } }, ws: { on: vi.fn(), send: vi.fn() } };
		expect(mod.cliLaunchesAppAfterServerStart()).toBe(true);
		(mod.nsAppRestartPlugin() as any).configureServer(server);
		expect(mod.cliLaunchesAppAfterServerStart()).toBe(true);
		(mod.nsAppRestartPlugin() as any).configureServer(server);
		expect(mod.cliLaunchesAppAfterServerStart()).toBe(false);
	});

	it("drops the restarted server's first-connection restart once any app restart request goes out", async () => {
		vi.useFakeTimers();
		const send = vi.fn();
		vi.stubGlobal('process', Object.assign(Object.create(process), { send }));
		vi.resetModules();
		const mod = await import('./app-restart.js');
		const listeners = new Map<string, () => void>();
		const server = () => ({ config: { root: '/app', logger: { warn: vi.fn() } }, ws: { on: (event: string, fn: () => void) => listeners.set(event, fn), send: vi.fn() } });
		(mod.nsAppRestartPlugin() as any).configureServer(server());
		(mod.nsAppRestartPlugin() as any).configureServer(server());
		mod.requestAppRestart('the dev server is reachable again');
		listeners.get('vite:client:connect')!();
		vi.runAllTimers();
		vi.useRealTimers();
		expect(send.mock.calls).toEqual([[{ type: 'nativescript:restart', reason: 'the dev server is reachable again' }]]);
	});

	it('still tells the first device connection when no CLI restarts the app', async () => {
		vi.useFakeTimers();
		vi.stubGlobal('process', Object.assign(Object.create(process), { send: undefined }));
		vi.resetModules();
		const mod = await import('./app-restart.js');
		const listeners = new Map<string, () => void>();
		const warn = vi.fn();
		const server = () => ({ config: { root: '/app', logger: { warn } }, ws: { on: (event: string, fn: () => void) => listeners.set(event, fn), send: vi.fn() } });
		(mod.nsAppRestartPlugin() as any).configureServer(server());
		(mod.nsAppRestartPlugin() as any).configureServer(server());
		mod.requestAppRestart('the dev server is reachable again');
		vi.runAllTimers();
		listeners.get('vite:client:connect')!();
		vi.runAllTimers();
		vi.useRealTimers();
		expect(warn.mock.calls.map((c) => c[0])).toEqual(['[NativeScript] restart the app to apply: the dev server is reachable again', '[NativeScript] restart the app to apply: the Vite dev server restarted']);
	});

	it('never holds without an IPC channel to the CLI', async () => {
		vi.stubGlobal('process', Object.assign(Object.create(process), { send: undefined }));
		vi.resetModules();
		const mod = await import('./app-restart.js');
		expect(mod.cliLaunchesAppAfterServerStart()).toBe(false);
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

	it('leaves the app restart to whoever restarted the server for one', () => {
		const request = vi.fn();
		const state: { serverStarts: number; nextStartRequestsRestart?: boolean } = { serverStarts: 0 };
		(nsAppRestartPlugin({ request, state }) as any).configureServer(fakeServer().server);
		state.nextStartRequestsRestart = true;
		const owned = fakeServer();
		(nsAppRestartPlugin({ request, state }) as any).configureServer(owned.server);
		owned.emit('vite:client:connect');
		expect(request).not.toHaveBeenCalled();

		const next = fakeServer();
		(nsAppRestartPlugin({ request, state }) as any).configureServer(next.server);
		next.emit('vite:client:connect');
		expect(request.mock.calls).toEqual([['the Vite dev server restarted']]);
	});

	it('swallows an edit to non-evictable code and requests a restart', async () => {
		const request = vi.fn();
		const fake = fakeServer();
		const plugin: any = nsAppRestartPlugin({ request, state: { serverStarts: 0 } });
		const entry = node('/src/app.ts', { selfAccepting: true });
		const run = (file: string, type = 'update') => plugin.hotUpdate.handler.call({ environment: { name: 'client' } }, { type, file, modules: [node(file.replace('/app', ''), { importers: [entry] })], server: fake.server });

		expect(await run('/app/node_modules/@nativescript/core/ui/core/view/index.js')).toEqual([]);
		expect(request).toHaveBeenCalledWith('node_modules/@nativescript/core/ui/core/view/index.js changed');
		expect(await run('/app/node_modules/@nativescript/core/index.js', 'create')).toEqual([]);
		expect(await run('/app/node_modules/@nativescript/core/index.js', 'delete')).toBeUndefined();
		request.mockClear();
		expect(await run('/app/src/app/app.component.ts')).toBeUndefined();
		expect(await run('/app/node_modules/plugin/index.ios.js')).toBeUndefined();
		expect(request).not.toHaveBeenCalled();
	});
});
