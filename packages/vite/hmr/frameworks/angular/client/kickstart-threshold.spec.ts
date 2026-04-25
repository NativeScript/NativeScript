import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * alpha.64 — Kickstart-eligibility threshold tests.
 *
 * The Angular client's parallel HMR prefetch (`alpha.63`) is a clean
 * win for component-shaped eviction sets (5–30 modules) and a net
 * loss for deep-fan-in `.ts` edits (constants files,
 * design-system enums) where the inverse-dep closure can hit
 * 200–300 modules. Without a cap, those wide closures overwhelm
 * Vite's single-threaded transform pipeline and a "should-be-200ms"
 * cycle balloons to 6+ seconds (see the `[hmr-kickstart][list] urls=264`
 * trace in the alpha.63 user feedback that prompted this round).
 *
 * The threshold short-circuits the kickstart when
 * `evictPaths.length` exceeds the configured cap (default 32,
 * override via `NS_VITE_KICKSTART_MAX_URLS`). The HMR cycle still
 * completes correctly — V8 falls back to per-module synchronous
 * fetches as it walks the real forward path, exactly the way the
 * runtime behaved through alpha.62.
 *
 * These tests live in their own file because the build-time cap is
 * captured ONCE at module load time. To exercise both above-cap and
 * below-cap paths we need fresh module imports between cases. Putting
 * them next to `kickstart-wiring.spec.ts` would force a `vi.resetModules`
 * there too, which would invalidate the wiring tests' reusable setup.
 */

type KickstartFn = ReturnType<typeof vi.fn>;
type InvalidatorFn = ReturnType<typeof vi.fn>;
type ImporterFn = ReturnType<typeof vi.fn>;
type RebootFn = ReturnType<typeof vi.fn>;

interface Globals {
	kickstart: KickstartFn;
	invalidator: InvalidatorFn;
	importer: ImporterFn;
	reboot: RebootFn;
	updater: ReturnType<typeof vi.fn>;
}

function installGlobals(): Globals {
	const g = globalThis as any;
	const reboot: RebootFn = vi.fn();
	const importer: ImporterFn = vi.fn(async () => ({}));
	const updater = vi.fn();
	const invalidator: InvalidatorFn = vi.fn();
	const kickstart: KickstartFn = vi.fn(() => ({ ok: true, fetched: 0, ms: 1 }));

	g.__reboot_ng_modules__ = reboot;
	g.__NS_HMR_IMPORT__ = importer;
	g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ = updater;
	g.__nsInvalidateModules = invalidator;
	g.__nsKickstartHmrPrefetch = kickstart;

	return { kickstart, invalidator, importer, reboot, updater };
}

function clearGlobals() {
	const g = globalThis as any;
	delete g.__reboot_ng_modules__;
	delete g.__NS_HMR_IMPORT__;
	delete g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
	delete g.__nsInvalidateModules;
	delete g.__nsKickstartHmrPrefetch;
	delete g.__NS_HMR_DEV_OVERLAY__;
	delete g.__NS_HMR_KICKSTART_MAX_URLS__;
	delete g.__NS_HMR_PROGRESS_OVERLAY_ENABLED__;
}

function makeUrls(count: number, prefix = 'http://localhost:5173/ns/m/src/app/file'): string[] {
	const urls: string[] = [];
	for (let i = 0; i < count; i += 1) urls.push(`${prefix}-${i}.ts`);
	return urls;
}

