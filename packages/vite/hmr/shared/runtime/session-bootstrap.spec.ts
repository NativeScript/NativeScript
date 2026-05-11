import { afterEach, describe, expect, it, vi } from 'vitest';
import { ensureHmrDevOverlayRuntimeInstalled } from './dev-overlay.js';
import { startBrowserRuntimeSession } from './session-bootstrap.js';

describe('browser runtime session bootstrap', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		vi.useRealTimers();
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
		delete (globalThis as any).__NS_HTTP_ORIGIN__;
		delete (globalThis as any).__NS_HMR_WS_URL__;
		delete (globalThis as any).__NS_HMR_BOOT_COMPLETE__;
		delete (globalThis as any).__NS_EXPERIMENTAL_NATIVE_RUNTIME_CONFIG_URL__;
		delete (globalThis as any).__nsSupportsRuntimeConfigUrl;
		delete (globalThis as any).__nsStartDevSession;
		delete (globalThis as any).__nsConfigureDevRuntime;
		delete (globalThis as any).__nsConfigureRuntime;
		delete (globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__;
		// clear the shared dedup flag between tests so each case
		// exercises the import-map fetch path independently.
		delete (globalThis as any).__NS_IMPORT_MAP_CONFIGURED__;
		// Boot timeline trace is mirrored onto globalThis for post-boot
		// inspection — reset it so each test sees a clean slate.
		delete (globalThis as any).__NS_BOOT_TRACE__;
		// Boot-progress globals (snippet + heartbeat ratchet) are reset by
		// `clearBootProgressState` inside `startBrowserRuntimeSession`, but
		// some tests stage these directly so wipe them defensively here too.
		delete (globalThis as any).__NS_HMR_BOOT_MODULE_COUNT__;
		delete (globalThis as any).__NS_HMR_BOOT_LAST_MODULE__;
		delete (globalThis as any).__NS_HMR_BOOT_LAST_PROGRESS__;
		delete (globalThis as any).__NS_HMR_BOOT_LAST_PROGRESS_AT__;
		delete (globalThis as any).__NS_HMR_BOOT_IMPORT_STARTED_AT__;
	});

	it('waits for the real app root after __nsStartDevSession resolves', async () => {
		const startDevSession = vi.fn().mockImplementation(async (session) => {
			expect((globalThis as any).__NS_HTTP_ORIGIN__).toBeUndefined();
			expect((globalThis as any).__NS_HMR_WS_URL__).toBeUndefined();
			expect((globalThis as any).__NS_HMR_BOOT_COMPLETE__).toBeUndefined();
			(globalThis as any).__NS_HTTP_ORIGIN__ = session.origin;
			(globalThis as any).__NS_HMR_WS_URL__ = session.wsUrl;
			(globalThis as any).__NS_HMR_BOOT_COMPLETE__ = false;
		});
		const restorePlaceholder = vi.fn();
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		(globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__ = restorePlaceholder;
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					sessionId: 'session-1',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/@ns/client',
					// The dev-server descriptor wraps the main entry in
					// `__ns_boot__/b1` so the boot-progress snippet propagates
					// across the cold-boot module graph. The canonicalizer in
					// the iOS runtime strips the wrapper before keying the
					// module registry — see `rewriteNsMImportPathForHmr`.
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173',
					platform: 'ios',
				}),
			}),
		);

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(startDevSession).toHaveBeenCalledTimes(1);
		expect(restorePlaceholder).toHaveBeenCalledWith('session-active');
		expect((globalThis as any).__NS_HTTP_ORIGIN__).toBe('http://localhost:5173');
		expect((globalThis as any).__NS_HMR_WS_URL__).toBe('ws://localhost:5173');
		expect((globalThis as any).__NS_HMR_BOOT_COMPLETE__).toBe(false);
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'boot',
			phase: 'Waiting for the app root view',
			progress: 94,
		});
		expect(api.getSnapshot().detail).toContain('Waiting for the real app root');
	});

	it('configures the runtime import map before invoking __nsStartDevSession', async () => {
		const configureRuntime = vi.fn();
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					sessionId: 'session-2',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
					runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
				}),
			})
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

		vi.stubGlobal('__nsConfigureDevRuntime', configureRuntime);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
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
		expect(configureRuntime.mock.invocationCallOrder[0]).toBeLessThan(startDevSession.mock.invocationCallOrder[0]);
	});

	it('keeps JS runtime-config loading as the default even when the runtime advertises support', async () => {
		const configureRuntime = vi.fn();
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					sessionId: 'session-3',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
					runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
				}),
			})
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

		vi.stubGlobal('__nsSupportsRuntimeConfigUrl', true);
		vi.stubGlobal('__nsConfigureDevRuntime', configureRuntime);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:5173/__ns_dev__/session');
		expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:5173/ns/import-map.json');
		expect(configureRuntime).toHaveBeenCalledTimes(1);
		expect(startDevSession).toHaveBeenCalledWith(
			expect.objectContaining({
				runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
			}),
		);
	});

	it('delegates runtime config loading to the native session start only when explicitly enabled', async () => {
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				sessionId: 'session-3',
				origin: 'http://localhost:5173',
				clientUrl: 'http://localhost:5173/__ns_dev__/client',
				entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
				wsUrl: 'ws://localhost:5173/ns-hmr',
				platform: 'ios',
				runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
			}),
		});

		(globalThis as any).__NS_EXPERIMENTAL_NATIVE_RUNTIME_CONFIG_URL__ = true;
		vi.stubGlobal('__nsSupportsRuntimeConfigUrl', true);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith('http://localhost:5173/__ns_dev__/session');
		expect(startDevSession).toHaveBeenCalledWith(
			expect.objectContaining({
				runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
			}),
		);
	});

	it('skips the import-map fetch when a prior boot stage has already configured the runtime', async () => {
		const configureRuntime = vi.fn();
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				sessionId: 'session-4',
				origin: 'http://localhost:5173',
				clientUrl: 'http://localhost:5173/__ns_dev__/client',
				entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
				wsUrl: 'ws://localhost:5173/ns-hmr',
				platform: 'ios',
				runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
			}),
		});

		(globalThis as any).__NS_IMPORT_MAP_CONFIGURED__ = true;
		vi.stubGlobal('__nsConfigureDevRuntime', configureRuntime);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
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
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					sessionId: 'session-trace-ok',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
					runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			});

		vi.stubGlobal('__nsConfigureDevRuntime', configureRuntime);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		const lines = infoSpy.mock.calls.map((call) => String(call[0])).filter((line) => line.startsWith('[ns-boot]'));
		expect(lines, 'expected exactly one boot timeline line').toHaveLength(1);
		const line = lines[0];
		expect(line).toMatch(/^\[ns-boot\] ok total=\d+ms session=\d+ms importMap=\d+ms native=\d+ms$/);

		// And the trace should be available on globalThis for post-boot inspection.
		const trace = (globalThis as any).__NS_BOOT_TRACE__;
		expect(trace).toBeDefined();
		expect(typeof trace.t0).toBe('number');
		expect(typeof trace.t1).toBe('number');
		expect(trace.session?.ok).toBe(true);
		expect(trace.importMap?.ok).toBe(true);
		expect(trace.native?.ok).toBe(true);
	});

	it('instrumentation: stays silent on success when verbose is off but still publishes the trace', async () => {
		const configureRuntime = vi.fn();
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					sessionId: 'session-trace-quiet',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
					runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			});

		vi.stubGlobal('__nsConfigureDevRuntime', configureRuntime);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		const lines = infoSpy.mock.calls.map((call) => String(call[0])).filter((line) => line.startsWith('[ns-boot]'));
		expect(lines, 'no boot timeline line should leak when verbose is off').toEqual([]);

		// The trace itself should still be published for post-boot inspection.
		const trace = (globalThis as any).__NS_BOOT_TRACE__;
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
		expect(bootLine!).not.toContain('native=');
	});

	it('instrumentation: omits importMap segment when __NS_IMPORT_MAP_CONFIGURED__ short-circuits', async () => {
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				sessionId: 'session-dedup',
				origin: 'http://localhost:5173',
				clientUrl: 'http://localhost:5173/__ns_dev__/client',
				entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
				wsUrl: 'ws://localhost:5173/ns-hmr',
				platform: 'ios',
				runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
			}),
		});

		(globalThis as any).__NS_IMPORT_MAP_CONFIGURED__ = true;
		vi.stubGlobal('__nsConfigureDevRuntime', vi.fn());
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		const bootLine = infoSpy.mock.calls.map((c) => String(c[0])).find((line) => line.startsWith('[ns-boot]'));
		expect(bootLine).toBeDefined();
		expect(bootLine!).not.toContain('importMap=');
		expect(bootLine!).toContain('session=');
		expect(bootLine!).toContain('native=');
	});

	// The "fluid boot progress" guarantees: the placeholder must keep
	// climbing during `__nsStartDevSession` even when the injected snippet
	// hasn't ticked yet (early-window vendor download, long node_modules
	// stretch, etc.). The heartbeat in `startBootImportHeartbeat` is what
	// keeps the percentage moving — these tests pin the contract:
	//   1. session-bootstrap stamps `__NS_HMR_BOOT_IMPORT_STARTED_AT__` so
	//      the snippet's inline elapsed-time math agrees with the heartbeat;
	//   2. snippet ticks (which set the boot-progress globals) push the bar
	//      forward through `applyMonotonicBootProgress`; and
	//   3. the heartbeat picks the bar up after the snippet stalls and
	//      drives it via the time axis.
	it('boot heartbeat: stamps __NS_HMR_BOOT_IMPORT_STARTED_AT__ before invoking __nsStartDevSession so the snippet shares a clock', async () => {
		const startedAtAtNativeCall: { value: number | undefined } = { value: undefined };
		const startDevSession = vi.fn().mockImplementation(async () => {
			startedAtAtNativeCall.value = (globalThis as any).__NS_HMR_BOOT_IMPORT_STARTED_AT__;
		});
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				sessionId: 'session-heartbeat-stamp',
				origin: 'http://localhost:5173',
				clientUrl: 'http://localhost:5173/__ns_dev__/client',
				entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
				wsUrl: 'ws://localhost:5173/ns-hmr',
				platform: 'ios',
			}),
		});
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		expect(typeof startedAtAtNativeCall.value).toBe('number');
		expect(startedAtAtNativeCall.value!).toBeGreaterThan(0);
	});

	it('boot heartbeat: clearBootProgressState wipes stale globals before each boot so a re-bootstrap starts fresh', async () => {
		// Stage a leftover from a previous boot — the bar peaked at 92 last
		// time and the snippet logged 200 modules. Without the
		// `clearBootProgressState()` call inside `startBrowserRuntimeSession`,
		// the next boot would inherit those values and the bar would be
		// stuck at 92 from the very first frame.
		(globalThis as any).__NS_HMR_BOOT_MODULE_COUNT__ = 200;
		(globalThis as any).__NS_HMR_BOOT_LAST_MODULE__ = '/src/stale.ts';
		(globalThis as any).__NS_HMR_BOOT_LAST_PROGRESS__ = 92;
		const observed: { count: any; lastModule: any; lastProgress: any } = { count: 'unset', lastModule: 'unset', lastProgress: 'unset' };
		const startDevSession = vi.fn().mockImplementation(async () => {
			const g = globalThis as any;
			observed.count = g.__NS_HMR_BOOT_MODULE_COUNT__;
			observed.lastModule = g.__NS_HMR_BOOT_LAST_MODULE__;
			observed.lastProgress = g.__NS_HMR_BOOT_LAST_PROGRESS__;
		});
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				sessionId: 'session-clear-stale',
				origin: 'http://localhost:5173',
				clientUrl: 'http://localhost:5173/__ns_dev__/client',
				entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
				wsUrl: 'ws://localhost:5173/ns-hmr',
				platform: 'ios',
			}),
		});
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		// All three boot-progress markers should have been wiped by
		// `clearBootProgressState()` before native session start. The heartbeat
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

	it('boot heartbeat: drives the placeholder forward via setHmrBootStage while __nsStartDevSession is awaiting', async () => {
		// Use fake timers so we can advance time deterministically and
		// observe the heartbeat ticks without flaky 250ms waits.
		vi.useFakeTimers();
		const overlayApi = ensureHmrDevOverlayRuntimeInstalled(false);
		const setBootStageSpy = vi.spyOn(overlayApi, 'setBootStage');

		// Resolve __nsStartDevSession only when explicitly told to so we
		// can advance fake time inside the await window.
		let resolveNative!: () => void;
		const nativePromise = new Promise<void>((resolve) => {
			resolveNative = resolve;
		});
		vi.stubGlobal(
			'__nsStartDevSession',
			vi.fn().mockImplementation(() => nativePromise),
		);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					sessionId: 'session-heartbeat-tick',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
				}),
			}),
		);

		const sessionPromise = startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');
		// Let the session-fetch + import-map prep + native call kick off.
		await vi.runOnlyPendingTimersAsync();
		// Wipe the spy history so we only see heartbeat-driven ticks (not
		// the initial 'importing-main' assertion that runs synchronously
		// before the heartbeat starts).
		setBootStageSpy.mockClear();

		// Simulate the snippet bumping the module count + label, just like
		// a `__ns_boot__/b1`-tagged module evaluating mid-boot.
		(globalThis as any).__NS_HMR_BOOT_MODULE_COUNT__ = 5;
		(globalThis as any).__NS_HMR_BOOT_LAST_MODULE__ = '/src/main.ts';

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

		resolveNative();
		await sessionPromise;
	});

	it('boot heartbeat: stops ticking once __nsStartDevSession resolves so it never collides with waiting-for-app', async () => {
		vi.useFakeTimers();
		const overlayApi = ensureHmrDevOverlayRuntimeInstalled(false);
		const setBootStageSpy = vi.spyOn(overlayApi, 'setBootStage');

		let resolveNative!: () => void;
		const nativePromise = new Promise<void>((resolve) => {
			resolveNative = resolve;
		});
		vi.stubGlobal(
			'__nsStartDevSession',
			vi.fn().mockImplementation(() => nativePromise),
		);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					sessionId: 'session-heartbeat-stop',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
				}),
			}),
		);

		const sessionPromise = startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');
		await vi.runOnlyPendingTimersAsync();
		// Let the heartbeat run for a bit so we can verify it stops cleanly.
		await vi.advanceTimersByTimeAsync(800);
		resolveNative();
		await sessionPromise;
		setBootStageSpy.mockClear();

		// After the native call resolves, the heartbeat must be cleared —
		// further timer advances should NOT produce more 'importing-main'
		// updates that would race the 'waiting-for-app' / 'app-root-committed'
		// transitions.
		await vi.advanceTimersByTimeAsync(2000);
		const stragglerImportingMain = setBootStageSpy.mock.calls.filter((call) => call[0] === 'importing-main');
		expect(stragglerImportingMain).toHaveLength(0);
	});

	it('sets __NS_IMPORT_MAP_CONFIGURED__ after a successful first configure so re-entrant bootstraps de-dup', async () => {
		const configureRuntime = vi.fn();
		const startDevSession = vi.fn().mockResolvedValue(undefined);
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					sessionId: 'session-5',
					origin: 'http://localhost:5173',
					clientUrl: 'http://localhost:5173/__ns_dev__/client',
					entryUrl: 'http://localhost:5173/ns/m/__ns_boot__/b1/src/main.ts',
					wsUrl: 'ws://localhost:5173/ns-hmr',
					platform: 'ios',
					runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json',
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					importMap: { imports: { stacktrace: 'ns-vendor://stacktrace-js' } },
					volatilePatterns: ['?v='],
				}),
			});

		vi.stubGlobal('__nsConfigureDevRuntime', configureRuntime);
		vi.stubGlobal('__nsStartDevSession', startDevSession);
		vi.stubGlobal('fetch', fetchMock);

		expect((globalThis as any).__NS_IMPORT_MAP_CONFIGURED__).toBeUndefined();
		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);
		expect((globalThis as any).__NS_IMPORT_MAP_CONFIGURED__).toBe(true);
		expect(configureRuntime).toHaveBeenCalledTimes(1);
	});
});
