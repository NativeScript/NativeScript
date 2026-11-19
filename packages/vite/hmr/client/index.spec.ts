import { describe, expect, it, vi } from 'vitest';
import type { Update } from 'vite';
import { HMRClient, HMRContext } from './hmr-client.js';
import { createNsHmrRuntime, type DeviceHotPayload } from './index.js';
import { NS_CSS_UPDATES_EVENT, NS_RESTART_EVENT, NS_RESTART_REQUIRED_EVENT } from '../shared/protocol.js';

const ORIGIN = 'http://192.168.1.5:5173';
const ENTRY = `${ORIGIN}/ns/v/src/main.ts`;
const WS_URL = 'ws://192.168.1.5:5173/vite-hmr?token=tok-1';

type Listener = { fn: (event: any) => void; once: boolean };

class FakeSocket {
	readonly OPEN = 1;
	readyState = 0;
	sent: string[] = [];
	private listeners = new Map<string, Listener[]>();

	constructor(
		readonly url: string,
		readonly protocol: string,
	) {}

	addEventListener(type: string, fn: (event: any) => void, options?: { once?: boolean }) {
		const list = this.listeners.get(type) ?? [];
		list.push({ fn, once: !!options?.once });
		this.listeners.set(type, list);
	}

	removeEventListener(type: string, fn: (event: any) => void) {
		this.listeners.set(
			type,
			(this.listeners.get(type) ?? []).filter((l) => l.fn !== fn),
		);
	}

	send(data: string) {
		this.sent.push(data);
	}

	close() {
		if (this.readyState === 3) return;
		this.readyState = 3;
		this.emit('close', {});
	}

	open() {
		this.readyState = 1;
		this.emit('open', {});
	}

	fail() {
		this.emit('error', {});
		this.close();
	}

	message(payload: unknown) {
		this.emit('message', { data: JSON.stringify(payload) });
	}

	private emit(type: string, event: unknown) {
		for (const listener of [...(this.listeners.get(type) ?? [])]) {
			if (listener.once) this.removeEventListener(type, listener.fn);
			listener.fn(event);
		}
	}
}

interface SetupOptions {
	loaded?: string[];
	modules?: Record<string, unknown>;
	importModule?: (url: string) => Promise<any>;
	/** Results of successive `vite-ping` attempts; missing entries succeed. */
	pings?: boolean[];
}

function setup(options: SetupOptions = {}) {
	const logger = { error: vi.fn(), debug: vi.fn() };
	const client = new HMRClient(logger);
	const sockets: FakeSocket[] = [];
	const pings = [...(options.pings ?? [])];
	const createSocket = (url: string, protocol: string) => {
		const socket = new FakeSocket(url, protocol);
		sockets.push(socket);
		if (protocol === 'vite-ping') {
			const ok = pings.length ? pings.shift() : true;
			queueMicrotask(() => (ok ? socket.open() : socket.fail()));
		}
		return socket;
	};
	const imports: string[] = [];
	const importModule = vi.fn(
		options.importModule ??
			(async (url: string) => {
				imports.push(url);
				return options.modules?.[url] ?? {};
			}),
	);
	const loaded = options.loaded ?? [ENTRY];
	const devHost = { getLoadedModuleUrls: vi.fn(() => loaded), invalidateModules: vi.fn() };
	const overlay = { setUpdateStage: vi.fn(), setConnectionStage: vi.fn(), hide: vi.fn() };
	const applyCssUpdates = vi.fn(async () => {});
	const sweepWorkers = vi.fn();
	const runtime = createNsHmrRuntime(
		{ wsUrl: WS_URL, wsProtocol: 'vite-hmr', entryUrl: ENTRY, origin: ORIGIN, keepUrlPrefixes: [`${ORIGIN}/ns/v/@fs/repo/packages/core/`] },
		{
			client,
			createSocket,
			importModule,
			devHost,
			overlay,
			applyCssUpdates,
			sweepWorkers,
			clientPackageUrl: `${ORIGIN}/ns/v/@fs/repo/packages/vite/`,
			reloadDebounceMs: 5,
			pingRetryMs: 1,
		},
	);
	const hmrSockets = () => sockets.filter((s) => s.protocol === 'vite-hmr');
	const connect = async () => {
		const connecting = runtime.connect();
		hmrSockets().at(-1)!.open();
		await connecting;
		return hmrSockets().at(-1)!;
	};
	const stages = () => overlay.setUpdateStage.mock.calls.map(([stage]) => stage);
	return { runtime, client, logger, sockets, hmrSockets, connect, imports, importModule, devHost, overlay, applyCssUpdates, sweepWorkers, stages };
}

