import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleAngularHotUpdateMessage } from './index.js';
import { getGlobalScope } from '../../../shared/runtime/global-scope.js';
import type { NsHotRegistry } from '../../../client/hot-context.js';

// Specs in this file fake the runtime primitives as members of the
// `__NS_DEV__` namespace object; seed it once so member-level
// save/restore never dereferences `undefined`.
getGlobalScope().__NS_DEV__ ??= {};

// Minimal fake for the JS hot registry (`globalThis.__NS_HOT_REGISTRY__`).
// The angular client reads it through `getNsHotRegistry()`, which returns
// any pre-installed object with a `createHotContext` function — so specs
// can stub exactly the members a test drives and leave the rest inert.
function makeFakeHotRegistry(overrides: Partial<NsHotRegistry> = {}): NsHotRegistry {
	return {
		createHotContext: () => ({ data: {}, accept() {}, acceptExports() {}, dispose() {}, prune() {}, decline() {}, invalidate() {}, on() {}, off() {}, send() {} }),
		canonicalHotKey: (id: string) => id,
		runDispose: () => 0,
		runPrune: () => 0,
		hasDeclined: () => false,
		dispatchHotEvent: () => 0,
		listHotEventListeners: () => ({}),
		setSendToServer: () => {},
		setFullReloadHandler: () => {},
		requestFullReload: () => {},
		...overrides,
	};
}

