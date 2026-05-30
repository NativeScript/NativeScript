// Pure snapshot model for the HMR dev overlay: the stage enums and the
// factories that turn a stage + info into an immutable `HmrOverlaySnapshot`.
// No view-tree or platform dependencies live here — rendering is in
// `dev-overlay.ts`, so these factories are trivially unit-testable.

type HmrOverlayTone = 'info' | 'warn' | 'error' | 'success';

// 'boot' is the full-screen cold-boot placeholder; 'connection' and 'update'
// share the small live panel; 'hidden' is the resting state.
type HmrOverlayMode = 'hidden' | 'boot' | 'connection' | 'update';

// Where the live (connection/update) overlay renders. 'top'/'bottom' slide in a
// safe-area toast chip with a transparent backdrop; 'center' is the dimmed modal.
// Override per-session via `globalThis.__NS_HMR_OVERLAY_POSITION__` or
// `setHmrDevOverlayPosition()`.
export type HmrOverlayPosition = 'top' | 'bottom' | 'center';

export type HmrBootStage = 'placeholder' | 'probing-origin' | 'loading-entry-runtime' | 'configuring-import-map' | 'loading-runtime-bridge' | 'loading-core-bridge' | 'preloading-style-scope' | 'installing-css' | 'importing-main' | 'waiting-for-app' | 'app-root-committed' | 'ready' | 'error';

export type HmrConnectionStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline' | 'healthy';

// HMR apply stages, in chronological order (received → evicting → reimporting →
// rebooting → complete). Progress percentages are deliberately non-linear so the
// bar keeps moving through the long re-import + reboot tail.
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

export const BOOT_TITLE = 'NativeScript Vite preparing dev session...';

export const DEFAULT_SNAPSHOT: HmrOverlaySnapshot = {
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

const HMR_UPDATE_TITLE = 'HMR update applying...';
const HMR_UPDATE_DONE_TITLE = 'HMR update applied';

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
			// 30 (not 82) so the bar visibly climbs the ~62 points the heartbeat +
			// snippet drive during the long HTTP-module-load phase. The monotonic
			// ratchet in `setBootStage` prevents earlier-but-higher stages from
			// being clobbered.
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
