/**
 * Internals shared by the dev-overlay backends (boot placeholder, in-tree
 * live overlay, iOS UIWindow overlay): the per-session runtime state,
 * core-class resolution, and snapshot/text formatting. Not part of the public overlay API — import
 * `dev-overlay.ts` for that.
 */

import { DEFAULT_SNAPSHOT, type HmrOverlayAction, type HmrOverlayPosition, type HmrOverlaySnapshot } from './dev-overlay-snapshots.js';
import { getGlobalScope } from './global-scope.js';

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
	codeLabel?: any;
	actionButton?: any;
	currentAction?: HmrOverlayAction;
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
	codeLabel: any;
	actionButton: any;
	// Keeps the tap handler alive: UIKit holds a button target weakly.
	actionHandler: any;
	currentAction?: HmrOverlayAction;
	// Window coordinates of the button while one is shown; in toast mode the
	// window takes touches only there, so the app stays usable around it.
	actionHitRect: { x: number; y: number; width: number; height: number } | null;
	// False when the pass-through window subclass could not be defined.
	passThrough: boolean;
	// See LiveOverlayRefs comment — same animation gating semantics.
	wasVisible: boolean;
	currentPosition: HmrOverlayPosition;
};

export type AndroidOverlayRefs = {
	decor: any;
	root: any;
	panel: any;
	panelBackground: any;
	titleLabel: any;
	statusLabel: any;
	codeLabel: any;
	actionButton: any;
	currentAction?: HmrOverlayAction;
	density: number;
	wasVisible: boolean;
	currentPosition: HmrOverlayPosition;
};

export type HmrOverlayRuntimeState = {
	snapshot: HmrOverlaySnapshot;
	bootRefs: BootOverlayRefs | null;
	liveRefs: LiveOverlayRefs | null;
	iosRefs: IosOverlayRefs | null;
	iosBuildFailed: boolean;
	androidRefs: AndroidOverlayRefs | null;
	androidBuildFailed: boolean;
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
	// Set by the 'restart-required' update stage. Only a new process clears
	// it, so the live overlay keeps showing it over later update,
	// connection and hide calls.
	restartRequired: boolean;
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

let runtimeState: HmrOverlayRuntimeState | null = null;

export function getRuntimeState(): HmrOverlayRuntimeState {
	runtimeState ||= {
		snapshot: { ...DEFAULT_SNAPSHOT },
		bootRefs: null,
		liveRefs: null,
		iosRefs: null,
		iosBuildFailed: false,
		androidRefs: null,
		androidBuildFailed: false,
		verbose: false,
		updateAutoHideTimer: null,
		updateCycleStartedAt: 0,
		restartRequired: false,
	};
	return runtimeState;
}

export function resolveCoreExport(name: string): any {
	const g = getOverlayGlobal();
	try {
		if (g && g[name]) {
			return g[name];
		}
	} catch {}
	try {
		// The bundle.mjs require shim answers from the served core.
		if (typeof g.require === 'function') {
			const mod = g.require('@nativescript/core');
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

/** Runs the shown action's tap handler; a throwing handler must not take the overlay down. */
export function runOverlayAction(action: HmrOverlayAction | undefined): void {
	if (!action) return;
	try {
		action.onTap();
	} catch (err) {
		console.warn('[ns-hmr-overlay] overlay action failed:', (err as any)?.message || err);
	}
}

/** Most lines of `code` any backend draws, so the button stays on screen. */
export const MAX_CODE_LINES = 14;

export function formatStatusText(snapshot: HmrOverlaySnapshot): string {
	const progressText = typeof snapshot.progress === 'number' ? ` (${Math.round(Number(snapshot.progress))}%)` : '';
	const primary = `${snapshot.phase || ''}${progressText}`.trim();
	return [primary, snapshot.detail].filter(Boolean).join('\n');
}
