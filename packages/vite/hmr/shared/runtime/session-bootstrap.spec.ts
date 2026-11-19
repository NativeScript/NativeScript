import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getGlobalScope } from './global-scope.js';
import { NS_DEV_SYMBOL_KEY, nsDev } from './dev-globals.js';

let ensureHmrDevOverlayRuntimeInstalled: typeof import('./dev-overlay.js').ensureHmrDevOverlayRuntimeInstalled;
let startBrowserRuntimeSession: typeof import('./session-bootstrap.js').startBrowserRuntimeSession;
let setRestorePlaceholder: typeof import('./placeholder-hooks.js').setRestorePlaceholder;
let applyMonotonicBootProgress: typeof import('./boot-progress.js').applyMonotonicBootProgress;

// The import-map dedup, boot progress ratchet, placeholder hook and overlay
// state are module state: each case gets fresh instances, all from the same
// module graph.
beforeEach(async () => {
	vi.resetModules();
	({ ensureHmrDevOverlayRuntimeInstalled } = await import('./dev-overlay.js'));
	({ startBrowserRuntimeSession } = await import('./session-bootstrap.js'));
	({ setRestorePlaceholder } = await import('./placeholder-hooks.js'));
	({ applyMonotonicBootProgress } = await import('./boot-progress.js'));
});

const SESSION_DESCRIPTOR = {
	sessionId: 'session-1',
	origin: 'http://localhost:5173',
	clientUrl: 'http://localhost:5173/__ns_dev__/client',
	// The dev-server descriptor emits the CANONICAL (untagged) entry URL.
	entryUrl: 'http://localhost:5173/ns/v/src/main.ts',
	wsUrl: 'ws://localhost:5173/vite-hmr?token=abc',
	wsProtocol: 'vite-hmr',
	platform: 'ios',
} as const;

function sessionResponse(overrides: Record<string, unknown> = {}) {
	return {
		ok: true,
		json: async () => ({ ...SESSION_DESCRIPTOR, ...overrides }),
	};
}

// Stub the global CJS `require` so `ns:module` resolves to the given module
// object, mirroring how the device runtime provides the dev host API.
// Restored by `vi.unstubAllGlobals()` in afterEach.
function stubNsRuntime(api: Record<string, unknown>) {
	vi.stubGlobal('require', (specifier: string) => {
		if (specifier === 'ns:module') return api;
		throw new Error(`No such built-in module: ${specifier}`);
	});
}

// One successful boot that configures the runtime import map. Expects
// `ns:module` and `__NS_HMR_IMPORT__` to be stubbed already.
async function bootWithImportMap(sessionId: string) {
	vi.stubGlobal(
		'fetch',
		vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId, runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			}),
	);
	await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');
}

