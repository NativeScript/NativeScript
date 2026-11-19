import { describe, expect, it, vi } from 'vitest';
import type { Update } from 'vite';
import { HMRClient, HMRContext } from './hmr-client.js';
import { registerEntryBoundary } from './hot-state.js';
import { createNsHmrRuntime, type DeviceHotPayload } from './index.js';
import { NS_AFTER_REBOOT_EVENT, NS_BEFORE_REBOOT_EVENT, NS_BEFORE_RERUN_EVENT, NS_BEFORE_RESTART_EVENT, NS_CSS_UPDATES_EVENT, NS_RESTART_EVENT, NS_RESTART_REQUIRED_EVENT, NS_UPDATE_RERUN_EVENT, type BeforeRerunEventData, type RebootEventData, type UpdateRerunEventData } from '../shared/protocol.js';

const ORIGIN = 'http://192.168.1.5:5173';
const ENTRY_PATH = '/src/main.ts';
const ENTRY = `${ORIGIN}${ENTRY_PATH}`;
const WS_URL = 'ws://192.168.1.5:5173/vite-hmr?token=tok-1';
const LIB = '/node_modules/@nativescript/angular/fesm2022/nativescript-angular.mjs';

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
	importModule?: (url: string) => Promise<any>;
	/** Results of successive `vite-ping` attempts; missing entries succeed. */
	pings?: boolean[];
	rebootSettledTimeoutMs?: number;
	beforeRestartTimeoutMs?: number;
	root?: string;
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
				return {};
			}),
	);
	const overlay = { setUpdateStage: vi.fn(), setConnectionStage: vi.fn(), hide: vi.fn() };
	const applyCssUpdates = vi.fn(async () => {});
	const devHost = { invalidateModules: vi.fn() };
	const runtime = createNsHmrRuntime(
		{ wsUrl: WS_URL, wsProtocol: 'vite-hmr', entryUrl: ENTRY, origin: ORIGIN, root: options.root },
		{
			client,
			createSocket,
			importModule,
			overlay,
			applyCssUpdates,
			devHost,
			pingRetryMs: 1,
			rebootSettledTimeoutMs: options.rebootSettledTimeoutMs ?? 1000,
			beforeRestartTimeoutMs: options.beforeRestartTimeoutMs ?? 1000,
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
	return { runtime, client, logger, sockets, hmrSockets, connect, imports, importModule, overlay, applyCssUpdates, devHost, stages };
}

function restartsSent(socket: FakeSocket): unknown[] {
	return socket.sent.map((s) => JSON.parse(s)).filter((m) => m.type === 'custom' && m.event === NS_RESTART_EVENT);
}

const send = (runtime: { onMessage(p: DeviceHotPayload): Promise<unknown> }, payload: DeviceHotPayload) => runtime.onMessage(payload);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function update(...updates: Update[]): DeviceHotPayload {
	return { type: 'update', updates };
}

function jsUpdate(path: string, acceptedPath = path, extra: Partial<Update> = {}): Update {
	return { type: 'js-update', path, acceptedPath, timestamp: 123, ...extra };
}

function announceRerun(data: Partial<UpdateRerunEventData> = {}): DeviceHotPayload {
	return { type: 'custom', event: NS_UPDATE_RERUN_EVENT, data: { timestamp: 123, changed: [], rerun: [], root: '/repo/app', ...data } };
}

const RESTART_ACTION = { label: 'Restart app', onTap: expect.any(Function) };

function quiet() {
	vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.spyOn(console, 'info').mockImplementation(() => {});
}

describe("js-update import URL: absolute, in the order of Vite's client", () => {
	it.each([
		['plain', jsUpdate('/src/a.ts'), `${ORIGIN}/src/a.ts?t=123`],
		['explicitImportRequired', jsUpdate('/src/a.ts', '/src/a.ts', { explicitImportRequired: true }), `${ORIGIN}/src/a.ts?import&t=123`],
		['existing query', jsUpdate('/src/a.vue?vue&type=style&index=0&lang.css'), `${ORIGIN}/src/a.vue?t=123&vue&type=style&index=0&lang.css`],
		['explicitImportRequired with an existing query', jsUpdate('/src/a.vue?vue&type=style&index=0&lang.css', '/src/a.vue?vue&type=style&index=0&lang.css', { explicitImportRequired: true }), `${ORIGIN}/src/a.vue?import&t=123&vue&type=style&index=0&lang.css`],
		['/@fs path', jsUpdate('/@fs/repo/libs/x.ts'), `${ORIGIN}/@fs/repo/libs/x.ts?t=123`],
	])('%s', async (_name, entry, url) => {
		const t = setup();
		new HMRContext(t.client, entry.path).accept();
		await send(t.runtime, update(entry));
		expect(t.imports).toEqual([url]);
	});
});

describe('update', () => {
	it('awaits vite:beforeUpdate, applies js-updates, then vite:afterUpdate, driving the overlay', async () => {
		const t = setup();
		const order: string[] = [];
		const listenerHost = new HMRContext(t.client, LIB);
		listenerHost.on('vite:beforeUpdate', async () => {
			await sleep(5);
			order.push('before');
		});
		listenerHost.on('vite:afterUpdate', () => order.push('after'));
		listenerHost.on(NS_BEFORE_REBOOT_EVENT, () => order.push('beforeReboot'));
		listenerHost.on(NS_AFTER_REBOOT_EVENT, () => order.push('afterReboot'));
		new HMRContext(t.client, '/src/a.ts').accept(() => order.push('accept'));

		await send(t.runtime, update(jsUpdate('/src/a.ts'), { type: 'css-update', path: '/src/b.css', acceptedPath: '/src/b.css', timestamp: 1 }));

		expect(order).toEqual(['before', 'accept', 'after']);
		expect(t.imports).toEqual([`${ORIGIN}/src/a.ts?t=123`]);
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

describe('soft reboot (an update whose boundary is the app entry)', () => {
	function arrangeEntry(t: ReturnType<typeof setup>, order: string[]) {
		const hot = new HMRContext(t.client, ENTRY_PATH);
		hot.accept();
		hot.dispose(() => order.push('dispose'));
		return hot;
	}

	function recordEvents(t: ReturnType<typeof setup>, order: string[]) {
		const events: Record<string, RebootEventData[]> = { before: [], after: [] };
		const host = new HMRContext(t.client, LIB);
		host.on('vite:beforeUpdate', () => order.push('vite:beforeUpdate'));
		host.on(NS_BEFORE_REBOOT_EVENT, async (data: RebootEventData) => {
			await sleep(5);
			events.before.push(data);
			order.push('beforeReboot');
		});
		host.on(NS_AFTER_REBOOT_EVENT, (data: RebootEventData) => {
			events.after.push(data);
			order.push(data.error ? `afterReboot error: ${data.error}` : 'afterReboot');
		});
		host.on('vite:afterUpdate', () => order.push('vite:afterUpdate'));
		return events;
	}

	it('runs beforeReboot → entry dispose → entry import → settled → afterReboot between vite:beforeUpdate and vite:afterUpdate', async () => {
		const order: string[] = [];
		const t = setup({
			importModule: async (url) => {
				order.push(`import ${url}`);
				arrangeEntry(t, order);
				registerEntryBoundary(async () => {
					await sleep(5);
					order.push('settled');
				});
				return {};
			},
		});
		arrangeEntry(t, order);
		const events = recordEvents(t, order);

		await send(t.runtime, announceRerun({ changed: ['/src/app.ts'], rerun: ['/src/app.ts', ENTRY_PATH] }));
		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		expect(order).toEqual(['vite:beforeUpdate', 'beforeReboot', 'dispose', `import ${ENTRY}?t=123`, 'settled', 'afterReboot', 'vite:afterUpdate']);
		expect(events.before[0]).toMatchObject({ entry: ENTRY_PATH, changed: ['/src/app.ts'], rerun: ['/src/app.ts', ENTRY_PATH] });
		expect(events.after[0].error).toBeUndefined();
		expect(t.stages()).toEqual(['received', 'rebooting', 'complete']);
		expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('received', { detail: '/src/app.ts' });
	});

	it('the reboot payloads answer isRerun/isChanged for device URLs, owner paths and file paths', async () => {
		const t = setup();
		arrangeEntry(t, []);
		const events = recordEvents(t, []);

		await send(t.runtime, announceRerun({ changed: ['/src/edited.ts'], rerun: ['/src/edited.ts', '/src/a.vue?vue&type=style&index=0&lang.css', ENTRY_PATH], root: '/repo/app' }));
		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		for (const data of [events.before[0], events.after[0]]) {
			expect(data.isRerun(`${ORIGIN}/src/main.ts?t=123`)).toBe(true);
			expect(data.isRerun(`${ORIGIN}/src/a.vue?import&vue&t=9&type=style&index=0&lang.css`)).toBe(true);
			expect(data.isRerun('/src/a.vue')).toBe(false);
			expect(data.isRerun('/src/other.ts')).toBe(false);
			expect(data.isChanged('/src/edited.ts')).toBe(true);
			expect(data.isChanged('/repo/app/src/edited.ts')).toBe(true);
			expect(data.isChanged(ENTRY_PATH)).toBe(false);
		}
	});

	it('an announcement is matched by timestamp even when a later one arrived first', async () => {
		const t = setup();
		arrangeEntry(t, []);
		const events = recordEvents(t, []);

		await send(t.runtime, announceRerun({ timestamp: 123, changed: ['/src/first.ts'] }));
		await send(t.runtime, announceRerun({ timestamp: 124, changed: ['/src/second.ts'] }));
		await send(t.runtime, update(jsUpdate(ENTRY_PATH, ENTRY_PATH, { timestamp: 124 })));
		await send(t.runtime, update(jsUpdate(ENTRY_PATH, ENTRY_PATH, { timestamp: 123 })));

		expect(events.before.map((e) => e.changed)).toEqual([['/src/second.ts'], ['/src/first.ts']]);
	});

	it('without a matching ns:rerun, changed and rerun are empty', async () => {
		const t = setup();
		arrangeEntry(t, []);
		const events = recordEvents(t, []);

		await send(t.runtime, announceRerun({ timestamp: 99, changed: ['/src/old.ts'], rerun: ['/src/old.ts'] }));
		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		for (const data of [...events.before, ...events.after]) {
			expect(data.changed).toEqual([]);
			expect(data.rerun).toEqual([]);
			expect(data.isRerun(ENTRY_PATH)).toBe(false);
		}
		expect(events.before).toHaveLength(1);
	});

	it('a failed entry import reports afterReboot with the error, and the next entry update retries', async () => {
		quiet();
		const order: string[] = [];
		let fail = true;
		const t = setup({
			rebootSettledTimeoutMs: 60_000,
			importModule: async (url) => {
				order.push(`import ${url}`);
				if (fail) throw new Error('SyntaxError: Unexpected token');
				arrangeEntry(t, order);
				return {};
			},
		});
		const socket = await t.connect();
		arrangeEntry(t, order);
		// The torn-down app's provider must not be awaited after a failed import.
		registerEntryBoundary(() => new Promise(() => {}));
		recordEvents(t, order);

		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		expect(order).toEqual(['vite:beforeUpdate', 'beforeReboot', 'dispose', `import ${ENTRY}?t=123`, 'afterReboot error: SyntaxError: Unexpected token', 'vite:afterUpdate']);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('failed', expect.objectContaining({ detail: 'SyntaxError: Unexpected token', action: RESTART_ACTION }));

		order.length = 0;
		fail = false;
		await send(t.runtime, update(jsUpdate(ENTRY_PATH, ENTRY_PATH, { timestamp: 124 })));

		expect(order).toEqual(['vite:beforeUpdate', 'beforeReboot', 'dispose', `import ${ENTRY}?t=124`, 'afterReboot', 'vite:afterUpdate']);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('complete', expect.anything());
		expect(t.stages()).not.toContain('restart-required');
		expect(restartsSent(socket)).toEqual([]);
	});

	it.each([
		['a dependency of the entry throws', 'dispose app 0', 'dependency'],
		['the entry throws after registering its boundary', 'dispose app 1', 'entry'],
		['the new app fails to bootstrap', 'dispose app 1', 'bootstrap'],
	] as const)('%s: the retry tears down again through %s, and no-op teardowns do not restart', async (_name, retryDisposer, failure) => {
		quiet();
		const order: string[] = [];
		const bare = (message: string) => Object.assign(new Error(message), { stack: `Error: ${message}` });
		let appLive = true;
		let generation = 0;
		let attempt = 0;
		const t = setup({
			importModule: async () => {
				attempt++;
				const failing = attempt !== 2;
				if (failing && (failure === 'dependency' || attempt === 3)) throw bare('boom');
				evaluateEntry();
				if (failing && failure === 'entry') throw bare('boom');
				registerEntryBoundary(async () => {
					if (failing) throw bare('boom');
					appLive = true;
				});
				return {};
			},
		});
		function evaluateEntry() {
			const app = generation++;
			const hot = new HMRContext(t.client, ENTRY_PATH);
			hot.accept();
			hot.dispose(() => {
				order.push(`dispose app ${app}${appLive ? '' : ' (no-op)'}`);
				appLive = false;
			});
		}
		const socket = await t.connect();
		evaluateEntry();
		const host = new HMRContext(t.client, LIB);
		host.on(NS_BEFORE_REBOOT_EVENT, () => order.push(`beforeReboot${appLive ? '' : ' (no-op)'}`));
		host.on(NS_AFTER_REBOOT_EVENT, (data: RebootEventData) => order.push(data.error ? `afterReboot error: ${data.error}` : 'afterReboot'));

		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));
		expect(order).toEqual(['beforeReboot', 'dispose app 0', 'afterReboot error: boom']);
		expect(t.stages().at(-1)).toBe('failed');

		order.length = 0;
		await send(t.runtime, update(jsUpdate(ENTRY_PATH, ENTRY_PATH, { timestamp: 124 })));
		expect(order).toEqual(['beforeReboot (no-op)', `${retryDisposer} (no-op)`, 'afterReboot']);
		expect(t.stages().at(-1)).toBe('complete');

		// The same failure twice in a row restarts, so this one passing shows the retry cleared it.
		await send(t.runtime, update(jsUpdate(ENTRY_PATH, ENTRY_PATH, { timestamp: 125 })));
		expect(t.stages().at(-1)).toBe('failed');

		expect(t.stages()).not.toContain('restart-required');
		expect(restartsSent(socket)).toEqual([]);
	});

	it('a settled provider that never resolves times out, logs and continues without an error', async () => {
		const order: string[] = [];
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const t = setup({
			rebootSettledTimeoutMs: 10,
			importModule: async () => {
				registerEntryBoundary(() => new Promise(() => {}));
				return {};
			},
		});
		arrangeEntry(t, order);
		recordEvents(t, order);

		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		expect(order.slice(-2)).toEqual(['afterReboot', 'vite:afterUpdate']);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('10 ms'));
		expect(t.stages().at(-1)).toBe('complete');
	});

	it.each([
		['rejects', () => Promise.reject(new Error('bootstrap failed'))],
		['resolves to { error }', () => Promise.resolve({ error: new Error('bootstrap failed') })],
	])('a settled provider that %s reports afterReboot with the error', async (_how, settled) => {
		quiet();
		const order: string[] = [];
		const t = setup({
			importModule: async () => {
				registerEntryBoundary(settled);
				return {};
			},
		});
		arrangeEntry(t, order);
		recordEvents(t, order);

		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		expect(order.slice(-2)).toEqual(['afterReboot error: bootstrap failed', 'vite:afterUpdate']);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('failed', expect.objectContaining({ detail: 'bootstrap failed', action: RESTART_ACTION }));
	});

	it('an entry dispose that throws sends afterReboot with the error, then asks for a restart', async () => {
		quiet();
		const order: string[] = [];
		const t = setup();
		const socket = await t.connect();
		const hot = new HMRContext(t.client, ENTRY_PATH);
		hot.accept();
		hot.dispose(() => {
			throw new Error('teardown failed');
		});
		recordEvents(t, order);

		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		expect(order).toEqual(['vite:beforeUpdate', 'beforeReboot', 'afterReboot error: teardown failed']);
		expect(t.importModule).not.toHaveBeenCalled();
		expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'dispose before the app reboot failed: teardown failed' } }]);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('restart-required', { detail: 'dispose before the app reboot failed: teardown failed' });
	});

	it.each([
		[
			'throws',
			() => {
				throw new Error('cleanup failed');
			},
		],
		[
			'rejects',
			async () => {
				throw new Error('cleanup failed');
			},
		],
	])('a beforeReboot listener that %s skips dispose and import, reports afterReboot with the error, then asks for a restart', async (_name, listener) => {
		quiet();
		const order: string[] = [];
		const t = setup();
		const socket = await t.connect();
		arrangeEntry(t, order);
		recordEvents(t, order);
		new HMRContext(t.client, '/src/participant.ts').on(NS_BEFORE_REBOOT_EVENT, listener);

		await send(t.runtime, update(jsUpdate(ENTRY_PATH)));

		expect(order).toEqual(['vite:beforeUpdate', 'beforeReboot', 'afterReboot error: cleanup failed']);
		expect(t.importModule).not.toHaveBeenCalled();
		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: `a ${NS_BEFORE_REBOOT_EVENT} listener failed: cleanup failed` } }]));
	});
});

