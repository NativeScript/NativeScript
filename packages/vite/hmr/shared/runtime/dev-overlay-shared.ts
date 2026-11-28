/**
 * Internals shared by the dev-overlay backends (in-tree live overlay, iOS
 * UIWindow overlay, Android DecorView overlay): the per-session runtime state,
 * core-class resolution, and snapshot/text formatting. Not part of the public overlay API — import
 * `dev-overlay.ts` for that.
 */

// The modules bundle-entry-points and the boot's Application import evaluate
// anyway; the core barrel would pull more of core ahead of the app's polyfills.
import { Application } from '@nativescript/core/application';
import { Color } from '@nativescript/core/color';
import { Frame, GridLayout, Label, StackLayout } from '@nativescript/core/ui';
import { DEFAULT_SNAPSHOT, type HmrOverlayAction, type HmrOverlayPosition, type HmrOverlaySnapshot } from './dev-overlay-snapshots.js';
import { getGlobalScope } from './global-scope.js';

/** Where the live overlay renders: the toast chip at the top, with a slide-in and safe-area padding. */
export const HMR_OVERLAY_POSITION: HmrOverlayPosition = 'top';

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

let runtimeState: HmrOverlayRuntimeState | null = null;

export function getRuntimeState(): HmrOverlayRuntimeState {
	runtimeState ||= {
		snapshot: { ...DEFAULT_SNAPSHOT },
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

// Read on use, not at evaluation: the overlay draws only after core has booted.
const coreExports: Record<string, () => unknown> = {
	Application: () => Application,
	Color: () => Color,
	Frame: () => Frame,
	GridLayout: () => GridLayout,
	Label: () => Label,
	StackLayout: () => StackLayout,
};

export function resolveCoreExport(name: string): any {
	const g = getOverlayGlobal();
	try {
		if (g && g[name]) {
			return g[name];
		}
	} catch {}
	try {
		return coreExports[name]?.();
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