function restartsSent(socket: FakeSocket): unknown[] {
	return socket.sent.map((s) => JSON.parse(s)).filter((m) => m.type === 'custom' && m.event === NS_RESTART_EVENT);
}

const send = (runtime: { onMessage(p: DeviceHotPayload): Promise<unknown> }, payload: DeviceHotPayload) => runtime.onMessage(payload);

function update(...updates: Update[]): DeviceHotPayload {
	return { type: 'update', updates };
}

function jsUpdate(path: string, acceptedPath = path, extra: Partial<Update> = {}): Update {
	return { type: 'js-update', path, acceptedPath, timestamp: 123, ...extra };
}

describe('js-update import URL', () => {
	it.each([
		['plain', jsUpdate('/src/a.ts'), `${ORIGIN}/ns/v/src/a.ts?t=123`],
		['explicitImportRequired', jsUpdate('/src/a.ts', '/src/a.ts', { explicitImportRequired: true }), `${ORIGIN}/ns/v/src/a.ts?import&t=123`],
		['existing query', jsUpdate('/src/a.vue?vue&type=style&index=0&lang.css'), `${ORIGIN}/ns/v/src/a.vue?t=123&vue&type=style&index=0&lang.css`],
	])('%s', async (_name, entry, url) => {
		const t = setup();
		new HMRContext(t.client, entry.path).accept();
		await send(t.runtime, update(entry));
		expect(t.imports).toEqual([url]);
	});

	it('a failed import inside a circular import triggers a full reload', async () => {
		const t = setup({
			importModule: async (url) => {
				t.imports.push(url);
				if (url.includes('/src/a.ts?')) throw new Error('TDZ');
				return {};
			},
		});
		new HMRContext(t.client, '/src/a.ts').accept();
		await send(t.runtime, update(jsUpdate('/src/a.ts', '/src/a.ts', { isWithinCircularImport: true })));
		await vi.waitFor(() => expect(t.imports).toContain(ENTRY));
	});
});

describe('update', () => {
	it('awaits vite:beforeUpdate, applies js-updates, then vite:afterUpdate, driving the overlay', async () => {
		const t = setup();
		const order: string[] = [];
		const listenerHost = new HMRContext(t.client, '/node_modules/@nativescript/angular/renderer.mjs');
		listenerHost.on('vite:beforeUpdate', async () => {
			await new Promise((r) => setTimeout(r, 5));
			order.push('before');
		});
		listenerHost.on('vite:afterUpdate', () => order.push('after'));
		new HMRContext(t.client, '/src/a.ts').accept(() => order.push('accept'));

		await send(t.runtime, update(jsUpdate('/src/a.ts'), { type: 'css-update', path: '/src/b.css', acceptedPath: '/src/b.css', timestamp: 1 }));

		expect(order).toEqual(['before', 'accept', 'after']);
		expect(t.imports).toEqual([`${ORIGIN}/ns/v/src/a.ts?t=123`]);
		expect(t.stages()).toEqual(['received', 'reimporting', 'complete']);
	});

	it('an accept callback that throws ends the overlay cycle as failed', async () => {
		const t = setup();
		new HMRContext(t.client, '/src/a.ts').accept(() => {
			throw new Error('bad accept');
		});
		await send(t.runtime, update(jsUpdate('/src/a.ts')));
		expect(t.stages()).toEqual(['received', 'reimporting', 'failed']);
	});
});