describe('soft reboot: the new app fails to evaluate', () => {
	const APP = '/src/app.ts';
	const OTHER = '/src/other.ts';

	function evaluationError(message: string, ...viteUrls: string[]) {
		const err = new Error(message);
		err.stack = [`Error: ${message}`, `    at helper (${ORIGIN}/node_modules/lib/x.js:1:2)`, ...viteUrls.map((url) => `    at ${ORIGIN}${url}:4:5`)].join('\n');
		return err;
	}

	function arrange(failures: Array<Error | undefined>) {
		quiet();
		const t = setup({
			importModule: async () => {
				const failure = failures.shift();
				if (failure) throw failure;
				arrangeEntry();
				return {};
			},
		});
		const afterReboot: Array<string | undefined> = [];
		function arrangeEntry() {
			new HMRContext(t.client, ENTRY_PATH).accept();
		}
		arrangeEntry();
		new HMRContext(t.client, LIB).on(NS_AFTER_REBOOT_EVENT, (data: RebootEventData) => afterReboot.push(data.error));
		const reboot = async (timestamp: number, rerun: string[]) => {
			await send(t.runtime, announceRerun({ timestamp, changed: rerun.slice(0, 1), rerun: [...rerun, ENTRY_PATH] }));
			await send(t.runtime, update(jsUpdate(ENTRY_PATH, ENTRY_PATH, { timestamp })));
		};
		return { t, afterReboot, reboot };
	}

	it('evicts the failed modules of the reboot, keeps the app alive and shows the error with its stack', async () => {
		const { t, afterReboot, reboot } = arrange([evaluationError('boom', `${APP}?t=123`)]);
		const socket = await t.connect();

		await reboot(123, [APP]);

		expect(t.devHost.invalidateModules).toHaveBeenCalledWith([`${ORIGIN}${APP}?t=123`]);
		expect(afterReboot).toEqual(['boom']);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('failed', { detail: 'boom', code: `at helper (/node_modules/lib/x.js:1:2)\nat ${APP}?t=123:4:5`, action: RESTART_ACTION });
		expect(restartsSent(socket)).toEqual([]);
	});

	it('restarts when the retry fails again on a module outside its chain', async () => {
		const failure = evaluationError('boom', `${APP}?t=123`);
		const { t, reboot } = arrange([failure, failure]);
		const socket = await t.connect();

		await reboot(123, [APP]);
		await reboot(124, [OTHER]);

		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'the app failed to reload: boom' } }]));
	});

	it('keeps retrying while the failure is inside the new chain', async () => {
		const { t, reboot } = arrange([evaluationError('boom', `${APP}?t=123`), evaluationError('boom', `${APP}?t=124`)]);
		const socket = await t.connect();

		await reboot(123, [APP]);
		await reboot(124, [APP]);

		expect(t.devHost.invalidateModules).toHaveBeenLastCalledWith([`${ORIGIN}${APP}?t=124`]);
		expect(t.stages().at(-1)).toBe('failed');
		expect(restartsSent(socket)).toEqual([]);
	});

	it('without device URLs in the stack, restarts on the same failure twice in a row only', async () => {
		const bare = (message: string) => Object.assign(new Error(message), { stack: `Error: ${message}` });
		const { t, reboot } = arrange([bare('first'), bare('second'), bare('second')]);
		const socket = await t.connect();

		await reboot(123, [APP]);
		await reboot(124, [APP]);
		expect(restartsSent(socket)).toEqual([]);

		await reboot(125, [APP]);
		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'the app failed to reload: second' } }]));
		expect(t.devHost.invalidateModules).not.toHaveBeenCalled();
	});

	it('a successful reboot clears the failure', async () => {
		const failure = evaluationError('boom', `${APP}?t=123`);
		const { t, afterReboot, reboot } = arrange([failure, undefined, failure]);
		const socket = await t.connect();

		await reboot(123, [APP]);
		await reboot(124, [APP]);
		expect(t.stages().at(-1)).toBe('complete');
		await reboot(125, [OTHER]);

		expect(afterReboot).toEqual(['boom', undefined, 'boom']);
		expect(restartsSent(socket)).toEqual([]);
	});
});

