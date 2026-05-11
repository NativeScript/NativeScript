// 'success' tone for in-progress HMR applies. The boot/error overlays
// already use 'info'/'warn'/'error'; 'success' is the calm green that
// signals "things are happening correctly right now" without competing
// with error/warn states. The existing tone-switches (panel bg, text
// colour, backdrop alpha) all continue to default to the non-error
// branch; we just opt success into a tinted-green branch wherever
// those switches live.
type HmrOverlayTone = 'info' | 'warn' | 'error' | 'success';

// 'update' is the small-panel surface we render during an HMR cycle.
// It reuses the connection overlay's window / in-tree wrapper so we
// get the exact same z-order guarantees on iOS (above modals, sheets,
// and the dev banner) without duplicating the view-construction code.
type HmrOverlayMode = 'hidden' | 'boot' | 'connection' | 'update';

// Position controls where the live (connection / update) overlay
// renders. 'top' / 'bottom' produce a "toast"-style chip that slides
// in from the nearest screen edge, sits inside the safe area, and
// uses a transparent backdrop so the rest of the app stays touchable.
// 'center' preserves the full-screen-dim modal
//
// Configurable per-session via:
//   globalThis.__NS_HMR_OVERLAY_POSITION__ = 'top' | 'bottom' | 'center';
// or via the exported `setHmrDevOverlayPosition()` helper.
export type HmrOverlayPosition = 'top' | 'bottom' | 'center';

const DEFAULT_OVERLAY_POSITION: HmrOverlayPosition = 'top';

export type HmrBootStage = 'placeholder' | 'probing-origin' | 'loading-entry-runtime' | 'configuring-import-map' | 'loading-runtime-bridge' | 'loading-core-bridge' | 'preloading-style-scope' | 'installing-css' | 'importing-main' | 'waiting-for-app' | 'app-root-committed' | 'ready' | 'error';

export type HmrConnectionStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline' | 'healthy';

// HMR apply stages, in chronological order. The progression matches
// what the angular client does inside handleAngularHotUpdateMessage:
//   received    → mutex acquired, message parsed
//   evicting    → __nsInvalidateModules() about to fire
//   reimporting → import(stable-entry) about to fire
//   rebooting   → __reboot_ng_modules__ about to fire
//   complete    → cycle finished; brief celebratory hold then hide
// Progress percentages are intentionally non-linear so the bar
// "feels" responsive: the cheap stages claim 5/30/60 quickly, and
// the 60→90 jump covers the long tail (re-import + reboot) so the
// user sees movement instead of a stalled bar at 60%.
export type HmrUpdateStage = 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete';

export type HmrOverlayStageInfo = {
	detail?: string;
	origin?: string;
	progress?: number | null;
	attempt?: number;
	attempts?: number;
};

export type HmrOverlaySnapshot = {
	visible: boolean;
	mode: HmrOverlayMode;
	badge: string;
	title: string;
	phase: string;
	detail: string;
	progress: number | null;
	busy: boolean;
	blocking: boolean;
	tone: HmrOverlayTone;
};

type BootOverlayRefs = {
	page: any;
	root: any;
	titleLabel: any;
	statusLabel: any;
	activityIndicator?: any;
};

