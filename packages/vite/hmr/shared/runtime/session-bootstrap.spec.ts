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
		delete (globalThis as any).__nsStartDevSession;
		delete (globalThis as any).__nsConfigureRuntime;
		delete (globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__;
	});

	it('waits for the real app root after __nsStartDevSession resolves', async () => {
		const startDevSession = vi.fn().mockResolvedValue(undefined);
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

		vi.stubGlobal('__nsConfigureRuntime', configureRuntime);
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
});
