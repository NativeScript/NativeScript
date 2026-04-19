type HmrOverlayTone = 'info' | 'warn' | 'error';
type HmrOverlayMode = 'hidden' | 'boot' | 'connection';

export type HmrBootStage = 'placeholder' | 'probing-origin' | 'loading-entry-runtime' | 'configuring-import-map' | 'loading-runtime-bridge' | 'loading-core-bridge' | 'preloading-style-scope' | 'installing-css' | 'importing-main' | 'waiting-for-app' | 'app-root-committed' | 'ready' | 'error';

export type HmrConnectionStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline' | 'healthy';

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

type HmrOverlayRuntimeState = {
	snapshot: HmrOverlaySnapshot;
	bootRefs: BootOverlayRefs | null;
	liveRefs: LiveOverlayRefs | null;
	verbose: boolean;
};

type HmrOverlayApi = {
	ensureBootPage: (verbose?: boolean) => any | null;
	setBootStage: (stage: HmrBootStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	setConnectionStage: (stage: HmrConnectionStage, info?: HmrOverlayStageInfo) => HmrOverlaySnapshot;
	hide: (reason?: string) => void;
	getSnapshot: () => HmrOverlaySnapshot;
};

const BOOT_TITLE = 'Starting NativeScript + Vite dev server…';

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
			verbose: false,
		} satisfies HmrOverlayRuntimeState;
	}
	return g.__NS_HMR_DEV_OVERLAY_STATE__ as HmrOverlayRuntimeState;
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
			title: 'Waiting for the Vite dev server',
			phase: 'Opening the websocket connection',
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
			phase: 'Reconnecting to the Vite websocket',
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
			phase: 'Waiting for a healthy dev server',
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
	refs.page.backgroundColor = asColor('#FFF9FAFB');
	refs.root.visibility = snapshot.visible && snapshot.mode === 'boot' ? 'visible' : 'collapse';
	refs.titleLabel.text = BOOT_TITLE;
	refs.titleLabel.color = asColor('#FF111827');
	refs.statusLabel.text = formatStatusText(snapshot) || 'Preparing the HTTP HMR bootstrap (4%)';
	refs.statusLabel.color = asColor(snapshot.tone === 'error' ? '#FFB91C1C' : '#FF4B5563');
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
		statusLabel.color = asColor(snapshot.tone === 'error' ? '#FFB91C1C' : '#FF4B5563');
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
	const visible = snapshot.visible && snapshot.mode === 'connection';
	refs.overlay.visibility = visible ? 'visible' : 'collapse';
	refs.overlay.backgroundColor = asColor(snapshot.tone === 'error' ? '#AA7F1D1D' : '#992D3748');
	refs.titleLabel.text = snapshot.title;
	refs.titleLabel.color = asColor('#FF111827');
	refs.statusLabel.text = formatStatusText(snapshot);
	refs.statusLabel.color = asColor(snapshot.tone === 'error' ? '#FF7F1D1D' : '#FF374151');
	try {
		const panel = refs.titleLabel.parent;
		if (panel) {
			panel.backgroundColor = asColor('#FFFFFFFF');
			panel.opacity = 1;
			panel.padding = 16;
			try {
				panel.borderRadius = 12;
			} catch {}
		}
	} catch {}
}

function applyRuntimeSnapshot(snapshot: HmrOverlaySnapshot): HmrOverlaySnapshot {
	const state = getRuntimeState();
	state.snapshot = snapshot;
	// Update the boot status label created by root-placeholder.ts
	if (snapshot.mode === 'boot') {
		updateBootStatusLabel(snapshot);
	}
	applySnapshotToBootRefs(state.bootRefs, snapshot);
	if (snapshot.visible && snapshot.mode === 'connection') {
		const liveRefs = ensureLiveOverlayRefs(snapshot);
		applySnapshotToLiveRefs(liveRefs, snapshot);
	} else {
		applySnapshotToLiveRefs(state.liveRefs, snapshot);
	}
	return state.snapshot;
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
			return applyRuntimeSnapshot(createBootOverlaySnapshot(stage, info));
		},
		setConnectionStage(stage: HmrConnectionStage, info?: HmrOverlayStageInfo) {
			return applyRuntimeSnapshot(createConnectionOverlaySnapshot(stage, info));
		},
		hide() {
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

export function hideHmrDevOverlay(reason?: string): void {
	void reason;
	ensureHmrDevOverlayRuntimeInstalled().hide(reason);
}
