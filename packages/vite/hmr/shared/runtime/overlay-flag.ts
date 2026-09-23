/**
 * The single implementation of the `NS_VITE_PROGRESS_OVERLAY` opt-out gate.
 *
 * Both the overlay provider (`dev-overlay.ts`) and every client-side consumer
 * (via `client/overlay-driver.ts`) resolve the gate through here. Duplicated
 * copies of this fallback chain have historically drifted — a copy that misses
 * the globalThis seed silently re-enables the overlay for raw-served modules.
 */
import { getGlobalScope } from './global-scope.js';

declare const __NS_HMR_PROGRESS_OVERLAY_ENABLED__: boolean | undefined;

/**
 * Overlay opt-out gate (`NS_VITE_PROGRESS_OVERLAY=0` → disabled). Accepts an
 * override so unit tests can force either state. Reads the build-time define
 * first (const-substituted into bundled modules); define substitution does not
 * reach raw-served client files, so the globalThis seed planted by the entry's
 * defines-seed module is the authoritative runtime fallback. Defaults to
 * enabled.
 */
export function resolveOverlayEnabled(override?: boolean): boolean {
	if (typeof override === 'boolean') return override;
	try {
		if (typeof __NS_HMR_PROGRESS_OVERLAY_ENABLED__ === 'boolean') return __NS_HMR_PROGRESS_OVERLAY_ENABLED__;
	} catch {}
	try {
		const seeded = getGlobalScope().__NS_HMR_PROGRESS_OVERLAY_ENABLED__;
		if (typeof seeded === 'boolean') return seeded;
	} catch {}
	return true;
}
