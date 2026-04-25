import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * alpha.62 follow-up — opt-out flag
 * (`NS_VITE_PROGRESS_OVERLAY=0` → `__NS_HMR_PROGRESS_OVERLAY_ENABLED__ = false`).
 *
 * The angular client captures the gate value once at module load
 * time, so to exercise both the enabled and disabled paths we need
 * a fresh module import per test. We mutate `globalThis` BEFORE
 * importing because the angular client falls through to the global
 * object when the lexical `__NS_HMR_PROGRESS_OVERLAY_ENABLED__`
 * identifier isn't declared (which is the case in vitest, since
 * the build-time `define` only fires inside the actual Vite bundle).
 *
 * Lives in its own file so the constant capture in `index.spec.ts`
 * isn't polluted — a `vi.resetModules` in the main file would
 * invalidate ~25 already-imported tests.
 */

type OverlayStub = {
	setUpdateStage: ReturnType<typeof vi.fn>;
	hide: ReturnType<typeof vi.fn>;
	ensureBootPage: () => null;
	setBootStage: () => void;
	setConnectionStage: () => void;
	getSnapshot: () => undefined;
};

function installOverlayStub(): OverlayStub {
	const stub: OverlayStub = {
		setUpdateStage: vi.fn(),
		hide: vi.fn(),
		ensureBootPage: () => null,
		setBootStage: () => undefined,
		setConnectionStage: () => undefined,
		getSnapshot: () => undefined,
	};
	(globalThis as any).__NS_HMR_DEV_OVERLAY__ = stub;
	return stub;
}

function clearOverlayState() {
	const g = globalThis as any;
	delete g.__NS_HMR_DEV_OVERLAY__;
	delete g.__NS_HMR_PROGRESS_OVERLAY_ENABLED__;
	delete g.__reboot_ng_modules__;
	delete g.__NS_HMR_IMPORT_NONCE__;
	delete g.__NS_HMR_IMPORT__;
	delete g.__NS_UPDATE_ANGULAR_APP_OPTIONS__;
	delete g.__nsInvalidateModules;
}

describe('Angular HMR client overlay opt-out', () => {
	beforeEach(() => {
		clearOverlayState();
		vi.resetModules();
	});

	afterEach(() => {
		clearOverlayState();
		vi.resetModules();
	});

	it('drives the overlay by default (env var unset → __NS_HMR_PROGRESS_OVERLAY_ENABLED__ undefined → enabled)', async () => {
		const stub = installOverlayStub();
		const reboot = vi.fn();
		(globalThis as any).__reboot_ng_modules__ = reboot;

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });

		// Default = enabled. We expect at least 'received' and 'complete'.
		expect(stub.setUpdateStage).toHaveBeenCalledWith('received', expect.any(Object));
		expect(stub.setUpdateStage).toHaveBeenCalledWith('complete', expect.any(Object));
	});

	it('drives the overlay when the flag is explicitly true', async () => {
		(globalThis as any).__NS_HMR_PROGRESS_OVERLAY_ENABLED__ = true;
		const stub = installOverlayStub();
		const reboot = vi.fn();
		(globalThis as any).__reboot_ng_modules__ = reboot;

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });

		expect(stub.setUpdateStage).toHaveBeenCalled();
	});

	it('does NOT touch the overlay when the flag is explicitly false (NS_VITE_PROGRESS_OVERLAY=0)', async () => {
		(globalThis as any).__NS_HMR_PROGRESS_OVERLAY_ENABLED__ = false;
		const stub = installOverlayStub();
		const reboot = vi.fn();
		(globalThis as any).__reboot_ng_modules__ = reboot;

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });

		// Functional behaviour is unchanged — handler still runs the
		// reboot and reports success. Only the overlay calls are
		// suppressed.
		expect(handled).toBe(true);
		expect(reboot).toHaveBeenCalledWith(true);
		expect(stub.setUpdateStage).not.toHaveBeenCalled();
		expect(stub.hide).not.toHaveBeenCalled();
	});

	it('still completes the cycle without throwing when the overlay is gated AND the dev overlay API is missing', async () => {
		// Belt-and-suspenders: production builds will both opt out
		// AND have no overlay installed. Make sure neither code path
		// produces a ReferenceError or NPE.
		(globalThis as any).__NS_HMR_PROGRESS_OVERLAY_ENABLED__ = false;
		const reboot = vi.fn();
		(globalThis as any).__reboot_ng_modules__ = reboot;

		const { handleAngularHotUpdateMessage } = await import('./index.js');
		const handled = await handleAngularHotUpdateMessage({ type: 'ns:angular-update', path: '/src/foo.ts' }, { getCore: () => undefined, verbose: false });

		expect(handled).toBe(true);
		expect(reboot).toHaveBeenCalledWith(true);
	});
});
