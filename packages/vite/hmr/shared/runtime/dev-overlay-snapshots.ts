// Pure snapshot model for the HMR dev overlay: the stage enums and the
// factories that turn a stage + info into an immutable `HmrOverlaySnapshot`.
// No view-tree or platform dependencies live here — rendering is in
// `dev-overlay.ts`, so these factories are trivially unit-testable.

type HmrOverlayTone = 'info' | 'warn' | 'error' | 'success';

// 'connection' and 'update' share the small live panel; 'hidden' is the resting state.
type HmrOverlayMode = 'hidden' | 'connection' | 'update';

// Where the live (connection/update) overlay renders. 'top'/'bottom' slide in a
// safe-area toast chip with a transparent backdrop; 'center' is the dimmed modal.
// Override per-session via `globalThis.__NS_HMR_OVERLAY_POSITION__` or
// `setHmrDevOverlayPosition()`.
export type HmrOverlayPosition = 'top' | 'bottom' | 'center';

export type HmrConnectionStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline' | 'healthy';

// HMR apply stages, in chronological order (received → evicting → reimporting →
// rebooting → complete, or failed). Progress percentages are deliberately non-linear so the
// bar keeps moving through the long re-import + reboot tail. 'restart-required' is
// terminal: the change can only be applied by restarting the app.
export type HmrUpdateStage = 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete' | 'failed' | 'restart-required';

/** A button on the panel. Only the `failed` update stage shows one. */
export type HmrOverlayAction = {
	label: string;
	onTap: () => void;
};

export type HmrOverlayStageInfo = {
	detail?: string;
	/** Preformatted text (a code frame, a stack) drawn in a monospaced font below the detail. */
	code?: string;
	action?: HmrOverlayAction;
	progress?: number | null;
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
	code?: string;
	action?: HmrOverlayAction;
};

export const DEFAULT_SNAPSHOT: HmrOverlaySnapshot = {
	visible: false,
	mode: 'hidden',
	badge: 'HMR',
	title: 'NativeScript Vite preparing dev session...',
	phase: '',
	detail: '',
	progress: null,
	busy: false,
	blocking: false,
	tone: 'info',
};

const HMR_UPDATE_TITLE = 'HMR update applying...';
const HMR_UPDATE_DONE_TITLE = 'HMR update applied';
const HMR_UPDATE_FAILED_TITLE = 'HMR update failed';
const HMR_RESTART_REQUIRED_TITLE = 'Restart required';

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
			phase: 'Rebooting app',
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
		failed: {
			visible: true,
			mode: 'update',
			badge: 'HMR',
			title: HMR_UPDATE_FAILED_TITLE,
			phase: 'See the terminal for details',
			detail: '',
			progress: null,
			busy: false,
			blocking: false,
			tone: 'error',
		},
		'restart-required': {
			visible: true,
			mode: 'update',
			badge: 'RESTART',
			title: HMR_RESTART_REQUIRED_TITLE,
			phase: 'This change needs an app restart',
			detail: '',
			progress: null,
			busy: false,
			blocking: false,
			tone: 'warn',
		},
	};

	const base = phaseInfo[stage];
	const snapshot: HmrOverlaySnapshot = {
		...base,
		detail: info?.detail || base.detail,
		progress: typeof info?.progress === 'number' || info?.progress === null ? info.progress : base.progress,
	};
	if (stage === 'failed') {
		if (info?.code) snapshot.code = info.code;
		if (info?.action && typeof info.action.onTap === 'function') snapshot.action = info.action;
	}
	return snapshot;
}
