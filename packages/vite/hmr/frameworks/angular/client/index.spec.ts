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

	// alpha.59 — Stable URL + Explicit Invalidation.
	//
	// When the server emits an `evictPaths` array AND the runtime
	// exposes `__nsInvalidateModules`, the client must:
	//   1. Hand the eviction set to the runtime BEFORE the entry import.
	//   2. Re-import the entry under its STABLE canonical URL (no
	//      `__ns_hmr__/v<N>/` segment).
	// The runtime canonicalizer (HMRSupport.mm alpha.59) then collapses
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

	// alpha.59 — Cycle serialization mutex.
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

// Round-eleven.3 — HMR-applying progress overlay integration.
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