describe('handleAngularHotUpdateMessage', () => {
	let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleInfoSpy.mockRestore();
	});

	it('bumps the HMR import nonce before rebooting Angular modules', async () => {
		const reboot = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousNonce = g.__NS_HMR_IMPORT_NONCE__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT_NONCE__ = 4;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			expect(handled).toBe(true);
			expect(g.__NS_HMR_IMPORT_NONCE__).toBe(5);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT_NONCE__ = previousNonce;
		}
	});

	it('applies a deferred Tailwind app.css update inside the Angular cycle before reboot', async () => {
		const order: string[] = [];
		const reboot = vi.fn(() => order.push('reboot'));
		const applyCssUpdates = vi.fn(async () => {
			order.push('css');
		});
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		g.__reboot_ng_modules__ = reboot;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					origin: 'http://localhost:5173',
					cssUpdates: [{ type: 'css-update', path: '/src/app.css', acceptedPath: '/src/app.css', timestamp: 123 }],
				},
				{ getCore: () => undefined, verbose: false, applyCssUpdates },
			);

			expect(handled).toBe(true);
			expect(applyCssUpdates).toHaveBeenCalledTimes(1);
			expect(order).toEqual(['css', 'reboot']);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
		}
	});

	// Stable URL + Explicit Invalidation.
	//
	// When the server emits an `evictPaths` array, the client must:
	//   1. Hand the eviction set to the runtime BEFORE the entry import.
	//   2. Re-import the entry under its STABLE canonical URL (no
	//      `__ns_hmr__/v<N>/` segment — module identity IS the URL).
	// The eviction is the only thing forcing a re-fetch: it drops V8's
	// registry entry and arms the runtime's bust-next-fetch nonce.
	it('hands the eviction set to the runtime and imports the stable entry URL', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;
		const previousRegisterOnly = g.__NS_ANGULAR_HMR_REGISTER_ONLY__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			const evictPaths = ['http://localhost:5173/ns/m/src/app/foo.component.ts', 'http://localhost:5173/ns/m/src/main.ts'];
			const handled = await handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update', version: 408, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			expect(handled).toBe(true);
			expect(invalidator).toHaveBeenCalledTimes(1);
			expect(invalidator).toHaveBeenCalledWith(evictPaths);
			// Stable URL: no __ns_hmr__/v408/ segment.
			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/src/main.ts');
			// Eviction must run BEFORE the entry import so V8's import()
			// walks a freshly-evicted graph instead of returning cached
			// (pre-edit) module instances.
			const invalidatorOrder = invalidator.mock.invocationCallOrder[0];
			const importerOrder = importer.mock.invocationCallOrder[0];
			expect(invalidatorOrder).toBeLessThan(importerOrder);
			expect(reboot).toHaveBeenCalledWith(true);
			expect(g.__NS_ANGULAR_HMR_REGISTER_ONLY__).toBe(false);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = previousRegisterOnly;
		}
	});

	it('still imports the stable canonical URL when the runtime lacks __NS_DEV__.invalidateModules', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;
		const previousRegisterOnly = g.__NS_ANGULAR_HMR_REGISTER_ONLY__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		delete g.__NS_DEV__.invalidateModules;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 12,
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/main.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			expect(handled).toBe(true);
			// Canonical URL even without eviction — there is no
			// URL-versioning fallback anymore (a tagged URL would mint a
			// second module identity on the runtime).
			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/src/main.ts');
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = previousRegisterOnly;
		}
	});

	it('survives __NS_DEV__.invalidateModules throwing without breaking the import flow', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn(() => {
			throw new Error('native bridge boom');
		});
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 9,
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/main.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			expect(handled).toBe(true);
			expect(invalidator).toHaveBeenCalled();
			// Eviction failed → still the stable canonical URL.
			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/src/main.ts');
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
		}
	});

	// Cycle serialization mutex.
	//
	// Two saves arriving in the same JS turn (or one cycle's import()
	// awaiting while another save lands) must NOT overlap their evict
	// + import phases. Cycle B should observe cycle A's reboot before
	// it starts its own evict.
	it('serializes overlapping HMR cycles via the in-flight mutex', async () => {
		const reboot = vi.fn();
		let resolveImporter1!: () => void;
		const importer = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise<void>((resolve) => {
						resolveImporter1 = resolve;
					}),
			)
			.mockImplementationOnce(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			const cycle1 = handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 1,
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/foo.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			// Yield once so cycle 1 starts and parks in importer #1.
			await Promise.resolve();
			await Promise.resolve();

			expect(invalidator).toHaveBeenCalledTimes(1);
			expect(invalidator.mock.calls[0][0]).toEqual(['http://localhost:5173/ns/m/src/foo.ts']);

			const cycle2 = handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 2,
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/bar.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			// Yield. Cycle 2 must NOT have invalidated yet — it's blocked
			// behind cycle 1's mutex.
			await Promise.resolve();
			await Promise.resolve();

			expect(invalidator).toHaveBeenCalledTimes(1);

			// Unblock cycle 1's importer.
			resolveImporter1();
			await cycle1;

			// Cycle 2 should now drain.
			await cycle2;

			expect(invalidator).toHaveBeenCalledTimes(2);
			expect(invalidator.mock.calls[1][0]).toEqual(['http://localhost:5173/ns/m/src/bar.ts']);
			expect(reboot).toHaveBeenCalledTimes(2);

			// Cycle 1's invalidate must precede cycle 2's invalidate.
			const order1 = invalidator.mock.invocationCallOrder[0];
			const order2 = invalidator.mock.invocationCallOrder[1];
			expect(order1).toBeLessThan(order2);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
		}
	});

	it('uses the importerEntry from the broadcast message when present', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/app/main.ts'],
					importerEntry: '/app/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/app/main.ts');
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
		}
	});

	it('emits a single-line update timing log (ok path) including refresh/reboot/total ms', async () => {
		const reboot = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;

		g.__reboot_ng_modules__ = reboot;

		try {
			await handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update', path: '/src/foo.ts' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			const calls = consoleInfoSpy.mock.calls.filter((args) => typeof args[0] === 'string' && (args[0] as string).startsWith('[ns-hmr][angular]'));
			expect(calls.length, 'expected exactly one [ns-hmr][angular] log line').toBe(1);
			const line = calls[0][0] as string;
			expect(line).toContain('[ns-hmr][angular] ok');
			expect(line).toContain('file=/src/foo.ts');
			expect(line).toMatch(/refresh=\d+ms/);
			expect(line).toMatch(/reboot=\d+ms/);
			expect(line).toMatch(/total=\d+ms/);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
		}
	});

	it('emits a FAILED timing log when no reboot handler is installed', async () => {
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		g.__reboot_ng_modules__ = undefined;

		try {
			await handleAngularHotUpdateMessage(
				{ type: 'ns:angular-update', path: '/src/foo.ts' },
				{
					getCore: () => undefined,
					verbose: false,
				},
			);

			const calls = consoleInfoSpy.mock.calls.filter((args) => typeof args[0] === 'string' && (args[0] as string).startsWith('[ns-hmr][angular]'));
			expect(calls.length).toBe(1);
			const line = calls[0][0] as string;
			expect(line).toContain('[ns-hmr][angular] FAILED');
			expect(line).toContain('error=no-reboot-handler');
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
		}
	});

	it('does not log timing for non-angular-update messages', async () => {
		await handleAngularHotUpdateMessage({ type: 'something-else' }, { getCore: () => undefined, verbose: false });
		await handleAngularHotUpdateMessage(null, { getCore: () => undefined, verbose: false });
		await handleAngularHotUpdateMessage(undefined, { getCore: () => undefined, verbose: false });

		const calls = consoleInfoSpy.mock.calls.filter((args) => typeof args[0] === 'string' && (args[0] as string).startsWith('[ns-hmr]'));
		expect(calls.length).toBe(0);
	});

	it('uses <unknown> when the broadcast message omits a path', async () => {
		const reboot = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		g.__reboot_ng_modules__ = reboot;

		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });
			const calls = consoleInfoSpy.mock.calls.filter((args) => typeof args[0] === 'string' && (args[0] as string).startsWith('[ns-hmr][angular]'));
			expect(calls.length).toBe(1);
			expect(calls[0][0]).toContain('file=<unknown>');
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
		}
	});
});

