import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleAngularHotUpdateMessage } from './index.js';

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
		const g = globalThis as any;
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

	// Stable URL + Explicit Invalidation.
	//
	// When the server emits an `evictPaths` array AND the runtime
	// exposes `__nsInvalidateModules`, the client must:
	//   1. Hand the eviction set to the runtime BEFORE the entry import.
	//   2. Re-import the entry under its STABLE canonical URL (no
	//      `__ns_hmr__/v<N>/` segment).
	// The runtime canonicalizer (in `HMRSupport.mm`) then collapses
	// any historical tagged URL still hanging around to the same key,
	// so the only thing forcing a re-fetch is the explicit eviction.
	it('hands the eviction set to the runtime and imports the stable entry URL', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;
		const previousRegisterOnly = g.__NS_ANGULAR_HMR_REGISTER_ONLY__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			g.__nsInvalidateModules = previousInvalidator;
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = previousRegisterOnly;
		}
	});

	it('falls back to versioned URL when the runtime lacks __nsInvalidateModules', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;
		const previousRegisterOnly = g.__NS_ANGULAR_HMR_REGISTER_ONLY__;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		delete g.__nsInvalidateModules;

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
			// Legacy URL: __ns_hmr__/v12 segment retained.
			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/__ns_hmr__/v12/src/main.ts');
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__nsInvalidateModules = previousInvalidator;
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = previousRegisterOnly;
		}
	});

	it('survives __nsInvalidateModules throwing without breaking the import flow', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn(() => {
			throw new Error('native bridge boom');
		});
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			// Eviction failed → fall back to versioned URL.
			expect(importer).toHaveBeenCalledWith('http://localhost:5173/ns/m/__ns_hmr__/v9/src/main.ts');
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_HMR_IMPORT__ = previousImporter;
			g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = previousUpdater;
			g.__nsInvalidateModules = previousInvalidator;
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
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			g.__nsInvalidateModules = previousInvalidator;
		}
	});

	it('uses the importerEntry from the broadcast message when present', async () => {
		const reboot = vi.fn();
		const importer = vi.fn(async () => ({}));
		const updater = vi.fn();
		const invalidator = vi.fn();
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			g.__nsInvalidateModules = previousInvalidator;
		}
	});

	it('emits a single-line update timing log (ok path) including refresh/reboot/total ms', async () => {
		const reboot = vi.fn();
		const g = globalThis as any;
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
		const g = globalThis as any;
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
		const g = globalThis as any;
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
//   1. PREFERRED: call `globalThis.__nsTerminateAllWorkers()` (NS iOS
//      runtime's authoritative `Caches::Workers` registry → terminate
//      everything in one native call). Catches every worker regardless
//      of how it was created.
//
//   2. FALLBACK: drain `globalThis.__NS_HMR_WORKERS__` (a Set populated
//      by `__nsHmrTrackWorker`, the helper `workerHmrUrlPlugin`
//      injects). Older runtimes that don't ship `__nsTerminateAllWorkers`
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
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousNative = g.__nsTerminateAllWorkers;
		const previousSet = g.__NS_HMR_WORKERS__;
		const previousDispose = g.__nsRunHmrDispose;
		return () => {
			g.__reboot_ng_modules__ = previousReboot;
			g.__nsTerminateAllWorkers = previousNative;
			g.__NS_HMR_WORKERS__ = previousSet;
			g.__nsRunHmrDispose = previousDispose;
		};
	}

	it('prefers globalThis.__nsTerminateAllWorkers() when the native API is present', async () => {
		const restore = snapshotWorkerGlobals();
		const reboot = vi.fn();
		const nativeTerminate = vi.fn(() => 3); // pretend 3 workers were terminated
		const fakeWorker = { terminate: vi.fn() };
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		g.__nsTerminateAllWorkers = nativeTerminate;
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
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		// Explicitly delete so the older-runtime case is unambiguous.
		delete g.__nsTerminateAllWorkers;
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
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		// Native API exists but throws — we must NOT propagate the
		// exception out of the HMR cycle. We must also fall back to the
		// JS-tracked Set so the user still gets the cleanup they expect
		// (rather than silently stacking up workers because the runtime
		// regressed).
		g.__nsTerminateAllWorkers = vi.fn(() => {
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
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		delete g.__nsTerminateAllWorkers;
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
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		delete g.__nsTerminateAllWorkers; // force fallback path
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
// The NS iOS runtime exposes `globalThis.__nsRunHmrDispose([keys?])` so the
// HMR client can drain the per-module dispose registry that
// `import.meta.hot.dispose(cb)` populates (see `HMRSupport.mm`). Without this
// drain, every HMR update silently leaks side effects: intervals keep
// firing, sockets stay open, store subscriptions stay active, etc.
//
// Contract pinned by these specs:
//
//   * The angular client MUST call `__nsRunHmrDispose()` (no arg → drain
//     every module) before `__reboot_ng_modules__`. Order matters: dispose
//     runs FIRST so user-code disposers see a still-live runtime; the
//     hard worker terminator runs SECOND.
//
//   * Older runtimes without `__nsRunHmrDispose` MUST degrade silently —
//     no throw, reboot still fires, and the worker terminator fallback
//     still cleans up workers.
//
//   * Per-callback failures inside the runtime are not the client's
//     concern (the runtime swallows them per Vite spec). But if the
//     ENTIRE drain throws (out-of-memory, runtime regression), we still
//     don't take down the HMR cycle.
describe('handleAngularHotUpdateMessage — import.meta.hot.dispose drain before reboot', () => {
	type SnapshotCleanup = () => void;
	function snapshotGlobals(): SnapshotCleanup {
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousDispose = g.__nsRunHmrDispose;
		const previousNative = g.__nsTerminateAllWorkers;
		return () => {
			g.__reboot_ng_modules__ = previousReboot;
			g.__nsRunHmrDispose = previousDispose;
			g.__nsTerminateAllWorkers = previousNative;
		};
	}

	it('calls __nsRunHmrDispose() with no arg before reboot when the runtime API is present', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const runDispose = vi.fn(() => 7); // pretend 7 disposers ran
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		g.__nsRunHmrDispose = runDispose;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(runDispose).toHaveBeenCalledTimes(1);
			// Implementation calls runDispose with the global as
			// `this` and no arguments → drain everything.
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
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		g.__nsRunHmrDispose = runDispose;
		g.__nsTerminateAllWorkers = nativeTerminate;

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

	it('degrades silently when the runtime does not expose __nsRunHmrDispose (older runtime)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		delete g.__nsRunHmrDispose;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			// No throw, reboot still ran. The dispose drain is a
			// best-effort enhancement; missing API must never break
			// the existing reboot flow.
			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('does not propagate exceptions when __nsRunHmrDispose itself throws (defensive)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		// Runtime regression: the drain function throws (out of memory,
		// isolate teardown race, etc.). The HMR cycle must NOT die.
		g.__nsRunHmrDispose = vi.fn(() => {
			throw new Error('runtime drain blew up');
		});

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('quietly no-ops when the runtime returns 0 (nothing to drain)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const runDispose = vi.fn(() => 0);
		const g = globalThis as any;

		g.__reboot_ng_modules__ = reboot;
		g.__nsRunHmrDispose = runDispose;

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
//     dispatchHotEvent path inside `triggerFullReload`) and call
//     `__nsReloadDevApp` — the cycle short-circuits before the reboot.
//   * Older runtimes without `__NS_DISPATCH_HOT_EVENT__` (no event
//     dispatcher installed) silently no-op without crashing the
//     cycle.
//
// Note: We can't directly assert the no-op case ("dispatcher missing")
// from a spec because `dispatchHotEvent` is a private helper, but
// every spec below works whether or not the global is installed —
// none of them require any side effect from the dispatcher to pass.
describe('handleAngularHotUpdateMessage — standard Vite event dispatching', () => {
	type SnapshotCleanup = () => void;
	function snapshotGlobals(): SnapshotCleanup {
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousDispatcher = g.__NS_DISPATCH_HOT_EVENT__;
		const previousDispose = g.__nsRunHmrDispose;
		const previousNative = g.__nsTerminateAllWorkers;
		const previousDeclined = g.__nsHasDeclinedModule;
		const previousReload = g.__nsReloadDevApp;
		return () => {
			g.__reboot_ng_modules__ = previousReboot;
			g.__NS_DISPATCH_HOT_EVENT__ = previousDispatcher;
			g.__nsRunHmrDispose = previousDispose;
			g.__nsTerminateAllWorkers = previousNative;
			g.__nsHasDeclinedModule = previousDeclined;
			g.__nsReloadDevApp = previousReload;
		};
	}

	function installEventCapture(): { events: Array<{ event: string; payload: any }>; restore: SnapshotCleanup } {
		const events: Array<{ event: string; payload: any }> = [];
		const g = globalThis as any;
		const previousDispatcher = g.__NS_DISPATCH_HOT_EVENT__;
		g.__NS_DISPATCH_HOT_EVENT__ = (event: string, payload: any) => {
			events.push({ event, payload });
		};
		return {
			events,
			restore: () => {
				g.__NS_DISPATCH_HOT_EVENT__ = previousDispatcher;
			},
		};
	}

	it('dispatches vite:beforeUpdate then vite:afterUpdate on a successful cycle', async () => {
		const restore = snapshotGlobals();
		const { events, restore: restoreDispatcher } = installEventCapture();
		const reboot = vi.fn();
		const g = globalThis as any;
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
		const g = globalThis as any;
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
		const { events, restore: restoreDispatcher } = installEventCapture();
		const reboot = vi.fn();
		const reloadDevApp = vi.fn();
		const hasDeclined = vi.fn(() => true); // ← module declined HMR
		const g = globalThis as any;
		g.__reboot_ng_modules__ = reboot;
		g.__nsReloadDevApp = reloadDevApp;
		g.__nsHasDeclinedModule = hasDeclined;

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
		const { events, restore: restoreDispatcher } = installEventCapture();
		const reboot = vi.fn();
		const reloadDevApp = vi.fn();
		const hasDeclined = vi.fn(() => false);
		const g = globalThis as any;
		g.__reboot_ng_modules__ = reboot;
		g.__nsReloadDevApp = reloadDevApp;
		g.__nsHasDeclinedModule = hasDeclined;

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

	it('proceeds with reboot when __nsHasDeclinedModule is missing (older runtime)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = globalThis as any;
		g.__reboot_ng_modules__ = reboot;
		// No __nsHasDeclinedModule — older runtime.
		delete g.__nsHasDeclinedModule;
		delete g.__nsReloadDevApp;

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
		const g = globalThis as any;
		g.__reboot_ng_modules__ = reboot;
		g.__nsHasDeclinedModule = vi.fn(() => {
			throw new Error('runtime decline check exploded');
		});

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('proceeds with reboot when module is declined but __nsReloadDevApp is unavailable', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = globalThis as any;
		g.__reboot_ng_modules__ = reboot;
		g.__nsHasDeclinedModule = vi.fn(() => true);
		// __nsReloadDevApp NOT installed — older runtime can't full-reload.
		delete g.__nsReloadDevApp;

		try {
			const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update' }, { getCore: () => undefined, verbose: false });

			// We can't full-reload, so we proceed with the regular
			// reboot path. Suboptimal (the decline isn't honored), but
			// the only correct fallback for older runtimes — failing
			// silently here would leave the user with a stale UI.
			expect(handled).toBe(true);
			expect(reboot).toHaveBeenCalledWith(true);
		} finally {
			restore();
		}
	});

	it('does not throw when __NS_DISPATCH_HOT_EVENT__ is missing (older runtime)', async () => {
		const restore = snapshotGlobals();
		const reboot = vi.fn();
		const g = globalThis as any;
		g.__reboot_ng_modules__ = reboot;
		// No event dispatcher → all dispatchHotEvent calls become
		// no-ops. The HMR cycle must still complete normally.
		delete g.__NS_DISPATCH_HOT_EVENT__;

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
		const g = globalThis as any;
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
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			g.__nsInvalidateModules = previousInvalidator;
		}
	});

	it("hides the overlay when there's no Angular reboot handler", async () => {
		const overlay = installOverlayStub();
		const g = globalThis as any;
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
		const g = globalThis as any;
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
		const g = globalThis as any;
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
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			g.__nsInvalidateModules = previousInvalidator;
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
		const g = globalThis as any;
		const previousReboot = g.__reboot_ng_modules__;
		const previousImporter = g.__NS_HMR_IMPORT__;
		const previousUpdater = g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
		const previousInvalidator = g.__nsInvalidateModules;

		g.__reboot_ng_modules__ = reboot;
		g.__NS_HMR_IMPORT__ = importer;
		g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
		g.__nsInvalidateModules = invalidator;

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
			g.__nsInvalidateModules = previousInvalidator;
		}
	});
});
