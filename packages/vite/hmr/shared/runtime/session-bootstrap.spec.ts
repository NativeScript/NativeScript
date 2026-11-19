import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @nativescript/core can't evaluate in Node: a stand-in Application whose
// launch the tests drive.
const app = vi.hoisted(() => {
	const listeners = new Set<(args?: unknown) => void>();
	return {
		launchEvent: 'launch',
		started: false,
		launched: false,
		listeners,
		hasLaunched(): boolean {
			return this.launched;
		},
		on(_event: string, listener: (args?: unknown) => void) {
			listeners.add(listener);
		},
		off(_event: string, listener: (args?: unknown) => void) {
			listeners.delete(listener);
		},
		launch() {
			this.launched = true;
			for (const listener of [...listeners]) listener();
		},
	};
});
vi.mock('@nativescript/core/application', () => ({ Application: app }));
vi.mock('@nativescript/core/color', () => ({}));
vi.mock('@nativescript/core/ui', () => ({}));

import { getGlobalScope } from './global-scope.js';
import { NS_DEV_SYMBOL_KEY, nsDev } from './dev-globals.js';

let startBrowserRuntimeSession: typeof import('./session-bootstrap.js').startBrowserRuntimeSession;

const URLS = { sessionUrl: 'http://localhost:5173/__ns_dev__/session.mjs', importMapUrl: 'http://localhost:5173/__ns_dev__/import-map.mjs' };

const SESSION = {
	sessionId: 'session-1',
	origin: 'http://localhost:5173',
	clientUrl: 'http://localhost:5173/@id/__x00__virtual:ns-dev-client',
	entryUrl: 'http://localhost:5173/src/main.ts',
	wsUrl: 'ws://localhost:5173/vite-hmr?token=abc',
	wsProtocol: 'vite-hmr',
	platform: 'ios',
} as const;

const LOADER_CONFIG = { importMap: { imports: { '@nativescript/core': 'http://localhost:5173/node_modules/@nativescript/core/index.js' } }, volatilePatterns: ['/@ng/component'], canonicalization: { preserveQueryFor: ['/@ng/component'] } };

function stubRuntime(api: Record<string, unknown>) {
	vi.doMock('ns:module', () => ({ default: api }));
}

function modules(overrides: Record<string, () => Promise<unknown>> = {}) {
	const imported: string[] = [];
	const importModule = vi.fn(async (url: string) => {
		imported.push(url);
		if (overrides[url]) return overrides[url]();
		if (url === URLS.sessionUrl) return { default: SESSION };
		if (url === URLS.importMapUrl) return { default: LOADER_CONFIG };
		return {};
	});
	return { imported, importModule };
}

beforeEach(async () => {
	vi.resetModules();
	app.started = false;
	app.launched = false;
	app.listeners.clear();
	({ startBrowserRuntimeSession } = await import('./session-bootstrap.js'));
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.doUnmock('ns:module');
	vi.useRealTimers();
	delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
});