describe('full-reload', () => {
	const loaded = [ENTRY, `${ORIGIN}/ns/v/src/a.ts?t=5`, `${ORIGIN}/ns/v/@id/__x00__virtual:app-config`, `${ORIGIN}/ns/v/node_modules/@nativescript/core/index.js`, `${ORIGIN}/ns/v/node_modules/@nativescript/angular/fesm2022/nativescript-angular.mjs`, `${ORIGIN}/ns/v/@vite/client`, `${ORIGIN}/ns/v/@fs/repo/packages/vite/hmr/client/index.js`, `${ORIGIN}/ns/v/@fs/repo/packages/core/ui/core/view/index.js`, `${ORIGIN}/__ns_dev__/client`, 'http://10.0.2.2:5173/ns/v/src/a.ts'];

	it('awaits vite:beforeFullReload, disposes, evicts app-owned modules only and re-imports the entry', async () => {
		const t = setup({ loaded });
		const order: string[] = [];
		new HMRContext(t.client, '/node_modules/@nativescript/angular/index.mjs').on('vite:beforeFullReload', async () => {
			await new Promise((r) => setTimeout(r, 5));
			order.push('beforeFullReload');
		});
		new HMRContext(t.client, '/src/a.ts').dispose(() => order.push('dispose a'));
		new HMRContext(t.client, '/node_modules/lib/index.js').dispose(() => order.push('dispose lib'));
		t.devHost.invalidateModules.mockImplementation(() => order.push('evict'));
		t.importModule.mockImplementation(async (url: string) => {
			order.push(`import ${url}`);
			return {};
		});

		await send(t.runtime, { type: 'full-reload', path: '*' });
		await vi.waitFor(() => expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('complete', expect.anything()));

		expect(order).toEqual(['beforeFullReload', 'dispose a', 'evict', `import ${ENTRY}`]);
		expect(t.devHost.invalidateModules).toHaveBeenCalledWith([ENTRY, `${ORIGIN}/ns/v/src/a.ts?t=5`, `${ORIGIN}/ns/v/@id/__x00__virtual:app-config`]);
		expect(t.sweepWorkers).toHaveBeenCalledTimes(1);
		expect(t.stages()).toEqual(['received', 'rebooting', 'complete']);
	});

	it('debounces a burst into one reload', async () => {
		const t = setup();
		await send(t.runtime, { type: 'full-reload' });
		await send(t.runtime, { type: 'full-reload', path: '*' });
		await vi.waitFor(() => expect(t.imports).toEqual([ENTRY]));
		await new Promise((r) => setTimeout(r, 20));
		expect(t.imports).toEqual([ENTRY]);
	});

	it('skips .html targets and fallback-page reloads', async () => {
		const t = setup();
		await send(t.runtime, { type: 'full-reload', path: '/index.html' });
		await send(t.runtime, { type: 'full-reload', ifFallback: true } as DeviceHotPayload);
		await new Promise((r) => setTimeout(r, 20));
		expect(t.imports).toEqual([]);
	});

	it('a failed entry re-import ends the overlay cycle as failed', async () => {
		const t = setup({
			importModule: async () => {
				throw new Error('entry threw');
			},
		});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		await send(t.runtime, { type: 'full-reload' });
		await vi.waitFor(() => expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('failed', { detail: 'entry threw' }));
	});

	it('after a failed reload, the next update reloads again instead of applying', async () => {
		let fail = true;
		const t = setup({
			importModule: async (url: string) => {
				if (fail) throw new Error('entry threw');
				return {};
			},
		});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		await send(t.runtime, { type: 'full-reload' });
		await vi.waitFor(() => expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('failed', { detail: 'entry threw' }));

		fail = false;
		const accept = vi.fn();
		new HMRContext(t.client, '/src/a.ts').accept(accept);
		await send(t.runtime, update(jsUpdate('/src/a.ts')));
		await vi.waitFor(() => expect(t.importModule).toHaveBeenLastCalledWith(ENTRY));
		await vi.waitFor(() => expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('complete', expect.anything()));
		expect(accept).not.toHaveBeenCalled();

		// The re-evaluated module registers its accept again.
		new HMRContext(t.client, '/src/a.ts').accept(accept);
		await send(t.runtime, update(jsUpdate('/src/a.ts')));
		expect(t.importModule).toHaveBeenLastCalledWith(`${ORIGIN}/ns/v/src/a.ts?t=123`);
		expect(accept).toHaveBeenCalledTimes(1);
	});

	describe('hot contexts of evicted modules', () => {
		it('(a) data written in dispose is readable by the re-evaluated module', async () => {
			const t = setup();
			let seen: unknown;
			t.importModule.mockImplementation(async () => {
				seen = new HMRContext(t.client, '/src/main.ts').data.count;
				return {};
			});
			const before = new HMRContext(t.client, '/src/main.ts');
			before.dispose((data) => {
				data.count = 41;
			});

			await send(t.runtime, { type: 'full-reload' });
			await vi.waitFor(() => expect(t.importModule).toHaveBeenCalled());

			expect(seen).toBe(41);
		});

		it('(b) listeners and accept callbacks of the evicted instance do not fire; node_modules listeners do', async () => {
			const t = setup();
			const evictedListener = vi.fn();
			const evictedAccept = vi.fn();
			const evicted = new HMRContext(t.client, '/src/a.ts');
			evicted.on('custom:event', evictedListener);
			evicted.accept(evictedAccept);
			const libListener = vi.fn();
			new HMRContext(t.client, '/node_modules/lib/index.js').on('custom:event', libListener);

			await send(t.runtime, { type: 'full-reload' });
			await vi.waitFor(() => expect(t.importModule).toHaveBeenCalledWith(ENTRY));
			await send(t.runtime, { type: 'custom', event: 'custom:event', data: 1 });
			await send(t.runtime, update(jsUpdate('/src/a.ts')));

			expect(evictedListener).not.toHaveBeenCalled();
			expect(evictedAccept).not.toHaveBeenCalled();
			expect(libListener).toHaveBeenCalledWith(1);
		});

		it('(c) prune deletes the data a full reload kept', async () => {
			const t = setup();
			const hot = new HMRContext(t.client, '/src/a.ts');
			hot.dispose((data) => {
				data.kept = true;
			});
			await send(t.runtime, { type: 'full-reload' });
			await vi.waitFor(() => expect(t.importModule).toHaveBeenCalled());
			expect(t.client.dataMap.get('/src/a.ts')).toEqual({ kept: true });

			await send(t.runtime, { type: 'prune', paths: ['/src/a.ts'] });

			expect(t.client.dataMap.has('/src/a.ts')).toBe(false);
			expect(new HMRContext(t.client, '/src/a.ts').data).toEqual({});
		});
	});
});

