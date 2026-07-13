/**
 * Dev overlay public API: boot / connection / update stage setters plus the
 * auto-hide timing policy. Rendering is delegated to two backends behind the
 * shared snapshot/state model (`dev-overlay-shared.ts`):
 *
 * - `dev-overlay-ios.ts` — dedicated UIWindow above `UIWindowLevelAlert`, so
 *   the overlay stacks above modals/sheets/system alerts (preferred on iOS)
 * - `dev-overlay-tree.ts` — boot placeholder + in-tree toast chip (Android,
 *   and the fallback when the iOS window can't be built)
 */

import { DEFAULT_SNAPSHOT, createBootOverlaySnapshot, createConnectionOverlaySnapshot, createUpdateOverlaySnapshot, type HmrBootStage, type HmrConnectionStage, type HmrOverlayPosition, type HmrOverlaySnapshot, type HmrOverlayStageInfo, type HmrUpdateStage } from './dev-overlay-snapshots.js';
import { getHmrDevOverlayPosition, getOverlayGlobal, getRuntimeState, type HmrOverlayRuntimeState } from './dev-overlay-shared.js';
import { applySnapshotToBootRefs, applySnapshotToLiveRefs, buildBootOverlayRefs, ensureLiveOverlayRefs, updateBootStatusLabel } from './dev-overlay-tree.js';
import { applySnapshotToIosRefs, ensureIosOverlayRefs, getIosOverlayHost } from './dev-overlay-ios.js';
import { resolveOverlayEnabled } from './overlay-flag.js';

// Re-export the snapshot model and backend pure helpers so existing
// `./dev-overlay.js` importers keep working.
export { createBootOverlaySnapshot, createConnectionOverlaySnapshot, createUpdateOverlaySnapshot } from './dev-overlay-snapshots.js';
export type { HmrBootStage, HmrConnectionStage, HmrOverlayPosition, HmrOverlaySnapshot, HmrOverlayStageInfo, HmrUpdateStage } from './dev-overlay-snapshots.js';
export { getHmrDevOverlayPosition } from './dev-overlay-shared.js';
export { computeAndroidToastMargin } from './dev-overlay-tree.js';
export type { AndroidSafeAreaInsets, AndroidToastMargin } from './dev-overlay-tree.js';
export { computeIosOverlayLayout, computeIosOverlayWindowLevel } from './dev-overlay-ios.js';
export type { IosOverlayLayout, IosRect, IosSafeInsets } from './dev-overlay-ios.js';

