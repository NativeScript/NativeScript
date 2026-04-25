import { afterEach, describe, expect, it, vi } from 'vitest';
import { ensureHmrDevOverlayRuntimeInstalled } from './dev-overlay.js';
import { startBrowserRuntimeSession } from './session-bootstrap.js';

describe('browser runtime session bootstrap', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
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
					entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
					entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
					entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
				entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
				entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
					entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
					entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
				entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
					entryUrl: 'http://localhost:5173/ns/m/src/main.ts',
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