describe(NS_BEFORE_RERUN_EVENT, () => {
	// main → one → child1, main → child2, child1 → child2, main → three → four
	const PATHS = { main: ENTRY_PATH, one: '/src/one.ts', child1: '/src/child1.ts', child2: '/src/child2.ts', three: '/src/three.ts', four: '/src/four.ts' };
	type Name = keyof typeof PATHS;

	function arrangeTree(t: ReturnType<typeof setup>, order: string[]) {
		const contexts = {} as Record<Name, HMRContext>;
		for (const [name, path] of Object.entries(PATHS) as [Name, string][]) {
			const hot = new HMRContext(t.client, path);
			hot.on(NS_BEFORE_RERUN_EVENT, () => order.push(name));
			contexts[name] = hot;
		}
		for (const name of ['main', 'child1'] as const) {
			contexts[name].accept();
			contexts[name].dispose(() => order.push(`dispose ${name}`));
		}
		return contexts;
	}

	it('(a) reaches only the listeners of the modules in rerun', async () => {
		const t = setup();
		const order: string[] = [];
		arrangeTree(t, order);

		await send(t.runtime, announceRerun({ changed: [PATHS.one], rerun: [PATHS.main, PATHS.one, PATHS.child1] }));
		await send(t.runtime, update(jsUpdate(PATHS.main)));

		expect(order).toEqual(['main', 'one', 'child1', 'dispose main']);
	});

	it('(b, c) notifies each re-run module once per payload, before any boundary dispose', async () => {
		const t = setup();
		const order: string[] = [];
		arrangeTree(t, order);
		new HMRContext(t.client, LIB).on(NS_BEFORE_RERUN_EVENT, () => order.push('broadcast'));

		await send(t.runtime, announceRerun({ changed: [PATHS.child2], rerun: [PATHS.child2, PATHS.child1, PATHS.one, PATHS.main] }));
		await send(t.runtime, update(jsUpdate(PATHS.child1), jsUpdate(PATHS.main)));

		expect(order).toEqual(['child2', 'child1', 'one', 'main', 'dispose child1', 'dispose main']);
	});

	it('carries the update modules, marking edited files changed and their importers rerun', async () => {
		const t = setup();
		const payloads: BeforeRerunEventData[] = [];
		const hot = new HMRContext(t.client, PATHS.child1);
		hot.accept();
		hot.on(NS_BEFORE_RERUN_EVENT, (data: BeforeRerunEventData) => payloads.push(data));

		await send(t.runtime, announceRerun({ changed: [PATHS.child2], rerun: [PATHS.child2, PATHS.child1] }));
		await send(t.runtime, update(jsUpdate(PATHS.child1)));

		expect(payloads).toHaveLength(1);
		expect(payloads[0].timestamp).toBe(123);
		expect(Array.from(payloads[0].modules)).toEqual([
			[PATHS.child2, 'changed'],
			[PATHS.child1, 'rerun'],
		]);
		expect(payloads[0].isRerun(`${ORIGIN}${PATHS.child1}?t=123`)).toBe(true);
	});

	it('runs after vite:beforeUpdate and nativescript:beforeReboot', async () => {
		const t = setup();
		const order: string[] = [];
		arrangeTree(t, order);
		const host = new HMRContext(t.client, LIB);
		host.on('vite:beforeUpdate', () => order.push('vite:beforeUpdate'));
		host.on(NS_BEFORE_REBOOT_EVENT, () => order.push('beforeReboot'));

		await send(t.runtime, announceRerun({ rerun: [PATHS.main] }));
		await send(t.runtime, update(jsUpdate(PATHS.main)));

		expect(order).toEqual(['vite:beforeUpdate', 'beforeReboot', 'main', 'dispose main']);
	});

	it('(d) a re-evaluated module’s stale listener is pruned', async () => {
		const t = setup();
		const order: string[] = [];
		const old = new HMRContext(t.client, PATHS.child1);
		old.on(NS_BEFORE_RERUN_EVENT, () => order.push('old'));
		const fresh = new HMRContext(t.client, PATHS.child1);
		fresh.accept();
		fresh.on(NS_BEFORE_RERUN_EVENT, () => order.push('new'));

		await send(t.runtime, announceRerun({ rerun: [PATHS.child1] }));
		await send(t.runtime, update(jsUpdate(PATHS.child1)));

		expect(order).toEqual(['new']);
	});

	it('is skipped without a matching ns:rerun, and a rejecting listener does not stop the update', async () => {
		const t = setup();
		const order: string[] = [];
		const contexts = arrangeTree(t, order);
		contexts.one.on(NS_BEFORE_RERUN_EVENT, () => {
			throw new Error('cleanup failed');
		});

		await send(t.runtime, update(jsUpdate(PATHS.child1)));
		expect(order).toEqual(['dispose child1']);

		order.length = 0;
		await send(t.runtime, announceRerun({ timestamp: 124, rerun: [PATHS.one, PATHS.child1] }));
		await send(t.runtime, update(jsUpdate(PATHS.child1, PATHS.child1, { timestamp: 124 })));
		expect(order).toEqual(['one', 'child1', 'dispose child1']);
		expect(t.logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'cleanup failed' }));
	});
});

