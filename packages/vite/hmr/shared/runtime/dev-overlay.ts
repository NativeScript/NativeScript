// Round-eleven.3 (alpha.62) — Add 'success' tone for in-progress HMR
// applies. The boot/error overlays already use 'info'/'warn'/'error';
// 'success' is the calm green that signals "things are happening
// correctly right now" without competing with error/warn states. The
// existing tone-switches (panel bg, text colour, backdrop alpha) all
// continue to default to the non-error branch; we just opt success
// into a tinted-green branch wherever those switches live.
type HmrOverlayTone = 'info' | 'warn' | 'error' | 'success';

// Round-eleven.3 — 'update' is the small-panel surface we render
// during an HMR cycle. It reuses the connection overlay's window /
// in-tree wrapper so we get the exact same z-order guarantees on iOS
// (above modals, sheets, and the dev banner) without duplicating the
// view-construction code.
type HmrOverlayMode = 'hidden' | 'boot' | 'connection' | 'update';

export type HmrBootStage = 'placeholder' | 'probing-origin' | 'loading-entry-runtime' | 'configuring-import-map' | 'loading-runtime-bridge' | 'loading-core-bridge' | 'preloading-style-scope' | 'installing-css' | 'importing-main' | 'waiting-for-app' | 'app-root-committed' | 'ready' | 'error';

export type HmrConnectionStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline' | 'healthy';

// Round-eleven.3 — HMR apply stages, in chronological order. The
// progression matches what the angular client does inside
// handleAngularHotUpdateMessage:
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
};

type HmrOverlayRuntimeState = {
	snapshot: HmrOverlaySnapshot;
	bootRefs: BootOverlayRefs | null;
	liveRefs: LiveOverlayRefs | null;
	iosRefs: IosOverlayRefs | null;
	iosBuildFailed: boolean;
	verbose: boolean;
	// Round-eleven.3 — Single auto-hide timer for HMR apply
	// completions. Held on the runtime state (not per-API-instance) so
	// re-entrant calls from session-bootstrap reuses the same timer
	// rather than racing each other. The callback only hides the
	// overlay if the snapshot is still 'update' / 'complete' — if a
	// new HMR cycle has already reset it to 'update' / 'received', we
	// silently no-op so the second cycle's progress isn't ripped out
	// from under it.
	updateAutoHideTimer: ReturnType<typeof setTimeout> | null;
};

