/**
 * The single implementation of the `NS_VITE_PROGRESS_OVERLAY` opt-out gate.
 * Served in dev, where Vite's `/@vite/env` installs the define on globalThis.
 */
declare const __NS_HMR_PROGRESS_OVERLAY_ENABLED__: boolean | undefined;

/**
 * Overlay opt-out gate (`NS_VITE_PROGRESS_OVERLAY=0` → disabled). Accepts an
 * override so unit tests can force either state. Defaults to enabled where the
 * define is absent (unit tests run without substitution).
 */
export function resolveOverlayEnabled(override?: boolean): boolean {
	if (typeof override === 'boolean') return override;
	try {
		if (typeof __NS_HMR_PROGRESS_OVERLAY_ENABLED__ === 'boolean') return __NS_HMR_PROGRESS_OVERLAY_ENABLED__;
	} catch {}
	return true;
}