describe('full-reload', () => {
	it.each([
		['triggeredBy', { type: 'full-reload', path: '*', triggeredBy: '/repo/src/app/app.component.ts' }, 'full reload: /repo/src/app/app.component.ts'],
		['path', { type: 'full-reload', path: '/src/x.ts' }, 'full reload: /src/x.ts'],
		['no detail', { type: 'full-reload', path: '*' }, 'full reload requested by the dev server'],
	] as const)('asks for an app restart (%s), after vite:beforeFullReload and beforeRestart, without importing', async (_name, payload, reason) => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		const order: string[] = [];
		const host = new HMRContext(t.client, LIB);
		host.on('vite:beforeFullReload', () => order.push('beforeFullReload'));
		host.on(NS_BEFORE_RESTART_EVENT, async (data: { reason: string }) => {
			await sleep(5);
			order.push(`beforeRestart ${data.reason} (sent: ${restartsSent(socket).length})`);
		});
		const dispose = vi.fn();
		new HMRContext(t.client, '/src/a.ts').dispose(dispose);

		await send(t.runtime, payload as DeviceHotPayload);

		expect(order).toEqual(['beforeFullReload', `beforeRestart ${reason} (sent: 0)`]);
		expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason } }]);
		expect(dispose).not.toHaveBeenCalled();
		expect(t.importModule).not.toHaveBeenCalled();
		expect(t.overlay.setUpdateStage.mock.calls).toEqual([['restart-required', { detail: reason }]]);
	});

	it('a burst sends one restart', async () => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		await send(t.runtime, { type: 'full-reload' });
		await send(t.runtime, { type: 'full-reload', path: '*' });
		expect(restartsSent(socket)).toHaveLength(1);
	});

	it('skips .html targets and fallback-page reloads', async () => {
		const t = setup();
		const socket = await t.connect();
		const beforeRestart = vi.fn();
		new HMRContext(t.client, LIB).on(NS_BEFORE_RESTART_EVENT, beforeRestart);
		await send(t.runtime, { type: 'full-reload', path: '/index.html' });
		await send(t.runtime, { type: 'full-reload', ifFallback: true } as DeviceHotPayload);
		expect(restartsSent(socket)).toEqual([]);
		expect(beforeRestart).not.toHaveBeenCalled();
		expect(t.overlay.setUpdateStage).not.toHaveBeenCalled();
	});

	it('a failed import inside a circular import asks for a restart', async () => {
		quiet();
		const t = setup({
			importModule: async () => {
				throw new Error('TDZ');
			},
		});
		const socket = await t.connect();
		new HMRContext(t.client, '/src/a.ts').accept();
		await send(t.runtime, update(jsUpdate('/src/a.ts', '/src/a.ts', { isWithinCircularImport: true })));
		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: '/src/a.ts failed to apply within a circular import' } }]));
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
		expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('failed', { detail: 'Transform failed', action: RESTART_ACTION });
	});

	it('shows the root-relative location, the message without ANSI and the code frame, and leaves the app alone', async () => {
		quiet();
		const t = setup();
		const order: string[] = [];
		const entry = new HMRContext(t.client, ENTRY_PATH);
		entry.accept();
		entry.dispose(() => order.push('dispose'));
		new HMRContext(t.client, LIB).on(NS_BEFORE_REBOOT_EVENT, () => order.push('beforeReboot'));
		const frame = '1 | const a = ;\n  |           ^';

		await send(t.runtime, announceRerun({ timestamp: 1, root: '/repo/app' }));
		await send(t.runtime, {
			type: 'error',
			err: { message: '\u001b[31mExpected an expression\u001b[39m', stack: 'at transform (vite/dist/node.js:1:1)', id: '/repo/app/src/app.ts', frame: `\n${frame}\n`, loc: { file: '/repo/app/src/app.ts', line: 1, column: 11 }, plugin: 'vite:oxc' },
		});

		expect(t.overlay.setUpdateStage).toHaveBeenCalledWith('failed', { detail: 'src/app.ts:1:11\nExpected an expression', code: frame, action: RESTART_ACTION });
		expect(order).toEqual([]);
		expect(t.importModule).not.toHaveBeenCalled();
	});
});