type HmrOverlayApi = {
	ensureBootPage: (verbose?: boolean) => any | null;
	setBootStage: (stage: HmrBootStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	setConnectionStage: (stage: HmrConnectionStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	// Round-eleven.3 — Drive the HMR-applying progress overlay. Callers
	// (e.g., the angular client) walk: received → evicting → reimporting
	// → rebooting → complete. Setting 'complete' enqueues a short auto-
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
		} satisfies HmrOverlayRuntimeState;
	}
	const state = g.__NS_HMR_DEV_OVERLAY_STATE__ as Partial<HmrOverlayRuntimeState>;
	// Backfill newer fields for legacy state objects (e.g. after hot reload)
	// so we never observe an undefined iosRefs/iosBuildFailed at runtime.
	if (typeof state.iosRefs === 'undefined') state.iosRefs = null;
	if (typeof state.iosBuildFailed === 'undefined') state.iosBuildFailed = false;
	if (typeof state.updateAutoHideTimer === 'undefined') state.updateAutoHideTimer = null;
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
			progress: 82,
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
			phase: 'Reconnecting Vite websocket',
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

// Round-eleven.3 (alpha.62) — Snapshot factory for the HMR-applying
// overlay. Each stage owns a fixed phase string, badge, and progress
// %. We pick the percentages so users see continuous forward motion:
// the cheap stages (mutex acquire, eviction call) advance fast; the
// long tail (entry re-import + Angular reboot) sits at 60→90 so the
// bar keeps moving even when the V8 ESM walk dominates wall time.
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

	const panel = new StackLayout();
	panel.horizontalAlignment = 'center';
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

function applySnapshotToLiveRefs(refs: Pick<LiveOverlayRefs, 'overlay' | 'titleLabel' | 'statusLabel'> | null, snapshot: HmrOverlaySnapshot): void {
	if (!refs) {
		return;
	}
	// Round-eleven.3 — 'update' mode shares the live (in-tree) overlay
	// chrome with 'connection'. Both render a centered panel inside the
	// page; only the colours and text change with the snapshot's tone.
	const visible = snapshot.visible && (snapshot.mode === 'connection' || snapshot.mode === 'update');
	refs.overlay.visibility = visible ? 'visible' : 'collapse';
	// Backdrop tints by tone:
	//   error   → red wash (matches existing UX)
	//   success → soft green wash, deliberately lighter than the
	//             warn-orange so the underlying app remains readable
	//             during a fast HMR cycle (300–2000ms)
	//   default → warm orange (existing connection-overlay look)
	const overlayBg = snapshot.tone === 'error' ? '#b4181068' : snapshot.tone === 'success' ? '#1f883d2e' : '#a1771683';
	refs.overlay.backgroundColor = asColor(overlayBg);
	refs.titleLabel.text = snapshot.title;
	const textColor = snapshot.tone === 'error' ? '#b41810e6' : snapshot.tone === 'success' ? '#0e6e2fe6' : '#563e3fb1';
	refs.titleLabel.color = asColor(textColor);
	refs.statusLabel.text = formatStatusText(snapshot);
	refs.statusLabel.color = asColor(textColor);
	try {
		const panel = refs.titleLabel.parent;
		if (panel) {
			// Subtle green-tinted panel for HMR-apply, plain white
			// otherwise. Keeps the apply overlay distinct from the
			// boot/connection overlays at a glance.
			const panelBg = snapshot.tone === 'success' ? '#F1FCF3FF' : '#FFFFFFFF';
			panel.backgroundColor = asColor(panelBg);
			panel.opacity = 1;
			panel.padding = 16;
			try {
				panel.borderRadius = 12;
			} catch {}
		}
	} catch {}
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
 * (max panel width, centered placement, safe-area clamping, sane defaults)
 * from tests.
 */
export function computeIosOverlayLayout(input: { viewWidth: number; viewHeight: number; safeInsets?: IosSafeInsets | null; titleHeight: number; statusHeight: number; maxPanelWidth?: number; horizontalMargin?: number; panelPadding?: number; interLabelSpacing?: number; minTopInset?: number }): IosOverlayLayout {
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

	const available = Math.max(0, viewWidth - 2 * horizontalMargin - safeInsets.left - safeInsets.right);
	const panelWidth = Math.min(maxPanelWidth, available);
	const innerWidth = Math.max(0, panelWidth - 2 * panelPadding);

	const spacing = titleHeight > 0 && statusHeight > 0 ? interLabelSpacing : 0;
	const panelHeight = panelPadding * 2 + titleHeight + spacing + statusHeight;
	const panelX = Math.max(0, (viewWidth - panelWidth) / 2);
	// Center vertically, but never cross the top safe-area inset (notch/Dynamic Island).
	const centered = (viewHeight - panelHeight) / 2;
	const panelY = Math.max(safeInsets.top + minTopInset, centered);

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
			try {
				console.info('[ns-hmr-overlay] no active UIWindowScene; skipping iOS overlay promotion');
			} catch {}
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

		return { window, controller, backdrop, panel, titleLabel, statusLabel };
	} catch (err) {
		try {
			console.warn('[ns-hmr-overlay] iOS overlay construction failed:', (err as any)?.message || err);
		} catch {}
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

function layoutIosOverlayRefs(refs: IosOverlayRefs): void {
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
		});

		const toCgRect = (rect: IosRect) => ({
			origin: { x: rect.x, y: rect.y },
			size: { width: rect.width, height: rect.height },
		});

		refs.backdrop.frame = toCgRect(layout.backdrop);
		refs.panel.frame = toCgRect(layout.panel);
		refs.titleLabel.frame = toCgRect(layout.title);
		refs.statusLabel.frame = toCgRect(layout.status);
	} catch (err) {
		try {
			console.warn('[ns-hmr-overlay] iOS overlay layout failed:', (err as any)?.message || err);
		} catch {}
	}
}

