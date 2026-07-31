/**
 * HMR-applying overlay driver for Vue SFC updates.
 *
 * The Vue HMR cycle is driven by two messages on the wire:
 *
 *   1. `ns:hmr-pending` — fires at the start of `handleHotUpdate` on
 *      the server. The client's `applyHmrPendingFrame` shows the
 *      'received' (5%) frame so the user sees an instant reaction to
 *      their save.
 *   2. `ns:vue-sfc-registry-update` — fires once the SFC artifact is
 *      ready. The client loads the new component definition via
 *      `handleVueSfcRegistryUpdate` and then swaps the root view via
 *      `performResetRoot`.
 *
 * Without an explicit completion call between these two messages the
 * overlay sticks at "Preparing update (5%)" forever — exactly the
 * "toast never goes away" symptom this helper exists to prevent.
 *
 * The driver mirrors the Angular client's stage progression so the UX
 * feels consistent across flavors:
 *
 *   received  → ns:hmr-pending (driven by applyHmrPendingFrame)
 *   evicting  → before loadSfcComponent — surfaces the SFC artifact lookup
 *   reimporting → during loadSfcComponent — the network/HTTP-ESM fetch
 *   rebooting → before performResetRoot — the actual view-tree swap
 *   complete  → after performResetRoot — auto-hides via the overlay's
 *               internal timer
 *
 * The helper is intentionally a pure orchestrator so the stage
 * sequence can be verified without booting nativescript-vue or the
 * full HMR client. The CSS overlay helpers (`css-update-overlay.ts`)
 * follow the same shape; this is the Vue equivalent.
 */
import { resolveOverlayEnabled as resolveOverlayEnabledGate } from '../../../client/overlay-driver.js';

export type VueOverlayApiLike =
	| {
			setUpdateStage?: (stage: string, info?: { detail?: string; progress?: number | null }) => unknown;
			hide?: (reason?: string) => unknown;
	  }
	| null
	| undefined;

export type VueSfcUpdateOverlayDeps = {
	/** Resolves the live overlay API. Returning null/undefined is treated as "no overlay installed". */
	getOverlay: () => VueOverlayApiLike;
	/** Override the build-time gate for testing. Defaults to reading `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` (or `true` when undefined). */
	overlayEnabled?: boolean;
	/** Time source — exposed so tests can stub deterministically. */
	now?: () => number;
};

export type VueSfcUpdateOverlayRun<TComponent> = {
	/** The changed SFC path as broadcast by the server (e.g. `/src/components/Home.vue`). */
	filePath?: string;
	/** Resolves the component to mount. Returning `null`/`undefined` is treated as "no swap needed" and still completes the overlay. */
	loadComponent: () => Promise<TComponent | null | undefined>;
	/** Performs the view-tree swap once the component is loaded. Return value is intentionally `unknown` (callers like `performResetRoot` return `Promise<boolean>`; we only care about resolution, not the payload). */
	applyComponent: (component: TComponent) => Promise<unknown>;
};

export type VueSfcUpdateOverlayResult = {
	/** True when the overlay reached the 'complete' stage (whether the swap actually ran or was skipped). */
	completed: boolean;
	/** True when `applyComponent` was called and resolved without throwing. */
	swapped: boolean;
	/** Wall-clock duration of the orchestration window. */
	elapsedMs: number;
	/** Captured error from `loadComponent` / `applyComponent`, if any. */
	error?: unknown;
};

export function buildSfcLoadingDetail(filePath: string | undefined): string {
	if (!filePath || filePath === '<unknown>') return 'Loading SFC update';
	return `Loading ${filePath}`;
}

export function buildSfcRemountDetail(filePath: string | undefined): string {
	if (!filePath || filePath === '<unknown>') return 'Re-mounting view tree';
	return `Re-mounting ${filePath}`;
}

export function buildSfcCompleteDetail(filePath: string | undefined, elapsedMs: number): string {
	const ms = Number.isFinite(elapsedMs) && elapsedMs >= 0 ? Math.round(elapsedMs) : 0;
	if (!filePath || filePath === '<unknown>') return `Update applied in ${ms}ms`;
	return `Updated ${filePath} in ${ms}ms`;
}

export function buildSfcSkippedDetail(filePath: string | undefined): string {
	if (!filePath || filePath === '<unknown>') return 'No SFC swap required';
	return `Skipped ${filePath}`;
}

export function buildSfcFailedDetail(filePath: string | undefined): string {
	if (!filePath || filePath === '<unknown>') return 'SFC update failed';
	return `Update failed for ${filePath}`;
}

function resolveOverlay(deps: VueSfcUpdateOverlayDeps): VueOverlayApiLike {
	try {
		return deps.getOverlay();
	} catch {
		return null;
	}
}

function setStage(api: VueOverlayApiLike, stage: 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete', detail: string): void {
	if (!api || typeof api.setUpdateStage !== 'function') return;
	try {
		api.setUpdateStage(stage, { detail });
	} catch {
		// A bad overlay state must never break the HMR cycle.
	}
}

/**
 * Orchestrate the apply-progress overlay around a single Vue SFC
 * registry update.
 *
 * The function never throws — every overlay call is guarded — and
 * always resolves the orchestration even if the underlying load/apply
 * functions reject. Callers can inspect the returned `error` field for
 * diagnostics, but the visual contract is that the user always sees a
 * completed (or hidden) overlay at the end of the call.
 */
export async function driveVueSfcUpdateOverlay<TComponent>(run: VueSfcUpdateOverlayRun<TComponent>, deps: VueSfcUpdateOverlayDeps): Promise<VueSfcUpdateOverlayResult> {
	const now = typeof deps.now === 'function' ? deps.now : () => Date.now();
	const enabled = resolveOverlayEnabledGate(deps.overlayEnabled);
	const overlay = enabled ? resolveOverlay(deps) : null;
	const startedAt = now();
	const filePath = run.filePath;

	setStage(overlay, 'evicting', buildSfcLoadingDetail(filePath));

	let component: TComponent | null | undefined = null;
	try {
		setStage(overlay, 'reimporting', buildSfcLoadingDetail(filePath));
		component = await run.loadComponent();
	} catch (error) {
		const elapsedMs = Math.max(0, now() - startedAt);
		setStage(overlay, 'complete', buildSfcFailedDetail(filePath));
		return { completed: true, swapped: false, elapsedMs, error };
	}

	if (component == null) {
		const elapsedMs = Math.max(0, now() - startedAt);
		setStage(overlay, 'complete', buildSfcSkippedDetail(filePath));
		return { completed: true, swapped: false, elapsedMs };
	}

	try {
		setStage(overlay, 'rebooting', buildSfcRemountDetail(filePath));
		await run.applyComponent(component);
	} catch (error) {
		const elapsedMs = Math.max(0, now() - startedAt);
		setStage(overlay, 'complete', buildSfcFailedDetail(filePath));
		return { completed: true, swapped: false, elapsedMs, error };
	}

	const elapsedMs = Math.max(0, now() - startedAt);
	setStage(overlay, 'complete', buildSfcCompleteDetail(filePath, elapsedMs));
	return { completed: true, swapped: true, elapsedMs };
}