type LiveOverlayRefs = {
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
type IosOverlayRefs = {
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

type HmrOverlayRuntimeState = {
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

const BOOT_TITLE = 'NativeScript Vite preparing dev session...';

const DEFAULT_SNAPSHOT: HmrOverlaySnapshot = {
	visible: false,
	mode: 'hidden',
	badge: 'HMR',
	title: BOOT_TITLE,
	phase: '',
	detail: '',
	progress: null,
	busy: false,
	blocking: false,
	tone: 'info',
};

function getOverlayGlobal(): any {
	return globalThis as any;
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

function getRuntimeState(): HmrOverlayRuntimeState {
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

function describeAttempt(info?: HmrOverlayStageInfo): string {
	const attempt = Number(info?.attempt || 0);
	const attempts = Number(info?.attempts || 0);
	if (!attempt || !attempts) {
		return '';
	}
	return `Attempt ${attempt}/${attempts}`;
}

export function createBootOverlaySnapshot(stage: HmrBootStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	const attemptText = describeAttempt(info);
	const phaseInfo: Record<HmrBootStage, Omit<HmrOverlaySnapshot, 'detail'>> = {
		placeholder: {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Preparing the HTTP HMR bootstrap',
			progress: 4,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'probing-origin': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Contacting the Vite dev server',
			progress: 8,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'loading-entry-runtime': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Loading the entry runtime bridge',
			progress: 16,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'configuring-import-map': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Configuring the import map',
			progress: 26,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'loading-runtime-bridge': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Loading the NativeScript runtime bridge',
			progress: 40,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'loading-core-bridge': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Loading the unified core bridge',
			progress: 54,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'preloading-style-scope': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Preparing the shared style scope',
			progress: 62,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'installing-css': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Applying the app stylesheet',
			progress: 70,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'importing-main': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Importing the app entry',
			// 30 (not 82) so the bar visibly climbs the ~62 points the
			// heartbeat + snippet drive during the long HTTP-module-load
			// phase. The monotonic ratchet in `setBootStage` prevents
			// earlier-but-higher stages from being clobbered.
			progress: 30,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'waiting-for-app': {
			visible: true,
			mode: 'boot',
			badge: 'BOOT',
			title: BOOT_TITLE,
			phase: 'Waiting for the app root view',
			progress: 94,
			busy: true,
			blocking: true,
			tone: 'info',
		},
		'app-root-committed': {
			visible: true,
			mode: 'boot',
			badge: 'READY',
			title: BOOT_TITLE,
			phase: 'Real app root committed',
			progress: 100,
			busy: false,
			blocking: true,
			tone: 'info',
		},
		ready: {
			visible: true,
			mode: 'boot',
			badge: 'READY',
			title: BOOT_TITLE,
			phase: 'Boot complete',
			progress: 100,
			busy: false,
			blocking: true,
			tone: 'info',
		},
		error: {
			visible: true,
			mode: 'boot',
			badge: 'RETRY',
			title: BOOT_TITLE,
			phase: 'Retrying after a boot failure',
			progress: null,
			busy: true,
			blocking: true,
			tone: 'error',
		},
	};

	const base = phaseInfo[stage];
	let detail = info?.detail || '';
	if (!detail && stage === 'probing-origin' && info?.origin) {
		detail = `Trying ${info.origin}`;
	}
	if (attemptText) {
		detail = detail ? `${detail}  ${attemptText}` : attemptText;
	}
	return {
		...base,
		detail,
		progress: typeof info?.progress === 'number' || info?.progress === null ? info.progress : base.progress,
	};
}

export function createConnectionOverlaySnapshot(stage: HmrConnectionStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	if (stage === 'healthy') {
		return { ...DEFAULT_SNAPSHOT };
	}

	const phaseInfo: Record<Exclude<HmrConnectionStage, 'healthy'>, HmrOverlaySnapshot> = {
		connecting: {
			visible: true,
			mode: 'connection',
			badge: 'SOCKET',
			title: 'Waiting for Vite dev server',
			phase: 'Opening websocket connection',
			detail: 'Live updates are paused until the connection is healthy.',
			progress: null,
			busy: true,
			blocking: false,
			tone: 'warn',
		},
		reconnecting: {
			visible: true,
			mode: 'connection',
			badge: 'SOCKET',
			title: 'HMR connection lost',
			phase: 'Trying to reconnect Vite websocket',
			detail: 'The app may be stale until the dev server reconnects.',
			progress: null,
			busy: true,
			blocking: false,
			tone: 'warn',
		},
		synchronizing: {
			visible: true,
			mode: 'connection',
			badge: 'SYNC',
			title: 'HMR connection restored',
			phase: 'Synchronizing live-update state',
			detail: 'Finalizing the module graph before dismissing the overlay.',
			progress: 95,
			busy: true,
			blocking: false,
			tone: 'info',
		},
		offline: {
			visible: true,
			mode: 'connection',
			badge: 'OFFLINE',
			title: 'Vite dev server offline',
			phase: 'Please check your terminal.',
			detail: 'The websocket and HTTP HMR path are both unavailable right now.',
			progress: null,
			busy: true,
			blocking: false,
			tone: 'error',
		},
	};

	const base = phaseInfo[stage];
	return {
		...base,
		detail: info?.detail || base.detail,
		progress: typeof info?.progress === 'number' || info?.progress === null ? info.progress : base.progress,
	};
}

// Snapshot factory for the HMR-applying overlay. Each stage owns a
// fixed phase string, badge, and progress %. We pick the percentages
// so users see continuous forward motion: the cheap stages (mutex
// acquire, eviction call) advance fast; the long tail (entry
// re-import + Angular reboot) sits at 60→90 so the bar keeps moving
// even when the V8 ESM walk dominates wall time.
//
// The 'complete' stage holds for a brief moment (the API auto-hides
// it via setUpdateStage) so the user gets visual closure ("the update
// landed") without staring at a frozen overlay; tone stays 'success'
// throughout so the colour scheme never flickers between phases.
const HMR_UPDATE_TITLE = 'HMR update applying...';
const HMR_UPDATE_DONE_TITLE = 'HMR update applied';

export function createUpdateOverlaySnapshot(stage: HmrUpdateStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	const phaseInfo: Record<HmrUpdateStage, HmrOverlaySnapshot> = {
		received: {
			visible: true,
			mode: 'update',
			badge: 'HMR',
			title: HMR_UPDATE_TITLE,
			phase: 'Preparing update',
			detail: '',
			progress: 5,
			busy: true,
			blocking: false,
			tone: 'success',
		},
		evicting: {
			visible: true,
			mode: 'update',
			badge: 'HMR',
			title: HMR_UPDATE_TITLE,
			phase: 'Invalidating module cache',
			detail: '',
			progress: 30,
			busy: true,
			blocking: false,
			tone: 'success',
		},
		reimporting: {
			visible: true,
			mode: 'update',
			badge: 'HMR',
			title: HMR_UPDATE_TITLE,
			phase: 'Re-importing entry',
			detail: '',
			progress: 60,
			busy: true,
			blocking: false,
			tone: 'success',
		},
		rebooting: {
			visible: true,
			mode: 'update',
			badge: 'HMR',
			title: HMR_UPDATE_TITLE,
			phase: 'Rebooting Angular',
			detail: '',
			progress: 90,
			busy: true,
			blocking: false,
			tone: 'success',
		},
		complete: {
			visible: true,
			mode: 'update',
			badge: 'HMR',
			title: HMR_UPDATE_DONE_TITLE,
			phase: 'Update applied',
			detail: '',
			progress: 100,
			busy: false,
			blocking: false,
			tone: 'success',
		},
	};

	const base = phaseInfo[stage];
	return {
		...base,
		detail: info?.detail || base.detail,
		progress: typeof info?.progress === 'number' || info?.progress === null ? info.progress : base.progress,
	};
}

function resolveCoreExport(name: string): any {
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
		const req = g.__nsVendorRequire || g.__nsRequire || g.require;
		if (typeof req === 'function') {
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

function asColor(value: string): any {
	try {
		const Color = resolveCoreExport('Color');
		if (Color) {
			return new Color(value);
		}
	} catch {}
	return value as any;
}

function formatStatusText(snapshot: HmrOverlaySnapshot): string {
	const progressText = typeof snapshot.progress === 'number' ? ` (${Math.round(Number(snapshot.progress))}%)` : '';
	const primary = `${snapshot.phase || ''}${progressText}`.trim();
	return [primary, snapshot.detail].filter(Boolean).join('\n');
}

function buildBootOverlayRefs(snapshot: HmrOverlaySnapshot): BootOverlayRefs | null {
	const Page = resolveCoreExport('Page');
	const StackLayout = resolveCoreExport('StackLayout');
	const Label = resolveCoreExport('Label');
	const ActivityIndicator = resolveCoreExport('ActivityIndicator');
	if (!Page || !StackLayout || !Label) {
		return null;
	}

	const page = new Page();
	page.actionBarHidden = true;

	const root = new StackLayout();
	root.padding = 24;
	root.verticalAlignment = 'middle';
	root.horizontalAlignment = 'stretch';

	const titleLabel = new Label();
	titleLabel.text = BOOT_TITLE;
	titleLabel.textAlignment = 'center';
	titleLabel.textWrap = true;
	titleLabel.fontSize = 22;
	titleLabel.fontWeight = '600';

	const statusLabel = new Label();
	statusLabel.textAlignment = 'center';
	statusLabel.textWrap = true;
	statusLabel.fontSize = 14;
	statusLabel.marginTop = 12;

	const activityIndicator = ActivityIndicator
		? (() => {
				const indicator = new ActivityIndicator();
				indicator.marginTop = 16;
				indicator.width = 28;
				indicator.height = 28;
				indicator.horizontalAlignment = 'center';
				return indicator;
			})()
		: null;

	root.addChild(titleLabel);
	root.addChild(statusLabel);
	if (activityIndicator) {
		root.addChild(activityIndicator);
	}
	page.content = root;

	const refs: BootOverlayRefs = {
		page,
		root,
		titleLabel,
		statusLabel,
		activityIndicator,
	};
	applySnapshotToBootRefs(refs, snapshot);
	return refs;
}

function applySnapshotToBootRefs(refs: BootOverlayRefs | null, snapshot: HmrOverlaySnapshot): void {
	if (!refs) {
		return;
	}
	refs.page.actionBarHidden = true;
	refs.page.backgroundColor = asColor(snapshot.tone === 'error' ? '#b4181068' : '#a1771683');
	refs.root.visibility = snapshot.visible && snapshot.mode === 'boot' ? 'visible' : 'collapse';
	refs.titleLabel.text = BOOT_TITLE;
	refs.titleLabel.color = asColor(snapshot.tone === 'error' ? '#b41810e6' : '#563e3fb1');
	refs.statusLabel.text = formatStatusText(snapshot) || 'Preparing the HTTP HMR bootstrap (4%)';
	refs.statusLabel.color = asColor(snapshot.tone === 'error' ? '#b41810e6' : '#563e3fb1');
	if (refs.activityIndicator) {
		refs.activityIndicator.busy = !!snapshot.busy;
		refs.activityIndicator.visibility = snapshot.visible && snapshot.mode === 'boot' && snapshot.busy ? 'visible' : 'collapse';
	}
}

function findBootActivityIndicator(): any {
	const g = getOverlayGlobal();
	if (g.__NS_DEV_BOOT_ACTIVITY_INDICATOR__) {
		return g.__NS_DEV_BOOT_ACTIVITY_INDICATOR__;
	}
	try {
		const frame = g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
		if (!frame) return null;
		const page = frame.currentPage || frame._currentEntry?.resolvedPage;
		const content = page?.content;
		const children = content?.getChildrenCount?.() || 0;
		if (children >= 3) {
			const indicator = content.getChildAt?.(2);
			if (indicator && typeof indicator.busy !== 'undefined') {
				g.__NS_DEV_BOOT_ACTIVITY_INDICATOR__ = indicator;
				return indicator;
			}
		}
	} catch {}
	return null;
}

function findBootStatusLabel(): any {
	const g = getOverlayGlobal();
	// Try direct reference first
	if (g.__NS_DEV_BOOT_STATUS_LABEL__) {
		return g.__NS_DEV_BOOT_STATUS_LABEL__;
	}
	// Fallback: walk from placeholder root view
	try {
		const frame = g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__;
		if (!frame) return null;
		const page = frame.currentPage || frame._currentEntry?.resolvedPage;
		if (!page) return null;
		const content = page.content;
		if (!content) return null;
		// StackLayout with children: titleLabel, statusLabel
		const children = content.getChildrenCount?.() || 0;
		if (children >= 2) {
			const label = content.getChildAt?.(1);
			if (label && typeof label.text !== 'undefined') {
				// Cache for next time
				g.__NS_DEV_BOOT_STATUS_LABEL__ = label;
				return label;
			}
		}
	} catch {}
	return null;
}

function updateBootStatusLabel(snapshot: HmrOverlaySnapshot): void {
	const newText = formatStatusText(snapshot) || 'Preparing the HTTP HMR bootstrap (4%)';
	const statusLabel = findBootStatusLabel();
	const activityIndicator = findBootActivityIndicator();
	if (!statusLabel) {
		if (activityIndicator) {
			try {
				activityIndicator.busy = !!snapshot.busy;
				activityIndicator.visibility = snapshot.visible && snapshot.mode === 'boot' && snapshot.busy ? 'visible' : 'collapse';
			} catch {}
		}
		return;
	}
	try {
		statusLabel.text = newText;
		statusLabel.color = asColor(snapshot.tone === 'error' ? '#b41810e6' : '#563e3fb1');
		if (typeof statusLabel.requestLayout === 'function') {
			statusLabel.requestLayout();
		}
		const parent = statusLabel.parent;
		if (parent && typeof parent.requestLayout === 'function') {
			parent.requestLayout();
		}
	} catch {}
	if (activityIndicator) {
		try {
			activityIndicator.busy = !!snapshot.busy;
			activityIndicator.visibility = snapshot.visible && snapshot.mode === 'boot' && snapshot.busy ? 'visible' : 'collapse';
		} catch {}
	}
}

function resolveActivePage(): any {
	try {
		const Frame = resolveCoreExport('Frame');
		const frame = Frame?.topmost?.() || null;
		const currentPage = frame?.currentPage || frame?._currentEntry?.resolvedPage || null;
		if (currentPage) {
			return currentPage;
		}
	} catch {}
	try {
		const Application = resolveCoreExport('Application');
		const rootView = Application?.getRootView?.() || null;
		if (rootView?.currentPage) {
			return rootView.currentPage;
		}
		if (typeof rootView?.content !== 'undefined') {
			return rootView;
		}
	} catch {}
	return null;
}

function buildLiveOverlayView(snapshot: HmrOverlaySnapshot): Omit<LiveOverlayRefs, 'page' | 'wrapper'> | null {
	const GridLayout = resolveCoreExport('GridLayout');
	const StackLayout = resolveCoreExport('StackLayout');
	const Label = resolveCoreExport('Label');
	if (!GridLayout || !StackLayout || !Label) {
		return null;
	}

	const overlay = new GridLayout();
	overlay.visibility = 'collapse';
	overlay.width = '100%';
	overlay.height = '100%';
	overlay.horizontalAlignment = 'stretch';
	overlay.verticalAlignment = 'stretch';
	// Toast mode lets touches reach the underlying app. We flip
	// isUserInteractionEnabled in applySnapshotToLiveRefs based on
	// the resolved position, but keep it false here as a safe default
	// (the panel itself is purely informational).
	try {
		overlay.isUserInteractionEnabled = false;
	} catch {}

	const panel = new StackLayout();
	panel.horizontalAlignment = 'center';
	// Vertical alignment is overridden in applySnapshotToLiveRefs
	// based on getHmrDevOverlayPosition(); 'middle' is the default
	panel.verticalAlignment = 'middle';
	panel.width = 320;
	panel.margin = 24;
	panel.padding = 16;

	const titleLabel = new Label();
	titleLabel.textAlignment = 'center';
	titleLabel.textWrap = true;
	titleLabel.fontSize = 18;
	titleLabel.fontWeight = '600';

	const statusLabel = new Label();
	statusLabel.textAlignment = 'center';
	statusLabel.textWrap = true;
	statusLabel.fontSize = 13;
	statusLabel.marginTop = 10;

	panel.addChild(titleLabel);
	panel.addChild(statusLabel);
	overlay.addChild(panel);

	const refs = {
		overlay,
		titleLabel,
		statusLabel,
		wasVisible: false,
		currentPosition: getHmrDevOverlayPosition(),
	};
	applySnapshotToLiveRefs(refs, snapshot);
	return refs;
}

function ensureLiveOverlayRefs(snapshot: HmrOverlaySnapshot): LiveOverlayRefs | null {
	const state = getRuntimeState();
	const page = resolveActivePage();
	if (!page) {
		return null;
	}

	if (state.liveRefs) {
		if (state.liveRefs.page === page && state.liveRefs.overlay?.parent) {
			return state.liveRefs;
		}
		try {
			state.liveRefs.overlay.visibility = 'collapse';
		} catch {}
		state.liveRefs = null;
	}

	const GridLayout = resolveCoreExport('GridLayout');
	if (!GridLayout || typeof page.content === 'undefined') {
		return null;
	}

	let wrapper = page.content;
	if (!wrapper || !wrapper.__ns_hmr_overlay_wrapper__) {
		const currentContent = page.content || null;
		wrapper = new GridLayout();
		wrapper.width = '100%';
		wrapper.height = '100%';
		wrapper.__ns_hmr_overlay_wrapper__ = true;
		try {
			page.content = null;
		} catch {}
		if (currentContent) {
			wrapper.addChild(currentContent);
		}
		page.content = wrapper;
	}

	const liveView = buildLiveOverlayView(snapshot);
	if (!liveView) {
		return null;
	}

	wrapper.addChild(liveView.overlay);
	state.liveRefs = {
		page,
		wrapper,
		...liveView,
	};
	return state.liveRefs;
}

function applySnapshotToLiveRefs(refs: Pick<LiveOverlayRefs, 'overlay' | 'titleLabel' | 'statusLabel'> & Partial<Pick<LiveOverlayRefs, 'wasVisible' | 'currentPosition'>>, snapshot: HmrOverlaySnapshot): void;
function applySnapshotToLiveRefs(refs: null, snapshot: HmrOverlaySnapshot): void;
function applySnapshotToLiveRefs(refs: any, snapshot: HmrOverlaySnapshot): void {
	if (!refs) {
		return;
	}
	// 'update' mode shares the live (in-tree) overlay chrome with
	// 'connection'. Both render a small panel inside the page; only
	// the colours, text, and (now) panel position change with the
	// snapshot's tone and the configured overlay position.
	const visible = snapshot.visible && (snapshot.mode === 'connection' || snapshot.mode === 'update');
	const wasVisible = !!refs.wasVisible;
	const position = getHmrDevOverlayPosition();
	const previousPosition: HmrOverlayPosition = refs.currentPosition || position;
	const isToast = position !== 'center';

	refs.titleLabel.text = snapshot.title;
	refs.statusLabel.text = formatStatusText(snapshot);

	const textColor = snapshot.tone === 'error' ? '#b41810e6' : snapshot.tone === 'success' ? '#0e6e2fff' : '#563e3fb1';
	refs.titleLabel.color = asColor(textColor);
	refs.statusLabel.color = asColor(textColor);

	// Backdrop tints (centered modal only). Toast modes use a fully
	// transparent backdrop so the rest of the app stays visible AND
	// reachable; the panel itself carries enough colour to stand out.
	if (isToast) {
		refs.overlay.backgroundColor = asColor('transparent');
	} else {
		// Original wash-by-tone for centered:
		//   error   → red wash (matches existing UX)
		//   success → richer green wash so the apply event is visible
		//             on bright app backgrounds
		//   default → warm orange (existing connection-overlay look)
		const overlayBg = snapshot.tone === 'error' ? '#b4181068' : snapshot.tone === 'success' ? '#1f883d80' : '#a1771683';
		refs.overlay.backgroundColor = asColor(overlayBg);
	}

	// Panel chrome — toast and centered share the same chip look,
	// just position differs. We keep the slightly richer green tint
	// for the HMR success state so it pops without needing the
	// backdrop wash.
	let panel: any = null;
	try {
		panel = refs.titleLabel.parent;
		if (panel) {
			const panelBg = snapshot.tone === 'success' ? '#E6F8E9FF' : '#FFFFFFFF';
			panel.backgroundColor = asColor(panelBg);
			panel.opacity = 1;
			panel.padding = 16;
			try {
				panel.borderRadius = 12;
			} catch {}

			// Position-aware alignment. The wrapper GridLayout fills
			// the page content area, which on iOS is already inside
			// the safe area; we add a small extra margin so the chip
			// doesn't kiss the notch / home indicator.
			try {
				if (position === 'top') {
					panel.verticalAlignment = 'top';
					panel.margin = '12 16 0 16';
				} else if (position === 'bottom') {
					panel.verticalAlignment = 'bottom';
					panel.margin = '0 16 12 16';
				} else {
					panel.verticalAlignment = 'middle';
					panel.margin = 24;
				}
			} catch {}
		}
	} catch {}

	// Touch passthrough for toast; centered mode keeps the
	// blocking modal so the dim backdrop is meaningful.
	try {
		refs.overlay.isUserInteractionEnabled = !isToast;
	} catch {}

	const positionChanged = previousPosition !== position;
	const justAppeared = visible && (!wasVisible || positionChanged);
	const justDismissed = !visible && wasVisible;

	if (justAppeared) {
		refs.overlay.visibility = 'visible';
		if (isToast && panel && typeof panel.animate === 'function') {
			animateLivePanelIn(panel, position);
		} else if (panel) {
			try {
				panel.translateY = 0;
				panel.opacity = 1;
			} catch {}
		}
	} else if (justDismissed) {
		if (isToast && panel && typeof panel.animate === 'function') {
			animateLivePanelOut(panel, previousPosition, () => {
				try {
					refs.overlay.visibility = 'collapse';
				} catch {}
			});
		} else {
			refs.overlay.visibility = 'collapse';
		}
	} else {
		refs.overlay.visibility = visible ? 'visible' : 'collapse';
	}

	if (typeof refs.wasVisible !== 'undefined') refs.wasVisible = visible;
	if (typeof refs.currentPosition !== 'undefined') refs.currentPosition = position;
}

/**
 * Slide-in animation for the in-tree toast panel.
 *
 * NativeScript's `View.animate({ translate, opacity, duration, curve })`
 * is widely available across Core versions, so we don't depend on any
 * specific curve enum being importable here. We use a moderate-to-snappy
 * 320ms ease-out which feels close to a UIView spring without needing
 * platform-specific APIs.
 */
function animateLivePanelIn(panel: any, position: HmrOverlayPosition): void {
	if (!panel || typeof panel.animate !== 'function') return;
	try {
		const startY = position === 'bottom' ? 80 : -80;
		panel.translateY = startY;
		panel.opacity = 0;
		const result = panel.animate({
			translate: { x: 0, y: 0 },
			opacity: 1,
			duration: 320,
			curve: 'easeOut',
		});
		if (result && typeof result.catch === 'function') {
			result.catch(() => {
				try {
					panel.translateY = 0;
					panel.opacity = 1;
				} catch {}
			});
		}
	} catch {
		try {
			panel.translateY = 0;
			panel.opacity = 1;
		} catch {}
	}
}

function animateLivePanelOut(panel: any, position: HmrOverlayPosition, onComplete: () => void): void {
	if (!panel || typeof panel.animate !== 'function') {
		onComplete();
		return;
	}
	try {
		const targetY = position === 'bottom' ? 80 : -80;
		const result = panel.animate({
			translate: { x: 0, y: targetY },
			opacity: 0,
			duration: 220,
			curve: 'easeIn',
		});
		const finish = () => {
			try {
				panel.translateY = 0;
				panel.opacity = 1;
			} catch {}
			onComplete();
		};
		if (result && typeof result.then === 'function') {
			result.then(finish, finish);
		} else {
			finish();
		}
	} catch {
		onComplete();
	}
}

// pure helpers for iOS window promotion. Factored out so the layout
// math and window-level selection stay unit-testable without booting a
// simulator. See `dev-overlay.spec.ts`.

/**
 * Returns the UIWindow level we use for the live/connection overlay. We lift
 * above `UIWindowLevelAlert` so system alerts (and any app-presented modal)
 * stack underneath. When the platform does not expose `UIWindowLevelAlert`
 * we fall back to the documented constant value (2000).
 */
export function computeIosOverlayWindowLevel(baseAlert?: number | null): number {
	if (typeof baseAlert === 'number' && Number.isFinite(baseAlert)) {
		return baseAlert + 1;
	}
	return 2000 + 1;
}

export type IosSafeInsets = {
	top: number;
	bottom: number;
	left: number;
	right: number;
};

export type IosRect = { x: number; y: number; width: number; height: number };

export type IosOverlayLayout = {
	backdrop: IosRect;
	panel: IosRect;
	title: IosRect;
	status: IosRect;
};

/**
 * Layout math for the live overlay when it runs inside its own UIWindow.
 * Pure, deterministic and independent of UIKit so we can verify the rules
 * (max panel width, position-aware placement, safe-area clamping, sane
 * defaults) from tests.
 *
 * `position` controls where the panel sits vertically:
 *   - 'top':    hugs `safeInsets.top + toastVerticalInset` so the chip
 *               sits just below the notch / Dynamic Island.
 *   - 'bottom': hugs `viewHeight - safeInsets.bottom - panelHeight -
 *               toastVerticalInset` so the chip sits just above the
 *               home indicator / nav bar.
 *   - 'center': original modal placement (vertically centered, clamped
 *               so it never crosses the top safe-area inset).
 */
export function computeIosOverlayLayout(input: { viewWidth: number; viewHeight: number; safeInsets?: IosSafeInsets | null; titleHeight: number; statusHeight: number; maxPanelWidth?: number; horizontalMargin?: number; panelPadding?: number; interLabelSpacing?: number; minTopInset?: number; position?: HmrOverlayPosition; toastVerticalInset?: number }): IosOverlayLayout {
	const viewWidth = Math.max(0, Number(input.viewWidth) || 0);
	const viewHeight = Math.max(0, Number(input.viewHeight) || 0);
	const safeInsets: IosSafeInsets = {
		top: Math.max(0, Number(input.safeInsets?.top ?? 0) || 0),
		bottom: Math.max(0, Number(input.safeInsets?.bottom ?? 0) || 0),
		left: Math.max(0, Number(input.safeInsets?.left ?? 0) || 0),
		right: Math.max(0, Number(input.safeInsets?.right ?? 0) || 0),
	};
	const titleHeight = Math.max(0, Number(input.titleHeight) || 0);
	const statusHeight = Math.max(0, Number(input.statusHeight) || 0);
	const horizontalMargin = Math.max(0, Number(input.horizontalMargin ?? 24));
	const maxPanelWidth = Math.max(0, Number(input.maxPanelWidth ?? 340));
	const panelPadding = Math.max(0, Number(input.panelPadding ?? 16));
	const interLabelSpacing = Math.max(0, Number(input.interLabelSpacing ?? 10));
	const minTopInset = Math.max(0, Number(input.minTopInset ?? 20));
	// Default to 'center' on the pure function so the existing
	// snapshot/layout tests remain stable; the runtime call site
	// (layoutIosOverlayRefs) reads the configured position from
	// `getHmrDevOverlayPosition()` and forwards it explicitly.
	const position: HmrOverlayPosition = input.position ?? 'center';
	// Distance between the panel and the safe-area edge in toast
	// modes. 8pt mirrors the typical iOS notification chip inset and
	// keeps the chip from hugging the notch / home indicator.
	const toastVerticalInset = Math.max(0, Number(input.toastVerticalInset ?? 8));

	const available = Math.max(0, viewWidth - 2 * horizontalMargin - safeInsets.left - safeInsets.right);
	const panelWidth = Math.min(maxPanelWidth, available);
	const innerWidth = Math.max(0, panelWidth - 2 * panelPadding);

	const spacing = titleHeight > 0 && statusHeight > 0 ? interLabelSpacing : 0;
	const panelHeight = panelPadding * 2 + titleHeight + spacing + statusHeight;
	const panelX = Math.max(0, (viewWidth - panelWidth) / 2);

	let panelY: number;
	if (position === 'top') {
		// Pin to the top safe-area inset (just below notch / Dynamic
		// Island). Clamp non-negative for fully-NaN input.
		panelY = Math.max(0, safeInsets.top + toastVerticalInset);
	} else if (position === 'bottom') {
		// Pin to the bottom safe-area inset (just above home indicator
		// / nav bar). If the panel can't fit between the safe-area
		// insets we fall back to the top safe-area edge so the chip is
		// always visible (rather than getting clipped off-screen).
		const desired = viewHeight - safeInsets.bottom - panelHeight - toastVerticalInset;
		panelY = Math.max(safeInsets.top + minTopInset, desired);
	} else {
		// Center vertically, but never cross the top safe-area inset
		// (notch/Dynamic Island). Original modal placement.
		const centered = (viewHeight - panelHeight) / 2;
		panelY = Math.max(safeInsets.top + minTopInset, centered);
	}

	return {
		backdrop: { x: 0, y: 0, width: viewWidth, height: viewHeight },
		panel: { x: panelX, y: panelY, width: panelWidth, height: panelHeight },
		title: { x: panelPadding, y: panelPadding, width: innerWidth, height: titleHeight },
		status: {
			x: panelPadding,
			y: panelPadding + titleHeight + spacing,
			width: innerWidth,
			height: statusHeight,
		},
	};
}

type IosOverlayHost = {
	UIWindow: any;
	UIViewController: any;
	UIView: any;
	UILabel: any;
	UIColor: any;
	UIFont: any;
	UIApplication: any;
	UIScreen: any;
	UIWindowLevelAlert?: number;
};

/**
 * Returns the iOS UIKit symbols we rely on if we're running on an iOS runtime
 * with the metadata bridge available. Returns null on Android, web, or in
 * tests so callers can gracefully fall back to the in-tree overlay.
 */
function getIosOverlayHost(): IosOverlayHost | null {
	const g = getOverlayGlobal();
	if (typeof g.UIWindow === 'undefined' || typeof g.UIApplication === 'undefined' || typeof g.UIViewController === 'undefined' || typeof g.UIView === 'undefined' || typeof g.UILabel === 'undefined' || typeof g.UIColor === 'undefined' || typeof g.UIFont === 'undefined' || typeof g.UIScreen === 'undefined') {
		return null;
	}
	return {
		UIWindow: g.UIWindow,
		UIViewController: g.UIViewController,
		UIView: g.UIView,
		UILabel: g.UILabel,
		UIColor: g.UIColor,
		UIFont: g.UIFont,
		UIApplication: g.UIApplication,
		UIScreen: g.UIScreen,
		UIWindowLevelAlert: typeof g.UIWindowLevelAlert === 'number' ? g.UIWindowLevelAlert : undefined,
	};
}

/**
 * Walks UIApplication.sharedApplication windows and returns the first active
 * UIWindowScene we can locate. On iOS 13+ every UIWindow is attached to a
 * scene, and we must initialise our overlay window the same way or the OS
 * will silently refuse to render it. Returns null when no scene is found
 * (older iOS versions or non-UI environments).
 */
function findActiveWindowScene(host: IosOverlayHost): any | null {
	try {
		const app = host.UIApplication.sharedApplication;
		const windows = app?.windows;
		if (!windows || typeof windows.count !== 'number') return null;
		for (let i = 0; i < windows.count; i++) {
			const w = windows.objectAtIndex(i);
			const scene = w && w.windowScene;
			if (scene) return scene;
		}
	} catch {}
	return null;
}

function buildIosOverlayRefs(state: HmrOverlayRuntimeState): IosOverlayRefs | null {
	const host = getIosOverlayHost();
	if (!host) return null;

	// Without a scene we can't build a modern UIWindow that actually renders.
	// Fall back to the in-tree overlay rather than show nothing.
	const scene = findActiveWindowScene(host);
	if (!scene) {
		if (state.verbose) {
			console.info('[ns-hmr-overlay] no active UIWindowScene; skipping iOS overlay promotion');
		}
		return null;
	}

	try {
		const { UIWindow, UIViewController, UIView, UILabel, UIColor, UIFont } = host;
		const window = UIWindow.alloc().initWithWindowScene(scene);
		window.windowLevel = computeIosOverlayWindowLevel(host.UIWindowLevelAlert ?? null);
		window.backgroundColor = UIColor.clearColor;
		window.hidden = true;

		const controller = UIViewController.new();
		controller.view.backgroundColor = UIColor.clearColor;
		window.rootViewController = controller;

		// UIViewAutoresizing bit masks. We mirror the UIKit constants here to
		// avoid depending on symbols the metadata bridge does not always
		// expose as top-level globals.
		const FLEXIBLE_LEFT_MARGIN = 1 << 0;
		const FLEXIBLE_WIDTH = 1 << 1;
		const FLEXIBLE_RIGHT_MARGIN = 1 << 2;
		const FLEXIBLE_TOP_MARGIN = 1 << 3;
		const FLEXIBLE_HEIGHT = 1 << 4;
		const FLEXIBLE_BOTTOM_MARGIN = 1 << 5;

		const backdrop = UIView.new();
		backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.35);
		backdrop.autoresizingMask = FLEXIBLE_WIDTH | FLEXIBLE_HEIGHT;
		controller.view.addSubview(backdrop);

		const panel = UIView.new();
		panel.backgroundColor = UIColor.whiteColor;
		panel.autoresizingMask = FLEXIBLE_LEFT_MARGIN | FLEXIBLE_RIGHT_MARGIN | FLEXIBLE_TOP_MARGIN | FLEXIBLE_BOTTOM_MARGIN;
		try {
			panel.layer.cornerRadius = 14;
			panel.layer.masksToBounds = true;
		} catch {}
		controller.view.addSubview(panel);

		const titleLabel = UILabel.new();
		titleLabel.numberOfLines = 0;
		titleLabel.textAlignment = 1; // NSTextAlignmentCenter
		titleLabel.font = UIFont.boldSystemFontOfSize(16);
		titleLabel.textColor = UIColor.blackColor;
		panel.addSubview(titleLabel);

		const statusLabel = UILabel.new();
		statusLabel.numberOfLines = 0;
		statusLabel.textAlignment = 1;
		statusLabel.font = UIFont.systemFontOfSize(13);
		statusLabel.textColor = UIColor.darkGrayColor;
		panel.addSubview(statusLabel);

		// Subtle drop-shadow so the toast chip reads against light app
		// content (white-on-white is invisible). The error / centered
		// branches still get the dim backdrop, so the shadow is mostly
		// a no-op for them — but it's a one-time setup.
		try {
			panel.layer.shadowColor = UIColor.blackColor.CGColor;
			panel.layer.shadowOpacity = 0.18;
			panel.layer.shadowRadius = 8;
			panel.layer.shadowOffset = { width: 0, height: 2 };
			panel.layer.masksToBounds = false;
		} catch {}

		// `wasVisible` / `currentPosition` are mutated by
		// applySnapshotToIosRefs when the snapshot triggers a slide-in
		// or slide-out. They start in the "hidden" state so the very
		// first visible snapshot animates in cleanly.
		return {
			window,
			controller,
			backdrop,
			panel,
			titleLabel,
			statusLabel,
			wasVisible: false,
			currentPosition: getHmrDevOverlayPosition(),
		};
	} catch (err) {
		console.warn('[ns-hmr-overlay] iOS overlay construction failed:', (err as any)?.message || err);
		return null;
	}
}

function ensureIosOverlayRefs(state: HmrOverlayRuntimeState): IosOverlayRefs | null {
	if (state.iosRefs) return state.iosRefs;
	if (state.iosBuildFailed) return null;
	const built = buildIosOverlayRefs(state);
	if (built) {
		state.iosRefs = built;
	} else {
		// Remember failure so we don't hammer construction on every snapshot
		// update — the in-tree path will take over for this session.
		state.iosBuildFailed = true;
	}
	return state.iosRefs;
}

function layoutIosOverlayRefs(refs: IosOverlayRefs, position: HmrOverlayPosition): IosOverlayLayout | null {
	try {
		const bounds = refs.controller.view.bounds;
		const viewWidth = Number(bounds?.size?.width) || 0;
		const viewHeight = Number(bounds?.size?.height) || 0;
		const raw = (refs.controller.view as any).safeAreaInsets;
		const safeInsets: IosSafeInsets = raw
			? {
					top: Number(raw.top) || 0,
					bottom: Number(raw.bottom) || 0,
					left: Number(raw.left) || 0,
					right: Number(raw.right) || 0,
				}
			: { top: 0, bottom: 0, left: 0, right: 0 };

		// Ask UIKit what the labels want given the panel inner width. We use a
		// generous height bound so nothing clips on long reconnect strings.
		const panelPadding = 16;
		const horizontalMargin = 24;
		const maxPanelWidth = 340;
		const innerWidth = Math.max(0, Math.min(maxPanelWidth, viewWidth - 2 * horizontalMargin - safeInsets.left - safeInsets.right) - 2 * panelPadding);
		const titleFit = refs.titleLabel.sizeThatFits({ width: innerWidth, height: 10000 }) || { height: 0 };
		const statusFit = refs.statusLabel.sizeThatFits({ width: innerWidth, height: 10000 }) || { height: 0 };

		const layout = computeIosOverlayLayout({
			viewWidth,
			viewHeight,
			safeInsets,
			titleHeight: Number(titleFit.height) || 0,
			statusHeight: Number(statusFit.height) || 0,
			maxPanelWidth,
			horizontalMargin,
			panelPadding,
			position,
		});

		const toCgRect = (rect: IosRect) => ({
			origin: { x: rect.x, y: rect.y },
			size: { width: rect.width, height: rect.height },
		});

		refs.backdrop.frame = toCgRect(layout.backdrop);
		refs.panel.frame = toCgRect(layout.panel);
		refs.titleLabel.frame = toCgRect(layout.title);
		refs.statusLabel.frame = toCgRect(layout.status);
		return layout;
	} catch (err) {
		console.warn('[ns-hmr-overlay] iOS overlay layout failed:', (err as any)?.message || err);
		return null;
	}
}

/**
 * Slide-in animation for the iOS toast panel. Off-screen start frame
 * lives just above (top) or below (bottom) the visible area; the panel
 * snaps to its target frame with a spring so the motion feels physical
 * without the heavy "settle" overshoot of a hard spring (damping 0.85
 * lands quickly with a small overshoot).
 */
function animateIosPanelIn(refs: IosOverlayRefs, position: HmrOverlayPosition, layout: IosOverlayLayout): void {
	const g = getOverlayGlobal();
	const UIView = g?.UIView;
	if (!UIView) return;
	try {
		const targetFrame = {
			origin: { x: layout.panel.x, y: layout.panel.y },
			size: { width: layout.panel.width, height: layout.panel.height },
		};
		// Off-screen start: distance includes a small fudge so the
		// shadow blur tail isn't visible at t=0.
		const startY = position === 'bottom' ? layout.backdrop.height + 24 : -(layout.panel.height + 24);
		refs.panel.frame = {
			origin: { x: layout.panel.x, y: startY },
			size: { width: layout.panel.width, height: layout.panel.height },
		};
		refs.panel.alpha = 0;
		try {
			if (typeof UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion === 'function') {
				UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(
					0.42,
					0,
					0.85,
					0.7,
					0,
					() => {
						refs.panel.frame = targetFrame;
						refs.panel.alpha = 1;
					},
					null,
				);
			} else if (typeof UIView.animateWithDurationAnimations === 'function') {
				UIView.animateWithDurationAnimations(0.32, () => {
					refs.panel.frame = targetFrame;
					refs.panel.alpha = 1;
				});
			} else {
				refs.panel.frame = targetFrame;
				refs.panel.alpha = 1;
			}
		} catch {
			refs.panel.frame = targetFrame;
			refs.panel.alpha = 1;
		}
	} catch {}
}

/**
 * Slide-out animation for the iOS toast panel. Mirrors animateIosPanelIn:
 * the panel travels to the nearest off-screen edge while fading out so
 * the dismissal still feels intentional even on fast HMR cycles.
 */
function animateIosPanelOut(refs: IosOverlayRefs, position: HmrOverlayPosition, onComplete: () => void): void {
	const g = getOverlayGlobal();
	const UIView = g?.UIView;
	const currentFrame = refs.panel?.frame;
	if (!UIView || !currentFrame) {
		onComplete();
		return;
	}
	try {
		const bounds = refs.controller?.view?.bounds;
		const viewHeight = Number(bounds?.size?.height) || 0;
		const targetY = position === 'bottom' ? viewHeight + 24 : -(Number(currentFrame.size?.height) + 24);
		const startFrame = currentFrame;
		const targetFrame = {
			origin: { x: Number(startFrame.origin?.x) || 0, y: targetY },
			size: startFrame.size,
		};
		try {
			if (typeof UIView.animateWithDurationDelayOptionsAnimationsCompletion === 'function') {
				// UIViewAnimationOptionCurveEaseIn = 1 << 16 — accelerate
				// out so the dismissal doesn't drag on screen.
				UIView.animateWithDurationDelayOptionsAnimationsCompletion(
					0.22,
					0,
					1 << 16,
					() => {
						refs.panel.frame = targetFrame;
						refs.panel.alpha = 0;
					},
					() => onComplete(),
				);
			} else if (typeof UIView.animateWithDurationAnimationsCompletion === 'function') {
				UIView.animateWithDurationAnimationsCompletion(
					0.22,
					() => {
						refs.panel.frame = targetFrame;
						refs.panel.alpha = 0;
					},
					() => onComplete(),
				);
			} else {
				refs.panel.alpha = 0;
				onComplete();
			}
		} catch {
			refs.panel.alpha = 0;
			onComplete();
		}
	} catch {
		onComplete();
	}
}

function applySnapshotToIosRefs(refs: IosOverlayRefs | null, snapshot: HmrOverlaySnapshot): boolean {
	if (!refs) return false;
	try {
		// 'update' mode rides the same dedicated UIWindow as
		// 'connection' so the HMR apply overlay always stacks above
		// modals/sheets/system alerts. The window is constructed
		// lazily (ensureIosOverlayRefs) and reused for the lifetime of
		// the dev session.
		const visible = snapshot.visible && (snapshot.mode === 'connection' || snapshot.mode === 'update');
		const wasVisible = !!refs.wasVisible;
		const position = getHmrDevOverlayPosition();
		const previousPosition = refs.currentPosition;
		const isToast = position !== 'center';

		// Touches pass through the overlay window in toast mode so
		// the user can keep tapping the app while the HMR chip is
		// shown. In centered mode we keep the blocking
		// behaviour (the dim backdrop is itself a hint to wait).
		try {
			refs.window.userInteractionEnabled = !isToast;
		} catch {}

		if (!visible) {
			// Animate out before hiding the window so the dismissal
			// has a discoverable motion. Only animate when previously
			// visible and in toast mode — centered modal hides instantly.
			if (wasVisible && isToast) {
				animateIosPanelOut(refs, previousPosition, () => {
					try {
						refs.window.hidden = true;
					} catch {}
				});
			} else {
				refs.window.hidden = true;
			}
			refs.wasVisible = false;
			refs.currentPosition = position;
			return true;
		}

		refs.window.hidden = false;
		refs.titleLabel.text = snapshot.title || '';
		refs.statusLabel.text = formatStatusText(snapshot);

		const host = getIosOverlayHost();
		if (host) {
			const { UIColor } = host;
			const isError = snapshot.tone === 'error';
			const isSuccess = snapshot.tone === 'success';
			try {
				if (isError) {
					// Red panel + dark red text (existing UX).
					refs.panel.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(1, 0.96, 0.96, 1);
					refs.titleLabel.textColor = UIColor.colorWithRedGreenBlueAlpha(0.7, 0.1, 0.06, 1);
					refs.statusLabel.textColor = UIColor.colorWithRedGreenBlueAlpha(0.7, 0.1, 0.06, 0.9);
				} else if (isSuccess) {
					// Slightly more saturated green panel + dark-green
					// text. The previous 0.94/0.99/0.95 background was
					// nearly indistinguishable from white on most
					// devices; this bump keeps long detail strings
					// readable while making the apply event obviously
					// "happening right now".
					refs.panel.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0.9, 0.97, 0.91, 1);
					refs.titleLabel.textColor = UIColor.colorWithRedGreenBlueAlpha(0.05, 0.43, 0.18, 1);
					refs.statusLabel.textColor = UIColor.colorWithRedGreenBlueAlpha(0.05, 0.43, 0.18, 1);
				} else {
					// Default (info / warn) — existing connection look.
					refs.panel.backgroundColor = UIColor.whiteColor;
					refs.titleLabel.textColor = UIColor.blackColor;
					refs.statusLabel.textColor = UIColor.darkGrayColor;
				}

				// Backdrop dims only in centered mode; toast mode keeps
				// the rest of the app fully visible/usable. Errors get
				// a slightly stronger dim in centered mode because the
				// user MUST notice them.
				if (isToast) {
					refs.backdrop.backgroundColor = UIColor.clearColor;
				} else if (isError) {
					refs.backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.35);
				} else if (isSuccess) {
					refs.backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0.15, 0.05, 0.28);
				} else {
					refs.backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.35);
				}
			} catch {}
		}

		const layout = layoutIosOverlayRefs(refs, position);
		// Slide-in animation only fires on the actual hidden→visible
		// transition (or on a position swap — e.g. dev toggling top
		// to bottom mid-cycle). Subsequent updates within the same
		// visible cycle just refresh text/colours without re-animating.
		const positionChanged = previousPosition !== position;
		const justAppeared = !wasVisible || positionChanged;
		if (justAppeared && isToast && layout) {
			animateIosPanelIn(refs, position, layout);
		} else if (justAppeared && !isToast) {
			// Centered modal: ensure alpha is reset to 1 in case a
			// previous toast-mode dismissal left it at 0.
			try {
				refs.panel.alpha = 1;
			} catch {}
		}

		refs.wasVisible = true;
		refs.currentPosition = position;
		return true;
	} catch (err) {
		console.warn('[ns-hmr-overlay] iOS overlay apply failed:', (err as any)?.message || err);
		return false;
	}
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
			// order across boot paths (native `__nsStartDevSession` vs the
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

export function ensureHmrDevOverlayRuntimeInstalled(verbose?: boolean): HmrOverlayApi {
	const g = getOverlayGlobal();
	const state = getRuntimeState();
	state.verbose = state.verbose || !!verbose;
	if (!g.__NS_HMR_DEV_OVERLAY__) {
		g.__NS_HMR_DEV_OVERLAY__ = createOverlayApi();
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