describe('prune', () => {
	it('awaits vite:beforePrune, then runs dispose and prune with data', async () => {
		const t = setup();
		const order: string[] = [];
		new HMRContext(t.client, '/node_modules/lib/x.js').on('vite:beforePrune', () => order.push('beforePrune'));
		const hot = new HMRContext(t.client, '/src/gone.ts');
		hot.dispose(() => order.push('dispose'));
		hot.prune(() => order.push('prune'));
		await send(t.runtime, { type: 'prune', paths: ['/src/gone.ts'] });
		expect(order).toEqual(['beforePrune', 'dispose', 'prune']);
	});
});

describe('error', () => {
	it('notifies vite:error and shows the failure on the overlay', async () => {
		const t = setup();
		const listener = vi.fn();
		new HMRContext(t.client, '/node_modules/lib/x.js').on('vite:error', listener);
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const payload: DeviceHotPayload = { type: 'error', err: { message: 'Transform failed', stack: 'at x' } };
		await send(t.runtime, payload);
		expect(listener).toHaveBeenCalledWith(payload);
		expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('failed', { detail: 'Transform failed' });
	});
});

describe(NS_CSS_UPDATES_EVENT, () => {
	const item = { type: 'css-update' as const, path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: 7, css: '.a { color: red; }' };

	it('applies the stylesheets the event carries and drives the overlay', async () => {
		const t = setup();
		await send(t.runtime, { type: 'custom', event: NS_CSS_UPDATES_EVENT, data: { updates: [item] } });
		expect(t.applyCssUpdates).toHaveBeenCalledWith([item]);
		expect(t.stages()).toEqual(['received', 'complete']);
	});

	it('applies connect-sync without the overlay', async () => {
		const t = setup();
		await send(t.runtime, { type: 'custom', event: NS_CSS_UPDATES_EVENT, data: { updates: [item], reason: 'connect-sync' } });
		expect(t.applyCssUpdates).toHaveBeenCalledWith([item]);
		expect(t.overlay.setUpdateStage).not.toHaveBeenCalled();
	});
});