function applySnapshotToIosRefs(refs: IosOverlayRefs | null, snapshot: HmrOverlaySnapshot): boolean {
	if (!refs) return false;
	try {
		// Round-eleven.3 — 'update' mode rides the same dedicated
		// UIWindow as 'connection' so the HMR apply overlay always
		// stacks above modals/sheets/system alerts. The window is
		// constructed lazily (ensureIosOverlayRefs) and reused for the
		// lifetime of the dev session.
		const visible = snapshot.visible && (snapshot.mode === 'connection' || snapshot.mode === 'update');
		refs.window.hidden = !visible;
		if (!visible) return true;

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
					// Slightly stronger dimming on errors; users need to
					// notice these.
					refs.backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.35);
				} else if (isSuccess) {
					// Tinted-green panel + dark-green text. We
					// deliberately keep the panel readable (off-white
					// with green tint) instead of a saturated green so
					// long detail strings (e.g., file paths) stay easy
					// to read on small screens.
					refs.panel.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0.94, 0.99, 0.95, 1);
					refs.titleLabel.textColor = UIColor.colorWithRedGreenBlueAlpha(0.05, 0.43, 0.18, 1);
					refs.statusLabel.textColor = UIColor.colorWithRedGreenBlueAlpha(0.05, 0.43, 0.18, 0.9);
					// Lighter dimming during HMR — the cycle is short
					// (300–2000ms) and we don't want to obscure the
					// app's UI underneath while a save lands.
					refs.backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.12);
				} else {
					// Default (info / warn) — existing connection look.
					refs.panel.backgroundColor = UIColor.whiteColor;
					refs.titleLabel.textColor = UIColor.blackColor;
					refs.statusLabel.textColor = UIColor.darkGrayColor;
					refs.backdrop.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.35);
				}
			} catch {}
		}

		layoutIosOverlayRefs(refs);
		return true;
	} catch (err) {
		try {
			console.warn('[ns-hmr-overlay] iOS overlay apply failed:', (err as any)?.message || err);
		} catch {}
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

// Round-eleven.3 — How long the 'complete' frame stays on screen
// before we auto-hide. Long enough to register visually, short enough
// to feel snappy. 350ms keeps the perception of "the update landed
// successfully" without blocking quick repeated saves.
const UPDATE_AUTO_HIDE_MS = 350;

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
				applyRuntimeSnapshot({ ...DEFAULT_SNAPSHOT });
			}
		}, UPDATE_AUTO_HIDE_MS);
	} catch {
		// setTimeout missing (extremely rare; some test envs). Fall
		// back to immediate hide so we never leave the overlay visible
		// forever after a 'complete'.
		applyRuntimeSnapshot({ ...DEFAULT_SNAPSHOT });
	}
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
			clearUpdateAutoHideTimer(getRuntimeState());
			return applyRuntimeSnapshot(createBootOverlaySnapshot(stage, info));
		},
		setConnectionStage(stage: HmrConnectionStage, info?: HmrOverlayStageInfo) {
			clearUpdateAutoHideTimer(getRuntimeState());
			return applyRuntimeSnapshot(createConnectionOverlaySnapshot(stage, info));
		},
		setUpdateStage(stage: HmrUpdateStage, info?: HmrOverlayStageInfo) {
			const state = getRuntimeState();
			// Each new in-progress stage cancels any pending auto-hide
			// from a previous cycle. Without this, two saves in quick
			// succession could see cycle-2's progress overlay yanked
			// off by cycle-1's already-scheduled hide.
			clearUpdateAutoHideTimer(state);
			const snapshot = applyRuntimeSnapshot(createUpdateOverlaySnapshot(stage, info));
			if (stage === 'complete') {
				scheduleUpdateAutoHide(state);
			}
			return snapshot;
		},
		hide() {
			clearUpdateAutoHideTimer(getRuntimeState());
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

// Round-eleven.3 — Public entry point for driving the HMR-applying
// overlay. Callers walk through stages (received → evicting →
// reimporting → rebooting → complete); 'complete' auto-hides after a
// short interval. Soft-fails (no-op) if the runtime overlay was never
// installed (e.g., production builds, test environments).
export function setHmrUpdateStage(stage: HmrUpdateStage, info?: HmrOverlayStageInfo): HmrOverlaySnapshot {
	return ensureHmrDevOverlayRuntimeInstalled().setUpdateStage(stage, info);
}

export function hideHmrDevOverlay(reason?: string): void {
	void reason;
	ensureHmrDevOverlayRuntimeInstalled().hide(reason);
}