type HmrOverlayApi = {
	ensureBootPage: (verbose?: boolean) => any | null;
	setBootStage: (stage: HmrBootStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	setConnectionStage: (stage: HmrConnectionStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	// Drive the HMR-applying progress overlay. Callers (e.g., the
	// angular client) walk: received → evicting → reimporting →
	// rebooting → complete. Setting 'complete' enqueues a short auto-
	// hide so the overlay gracefully dismisses without the caller
	// needing a separate hide() call (it can still call hide() to
	// dismiss earlier, e.g., on error).
	setUpdateStage: (stage: HmrUpdateStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	hide: (reason?: string) => void;
	getSnapshot: () => HmrOverlaySnapshot;
};

/**
 * Imperative setter for the live-overlay position. Re-applies the
 * current snapshot so the change is visible without waiting for the
 * next HMR cycle. Useful during dev to A/B between top/bottom/center
 * without restarting the app.
 */
export function setHmrDevOverlayPosition(position: HmrOverlayPosition): void {
	if (position !== 'top' && position !== 'bottom' && position !== 'center') {
		return;
	}
	const g = getOverlayGlobal();
	g.__NS_HMR_OVERLAY_POSITION__ = position;
	const state = getRuntimeState();
	applyRuntimeSnapshot(state.snapshot);
}

function applyRuntimeSnapshot(snapshot: HmrOverlaySnapshot): HmrOverlaySnapshot {
	const state = getRuntimeState();
	state.snapshot = snapshot;
	// Update the boot status label created by root-placeholder.ts
	if (snapshot.mode === 'boot') {
		updateBootStatusLabel(snapshot);
	}
	applySnapshotToBootRefs(state.bootRefs, snapshot);

	// prefer the dedicated UIWindow
	// path so the live/update overlays always stack on top of modals,
	// sheets, and other windows. Fall back to the in-tree overlay when
	// iOS APIs aren't available (Android, tests, or when scene
	// construction fails).
	let handledByIos = false;
	// Both 'connection' and 'update' use the small-panel surface
	// (UIWindow on iOS, in-tree overlay everywhere else). 'boot' uses
	// the placeholder root via applySnapshotToBootRefs above; 'hidden'
	// hides everything.
	const wantsOverlay = snapshot.visible && (snapshot.mode === 'connection' || snapshot.mode === 'update');
	if (getIosOverlayHost()) {
		if (wantsOverlay) {
			const iosRefs = ensureIosOverlayRefs(state);
			handledByIos = applySnapshotToIosRefs(iosRefs, snapshot);
		} else if (state.iosRefs) {
			handledByIos = applySnapshotToIosRefs(state.iosRefs, snapshot);
		}
	}

	if (!handledByIos) {
		if (wantsOverlay) {
			const liveRefs = ensureLiveOverlayRefs(snapshot);
			applySnapshotToLiveRefs(liveRefs, snapshot);
		} else {
			applySnapshotToLiveRefs(state.liveRefs, snapshot);
		}
	}
	return state.snapshot;
}

// How long the 'complete' frame stays on screen before we auto-hide.
// The original 350ms was too tight: many HMR cycles complete in
// 50–250ms, so the *total* overlay lifetime (received → complete +
// 350ms) was often under 500ms, which is faster than the human eye
// can comfortably register. 600ms gives the user time to read the
// "Total Xms" line and confirm visually that something happened.
const UPDATE_AUTO_HIDE_MS = 600;

// Minimum perceptible duration for an entire update overlay cycle
// (from 'received' to hide). If the cycle finished in 50ms (e.g., a
// tiny HTML edit on a warm cache), we still hold for ~MIN_VISIBLE_MS
// total before hiding so the overlay is actually seen. Combined with
// UPDATE_AUTO_HIDE_MS, the *effective* hold-after-complete =
// max(UPDATE_AUTO_HIDE_MS, MIN_VISIBLE_MS - elapsed-since-received).
const UPDATE_MIN_VISIBLE_MS = 800;

function clearUpdateAutoHideTimer(state: HmrOverlayRuntimeState): void {
	if (state.updateAutoHideTimer) {
		try {
			clearTimeout(state.updateAutoHideTimer);
		} catch {}
		state.updateAutoHideTimer = null;
	}
}

function scheduleUpdateAutoHide(state: HmrOverlayRuntimeState): void {
	clearUpdateAutoHideTimer(state);
	// Compute how much longer we need to hold the overlay so that the
	// total cycle visibility is at least UPDATE_MIN_VISIBLE_MS. For
	// fast cycles (50ms reboot) this stretches the hide; for slow
	// cycles (>UPDATE_MIN_VISIBLE_MS) it falls back to the standard
	// UPDATE_AUTO_HIDE_MS so we don't truncate the celebratory hold.
	const startedAt = state.updateCycleStartedAt || 0;
	const elapsed = startedAt > 0 ? Math.max(0, Date.now() - startedAt) : 0;
	const minRemainder = elapsed > 0 ? Math.max(0, UPDATE_MIN_VISIBLE_MS - elapsed) : UPDATE_MIN_VISIBLE_MS;
	const holdMs = Math.max(UPDATE_AUTO_HIDE_MS, minRemainder);
	try {
		state.updateAutoHideTimer = setTimeout(() => {
			state.updateAutoHideTimer = null;
			// Critical: only auto-hide if we're still on the 'complete'
			// frame. If a new HMR cycle has rotated the snapshot back
			// to 'update' / 'received' (e.g., user saved twice in
			// quick succession), the new cycle owns the overlay and
			// our timer must not steal it.
			const current = state.snapshot;
			if (current.mode === 'update' && current.tone === 'success' && current.progress === 100) {
				state.updateCycleStartedAt = 0;
				applyRuntimeSnapshot({ ...DEFAULT_SNAPSHOT });
			}
		}, holdMs);
	} catch {
		// setTimeout missing (extremely rare; some test envs). Fall
		// back to immediate hide so we never leave the overlay visible
		// forever after a 'complete'.
		state.updateCycleStartedAt = 0;
		applyRuntimeSnapshot({ ...DEFAULT_SNAPSHOT });
	}
}

function logUpdateStageTransition(state: HmrOverlayRuntimeState, stage: HmrUpdateStage, info?: HmrOverlayStageInfo): void {
	if (!state.verbose) return;
	try {
		const detail = info?.detail || '';
		const progress = typeof info?.progress === 'number' ? info.progress : null;
		const progressTag = progress !== null ? ` (${Math.round(progress)}%)` : '';
		// Single-line breadcrumb so a developer can correlate
		// overlay frames with the [ns-hmr][angular] timing log when
		// debugging "I don't see the overlay" reports.
		console.info(`[ns-hmr-overlay] update stage=${stage}${progressTag}${detail ? ` detail=${detail}` : ''}`);
	} catch {}
}

function createOverlayApi(): HmrOverlayApi {
	return {
		ensureBootPage(verbose?: boolean) {
			const state = getRuntimeState();
			state.verbose = state.verbose || !!verbose;
			if (!state.snapshot.visible || state.snapshot.mode !== 'boot') {
				state.snapshot = createBootOverlaySnapshot('placeholder');
			}
			if (!state.bootRefs) {
				state.bootRefs = buildBootOverlayRefs(state.snapshot);
			}
			applySnapshotToBootRefs(state.bootRefs, state.snapshot);
			return state.bootRefs?.page || null;
		},
		setBootStage(stage: HmrBootStage, info?: HmrOverlayStageInfo) {
			// A boot transition cancels any pending HMR auto-hide so
			// the boot phase always wins.
			const state = getRuntimeState();
			clearUpdateAutoHideTimer(state);
			state.updateCycleStartedAt = 0;
			const next = createBootOverlaySnapshot(stage, info);
			// Monotonic boot-progress ratchet: boot stages can fire out of
			// order across boot paths (JS session bootstrap vs the
			// http-bootloader fallback) and individual bases were tuned
			// independently, so clamp boot→boot transitions to never go
			// backwards. Non-boot snapshots (error/ready) bypass — they
			// genuinely want to reset the visual.
			if (next.mode === 'boot' && state.snapshot.mode === 'boot' && typeof next.progress === 'number' && typeof state.snapshot.progress === 'number' && next.progress < state.snapshot.progress) {
				next.progress = state.snapshot.progress;
			}
			return applyRuntimeSnapshot(next);
		},
		setConnectionStage(stage: HmrConnectionStage, info?: HmrOverlayStageInfo) {
			const state = getRuntimeState();
			clearUpdateAutoHideTimer(state);
			state.updateCycleStartedAt = 0;
			return applyRuntimeSnapshot(createConnectionOverlaySnapshot(stage, info));
		},
		setUpdateStage(stage: HmrUpdateStage, info?: HmrOverlayStageInfo) {
			const state = getRuntimeState();
			// Each new in-progress stage cancels any pending auto-hide
			// from a previous cycle. Without this, two saves in quick
			// succession could see cycle-2's progress overlay yanked
			// off by cycle-1's already-scheduled hide.
			clearUpdateAutoHideTimer(state);
			// Stamp the cycle start on 'received', but distinguish
			// between two cases:
			//
			//   (a) Re-assertion of the SAME cycle (e.g., the server
			//       emits both `ns:hmr-pending` AND `ns:angular-update`,
			//       both of which call `setUpdateStage('received')`).
			//       We must PRESERVE the original timestamp so the
			//       minimum-visible-window math measures the FIRST
			//       'received' the user actually saw.
			//
			//   (b) Genuinely-new cycle starting either from a hidden
			//       overlay OR while the previous cycle is still on
			//       its 'complete' frame (pre auto-hide). In both
			//       sub-cases we MUST stamp a fresh start so the
			//       new cycle's auto-hide math is sane.
			//
			// We treat the previous snapshot as "in-progress for the
			// same cycle" iff mode==='update' AND progress!==100.
			// 'complete' frames are a sign that the cycle finished;
			// any subsequent 'received' is a NEW cycle.
			if (stage === 'received') {
				const prev = state.snapshot;
				const isMidCycleReassertion = prev.mode === 'update' && prev.progress !== 100;
				if (!isMidCycleReassertion) {
					state.updateCycleStartedAt = Date.now();
				}
			}
			logUpdateStageTransition(state, stage, info);
			const snapshot = applyRuntimeSnapshot(createUpdateOverlaySnapshot(stage, info));
			if (stage === 'complete') {
				scheduleUpdateAutoHide(state);
			}
			return snapshot;
		},
		hide() {
			const state = getRuntimeState();
			clearUpdateAutoHideTimer(state);
			state.updateCycleStartedAt = 0;
			applyRuntimeSnapshot({ ...DEFAULT_SNAPSHOT });
		},
		getSnapshot() {
			return getRuntimeState().snapshot;
		},
	};
}

// When the overlay is opted out, every surface (boot / connection / update / pending)
// becomes a no-op so nothing is ever drawn. The boot placeholder root and the
// `__NS_HMR_BOOT_COMPLETE__` signal are owned by `root-placeholder.ts` and are
// unaffected, so boot + HMR keep working — the user just sees no progress UI.
function createNoopOverlayApi(): HmrOverlayApi {
	const snapshot = () => getRuntimeState().snapshot;
	return {
		ensureBootPage() {
			return null;
		},
		setBootStage() {
			return snapshot();
		},
		setConnectionStage() {
			return snapshot();
		},
		setUpdateStage() {
			return snapshot();
		},
		hide() {},
		getSnapshot() {
			return snapshot();
		},
	};
}

export function ensureHmrDevOverlayRuntimeInstalled(verbose?: boolean): HmrOverlayApi {
	const g = getOverlayGlobal();
	const state = getRuntimeState();
	state.verbose = state.verbose || !!verbose;
	if (!g.__NS_HMR_DEV_OVERLAY__) {
		g.__NS_HMR_DEV_OVERLAY__ = resolveOverlayEnabled() ? createOverlayApi() : createNoopOverlayApi();
	}
	return g.__NS_HMR_DEV_OVERLAY__ as HmrOverlayApi;
}

export function createHmrBootOverlayPage(verbose?: boolean): any | null {
	return ensureHmrDevOverlayRuntimeInstalled(verbose).ensureBootPage(verbose);
}

export function setHmrBootStage(stage: HmrBootStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	return ensureHmrDevOverlayRuntimeInstalled().setBootStage(stage, info);
}

export function setHmrConnectionStage(stage: HmrConnectionStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	return ensureHmrDevOverlayRuntimeInstalled().setConnectionStage(stage, info);
}

// Public entry point for driving the HMR-applying overlay. Callers
// walk through stages (received → evicting → reimporting → rebooting
// → complete); 'complete' auto-hides after a short interval.
// Soft-fails (no-op) if the runtime overlay was never installed
// (e.g., production builds, test environments).
export function setHmrUpdateStage(stage: HmrUpdateStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	return ensureHmrDevOverlayRuntimeInstalled().setUpdateStage(stage, info);
}

export function hideHmrDevOverlay(reason?: string): void {
	void reason;
	ensureHmrDevOverlayRuntimeInstalled().hide(reason);
}
