/**
 * Internals shared by the dev-overlay backends (boot placeholder, in-tree
 * live overlay, iOS UIWindow overlay): the per-session runtime state held on
 * `globalThis`, core-class resolution that respects the realm rule, and
 * snapshot/text formatting. Not part of the public overlay API — import
 * `dev-overlay.ts` for that.
 */

import { DEFAULT_SNAPSHOT, type HmrOverlayPosition, type HmrOverlaySnapshot } from './dev-overlay-snapshots.js';
import { getGlobalScope } from './global-scope.js';
import { getVendorRequire } from './vendor-resolve.js';

const DEFAULT_OVERLAY_POSITION: HmrOverlayPosition = 'top';

export type BootOverlayRefs = {
	page: any;
	root: any;
	titleLabel: any;
	statusLabel: any;
	activityIndicator?: any;
};

export type LiveOverlayRefs = {
	page: any;
	wrapper: any;
	overlay: any;
	titleLabel: any;
	statusLabel: any;
	// Previous visibility/position so we only fire the slide-in
	// animation on hidden→visible transitions or when the position
	// actually changes (avoids re-animating every progress tick
	// inside a single HMR cycle).
	wasVisible: boolean;
	currentPosition: HmrOverlayPosition;
};

// iOS promotes the live/connection overlay to its own UIWindow so
// the dev surface never gets obscured by modals, bottom sheets, or any other
// window presented by the host app.
// (dev overlay z-order (iOS)").
export type IosOverlayRefs = {
	window: any;
	controller: any;
	backdrop: any;
	panel: any;
	titleLabel: any;
	statusLabel: any;
	// See LiveOverlayRefs comment — same animation gating semantics.
	wasVisible: boolean;
	currentPosition: HmrOverlayPosition;
};

export type HmrOverlayRuntimeState = {
	snapshot: HmrOverlaySnapshot;
	bootRefs: BootOverlayRefs | null;
	liveRefs: LiveOverlayRefs | null;
	iosRefs: IosOverlayRefs | null;
	iosBuildFailed: boolean;
	verbose: boolean;
	// Single auto-hide timer for HMR apply completions. Held on the
	// runtime state (not per-API-instance) so re-entrant calls from
	// session-bootstrap reuses the same timer rather than racing each
	// other. The callback only hides the overlay if the snapshot is
	// still 'update' / 'complete' — if a new HMR cycle has already
	// reset it to 'update' / 'received', we silently no-op so the
	// second cycle's progress isn't ripped out from under it.
	updateAutoHideTimer: ReturnType<typeof setTimeout> | null;
	// Timestamp the overlay first became visible for the current
	// update cycle. We use this to compute a minimum on-screen
	// duration so a 50ms HMR cycle still gives the user a perceptible
	// visual confirmation. Reset whenever the cycle returns to
	// 'received' (i.e., a new save fires) so each cycle is timed
	// independently.
	updateCycleStartedAt: number;
};

export function getOverlayGlobal(): any {
	return getGlobalScope();
}

/**
 * Resolve the configured live-overlay position.
 *
 * Reads `globalThis.__NS_HMR_OVERLAY_POSITION__` so a project can
 * override the default at boot time (e.g. inside `app.ts` before the
 * Vite session bootstraps). Falls back to 'top' which gives the
 * toast-style chip with a slide-in animation and safe-area padding.
 */
export function getHmrDevOverlayPosition(): HmrOverlayPosition {
	const g = getOverlayGlobal();
	const stored = g.__NS_HMR_OVERLAY_POSITION__;
	if (stored === 'top' || stored === 'bottom' || stored === 'center') {
		return stored;
	}
	return DEFAULT_OVERLAY_POSITION;
}

export function getRuntimeState(): HmrOverlayRuntimeState {
	const g = getOverlayGlobal();
	if (!g.__NS_HMR_DEV_OVERLAY_STATE__) {
		g.__NS_HMR_DEV_OVERLAY_STATE__ = {
			snapshot: { ...DEFAULT_SNAPSHOT },
			bootRefs: null,
			liveRefs: null,
			iosRefs: null,
			iosBuildFailed: false,
			verbose: false,
			updateAutoHideTimer: null,
			updateCycleStartedAt: 0,
		} satisfies HmrOverlayRuntimeState;
	}
	const state = g.__NS_HMR_DEV_OVERLAY_STATE__ as Partial<HmrOverlayRuntimeState>;
	// Backfill newer fields for legacy state objects (e.g. after hot reload)
	// so we never observe an undefined iosRefs/iosBuildFailed at runtime.
	if (typeof state.iosRefs === 'undefined') state.iosRefs = null;
	if (typeof state.iosBuildFailed === 'undefined') state.iosBuildFailed = false;
	if (typeof state.updateAutoHideTimer === 'undefined') state.updateAutoHideTimer = null;
	if (typeof state.updateCycleStartedAt !== 'number') state.updateCycleStartedAt = 0;
	return state as HmrOverlayRuntimeState;
}

export function resolveCoreExport(name: string): any {
	const g = getOverlayGlobal();
	try {
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (reg && typeof reg.get === 'function') {
			const mod = reg.get('@nativescript/core');
			const ns = (mod && (mod.default ?? mod)) || mod;
			if (ns && ns[name]) {
				return ns[name];
			}
		}
	} catch {}
	try {
		if (g && g[name]) {
			return g[name];
		}
	} catch {}
	try {
		const req = getVendorRequire();
		if (req) {
			const mod = req('@nativescript/core');
			const ns = (mod && (mod.default ?? mod)) || mod;
			if (ns && ns[name]) {
				return ns[name];
			}
		}
	} catch {}
	try {
		const nativeReq = g.__nativeRequire;
		if (typeof nativeReq === 'function') {
			const mod = nativeReq('@nativescript/core', '/');
			const ns = (mod && (mod.default ?? mod)) || mod;
			if (ns && ns[name]) {
				return ns[name];
			}
		}
	} catch {}
	return undefined;
}

export function asColor(value: string): any {
	try {
		const Color = resolveCoreExport('Color');
		if (Color) {
			return new Color(value);
		}
	} catch {}
	return value as any;
}

export function formatStatusText(snapshot: HmrOverlaySnapshot): string {
	const progressText = typeof snapshot.progress === 'number' ? ` (${Math.round(Number(snapshot.progress))}%)` : '';
	const primary = `${snapshot.phase || ''}${progressText}`.trim();
	return [primary, snapshot.detail].filter(Boolean).join('\n');
}