// Worker auto-termination across HMR cycles.
//
// When an HMR update re-bootstraps Angular via `__reboot_ng_modules__`,
// component constructors re-run and spawn fresh `new Worker(...)`
// instances. The previous worker objects (held by the iOS Worker
// dispatch table, not by any JS variable Angular knows about) stay
// alive — every cycle silently doubles the live worker count.
//
// The fix is a two-tier strategy IN `terminateTrackedWorkers`:
//
//   1. PREFERRED: call `globalThis.__NS_DEV__.terminateAllWorkers()` (NS iOS
//      runtime's authoritative `Caches::Workers` registry → terminate
//      everything in one native call). Catches every worker regardless
//      of how it was created.
//
//   2. FALLBACK: drain `globalThis.__NS_HMR_WORKERS__` (a Set populated
//      by `__nsHmrTrackWorker`, the helper `workerHmrUrlPlugin`
//      injects). Runtimes that don't expose `__NS_DEV__.terminateAllWorkers`
//      degrade cleanly to this path.
//
// These tests pin the BEHAVIOUR of that strategy so a runtime that
// regresses the native function (or a Vite plugin that stops injecting
// the producer-side wrap) is caught by the unit suite before it ships.
describe('handleAngularHotUpdateMessage — worker termination before reboot', () => {
	type SnapshotCleanup = () => void;

	// Save & restore globals the angular client touches so cross-spec
	// pollution from other describe blocks can't bleed into these
	// assertions.
	function snapshotWorkerGlobals(): SnapshotCleanup {
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousNative = g.__NS_DEV__.terminateAllWorkers;
		const previousSet = g.__NS_HMR_WORKERS__;
		const previousRegistry = g.__NS_HOT_REGISTRY__;
		return () => {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_DEV__.terminateAllWorkers = previousNative;
			g.__NS_HMR_WORKERS__ = previousSet;
			g.__NS_HOT_REGISTRY__ = previousRegistry;
		};
	}

	it('prefers globalThis.__NS_DEV__.terminateAllWorkers() when the native API is present', async () => {
		const restore = snapshotWorkerGlobals();
		const reboot = vi.fn();
		const nativeTerminate = vi.fn(() => 3); // pretend 3 workers were terminated
		const fakeWorker = { terminate: vi.fn() };
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		g.__NS_DEV__.terminateAllWorkers = nativeTerminate;
		// Producer-side Set still has an entry — when the native path
		// runs we must NOT also call .terminate() on this directly
		// (the runtime already did it). The Set should be cleared
		// regardless to avoid unbounded growth.
		g.__NS_HMR_WORKERS__ = new Set([fakeWorker]);

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Native API called exactly once before reboot.
			expect(nativeTerminate).toHaveBeenCalledTimes(1);
			// Producer-side fakeWorker.terminate() was NOT called by the
			// client — the native runtime owns termination when the API
			// is present.
			expect(fakeWorker.terminate).not.toHaveBeenCalled();
			// Set was cleared so producer-side bookkeeping doesn't leak
			// across HMR cycles.
			expect(g.__NS_HMR_WORKERS__.size).toBe(0);
			// Reboot still happened.
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('falls back to draining __NS_HMR_WORKERS__ when no native API is present', async () => {
		const restore = snapshotWorkerGlobals();
		const reboot = vi.fn();
		const workerA = { terminate: vi.fn() };
		const workerB = { terminate: vi.fn() };
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		// Explicitly delete so the older-runtime case is unambiguous.
		delete g.__NS_DEV__.terminateAllWorkers;
		g.__NS_HMR_WORKERS__ = new Set([workerA, workerB]);

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Both producer-side workers terminated.
			expect(workerA.terminate).toHaveBeenCalledTimes(1);
			expect(workerB.terminate).toHaveBeenCalledTimes(1);
			expect(g.__NS_HMR_WORKERS__.size).toBe(0);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('falls back to JS-Set drain when the native API throws (defensive)', async () => {
		const restore = snapshotWorkerGlobals();
		const reboot = vi.fn();
		const workerA = { terminate: vi.fn() };
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		// Native API exists but throws — we must NOT propagate the
		// exception out of the HMR cycle. We must also fall back to the
		// JS-tracked Set so the user still gets the cleanup they expect
		// (rather than silently stacking up workers because the runtime
		// regressed).
		g.__NS_DEV__.terminateAllWorkers = vi.fn(() => {
			throw new Error('native terminate failed');
		});
		g.__NS_HMR_WORKERS__ = new Set([workerA]);

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Fallback ran on workerA.
			expect(workerA.terminate).toHaveBeenCalledTimes(1);
			expect(g.__NS_HMR_WORKERS__.size).toBe(0);
			// Reboot still ran — runtime regression is non-fatal.
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('does not throw when neither global is present (non-worker apps)', async () => {
		const restore = snapshotWorkerGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		delete g.__NS_DEV__.terminateAllWorkers;
		delete g.__NS_HMR_WORKERS__;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('swallows per-worker terminate() failures so one bad worker cannot break the HMR cycle', async () => {
		const restore = snapshotWorkerGlobals();
		const reboot = vi.fn();
		const badWorker = {
			terminate: vi.fn(() => {
				throw new Error('worker already dead');
			}),
		};
		const goodWorker = { terminate: vi.fn() };
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		delete g.__NS_DEV__.terminateAllWorkers; // force fallback path
		// Set order is insertion order: bad first to confirm we don't
		// short-circuit on the first failure.
		g.__NS_HMR_WORKERS__ = new Set([badWorker, goodWorker]);

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Bad worker was attempted (throw was swallowed) AND good
			// worker still ran.
			expect(badWorker.terminate).toHaveBeenCalledTimes(1);
			expect(goodWorker.terminate).toHaveBeenCalledTimes(1);
			expect(g.__NS_HMR_WORKERS__.size).toBe(0);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});
});

// `import.meta.hot.dispose` callback drain before reboot.
//
// The JS hot registry (`hmr/client/hot-context.ts`, installed on
// `globalThis.__NS_HOT_REGISTRY__`) owns the per-module dispose map that
// `import.meta.hot.dispose(cb)` populates; the HMR client drains it via
// `registry.runDispose()`. Without this drain, every HMR update silently
// leaks side effects: intervals keep firing, sockets stay open, store
// subscriptions stay active, etc.
//
// Contract pinned by these specs:
//
//   * The angular client MUST call `runDispose()` (no arg → drain every
//     module) before `__reboot_ng_modules__`. Order matters: dispose
//     runs FIRST so user-code disposers see a still-live runtime; the
//     hard worker terminator runs SECOND.
//
//   * With no pre-installed registry the lazy install kicks in — no
//     throw, drain returns 0, reboot still fires, and the worker
//     terminator fallback still cleans up workers.
//
//   * Per-callback failures inside the registry are not the client's
//     concern (the registry swallows them per Vite spec). But if the
//     ENTIRE drain throws (registry regression), we still don't take
//     down the HMR cycle.
describe('handleAngularHotUpdateMessage — import.meta.hot.dispose drain before reboot', () => {
	type SnapshotCleanup = () => void;
	function snapshotGlobals(): SnapshotCleanup {
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousRegistry = g.__NS_HOT_REGISTRY__;
		const previousNative = g.__NS_DEV__.terminateAllWorkers;
		return () => {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HOT_REGISTRY__ = previousRegistry;
			g.__NS_DEV__.terminateAllWorkers = previousNative;
		};
	}

	it('calls registry.runDispose() with no arg before reboot', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const runDispose = vi.fn(() => 7); // pretend 7 disposers ran
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({ runDispose });

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(runDispose).toHaveBeenCalledTimes(1);
			// Implementation calls runDispose with no arguments →
			// drain everything.
			expect(runDispose.mock.calls[0]).toEqual([]);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('calls dispose BEFORE the worker terminator (correct order is dispose → terminate → reboot)', async () => {
		const restore = snapshotGlobals();
		const callOrder: string[] = [];
		const reboot = vi.fn(() => {
			callOrder.push('reboot');
		});
		const runDispose = vi.fn(() => {
			callOrder.push('dispose');
			return 1;
		});
		const nativeTerminate = vi.fn(() => {
			callOrder.push('terminate');
			return 1;
		});
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({ runDispose });
		g.__NS_DEV__.terminateAllWorkers = nativeTerminate;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Strict ordering: dispose first (so user code can clean up
			// gracefully while runtime is still live), then hard
			// worker termination (catches anything user code missed),
			// then reboot.
			expect(callOrder).toEqual(['dispose', 'terminate', 'reboot']);
		} finally {
			restore();
		}
	});

	it('degrades silently when no registry is pre-installed (lazy install, empty drain)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		delete g.__NS_HOT_REGISTRY__;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			// No throw, reboot still ran. The lazily-installed real
			// registry has no registered disposers, so the drain is a
			// no-op that must never break the existing reboot flow.
			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('does not propagate exceptions when runDispose itself throws (defensive)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		// Registry regression: the drain function throws. The HMR cycle
		// must NOT die.
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({
			runDispose: vi.fn(() => {
				throw new Error('registry drain blew up');
			}),
		});

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('quietly no-ops when the registry returns 0 (nothing to drain)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const runDispose = vi.fn(() => 0);
		const g = getGlobalScope();

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({ runDispose });

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(runDispose).toHaveBeenCalledTimes(1);
			expect(reboot).toHaveBeenCalledWith(true);
			// We don't assert anything about logging here; the
			// "single concise log per HMR cycle" output is gated to
			// `executed > 0` and that's covered by the live e2e
			// verification, not by unit tests (we don't want to bind
			// the suite to a specific log format).
		} finally {
			restore();
		}
	});
});

// Standard Vite HMR lifecycle event dispatching.
//
// `import.meta.hot.on(event, cb)` is implemented in the iOS runtime
// (`HMRSupport.mm`) — but the canonical Vite events
// (`vite:beforeUpdate`, `vite:afterUpdate`, `vite:beforeFullReload`,
// `vite:invalidate`, `vite:error`) only fire if the HMR client
// dispatches them at the right points in each cycle. This describe
// block pins:
//
//   * The 'happy path' fires `vite:beforeUpdate` first, then
//     `vite:afterUpdate` after the reboot completes (BOTH events fire
//     for a successful cycle).
//   * Errors fire `vite:error` instead of `vite:afterUpdate`.
//   * Declined modules trigger `vite:beforeFullReload` (via the
//     dispatchHotEvent path inside `triggerFullReload`) and call the
//     registry's `requestFullReload` — the cycle short-circuits before
//     the reboot.
//   * A registry whose members throw silently no-ops without crashing
//     the cycle.
//
// The events flow through the JS hot registry's `dispatchHotEvent`
// (`globalThis.__NS_HOT_REGISTRY__`), which specs stub via
// `makeFakeHotRegistry`.
describe('handleAngularHotUpdateMessage — standard Vite event dispatching', () => {
	type SnapshotCleanup = () => void;
	function snapshotGlobals(): SnapshotCleanup {
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousRegistry = g.__NS_HOT_REGISTRY__;
		const previousNative = g.__NS_DEV__.terminateAllWorkers;
		return () => {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HOT_REGISTRY__ = previousRegistry;
			g.__NS_DEV__.terminateAllWorkers = previousNative;
		};
	}

	// Install a fake registry whose `dispatchHotEvent` records every event.
	// Additional registry member overrides (hasDeclined, requestFullReload)
	// can be layered on top for the decline-path specs.
	function installEventCapture(overrides: Partial<NsHotRegistry> = {}): { events: Array<{ event: string; payload: any }>; restore: SnapshotCleanup } {
		const events: Array<{ event: string; payload: any }> = [];
		const g = getGlobalScope();
		const previousRegistry = g.__NS_HOT_REGISTRY__;
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({
			dispatchHotEvent: (event: string, payload?: unknown) => {
				events.push({ event, payload });
				return 0;
			},
			...overrides,
		});
		return {
			events,
			restore: () => {
				g.__NS_HOT_REGISTRY__ = previousRegistry;
			},
		};
	}

	it('dispatches vite:beforeUpdate then vite:afterUpdate on a successful cycle', async () => {
		const restore = snapshotGlobals();
		const { events, restore: restoreDispatcher } = installEventCapture();
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					path: '/src/app/foo.component.ts',
					evictPaths: ['http://localhost:5173/ns/m/src/app/foo.component'],
				},
				{ getCore: () => undefined, verbose: false },
			);

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);

			// Filter to the events we care about — overlay/diag events
			// are out of scope for this spec.
			const lifecycle = events.filter((e) => e.event === 'vite:beforeUpdate' || e.event === 'vite:afterUpdate');
			expect(lifecycle.map((e) => e.event)).toEqual(['vite:beforeUpdate', 'vite:afterUpdate']);

			// Both events carry the same `updates: [Update]` shape
			// (Vite spec). The Update entry must include the changed
			// path, eviction set, and a timestamp.
			for (const ev of lifecycle) {
				expect(ev.payload).toHaveProperty('updates');
				expect(Array.isArray(ev.payload.updates)).toBe(true);
				expect(ev.payload.updates).toHaveLength(1);
				const u = ev.payload.updates[0];
				expect(u.type).toBe('js-update');
				expect(u.path).toBe('/src/app/foo.component.ts');
				expect(u.evictPaths).toEqual(['http://localhost:5173/ns/m/src/app/foo.component']);
				expect(typeof u.timestamp).toBe('number');
			}
		} finally {
			restoreDispatcher();
			restore();
		}
	});

	it('dispatches vite:error and SKIPS vite:afterUpdate when the cycle throws', async () => {
		const restore = snapshotGlobals();
		const { events, restore: restoreDispatcher } = installEventCapture();
		const reboot = vi.fn(() => {
			throw new Error('reboot blew up');
		});
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/app/foo.component.ts' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);

			const lifecycle = events.filter((e) => e.event === 'vite:beforeUpdate' || e.event === 'vite:afterUpdate' || e.event === 'vite:error');
			// `beforeUpdate` always fires (entry of the cycle); the
			// reboot threw → `error` fires instead of `afterUpdate`.
			expect(lifecycle.map((e) => e.event)).toEqual(['vite:beforeUpdate', 'vite:error']);

			// vite:error payload mirrors Vite's ErrorPayload shape.
			const errorEvent = lifecycle[1];
			expect(errorEvent.payload.type).toBe('error');
			expect(errorEvent.payload.err.message).toBe('reboot blew up');
			expect(typeof errorEvent.payload.err.stack === 'string' || errorEvent.payload.err.stack === undefined).toBe(true);
			expect(errorEvent.payload.path).toBe('/src/app/foo.component.ts');
		} finally {
			restoreDispatcher();
			restore();
		}
	});

	it('dispatches vite:beforeFullReload and skips reboot when a module is declined', async () => {
		const restore = snapshotGlobals();
		const reloadDevApp = vi.fn();
		const hasDeclined = vi.fn(() => true); // ← module declined HMR
		const { events, restore: restoreDispatcher } = installEventCapture({
			hasDeclined,
			requestFullReload: reloadDevApp,
		});
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;

		try {
			const handled = await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					path: '/src/app/foo.component.ts',
					evictPaths: ['http://localhost:5173/ns/m/src/app/foo.component'],
				},
				{ getCore: () => undefined, verbose: false },
			);

			expect(handled).toBe(true);

			// Must NOT have called __reboot_ng_modules__ (full reload
			// instead).
			expect(reboot).not.toHaveBeenCalled();
			// Must have triggered the runtime full-reload.
			expect(reloadDevApp).toHaveBeenCalledTimes(1);
			// Must have asked the runtime about declined modules with
			// the eviction set.
			expect(hasDeclined).toHaveBeenCalledWith(['http://localhost:5173/ns/m/src/app/foo.component']);

			// Event sequence: beforeUpdate (always), then
			// beforeFullReload (because of the decline).
			const lifecycle = events.filter((e) => e.event === 'vite:beforeUpdate' || e.event === 'vite:beforeFullReload' || e.event === 'vite:afterUpdate');
			expect(lifecycle.map((e) => e.event)).toEqual(['vite:beforeUpdate', 'vite:beforeFullReload']);
			// vite:afterUpdate must NOT fire — the cycle was diverted
			// to a full reload.
			expect(events.some((e) => e.event === 'vite:afterUpdate')).toBe(false);
		} finally {
			restoreDispatcher();
			restore();
		}
	});

	it('does not reload when no module is declined (decline check returns false)', async () => {
		const restore = snapshotGlobals();
		const reloadDevApp = vi.fn();
		const hasDeclined = vi.fn(() => false);
		const { events, restore: restoreDispatcher } = installEventCapture({
			hasDeclined,
			requestFullReload: reloadDevApp,
		});
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', evictPaths: [] }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			// Reboot fired normally; no full reload.
			expect(reboot).toHaveBeenCalledWith(true);
			expect(reloadDevApp).not.toHaveBeenCalled();
			// beforeUpdate + afterUpdate (no beforeFullReload).
			const lifecycle = events.filter((e) => e.event === 'vite:beforeUpdate' || e.event === 'vite:beforeFullReload' || e.event === 'vite:afterUpdate');
			expect(lifecycle.map((e) => e.event)).toEqual(['vite:beforeUpdate', 'vite:afterUpdate']);
		} finally {
			restoreDispatcher();
			restore();
		}
	});

	it('proceeds with reboot when no registry is pre-installed (lazy install, nothing declined)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;
		// No pre-installed registry — the lazily-installed real registry
		// has no declined modules and no listeners.
		delete g.__NS_HOT_REGISTRY__;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('proceeds with reboot when decline check throws (defensive)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({
			hasDeclined: vi.fn(() => {
				throw new Error('registry decline check exploded');
			}),
		});

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('proceeds with reboot when module is declined but requestFullReload throws', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({
			hasDeclined: vi.fn(() => true),
			requestFullReload: vi.fn(() => {
				throw new Error('full reload path exploded');
			}),
		});

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			// We can't full-reload, so we proceed with the regular
			// reboot path. Suboptimal (the decline isn't honored), but
			// the only correct fallback — failing silently here would
			// leave the user with a stale UI.
			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('does not throw when the registry dispatcher throws (defensive)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = getGlobalScope();
		g.__reboot_ng_modules__ = reboot;
		// A throwing dispatcher → all dispatchHotEvent calls become
		// no-ops. The HMR cycle must still complete normally.
		g.__NS_HOT_REGISTRY__ = makeFakeHotRegistry({
			dispatchHotEvent: vi.fn(() => {
				throw new Error('dispatcher exploded');
			}),
		});

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });
			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});
});