describe('transport', () => {
	it('opens Vite’s HMR socket with the vite-hmr subprotocol and emits vite:ws:connect', async () => {
		const t = setup();
		const connected = vi.fn();
		new HMRContext(t.client, '/node_modules/lib/x.js').on('vite:ws:connect', connected);
		const socket = await t.connect();
		expect(socket.url).toBe(WS_URL);
		expect(socket.protocol).toBe('vite-hmr');
		await vi.waitFor(() => expect(connected).toHaveBeenCalledWith({ webSocket: socket }));
	});

	it('hot.send and hot.invalidate go over the socket as Vite custom payloads', async () => {
		const t = setup();
		const socket = await t.connect();
		const hot = new HMRContext(t.client, '/src/a.ts');
		hot.send('my:event', { n: 1 });
		hot.invalidate('reason');
		await vi.waitFor(() => expect(socket.sent).toHaveLength(2));
		expect(socket.sent.map((s) => JSON.parse(s))).toEqual([
			{ type: 'custom', event: 'my:event', data: { n: 1 } },
			{ type: 'custom', event: 'vite:invalidate', data: { path: '/src/a.ts', message: 'reason', firstInvalidatedBy: '/src/a.ts' } },
		]);
	});

	it('routes socket messages through the queue', async () => {
		const t = setup();
		const socket = await t.connect();
		const listener = vi.fn();
		new HMRContext(t.client, '/node_modules/lib/x.js').on('server:hello', listener);
		socket.message({ type: 'custom', event: 'server:hello', data: 'hi' });
		await vi.waitFor(() => expect(listener).toHaveBeenCalledWith('hi'));
	});

	it('on disconnect: notifies, pings the token-less URL until the server answers, then reconnects with the same URL without reloading', async () => {
		const t = setup({ pings: [false, true] });
		vi.spyOn(console, 'log').mockImplementation(() => {});
		const disconnected = vi.fn();
		new HMRContext(t.client, '/node_modules/lib/x.js').on('vite:ws:disconnect', disconnected);
		const first = await t.connect();

		first.close();

		await vi.waitFor(() => expect(t.hmrSockets()).toHaveLength(2));
		const pings = t.sockets.filter((s) => s.protocol === 'vite-ping');
		expect(disconnected).toHaveBeenCalledWith({ webSocket: first });
		expect(pings.map((s) => s.url)).toEqual(['ws://192.168.1.5:5173/vite-hmr', 'ws://192.168.1.5:5173/vite-hmr']);
		expect(t.hmrSockets()[1].url).toBe(WS_URL);
		expect(t.imports).toEqual([]);
		expect(t.devHost.invalidateModules).not.toHaveBeenCalled();
		expect(t.overlay.setConnectionStage).toHaveBeenCalledWith('reconnecting', expect.anything());

		const second = t.hmrSockets()[1];
		second.open();
		second.message({ type: 'connected' });
		await vi.waitFor(() => expect(t.overlay.hide).toHaveBeenCalledWith('healthy'));
	});

	it('retries the first connection after a failed one, without reloading', async () => {
		const t = setup();
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const connecting = t.runtime.connect();
		t.hmrSockets()[0].fail();
		await vi.waitFor(() => expect(t.hmrSockets()).toHaveLength(2));
		t.hmrSockets()[1].open();
		await connecting;
		expect(t.overlay.setConnectionStage).toHaveBeenCalledWith('offline', expect.anything());
		expect(t.imports).toEqual([]);
	});
});