describe('startBrowserRuntimeSession', () => {
	it('loads the session and loader config as modules, installs the import map, then imports the dev client and the entry', async () => {
		const configureLoader = vi.fn();
		stubRuntime({ configureLoader });
		const { imported, importModule } = modules({
			[SESSION.clientUrl]: async () => {
				expect(configureLoader).toHaveBeenCalledWith(LOADER_CONFIG);
				expect(nsDev().httpOrigin).toBe(SESSION.origin);
				return {};
			},
		});

		await expect(startBrowserRuntimeSession(URLS, false, { importModule })).resolves.toBeUndefined();

		expect(imported.slice(0, 2).sort()).toEqual([URLS.importMapUrl, URLS.sessionUrl].sort());
		expect(imported.slice(2)).toEqual([SESSION.clientUrl, SESSION.entryUrl]);
	});

	it('loads the session and the loader config concurrently', async () => {
		stubRuntime({ configureLoader: vi.fn() });
		let releaseSession!: () => void;
		const { imported, importModule } = modules({ [URLS.sessionUrl]: () => new Promise((resolve) => (releaseSession = () => resolve({ default: SESSION }))) });
		const boot = startBrowserRuntimeSession(URLS, false, { importModule });
		await Promise.resolve();
		expect(imported).toEqual([URLS.sessionUrl, URLS.importMapUrl]);
		releaseSession();
		await boot;
	});

	it('marks boot complete on the tick after the app launches', async () => {
		vi.useFakeTimers();
		stubRuntime({ configureLoader: vi.fn() });
		await startBrowserRuntimeSession(URLS, false, modules());
		expect(nsDev().bootComplete).toBeUndefined();
		app.launch();
		expect(nsDev().bootComplete).toBeUndefined();
		await vi.runAllTimersAsync();
		expect(nsDev().bootComplete).toBe(true);
		expect(app.listeners.size).toBe(0);
	});

	it('marks boot complete when the app launched before the entry import', async () => {
		vi.useFakeTimers();
		app.launched = true;
		stubRuntime({ configureLoader: vi.fn() });
		await startBrowserRuntimeSession(URLS, false, modules());
		await vi.runAllTimersAsync();
		expect(nsDev().bootComplete).toBe(true);
	});

	it('resolves the failure, without rejecting, when the boot fails before the entry called run', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		stubRuntime({ configureLoader: vi.fn() });
		const entryError = new Error('boom');
		const failure = await startBrowserRuntimeSession(URLS, false, modules({ [SESSION.entryUrl]: () => Promise.reject(entryError) }));
		expect(failure).toEqual({ message: 'boom', stack: entryError.stack });
		// The fallback screen's launch must not start the HMR client.
		expect(app.listeners.size).toBe(0);
	});

	it('resolves no failure when the entry already called run before failing: the app launches anyway', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		stubRuntime({ configureLoader: vi.fn() });
		const failure = await startBrowserRuntimeSession(
			URLS,
			false,
			modules({
				[SESSION.entryUrl]: () => {
					app.started = true;
					return Promise.reject(new Error('after run'));
				},
			}),
		);
		expect(failure).toBeUndefined();
	});

	it('fails on a session descriptor missing required fields', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		stubRuntime({ configureLoader: vi.fn() });
		const { imported, importModule } = modules({ [URLS.sessionUrl]: async () => ({ default: { origin: SESSION.origin } }) });
		const failure = await startBrowserRuntimeSession(URLS, false, { importModule });
		expect(failure?.message).toMatch(/sessionId|session/i);
		expect(imported).not.toContain(SESSION.entryUrl);
	});

	it('logs the boot timeline when verbose, and stays silent otherwise', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		stubRuntime({ configureLoader: vi.fn() });
		await startBrowserRuntimeSession(URLS, false, modules());
		expect(info).not.toHaveBeenCalled();
		await startBrowserRuntimeSession(URLS, true, modules());
		const lines = info.mock.calls.map((call) => String(call[0]));
		expect(lines.some((line) => /^\[ns-boot\] ok total=\d+ms session=\d+ms importMap=\d+ms entry=\d+ms$/.test(line))).toBe(true);
		expect(lines.some((line) => /^\[ns-entry\] entry evaluated t=\d+$/.test(line))).toBe(true);
	});

	it('logs a FAILED timeline line on a failure when verbose', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		stubRuntime({ configureLoader: vi.fn() });
		await startBrowserRuntimeSession(URLS, true, modules({ [URLS.importMapUrl]: () => Promise.reject(new Error('offline')) }));
		expect(info.mock.calls.map((call) => String(call[0])).some((line) => /^\[ns-boot\] FAILED total=\d+ms: offline$/.test(line))).toBe(true);
	});

	it('reports a missing configureLoader loudly and still boots', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		stubRuntime({});
		await expect(startBrowserRuntimeSession(URLS, false, modules())).resolves.toBeUndefined();
		expect(error.mock.calls[0][0]).toContain('configureLoader is unavailable');
	});
});