// HMR-applying progress overlay integration.
//
// These tests pin the contract between the angular client and the
// dev-overlay runtime: every successful HMR cycle MUST drive the
// overlay through the full stage progression so the user sees
// continuous visual feedback. Failures and missing-handler paths MUST
// hide the overlay rather than leaving stale progress on screen.
//
// We install a fake `__NS_HMR_DEV_OVERLAY__` global so the angular
// client's lookup-by-global resolves to our stubs without pulling the
// real overlay (which depends on @nativescript/core APIs and would
// require a NativeScript runtime to construct UIWindow refs in
// vitest).
describe('handleAngularHotUpdateMessage — overlay progress integration', () => {
	type StageCall = { stage: string; info?: any };

	function installOverlayStub(): { stages: StageCall[]; hideCount: number; restore: () => void } {
		const g = getGlobalScope();
		const previous = g.__NS_HMR_DEV_OVERLAY__;
		const stages: StageCall[] = [];
		let hideCount = 0;
		g.__NS_HMR_DEV_OVERLAY__ = {
			setUpdateStage(stage: string, info?: any) {
				stages.push({ stage, info });
			},
			hide(_reason?: string) {
				hideCount++;
			},
			// Other API surfaces the angular client doesn't touch but
			// the real overlay exposes — left as no-ops so ad hoc
			// callers don't blow up if they probe them.
			ensureBootPage: () => null,
			setBootStage: () => undefined,
			setConnectionStage: () => undefined,
			getSnapshot: () => undefined,
		};
		return {
			stages,
			get hideCount() {
				return hideCount;
			},
			restore() {
				if (previous === undefined) {
					delete g.__NS_HMR_DEV_OVERLAY__;
				} else {
					g.__NS_HMR_DEV_OVERLAY__ = previous;
				}
			},
		} as any;
	}

	it('drives the overlay through received → evicting → reimporting → rebooting → complete on success', async () => {
		const overlay = installOverlayStub();
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 1,
					path: '/src/app/foo.component.ts',
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/app/foo.component.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			const stageNames = overlay.stages.map((s) => s.stage);
			expect(stageNames).toEqual(['received', 'evicting', 'reimporting', 'rebooting', 'complete']);
			// 'received' should surface the changed file path so the
			// user knows which save the overlay reflects.
			const received = overlay.stages.find((s) => s.stage === 'received');
			expect(received?.info?.detail).toContain('/src/app/foo.component.ts');
			// 'evicting' surfaces the eviction count for the debug
			// breadcrumb. Matches the angular client's pluralization.
			const evicting = overlay.stages.find((s) => s.stage === 'evicting');
			expect(evicting?.info?.detail).toMatch(/Invalidating 1 module(?!s)/);
			// 'rebooting' includes refresh-so-far ms so the user can
			// already see if the slow phase is the import or reboot.
			const rebooting = overlay.stages.find((s) => s.stage === 'rebooting');
			expect(rebooting?.info?.detail).toMatch(/refresh \d+ms/);
			// 'complete' surfaces the wall-clock total.
			const complete = overlay.stages.find((s) => s.stage === 'complete');
			expect(complete?.info?.detail).toMatch(/Total \d+ms/);
			// Success path must NOT call hide() — auto-hide is the
			// overlay's job once the 'complete' frame elapses.
			expect((overlay as any).hideCount).toBe(0);
		} finally {
			overlay.restore();
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
		}
	});

	it("hides the overlay when there's no Angular reboot handler", async () => {
		const overlay = installOverlayStub();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		g.__reboot_ng_modules__ = undefined;

		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });

			// 'received' frame still posted (we couldn't have known
			// the handler was missing until *after* showing it), but
			// hide() must run so the user isn't left looking at
			// indefinite progress.
			expect(overlay.stages.some((s) => s.stage === 'received')).toBe(true);
			expect(overlay.stages.some((s) => s.stage === 'complete')).toBe(false);
			expect((overlay as any).hideCount).toBeGreaterThanOrEqual(1);
		} finally {
			overlay.restore();
			g.__reboot_ng_modules__ = previousReboot;
		}
	});

	it('hides the overlay if reboot throws mid-cycle', async () => {
		const overlay = installOverlayStub();
		const reboot = vi.fn(() => {
			throw new Error('reboot blew up');
		});
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		g.__reboot_ng_modules__ = reboot;

		try {
			await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });

			// We at least made it to 'rebooting' before the throw.
			expect(overlay.stages.some((s) => s.stage === 'rebooting')).toBe(true);
			// 'complete' must NOT fire on an error path — that frame
			// is reserved for successful applies (it would lie about
			// the cycle outcome and trigger the auto-hide too).
			expect(overlay.stages.some((s) => s.stage === 'complete')).toBe(false);
			// hide() runs in the catch block so the overlay drops
			// rather than leaving the 'rebooting' frame frozen.
			expect((overlay as any).hideCount).toBeGreaterThanOrEqual(1);
		} finally {
			overlay.restore();
			g.__reboot_ng_modules__ = previousReboot;
		}
	});

	it('soft-fails (no overlay calls, no throws) when __NS_HMR_DEV_OVERLAY__ is absent', async () => {
		// Production builds and test environments may never install
		// the overlay. The angular client must still complete its
		// cycle without throwing, even though there's nothing to
		// drive.
		const g = getGlobalScope();
		const previousOverlay = g.__NS_HMR_DEV_OVERLAY__;
		const previousReboot = g.__reboot_ng_modules__;
		const reboot = vi.fn();
		delete g.__NS_HMR_DEV_OVERLAY__;
		g.__reboot_ng_modules__ = reboot;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });
			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			if (previousOverlay === undefined) {
				delete g.__NS_HMR_DEV_OVERLAY__;
			} else {
				g.__NS_HMR_DEV_OVERLAY__ = previousOverlay;
			}
			g.__reboot_ng_modules__ = previousReboot;
		}
	});

	it("preserves stage ordering: 'evicting' fires before 'reimporting' fires before 'rebooting'", async () => {
		const overlay = installOverlayStub();
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			await handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 1,
					path: '/src/foo.ts',
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/foo.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);

			// Index-based ordering check — the overlay snapshot
			// progress is monotonic; if the angular client reordered
			// these stages the bar would visually rewind.
			const evictingIdx = overlay.stages.findIndex((s) => s.stage === 'evicting');
			const reimportingIdx = overlay.stages.findIndex((s) => s.stage === 'reimporting');
			const rebootingIdx = overlay.stages.findIndex((s) => s.stage === 'rebooting');
			const completeIdx = overlay.stages.findIndex((s) => s.stage === 'complete');
			expect(evictingIdx).toBeGreaterThanOrEqual(0);
			expect(reimportingIdx).toBeGreaterThan(evictingIdx);
			expect(rebootingIdx).toBeGreaterThan(reimportingIdx);
			expect(completeIdx).toBeGreaterThan(rebootingIdx);
		} finally {
			overlay.restore();
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
		}
	});

	// 'received' is fired AFTER the cycle mutex unblocks — i.e., a
	// cycle B that arrives while cycle A is still running should not
	// post its 'received' until cycle A is fully done. Otherwise the
	// overlay would visually rewind from cycle A's 'rebooting' /
	// 'complete' back to cycle B's 'received' mid-A.
	it("posts cycle B's 'received' frame only after cycle A completes", async () => {
		const overlay = installOverlayStub();
		const reboot = vi.fn();
		let resolveImporter1!: () => void;
		const importer = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise<void>((resolve) => {
						resolveImporter1 = resolve;
					}),
			)
			.mockImplementationOnce(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = getGlobalScope();
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__NS_DEV__.invalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__NS_DEV__.invalidateModules = invalidator;

		try {
			const cycle1 = handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 1,
					path: '/src/cycle1.ts',
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/cycle1.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);
			await Promise.resolve();
			await Promise.resolve();

			// Snapshot how many 'received' frames cycle 1 has emitted.
			const receivedAfterCycle1Started = overlay.stages.filter((s) => s.stage === 'received').length;
			expect(receivedAfterCycle1Started).toBe(1);

			// Fire cycle 2 while cycle 1 is parked in importer #1.
			const cycle2 = handleAngularHotUpdateMessage(
				{
					type: 'ns:angular-update',
					version: 2,
					path: '/src/cycle2.ts',
					origin: 'http://localhost:5173',
					evictPaths: ['http://localhost:5173/ns/m/src/cycle2.ts'],
					importerEntry: '/src/main.ts',
				},
				{ getCore: () => undefined, verbose: false },
			);
			await Promise.resolve();
			await Promise.resolve();

			// Cycle 2 must NOT have posted 'received' yet — it's
			// queued behind cycle 1's mutex.
			expect(overlay.stages.filter((s) => s.stage === 'received').length).toBe(1);

			// Drain cycle 1.
			resolveImporter1();
			await cycle1;
			await cycle2;

			// Now both cycles' 'received' frames are present, in order.
			const receivedFrames = overlay.stages.filter((s) => s.stage === 'received');
			expect(receivedFrames.length).toBe(2);
			expect(receivedFrames[0].info?.detail).toContain('/src/cycle1.ts');
			expect(receivedFrames[1].info?.detail).toContain('/src/cycle2.ts');
		} finally {
			overlay.restore();
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__NS_DEV__.invalidateModules = previousInvalidator;
		}
	});
});