describe('app restart', () => {
	const APP_MODULE = `${ORIGIN}/ns/v/src/a.ts`;

	function quiet() {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	}

	it('a full-reload with a declined app module asks the server for a restart instead of reloading', async () => {
		const t = setup({ loaded: [ENTRY, APP_MODULE] });
		quiet();
		const socket = await t.connect();
		const hot = new HMRContext(t.client, '/src/a.ts');
		const dispose = vi.fn();
		hot.dispose(dispose);
		hot.decline();

		await send(t.runtime, { type: 'full-reload', path: '*' });
		await vi.waitFor(() => expect(restartsSent(socket)).toHaveLength(1));
		await send(t.runtime, { type: 'full-reload', path: '*' });
		await new Promise((r) => setTimeout(r, 20));

		expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'hot.decline() in /src/a.ts' } }]);
		expect(dispose).not.toHaveBeenCalled();
		expect(t.devHost.invalidateModules).not.toHaveBeenCalled();
		expect(t.importModule).not.toHaveBeenCalled();
		expect(t.overlay.setUpdateStage.mock.calls).toEqual([['restart-required', { detail: 'hot.decline() in /src/a.ts' }]]);
	});

	it('a declined module outside the app (node_modules, kept packages) does not prevent a soft reload', async () => {
		const t = setup();
		const socket = await t.connect();
		new HMRContext(t.client, '/node_modules/lib/index.js').decline();
		new HMRContext(t.client, '/@fs/repo/packages/core/ui/core/view/index.js').decline();

		await send(t.runtime, { type: 'full-reload' });
		await vi.waitFor(() => expect(t.imports).toEqual([ENTRY]));

		expect(restartsSent(socket)).toEqual([]);
	});

	it.each([
		['boundary', '/src/parent.ts'],
		['accepted module', '/src/child.ts'],
	])('a js-update whose %s declined restarts without applying the update', async (_name, declinedPath) => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		const accept = vi.fn();
		const parent = new HMRContext(t.client, '/src/parent.ts');
		parent.accept('/src/child.ts', accept);
		const child = new HMRContext(t.client, '/src/child.ts');
		(declinedPath === '/src/parent.ts' ? parent : child).decline();

		await send(t.runtime, update(jsUpdate('/src/parent.ts', '/src/child.ts')));
		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: `hot.decline() in ${declinedPath}` } }]));

		expect(accept).not.toHaveBeenCalled();
		expect(t.importModule).not.toHaveBeenCalled();
	});

	it.each([
		[
			'a vite:beforeFullReload listener rejects',
			(t: ReturnType<typeof setup>) =>
				new HMRContext(t.client, '/node_modules/@nativescript/angular/index.mjs').on('vite:beforeFullReload', async () => {
					throw new Error('teardown failed');
				}),
			'vite:beforeFullReload listener failed: teardown failed',
		],
		[
			'a vite:beforeFullReload listener throws synchronously',
			(t: ReturnType<typeof setup>) =>
				new HMRContext(t.client, '/node_modules/@nativescript/angular/index.mjs').on('vite:beforeFullReload', () => {
					throw new Error('teardown failed');
				}),
			'vite:beforeFullReload listener failed: teardown failed',
		],
		[
			'a dispose callback throws',
			(t: ReturnType<typeof setup>) =>
				new HMRContext(t.client, '/src/a.ts').dispose(() => {
					throw new Error('dispose failed');
				}),
			'dispose of /src/a.ts failed: dispose failed',
		],
	])('a soft reload where %s requests a restart and evicts nothing', async (_name, arrange, reason) => {
		const t = setup({ loaded: [ENTRY, APP_MODULE] });
		quiet();
		const socket = await t.connect();
		arrange(t);

		await send(t.runtime, { type: 'full-reload' });
		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason } }]));

		expect(t.sweepWorkers).not.toHaveBeenCalled();
		expect(t.devHost.invalidateModules).not.toHaveBeenCalled();
		expect(t.importModule).not.toHaveBeenCalled();
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('restart-required', { detail: reason });
	});

	it('an entry re-import that throws stays the recoverable failed path', async () => {
		const t = setup({
			importModule: async () => {
				throw new Error('SyntaxError');
			},
		});
		quiet();
		const socket = await t.connect();

		await send(t.runtime, { type: 'full-reload' });
		await vi.waitFor(() => expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('failed', { detail: 'SyntaxError' }));

		expect(restartsSent(socket)).toEqual([]);
	});

	it(`${NS_RESTART_REQUIRED_EVENT} from the server shows the overlay and stops applying changes`, async () => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		const accept = vi.fn();
		new HMRContext(t.client, '/src/a.ts').accept(accept);
		const listener = vi.fn();
		new HMRContext(t.client, '/node_modules/lib/x.js').on('server:hello', listener);

		await send(t.runtime, { type: 'custom', event: NS_RESTART_REQUIRED_EVENT, data: { reason: 'no CLI attached' } });
		await send(t.runtime, update(jsUpdate('/src/a.ts')));
		await send(t.runtime, { type: 'full-reload' });
		await send(t.runtime, { type: 'prune', paths: ['/src/a.ts'] });
		await send(t.runtime, { type: 'custom', event: NS_CSS_UPDATES_EVENT, data: { updates: [{ type: 'css-update', path: '/app.css', acceptedPath: '/app.css', timestamp: 1, css: '' }] } });
		await send(t.runtime, { type: 'custom', event: 'server:hello', data: 'hi' });
		await new Promise((r) => setTimeout(r, 20));

		expect(t.overlay.setUpdateStage.mock.calls).toEqual([['restart-required', { detail: 'no CLI attached' }]]);
		expect(accept).not.toHaveBeenCalled();
		expect(t.importModule).not.toHaveBeenCalled();
		expect(t.applyCssUpdates).not.toHaveBeenCalled();
		expect(t.client.hotModulesMap.has('/src/a.ts')).toBe(true);
		expect(listener).toHaveBeenCalledWith('hi');
		expect(restartsSent(socket)).toEqual([]);
	});

	it('a debounced full-reload that fires after the restart is required does not reload', async () => {
		const t = setup();
		quiet();
		await t.connect();

		await send(t.runtime, { type: 'full-reload' });
		await send(t.runtime, { type: 'custom', event: NS_RESTART_REQUIRED_EVENT, data: { reason: 'no CLI attached' } });
		await new Promise((r) => setTimeout(r, 20));

		expect(t.importModule).not.toHaveBeenCalled();
	});

	it(`the server's ${NS_RESTART_REQUIRED_EVENT} reply to a device request does not send it again`, async () => {
		const t = setup();
		quiet();
		const socket = await t.connect();

		t.runtime.requestRestart('hot.decline() in /src/a.ts');
		await send(t.runtime, { type: 'custom', event: NS_RESTART_REQUIRED_EVENT, data: { reason: 'restart the app manually' } });
		t.runtime.requestRestart('dispose of /src/b.ts failed');

		expect(restartsSent(socket)).toHaveLength(1);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('restart-required', { detail: 'restart the app manually' });
	});

	it('a restart requested while the socket is down is sent once it reconnects', async () => {
		const t = setup();
		quiet();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		const first = await t.connect();

		first.close();
		t.runtime.requestRestart('hot.decline() in /src/a.ts');
		await vi.waitFor(() => expect(t.hmrSockets()).toHaveLength(2));
		const second = t.hmrSockets()[1];
		second.open();

		await vi.waitFor(() => expect(restartsSent(second)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'hot.decline() in /src/a.ts' } }]));
		expect(restartsSent(first)).toEqual([]);
		expect(t.importModule).not.toHaveBeenCalled();
	});
});