describe('Angular HMR client — alpha.64 kickstart threshold', () => {
	beforeEach(() => {
		clearGlobals();
		vi.resetModules();
		vi.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		clearGlobals();
		vi.resetModules();
		vi.restoreAllMocks();
	});

	it('runs the kickstart for a small eviction set (default cap = 32)', async () => {
		const ctx = installGlobals();
		const evictPaths = makeUrls(8);

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		expect(ctx.kickstart).toHaveBeenCalledTimes(1);
		const [arg0] = ctx.kickstart.mock.calls[0];
		expect(arg0).toEqual(evictPaths);
	});

	it('runs the kickstart at the cap exactly (boundary: 32 ≤ 32)', async () => {
		const ctx = installGlobals();
		const evictPaths = makeUrls(32);

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		// 32 is right at the knee — pinning the inclusive comparison
		// keeps a future "let's switch to <" change from silently
		// shifting the boundary by one and dropping a 32-URL closure
		// out of the fast path.
		expect(ctx.kickstart).toHaveBeenCalledTimes(1);
	});

	it('skips the kickstart when the eviction set exceeds the default cap (33 > 32)', async () => {
		const ctx = installGlobals();
		const evictPaths = makeUrls(33);

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		// Cycle still completes — the kickstart is a perf optimization,
		// not a correctness requirement. V8 falls back to synchronous
		// fetches as it walks the dep graph.
		expect(handled).toBe(true);
		expect(ctx.invalidator).toHaveBeenCalledTimes(1);
		expect(ctx.importer).toHaveBeenCalledTimes(1);
		expect(ctx.kickstart).not.toHaveBeenCalled();
	});

	it('skips the kickstart for the 264-URL repro case (constants edit pathology)', async () => {
		// 264 is the URL count from the user-facing trace that
		// motivated alpha.64 (`[hmr-kickstart][list] urls=264 fetched=264 ms=6313`).
		// Pinning the exact number documents the empirical signal in
		// the test source and prevents a future regression from
		// making this case "kickstart eligible" again.
		const ctx = installGlobals();
		const evictPaths = makeUrls(264);

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		expect(handled).toBe(true);
		expect(ctx.kickstart).not.toHaveBeenCalled();
	});

	it('honours an explicit cap override (__NS_HMR_KICKSTART_MAX_URLS__ = 4)', async () => {
		// The build-time literal is normally a number injected by
		// vite's `define`. In the vitest realm the lexical
		// identifier is undefined, but the angular client's capture
		// IIFE reads `typeof __NS_HMR_KICKSTART_MAX_URLS__` to detect
		// the missing-define case. Because TypeScript declarations of
		// the form `declare const __NS_..._URLS__: number | undefined`
		// are erased at compile time, vitest sees a free identifier
		// reference; we install it on globalThis BEFORE importing the
		// module so the capture sees a number.
		(globalThis as any).__NS_HMR_KICKSTART_MAX_URLS__ = 4;
		const ctx = installGlobals();

		const { handleAngularHotUpdateMessage } = await import('./index.js');

		// Cap = 4 → 4 URLs runs the kickstart (4 ≤ 4).
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: makeUrls(4), importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });
		expect(ctx.kickstart).toHaveBeenCalledTimes(1);

		// Cap = 4 → 5 URLs skips the kickstart (5 > 4).
		ctx.kickstart.mockClear();
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: makeUrls(5), importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });
		expect(ctx.kickstart).not.toHaveBeenCalled();
	});

	it('disables the kickstart entirely when the cap is 0 (NS_VITE_KICKSTART_MAX_URLS=0)', async () => {
		// 0 is the documented escape hatch: developers bisecting a
		// perf regression should be able to turn the optimization
		// off without uninstalling the runtime.
		(globalThis as any).__NS_HMR_KICKSTART_MAX_URLS__ = 0;
		const ctx = installGlobals();

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: makeUrls(1), importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		expect(ctx.kickstart).not.toHaveBeenCalled();
	});

	it('runs the kickstart for any size when the cap is Infinity (alpha.63 behavior)', async () => {
		// Some users may want the unconditional alpha.63 behavior
		// back (e.g. for benchmarking with a deliberately-warm dev
		// server). `__NS_HMR_KICKSTART_MAX_URLS__ = Infinity` is the
		// escape hatch.
		(globalThis as any).__NS_HMR_KICKSTART_MAX_URLS__ = Number.POSITIVE_INFINITY;
		const ctx = installGlobals();

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths: makeUrls(500), importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		expect(ctx.kickstart).toHaveBeenCalledTimes(1);
		const [arg0] = ctx.kickstart.mock.calls[0];
		expect((arg0 as string[]).length).toBe(500);
	});

	it('exports a pure shouldRunKickstart predicate that callers can unit-test', async () => {
		// Lock the contract for the exported predicate so a future
		// refactor of the call site (or a third-party framework
		// adapter that re-implements the gate) can rely on the same
		// rules without grepping the source.
		const { shouldRunKickstart } = await import('./index.js');

		// Empty / negative / NaN sets: nothing to do.
		expect(shouldRunKickstart(0, 32)).toBe(false);
		expect(shouldRunKickstart(-1, 32)).toBe(false);
		expect(shouldRunKickstart(Number.NaN, 32)).toBe(false);

		// Inclusive comparison at the cap.
		expect(shouldRunKickstart(1, 32)).toBe(true);
		expect(shouldRunKickstart(32, 32)).toBe(true);
		expect(shouldRunKickstart(33, 32)).toBe(false);

		// Disabled (cap=0).
		expect(shouldRunKickstart(1, 0)).toBe(false);
		expect(shouldRunKickstart(0, 0)).toBe(false);

		// Unbounded (cap=Infinity).
		expect(shouldRunKickstart(1, Number.POSITIVE_INFINITY)).toBe(true);
		expect(shouldRunKickstart(10_000, Number.POSITIVE_INFINITY)).toBe(true);
	});

	it('still completes the HMR cycle when the kickstart is skipped (functional regression guard)', async () => {
		// The threshold MUST NOT change correctness. We assert the
		// full ordered chain — invalidate → import → reboot — fires
		// even on the skip path. This is the one assertion that
		// would catch a "skip → early return" refactor that
		// accidentally drops the import.
		const ctx = installGlobals();
		const evictPaths = makeUrls(64);

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', version: 1, origin: 'http://localhost:5173', evictPaths, importerEntry: '/src/main.ts' }, { getCore: () => undefined, verbose: false });

		expect(handled).toBe(true);
		const invalidateOrder = ctx.invalidator.mock.invocationCallOrder[0];
		const importOrder = ctx.importer.mock.invocationCallOrder[0];
		const rebootOrder = ctx.reboot.mock.invocationCallOrder[0];
		expect(invalidateOrder).toBeLessThan(importOrder);
		expect(importOrder).toBeLessThan(rebootOrder);
		expect(ctx.kickstart).not.toHaveBeenCalled();
	});
});
