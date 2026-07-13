/**
 * Single client-side seam for the HMR dev overlay.
 *
 * Consumers (shared client, framework clients, pending/SFC overlay helpers)
 * MUST resolve the overlay and the opt-out gate through here rather than
 * reading `__NS_HMR_DEV_OVERLAY__` / `__NS_HMR_PROGRESS_OVERLAY_ENABLED__`
 * directly. The provider side lives in `shared/runtime/dev-overlay.ts` (it
 * installs `__NS_HMR_DEV_OVERLAY__`); we deliberately reach it through the
 * global rather than a static import because clients live in the user-app
 * realm and a second bundled copy of the overlay runtime state would split
 * the UI state across realms.
 */
import { getGlobalScope } from '../shared/runtime/global-scope.js';

export { resolveOverlayEnabled } from '../shared/runtime/overlay-flag.js';

export type HmrUpdateOverlayStage = 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete';
export type HmrUpdateOverlayInfo = { detail?: string; progress?: number | null };

/** Live overlay API installed by `shared/runtime/dev-overlay.ts`, or null. */
export function getOverlayApi(): any {
	try {
		return getGlobalScope().__NS_HMR_DEV_OVERLAY__ || null;
	} catch {}
	return null;
}

/** Drive the apply-progress overlay one stage forward. Soft-fails when the overlay is absent. */
export function setUpdateStage(stage: HmrUpdateOverlayStage, info?: HmrUpdateOverlayInfo): void {
	try {
		const api = getOverlayApi();
		if (api && typeof api.setUpdateStage === 'function') {
			api.setUpdateStage(stage, info);
		}
	} catch {}
}
