/**
 * Client-side access to the HMR dev overlay. The overlay runtime and its state
 * are installed by `bundle.mjs` (`shared/runtime/dev-overlay.ts`) and reached
 * through `__NS_HMR_DEV_OVERLAY__`: a static import here would load a second
 * copy under a `/ns/v` URL with its own state. Every call soft-fails when the
 * overlay is absent or opted out.
 */
import { getGlobalScope } from '../shared/runtime/global-scope.js';

export type HmrUpdateOverlayStage = 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete' | 'failed' | 'restart-required';
export type HmrConnectionOverlayStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline' | 'healthy';
/** A button on the overlay panel; the overlay draws it on the `failed` stage only. */
export type HmrOverlayAction = { label: string; onTap: () => void };
export type HmrOverlayInfo = {
	detail?: string;
	progress?: number | null;
	/** Preformatted text (a code frame, a stack), monospaced where the overlay supports it. */
	code?: string;
	action?: HmrOverlayAction;
};

export interface HmrOverlayDriver {
	setUpdateStage(stage: HmrUpdateOverlayStage, info?: HmrOverlayInfo): void;
	setConnectionStage(stage: HmrConnectionOverlayStage, info?: HmrOverlayInfo): void;
	hide(reason?: string): void;
}

function getOverlayApi(): any {
	try {
		return getGlobalScope().__NS_HMR_DEV_OVERLAY__ || null;
	} catch {}
	return null;
}

function call(method: string, ...args: unknown[]): void {
	try {
		const api = getOverlayApi();
		if (api && typeof api[method] === 'function') {
			api[method](...args);
		}
	} catch {}
}

export const overlayDriver: HmrOverlayDriver = {
	setUpdateStage: (stage, info) => call('setUpdateStage', stage, info),
	setConnectionStage: (stage, info) => call('setConnectionStage', stage, info),
	hide: (reason) => call('hide', reason),
};
