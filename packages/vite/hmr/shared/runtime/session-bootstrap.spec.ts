import { afterEach, describe, expect, it, vi } from 'vitest';
import { ensureHmrDevOverlayRuntimeInstalled } from './dev-overlay.js';
import { startBrowserRuntimeSession } from './session-bootstrap.js';
import { getGlobalScope } from './global-scope.js';

const SESSION_DESCRIPTOR = {
	sessionId: 'session-1',
	origin: 'http://localhost:5173',
	clientUrl: 'http://localhost:5173/__ns_dev__/client',
	// The dev-server descriptor emits the CANONICAL (untagged) entry
	// URL — boot-progress instrumentation is injected self-gating on the
	// server side, so no path decoration is involved.
	entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
	wsUrl: 'ws://localhost:5173/ns-hmr',
	platform: 'ios',
} as const;

function sessionResponse(overrides: Record<string, unknown> = {}) {
	return {
		ok: true,
		json: async () => ({ ...SESSION_DESCRIPTOR, ...overrides }),
	};
}

describe('browser runtime session bootstrap', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		vi.useRealTimers();
		delete getGlobalScope().__NS_HMR_DEV_OVERLAY__;
		delete getGlobalScope().__NS_HMR_DEV_OVERLAY_STATE__;
		delete getGlobalScope().__NS_HTTP_ORIGIN__;
		delete getGlobalScope().__NS_HMR_WS_URL__;
		delete getGlobalScope().__NS_HMR_BOOT_COMPLETE__;
		delete getGlobalScope().__NS_DEV_ENTRY_URL__;
		delete getGlobalScope().__NS_DEV_SESSION__;
		delete getGlobalScope().__NS_HMR_IMPORT__;
		delete getGlobalScope().__NS_DEV__;
		delete getGlobalScope().__NS_DEV_RESTORE_PLACEHOLDER__;
		// clear the shared dedup flag between tests so each case
		// exercises the import-map fetch path independently.
		delete getGlobalScope().__NS_IMPORT_MAP_CONFIGURED__;
		// Boot timeline trace is mirrored onto globalThis for post-boot
		// inspection — reset it so each test sees a clean slate.
		delete getGlobalScope().__NS_BOOT_TRACE__;
		// Boot-progress globals (snippet + heartbeat ratchet) are reset by
		// `clearBootProgressState` inside `startBrowserRuntimeSession`, but
		// some tests stage these directly so wipe them defensively here too.
		delete getGlobalScope().__NS_HMR_BOOT_MODULE_COUNT__;
		delete getGlobalScope().__NS_HMR_BOOT_LAST_MODULE__;
		delete getGlobalScope().__NS_HMR_BOOT_LAST_PROGRESS__;
		delete getGlobalScope().__NS_HMR_BOOT_LAST_PROGRESS_AT__;
		delete getGlobalScope().__NS_HMR_BOOT_IMPORT_STARTED_AT__;
	});

	it('applies session globals, imports client then entry, and waits for the real app root', async () => {
		const importedUrls: string[] = [];
		const importMock = vi.fn().mockImplementation(async (url: string) => {
			// Session globals must be visible to the imported client/entry.
			expect(getGlobalScope().__NS_HTTP_ORIGIN__).toBe(SESSION_DESCRIPTOR.origin);
			expect(getGlobalScope().__NS_HMR_WS_URL__).toBe(SESSION_DESCRIPTOR.wsUrl);
			expect(getGlobalScope().__NS_DEV_ENTRY_URL__).toBe(SESSION_DESCRIPTOR.entryUrl);
			importedUrls.push(url);
			return {};
		});
		const restorePlaceholder = vi.fn();
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		getGlobalScope().__NS_DEV_RESTORE_PLACEHOLDER__ = restorePlaceholder;
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse()));

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		// Boot orchestration order: dev client first, entry second.
		expect(importedUrls).toEqual([SESSION_DESCRIPTOR.clientUrl, SESSION_DESCRIPTOR.entryUrl]);
		expect(restorePlaceholder).toHaveBeenCalledWith('session-active');
		expect(getGlobalScope().__NS_HTTP_ORIGIN__).toBe('http://localhost:5173');
		expect(getGlobalScope().__NS_HMR_WS_URL__).toBe('ws://localhost:5173/ns-hmr');
		expect(getGlobalScope().__NS_DEV_SESSION__).toMatchObject({ sessionId: 'session-1' });
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'boot',
			phase: 'Waiting for the app root view',
			progress: 94,
		});
		expect(api.getSnapshot().detail).toContain('Waiting for the real app root');
	});

	it('arms the cold-boot gate via __NS_DEV__.setDevBootComplete(false) before importing', async () => {
		const calls: Array<{ kind: string; value?: unknown }> = [];
		vi.stubGlobal('__NS_DEV__', {
			setDevBootComplete: vi.fn().mockImplementation((value?: boolean) => {
				calls.push({ kind: 'boot-complete', value });
			}),
		});
		vi.stubGlobal(
			'__NS_HMR_IMPORT__',
			vi.fn().mockImplementation(async (url: string) => {
				calls.push({ kind: 'import', value: url });
				return {};
			}),
		);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse()));

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		expect(calls[0]).toEqual({ kind: 'boot-complete', value: false });
		expect(calls.map((c) => c.kind)).toEqual(['boot-complete', 'import', 'import']);
	});

	it('configures the runtime import map before importing the client and entry', async () => {
		const configureRuntime = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-2', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					importMap: {
						imports: {
							stacktrace: 'ns-vendor://stacktrace-js',
						},
					},
					volatilePatterns: ['?v='],
				}),
			});

		vi.stubGlobal('__NS_DEV__', { configureRuntime });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:5173/__ns_dev__/session');
		expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:5173/ns/import-map.json');
		expect(configureRuntime).toHaveBeenCalledWith({
			importMap: {
				imports: {
					stacktrace: 'ns-vendor://stacktrace-js',
				},
			},
			volatilePatterns: ['?v='],
		});
		expect(configureRuntime.mock.invocationCallOrder[0]).toBeLessThan(importMock.mock.invocationCallOrder[0]);
	});

	it('fetches the server boot closure and kickstarts the prefetch when the runtime exposes it', async () => {
		const kickstart = vi.fn().mockReturnValue({ ok: true, fetched: 2, ms: 12 });
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.endsWith('/__ns_dev__/session')) return sessionResponse();
			if (url.endsWith('/__ns_dev__/boot-closure')) {
				return {
					ok: true,
					json: async () => ({ urls: ['http://localhost:5173/ns/m/src/main.ts', 'http://localhost:5173/ns/m/src/app/app.ts'] }),
				};
			}
			return { ok: true, json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }) };
		});

		vi.stubGlobal('__NS_DEV__', { kickstartPrefetch: kickstart });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:5173/__ns_dev__/boot-closure');
		expect(kickstart).toHaveBeenCalledWith(['http://localhost:5173/ns/m/src/main.ts', 'http://localhost:5173/ns/m/src/app/app.ts'], { maxConcurrent: 16, timeoutMs: 30000 });
		// Kickstart runs BEFORE the client/entry imports.
		expect(kickstart.mock.invocationCallOrder[0]).toBeLessThan(importMock.mock.invocationCallOrder[0]);
		const trace = getGlobalScope().__NS_BOOT_TRACE__;
		expect(trace.kickstart).toMatchObject({ ok: true, meta: { fetched: 2 } });
	});

	it('skips the boot-closure fetch entirely on runtimes without __NS_DEV__.kickstartPrefetch', async () => {
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockResolvedValue(sessionResponse());
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		const closureCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('boot-closure'));
		expect(closureCalls).toEqual([]);
		expect(importMock).toHaveBeenCalledTimes(2);
	});

	it('continues the boot when the boot-closure endpoint fails', async () => {
		const kickstart = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.endsWith('/__ns_dev__/session')) return sessionResponse();
			if (url.endsWith('/__ns_dev__/boot-closure')) return { ok: false, status: 500, json: async () => ({}) };
			return { ok: true, json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }) };
		});
		vi.stubGlobal('__NS_DEV__', { kickstartPrefetch: kickstart });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		expect(kickstart).not.toHaveBeenCalled();
		expect(importMock).toHaveBeenCalledTimes(2);
	});

	it('prefers the boot archive over the kickstart when the runtime exposes seedModuleBodies', async () => {
		const seedModuleBodies = vi.fn().mockReturnValue({ ok: true, seeded: 2, bytes: 42 });
		const kickstart = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const archiveText = ['{"kind":"meta","version":1,"source":"recorded","urls":2}', '{"kind":"mod","url":"http://localhost:5173/ns/m/src/main","body":"export {};"}', 'junk-line', '{"kind":"mod","url":"http://localhost:5173/ns/rt","body":"export const rt = 1;"}'].join('\n');
		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.endsWith('/__ns_dev__/session')) return sessionResponse();
			if (url.endsWith('/__ns_dev__/boot-archive')) {
				return { ok: true, text: async () => archiveText };
			}
			return { ok: true, json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }) };
		});

		vi.stubGlobal('__NS_DEV__', { seedModuleBodies, kickstartPrefetch: kickstart });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:5173/__ns_dev__/boot-archive');
		expect(seedModuleBodies).toHaveBeenCalledWith([
			{ url: 'http://localhost:5173/ns/m/src/main', body: 'export {};' },
			{ url: 'http://localhost:5173/ns/rt', body: 'export const rt = 1;' },
		]);
		// Archive path replaces the kickstart wave entirely.
		expect(kickstart).not.toHaveBeenCalled();
		expect(fetchMock.mock.calls.filter((c) => String(c[0]).includes('boot-closure'))).toEqual([]);
		// Seeding runs BEFORE the client/entry imports.
		expect(seedModuleBodies.mock.invocationCallOrder[0]).toBeLessThan(importMock.mock.invocationCallOrder[0]);
		const trace = getGlobalScope().__NS_BOOT_TRACE__;
		expect(trace.kickstart).toMatchObject({ ok: true, meta: { mode: 'archive', seeded: 2, bytes: 42 } });
	});

	it('falls back to the kickstart wave when the boot archive fails or seeds nothing', async () => {
		const seedModuleBodies = vi.fn().mockReturnValue({ ok: false, seeded: 0, bytes: 0 });
		const kickstart = vi.fn().mockReturnValue({ ok: true, fetched: 1, ms: 5 });
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockImplementation(async (url: string) => {
			if (url.endsWith('/__ns_dev__/session')) return sessionResponse();
			if (url.endsWith('/__ns_dev__/boot-archive')) {
				return { ok: true, text: async () => '{"kind":"mod","url":"http://localhost:5173/ns/m/src/main","body":"export {};"}' };
			}
			if (url.endsWith('/__ns_dev__/boot-closure')) {
				return { ok: true, json: async () => ({ urls: ['http://localhost:5173/ns/m/src/main'] }) };
			}
			return { ok: true, json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }) };
		});

		vi.stubGlobal('__NS_DEV__', { seedModuleBodies, kickstartPrefetch: kickstart });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		expect(seedModuleBodies).toHaveBeenCalledTimes(1);
		expect(kickstart).toHaveBeenCalledWith(['http://localhost:5173/ns/m/src/main'], { maxConcurrent: 16, timeoutMs: 30000 });
		const trace = getGlobalScope().__NS_BOOT_TRACE__;
		expect(trace.kickstart).toMatchObject({ ok: true, meta: { mode: 'kickstart', fetched: 1 } });
	});

	it('skips the import-map fetch when a prior boot stage has already configured the runtime', async () => {
		const configureRuntime = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-4', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }));

		getGlobalScope().__NS_IMPORT_MAP_CONFIGURED__ = true;
		vi.stubGlobal('__NS_DEV__', { configureRuntime });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		// One fetch for the session descriptor itself; the import-map fetch is
		// short-circuited because the flag was already set.
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith('http://localhost:5173/__ns_dev__/session');
		expect(configureRuntime).not.toHaveBeenCalled();
	});

	it('instrumentation: emits a [ns-boot] timeline line on success when verbose is on', async () => {
		const configureRuntime = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-trace-ok', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			});

		vi.stubGlobal('__NS_DEV__', { configureRuntime });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		const lines = infoSpy.mock.calls.map((call) => String(call[0])).filter((line) => line.startsWith('[ns-boot]'));
		expect(lines, 'expected exactly one boot timeline line').toHaveLength(1);
		const line = lines[0];
		expect(line).toMatch(/^\[ns-boot\] ok total=\d+ms session=\d+ms importMap=\d+ms entry=\d+ms$/);

		// And the trace should be available on globalThis for post-boot inspection.
		const trace = getGlobalScope().__NS_BOOT_TRACE__;
		expect(trace).toBeDefined();
		expect(typeof trace.t0).toBe('number');
		expect(typeof trace.t1).toBe('number');
		expect(trace.session?.ok).toBe(true);
		expect(trace.importMap?.ok).toBe(true);
		expect(trace.entry?.ok).toBe(true);
	});

	it('instrumentation: stays silent on success when verbose is off but still publishes the trace', async () => {
		const configureRuntime = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-trace-quiet', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			});

		vi.stubGlobal('__NS_DEV__', { configureRuntime });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		const lines = infoSpy.mock.calls.map((call) => String(call[0])).filter((line) => line.startsWith('[ns-boot]'));
		expect(lines, 'no boot timeline line should leak when verbose is off').toEqual([]);

		// The trace itself should still be published for post-boot inspection.
		const trace = getGlobalScope().__NS_BOOT_TRACE__;
		expect(trace).toBeDefined();
		expect(typeof trace.t0).toBe('number');
		expect(typeof trace.t1).toBe('number');
		expect(trace.session?.ok).toBe(true);
	});

	it('instrumentation: emits a FAILED [ns-boot] line when the session fetch throws and verbose is on', async () => {
		const fetchMock = vi.fn().mockRejectedValue(new Error('boom'));
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await expect(startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true)).rejects.toThrow('boom');

		const bootLine = infoSpy.mock.calls.map((c) => String(c[0])).find((line) => line.startsWith('[ns-boot]'));
		expect(bootLine).toBeDefined();
		expect(bootLine!).toMatch(/^\[ns-boot\] FAILED total=\d+ms.*: boom$/);
		expect(bootLine!).not.toContain('session=');
		expect(bootLine!).not.toContain('entry=');
	});

	it('instrumentation: omits importMap segment when __NS_IMPORT_MAP_CONFIGURED__ short-circuits', async () => {
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-dedup', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }));

		getGlobalScope().__NS_IMPORT_MAP_CONFIGURED__ = true;
		vi.stubGlobal('__NS_DEV__', { configureRuntime: vi.fn() });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		const bootLine = infoSpy.mock.calls.map((c) => String(c[0])).find((line) => line.startsWith('[ns-boot]'));
		expect(bootLine).toBeDefined();
		expect(bootLine!).not.toContain('importMap=');
		expect(bootLine!).toContain('session=');
		expect(bootLine!).toContain('entry=');
	});

	// The "fluid boot progress" guarantees: the placeholder must keep
	// climbing during the entry import even when the injected snippet
	// hasn't ticked yet (early-window vendor download, long node_modules
	// stretch, etc.). The heartbeat in `startBootImportHeartbeat` is what
	// keeps the percentage moving — these tests pin the contract:
	//   1. session-bootstrap stamps `__NS_HMR_BOOT_IMPORT_STARTED_AT__` so
	//      the snippet's inline elapsed-time math agrees with the heartbeat;
	//   2. snippet ticks (which set the boot-progress globals) push the bar
	//      forward through `applyMonotonicBootProgress`; and
	//   3. the heartbeat picks the bar up after the snippet stalls and
	//      drives it via the time axis.
	it('boot heartbeat: stamps __NS_HMR_BOOT_IMPORT_STARTED_AT__ before the imports so the snippet shares a clock', async () => {
		const startedAtAtImport: { value: number | undefined } = { value: undefined };
		const importMock = vi.fn().mockImplementation(async () => {
			startedAtAtImport.value = getGlobalScope().__NS_HMR_BOOT_IMPORT_STARTED_AT__;
			return {};
		});
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-heartbeat-stamp' })));

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		expect(typeof startedAtAtImport.value).toBe('number');
		expect(startedAtAtImport.value!).toBeGreaterThan(0);
	});

	it('boot heartbeat: clearBootProgressState wipes stale globals before each boot so a re-bootstrap starts fresh', async () => {
		// Stage a leftover from a previous boot — the bar peaked at 92 last
		// time and the snippet logged 200 modules. Without the
		// `clearBootProgressState()` call inside `startBrowserRuntimeSession`,
		// the next boot would inherit those values and the bar would be
		// stuck at 92 from the very first frame.
		getGlobalScope().__NS_HMR_BOOT_MODULE_COUNT__ = 200;
		getGlobalScope().__NS_HMR_BOOT_LAST_MODULE__ = '/src/stale.ts';
		getGlobalScope().__NS_HMR_BOOT_LAST_PROGRESS__ = 92;
		const observed: { count: any; lastModule: any; lastProgress: any } = { count: 'unset', lastModule: 'unset', lastProgress: 'unset' };
		const importMock = vi.fn().mockImplementation(async () => {
			const g = getGlobalScope();
			observed.count = g.__NS_HMR_BOOT_MODULE_COUNT__;
			observed.lastModule = g.__NS_HMR_BOOT_LAST_MODULE__;
			observed.lastProgress = g.__NS_HMR_BOOT_LAST_PROGRESS__;
			return {};
		});
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-clear-stale' })));

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		// All three boot-progress markers should have been wiped by
		// `clearBootProgressState()` before the imports began. The heartbeat
		// may have ticked once and re-set `__NS_HMR_BOOT_LAST_PROGRESS__` to
		// the new floor (30), but it can never carry over the stale 92.
		expect(observed.count).toBeUndefined();
		expect(observed.lastModule).toBeUndefined();
		// Either undefined (heartbeat hasn't fired yet) or near the floor (30) —
		// never the stale 92 from the prior boot's terminal value.
		if (typeof observed.lastProgress === 'number') {
			expect(observed.lastProgress).toBeLessThanOrEqual(40);
		} else {
			expect(observed.lastProgress).toBeUndefined();
		}
	});

	it('boot heartbeat: drives the placeholder forward via setHmrBootStage while the entry import is awaiting', async () => {
		// Use fake timers so we can advance time deterministically and
		// observe the heartbeat ticks without flaky 250ms waits.
		vi.useFakeTimers();
		const overlayApi = ensureHmrDevOverlayRuntimeInstalled(false);
		const setBootStageSpy = vi.spyOn(overlayApi, 'setBootStage');

		// Resolve the entry import only when explicitly told to so we
		// can advance fake time inside the await window.
		let resolveEntry!: () => void;
		const entryPromise = new Promise<void>((resolve) => {
			resolveEntry = resolve;
		});
		vi.stubGlobal(
			'__NS_HMR_IMPORT__',
			vi.fn().mockImplementation((url: string) => {
				if (url === SESSION_DESCRIPTOR.entryUrl) return entryPromise;
				return Promise.resolve({});
			}),
		);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-heartbeat-tick' })));

		const sessionPromise = startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');
		// Let the session-fetch + import-map prep + imports kick off.
		await vi.runOnlyPendingTimersAsync();
		// Wipe the spy history so we only see heartbeat-driven ticks (not
		// the initial 'importing-main' assertion that runs synchronously
		// before the heartbeat starts).
		setBootStageSpy.mockClear();

		// Simulate the snippet bumping the module count + label, just like
		// a served module's self-gating boot-progress prelude evaluating
		// mid-boot.
		getGlobalScope().__NS_HMR_BOOT_MODULE_COUNT__ = 5;
		getGlobalScope().__NS_HMR_BOOT_LAST_MODULE__ = '/src/main.ts';

		// Advance past at least one heartbeat interval (250ms).
		await vi.advanceTimersByTimeAsync(300);

		const importingMainCalls = setBootStageSpy.mock.calls.filter((call) => call[0] === 'importing-main');
		expect(importingMainCalls.length).toBeGreaterThan(0);
		const lastInfo = importingMainCalls[importingMainCalls.length - 1][1] as any;
		// Detail should reflect the staged module count and last-module path.
		expect(lastInfo?.detail).toContain('Evaluated 5 modules');
		expect(lastInfo?.detail).toContain('/src/main.ts');
		// And the progress should ratchet to at least the floor (30) — under
		// the new wider 30→92 range. With count=5 and ~300ms elapsed the
		// formula yields 30 + floor(5/2) + floor(300/250) = 30 + 2 + 1 = 33,
		// but timer slop in fake-timer mode can extend that, so we only
		// require >= floor here. The strict count/time math is pinned by
		// `boot-progress.spec.ts`.
		expect(lastInfo?.progress).toBeGreaterThanOrEqual(30);

		resolveEntry();
		await sessionPromise;
	});

	it('boot heartbeat: stops ticking once the entry import resolves so it never collides with waiting-for-app', async () => {
		vi.useFakeTimers();
		const overlayApi = ensureHmrDevOverlayRuntimeInstalled(false);
		const setBootStageSpy = vi.spyOn(overlayApi, 'setBootStage');

		let resolveEntry!: () => void;
		const entryPromise = new Promise<void>((resolve) => {
			resolveEntry = resolve;
		});
		vi.stubGlobal(
			'__NS_HMR_IMPORT__',
			vi.fn().mockImplementation((url: string) => {
				if (url === SESSION_DESCRIPTOR.entryUrl) return entryPromise;
				return Promise.resolve({});
			}),
		);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-heartbeat-stop' })));

		const sessionPromise = startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');
		await vi.runOnlyPendingTimersAsync();
		// Let the heartbeat run for a bit so we can verify it stops cleanly.
		await vi.advanceTimersByTimeAsync(800);
		resolveEntry();
		await sessionPromise;
		setBootStageSpy.mockClear();

		// After the entry import resolves, the heartbeat must be cleared —
		// further timer advances should NOT produce more 'importing-main'
		// updates that would race the 'waiting-for-app' / 'app-root-committed'
		// transitions.
		await vi.advanceTimersByTimeAsync(2000);
		const stragglerImportingMain = setBootStageSpy.mock.calls.filter((call) => call[0] === 'importing-main');
		expect(stragglerImportingMain).toHaveLength(0);
	});

	it('sets __NS_IMPORT_MAP_CONFIGURED__ after a successful first configure so re-entrant bootstraps de-dup', async () => {
		const configureRuntime = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-5', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					importMap: { imports: { stacktrace: 'ns-vendor://stacktrace-js' } },
					volatilePatterns: ['?v='],
				}),
			});

		vi.stubGlobal('__NS_DEV__', { configureRuntime });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		expect(getGlobalScope().__NS_IMPORT_MAP_CONFIGURED__).toBeUndefined();
		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);
		expect(getGlobalScope().__NS_IMPORT_MAP_CONFIGURED__).toBe(true);
		expect(configureRuntime).toHaveBeenCalledTimes(1);
	});
});
