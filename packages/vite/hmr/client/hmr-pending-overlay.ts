/**
 * alpha.62 follow-up — client-side helper for `ns:hmr-pending`.
 *
 * Server emits `ns:hmr-pending` immediately when `handleHotUpdate`
 * fires, BEFORE doing any graph upserts / transforms / dependency
 * analysis. The client uses that hint to drive the HMR-applying
 * overlay's 'received' frame so the user sees an instant reaction
 * to their save instead of waiting ~7–200ms for the framework
 * payload (`ns:angular-update` / `ns:css-updates`) to arrive.
 *
 * This module is intentionally a tiny pure helper so the gating
 * (`__NS_HMR_PROGRESS_OVERLAY_ENABLED__`) and detail-string formatting
 * can be unit-tested without booting the full HMR client.
 */

declare const __NS_HMR_PROGRESS_OVERLAY_ENABLED__: boolean | undefined;

export type HmrOverlayApiLike =
	| {
			setUpdateStage?: (stage: string, info?: { detail?: string }) => unknown;
	  }
	| null
	| undefined;

export type HmrPendingHandlerDeps = {
	/** Resolves the live overlay API. Returning null/undefined is treated as "no overlay installed". */
	getOverlay: () => HmrOverlayApiLike;
	/** Override the build-time gate for testing. Defaults to reading `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` (or `true` when undefined). */
	overlayEnabled?: boolean;
};

export function buildHmrPendingDetail(filePath: string | undefined): string {
	if (!filePath || filePath === '<unknown>') return 'Preparing update';
	return `Updating ${filePath}`;
}

export function applyHmrPendingFrame(filePath: string | undefined, deps: HmrPendingHandlerDeps): boolean {
	const enabled =
		typeof deps.overlayEnabled === 'boolean'
			? deps.overlayEnabled
			: (() => {
					try {
						return typeof __NS_HMR_PROGRESS_OVERLAY_ENABLED__ === 'boolean' ? __NS_HMR_PROGRESS_OVERLAY_ENABLED__ : true;
					} catch {
						return true;
					}
				})();
	if (!enabled) return false;
	let api: HmrOverlayApiLike;
	try {
		api = deps.getOverlay();
	} catch {
		return false;
	}
	if (!api || typeof api.setUpdateStage !== 'function') return false;
	try {
		api.setUpdateStage('received', { detail: buildHmrPendingDetail(filePath) });
		return true;
	} catch {
		return false;
	}
}