describe('browser runtime session bootstrap', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		vi.useRealTimers();
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
		delete getGlobalScope().__NS_HMR_IMPORT__;
	});

	it('applies session globals, imports client then entry, and waits for the real app root', async () => {
		const importedUrls: string[] = [];
		const importMock = vi.fn().mockImplementation(async (url: string) => {
			// Session globals must be visible to the imported client/entry.
			expect(nsDev().httpOrigin).toBe(SESSION_DESCRIPTOR.origin);
			importedUrls.push(url);
			return {};
		});
		const restorePlaceholder = vi.fn();
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		setRestorePlaceholder(restorePlaceholder);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse()));

		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		// Boot orchestration order: dev client first, entry second.
		expect(importedUrls).toEqual([SESSION_DESCRIPTOR.clientUrl, SESSION_DESCRIPTOR.entryUrl]);
		expect(restorePlaceholder).toHaveBeenCalledWith('session-active');
		expect(nsDev().httpOrigin).toBe('http://localhost:5173');
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'boot',
			phase: 'Waiting for the app root view',
			progress: 94,
		});
		expect(api.getSnapshot().detail).toContain('Waiting for the real app root');
	});

	it('arms the cold-boot gate via ns:module setDevBootComplete(false) before importing', async () => {
		const calls: Array<{ kind: string; value?: unknown }> = [];
		stubNsRuntime({
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
		const configureLoader = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-2', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					importMap: {
						imports: {
							stacktrace: 'http://localhost:5173/ns/m/node_modules/stacktrace-js',
						},
					},
					volatilePatterns: ['?v='],
				}),
			});

		stubNsRuntime({ configureLoader });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:5173/__ns_dev__/session');
		expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:5173/ns/import-map.json');
		expect(configureLoader).toHaveBeenCalledWith({
			importMap: {
				imports: {
					stacktrace: 'http://localhost:5173/ns/m/node_modules/stacktrace-js',
				},
			},
			volatilePatterns: ['?v='],
		});
		expect(configureLoader.mock.invocationCallOrder[0]).toBeLessThan(importMock.mock.invocationCallOrder[0]);
	});

	it('performs no prewarm/closure/archive fetches — the runtime async graph walk owns module fetching', async () => {
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi.fn().mockResolvedValue(sessionResponse());
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		const prewarmCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes('boot-closure') || String(c[0]).includes('boot-archive'));
		expect(prewarmCalls).toEqual([]);
		expect(importMock).toHaveBeenCalledTimes(2);
	});

	it('passes the server canonicalization vocabulary through to configureLoader when present', async () => {
		const configureLoader = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const canonicalization = {
			stripParams: ['t', 'v', 'import'],
			forPathPrefixes: ['/ns/', '/node_modules/.vite/', '/@id/', '/@fs/'],
			preserveQueryFor: ['/@ng/component'],
		};
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-canon', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: ['?v='], canonicalization }),
			});

		stubNsRuntime({ configureLoader });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		expect(configureLoader).toHaveBeenCalledWith({
			importMap: { imports: {} },
			volatilePatterns: ['?v='],
			canonicalization,
		});
	});

	it('skips the import-map fetch when a prior boot already configured the runtime', async () => {
		const configureLoader = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		stubNsRuntime({ configureLoader });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		await bootWithImportMap('session-4a');

		const fetchMock = vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-4b', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }));
		vi.stubGlobal('fetch', fetchMock);
		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		// One fetch for the session descriptor itself; the import-map fetch is
		// short-circuited because the first boot configured the runtime.
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith('http://localhost:5173/__ns_dev__/session');
		expect(configureLoader).toHaveBeenCalledTimes(1);
	});

	it('instrumentation: emits a [ns-boot] timeline line on success when verbose is on', async () => {
		const configureLoader = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-trace-ok', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			});

		stubNsRuntime({ configureLoader });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		const lines = infoSpy.mock.calls.map((call) => String(call[0])).filter((line) => line.startsWith('[ns-boot]'));
		expect(lines, 'expected exactly one boot timeline line').toHaveLength(1);
		const line = lines[0];
		expect(line).toMatch(/^\[ns-boot\] ok total=\d+ms session=\d+ms importMap=\d+ms entry=\d+ms$/);
	});

	it('instrumentation: stays silent on success when verbose is off', async () => {
		const configureLoader = vi.fn();
		const importMock = vi.fn().mockResolvedValue({});
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(sessionResponse({ sessionId: 'session-trace-quiet', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' }))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ importMap: { imports: {} }, volatilePatterns: [] }),
			});

		stubNsRuntime({ configureLoader });
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', fetchMock);
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		const lines = infoSpy.mock.calls.map((call) => String(call[0])).filter((line) => line.startsWith('[ns-boot]'));
		expect(lines, 'no boot timeline line should leak when verbose is off').toEqual([]);
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

	it('instrumentation: omits importMap segment when an earlier boot already configured the runtime', async () => {
		stubNsRuntime({ configureLoader: vi.fn() });
		vi.stubGlobal('__NS_HMR_IMPORT__', vi.fn().mockResolvedValue({}));
		await bootWithImportMap('session-dedup-first');

		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-dedup', runtimeConfigUrl: 'http://localhost:5173/ns/import-map.json' })));
		const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session', true);

		const bootLine = infoSpy.mock.calls.map((c) => String(c[0])).find((line) => line.startsWith('[ns-boot]'));
		expect(bootLine).toBeDefined();
		expect(bootLine!).not.toContain('importMap=');
		expect(bootLine!).toContain('session=');
		expect(bootLine!).toContain('entry=');
	});

	// The placeholder must keep climbing during the entry import. The
	// heartbeat in `startBootImportHeartbeat` drives the percentage from
	// elapsed time; these tests pin that it starts from a fresh ratchet,
	// ticks while the entry import is pending, and stops once it resolves.
	it('boot heartbeat: clearBootProgressState resets the ratchet before each boot so a re-bootstrap starts fresh', async () => {
		// A previous boot left the bar at 92; without the reset the next boot
		// would start pinned there.
		applyMonotonicBootProgress(92);
		const observed: { lastProgress: number | null } = { lastProgress: null };
		const importMock = vi.fn().mockImplementation(async () => {
			observed.lastProgress = applyMonotonicBootProgress(0);
			return {};
		});
		vi.stubGlobal('__NS_HMR_IMPORT__', importMock);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sessionResponse({ sessionId: 'session-clear-stale' })));

		await startBrowserRuntimeSession('http://localhost:5173/__ns_dev__/session');

		// Zero (heartbeat hasn't fired yet) or near the floor (30) — never the
		// stale 92 from the prior boot's terminal value.
		expect(observed.lastProgress).toBeLessThanOrEqual(40);
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

		// Advance past at least one heartbeat interval (250ms).
		await vi.advanceTimersByTimeAsync(300);

		const importingMainCalls = setBootStageSpy.mock.calls.filter((call) => call[0] === 'importing-main');
		expect(importingMainCalls.length).toBeGreaterThan(0);
		const lastInfo = importingMainCalls[importingMainCalls.length - 1][1] as any;
		expect(lastInfo?.detail).toBe('Loading the module graph…');
		// Timer slop in fake-timer mode can push past the exact value, so only
		// require the floor here; the time math is pinned by `boot-progress.spec.ts`.
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
});