describe('the Restart app action', () => {
	it('asks for a restart after beforeRestart, moving the overlay to restart-required', async () => {
		quiet();
		const t = setup();
		const socket = await t.connect();
		const order: string[] = [];
		new HMRContext(t.client, LIB).on(NS_BEFORE_RESTART_EVENT, (data: { reason: string }) => order.push(`beforeRestart: ${data.reason}`));
		await send(t.runtime, { type: 'error', err: { message: 'Transform failed', stack: '' } });

		const [, info] = t.overlay.setUpdateStage.mock.calls.at(-1)!;
		info.action.onTap();
		info.action.onTap();

		await vi.waitFor(() => expect(restartsSent(socket)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'requested from the error overlay' } }]));
		expect(order).toEqual(['beforeRestart: requested from the error overlay']);
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('restart-required', { detail: 'requested from the error overlay' });
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

	it(`${NS_RESTART_REQUIRED_EVENT} from the server awaits beforeRestart, shows the overlay and stops applying changes`, async () => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		const order: string[] = [];
		const accept = vi.fn();
		new HMRContext(t.client, '/src/a.ts').accept(accept);
		const host = new HMRContext(t.client, '/node_modules/lib/x.js');
		const listener = vi.fn();
		host.on('server:hello', listener);
		host.on(NS_BEFORE_RESTART_EVENT, async (data: { reason: string }) => {
			await sleep(5);
			order.push(`beforeRestart ${data.reason}`);
		});
		t.overlay.setUpdateStage.mockImplementation((stage: string) => order.push(stage));

		await send(t.runtime, { type: 'custom', event: NS_RESTART_REQUIRED_EVENT, data: { reason: 'no CLI attached' } });
		await send(t.runtime, update(jsUpdate('/src/a.ts')));
		await send(t.runtime, { type: 'full-reload' });
		await send(t.runtime, { type: 'prune', paths: ['/src/a.ts'] });
		await send(t.runtime, { type: 'custom', event: NS_CSS_UPDATES_EVENT, data: { updates: [{ type: 'css-update', path: '/app.css', acceptedPath: '/app.css', timestamp: 1, css: '' }] } });
		await send(t.runtime, { type: 'custom', event: 'server:hello', data: 'hi' });

		expect(order).toEqual(['beforeRestart no CLI attached', 'restart-required']);
		expect(t.overlay.setUpdateStage.mock.calls).toEqual([['restart-required', { detail: 'no CLI attached' }]]);
		expect(accept).not.toHaveBeenCalled();
		expect(t.importModule).not.toHaveBeenCalled();
		expect(t.applyCssUpdates).not.toHaveBeenCalled();
		expect(t.client.hotModulesMap.has('/src/a.ts')).toBe(true);
		expect(listener).toHaveBeenCalledWith('hi');
		expect(restartsSent(socket)).toEqual([]);
	});

	it(`the server's ${NS_RESTART_REQUIRED_EVENT} reply to a device request does not send it again or repeat beforeRestart`, async () => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		const beforeRestart = vi.fn();
		new HMRContext(t.client, LIB).on(NS_BEFORE_RESTART_EVENT, beforeRestart);

		await t.runtime.requestRestart('hot.decline() in /src/a.ts');
		await send(t.runtime, { type: 'custom', event: NS_RESTART_REQUIRED_EVENT, data: { reason: 'restart the app manually' } });
		await t.runtime.requestRestart('dispose of /src/b.ts failed');

		expect(restartsSent(socket)).toHaveLength(1);
		expect(beforeRestart).toHaveBeenCalledTimes(1);
		expect(beforeRestart).toHaveBeenCalledWith({ reason: 'hot.decline() in /src/a.ts' });
		expect(t.overlay.setUpdateStage).toHaveBeenLastCalledWith('restart-required', { detail: 'restart the app manually' });
	});

	it(`a server ${NS_RESTART_REQUIRED_EVENT} while beforeRestart listeners run cancels the device request`, async () => {
		const t = setup();
		quiet();
		const socket = await t.connect();
		let release!: () => void;
		new HMRContext(t.client, LIB).on(NS_BEFORE_RESTART_EVENT, () => new Promise<void>((resolve) => (release = resolve)));

		const requested = t.runtime.requestRestart('hot.decline() in /src/a.ts');
		const required = send(t.runtime, { type: 'custom', event: NS_RESTART_REQUIRED_EVENT, data: { reason: 'restart the app manually' } });
		release();
		await Promise.all([requested, required]);

		expect(restartsSent(socket)).toEqual([]);
		expect(t.overlay.setUpdateStage.mock.calls).toEqual([['restart-required', { detail: 'restart the app manually' }]]);
	});

	it('beforeRestart listeners that hang or throw do not block the restart', async () => {
		const t = setup({ beforeRestartTimeoutMs: 10 });
		quiet();
		const socket = await t.connect();
		const host = new HMRContext(t.client, LIB);
		host.on(NS_BEFORE_RESTART_EVENT, () => {
			throw new Error('sync');
		});
		host.on(NS_BEFORE_RESTART_EVENT, () => new Promise(() => {}));

		await t.runtime.requestRestart('hot.decline() in /src/a.ts');

		expect(restartsSent(socket)).toHaveLength(1);
	});

	it('a restart requested while the socket is down is sent once it reconnects', async () => {
		const t = setup();
		quiet();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		const first = await t.connect();

		first.close();
		await t.runtime.requestRestart('hot.decline() in /src/a.ts');
		await vi.waitFor(() => expect(t.hmrSockets()).toHaveLength(2));
		const second = t.hmrSockets()[1];
		second.open();

		await vi.waitFor(() => expect(restartsSent(second)).toEqual([{ type: 'custom', event: NS_RESTART_EVENT, data: { reason: 'hot.decline() in /src/a.ts' } }]));
		expect(restartsSent(first)).toEqual([]);
		expect(t.importModule).not.toHaveBeenCalled();
	});
});
