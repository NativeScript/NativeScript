/**
 * iOS UIWindow overlay backend. The live/connection/update overlay is
 * promoted to its own UIWindow (above `UIWindowLevelAlert`) so the dev
 * surface never gets obscured by modals, bottom sheets, or any other window
 * presented by the host app. Falls back to null (→ in-tree backend) on
 * Android, web, tests, or when scene/window construction fails.
 *
 * The layout math (`computeIosOverlayLayout`, `computeIosOverlayWindowLevel`)
 * is pure and deterministic so the rules stay unit-testable without booting a
 * simulator — see `dev-overlay.spec.ts`.
 */

import { type HmrOverlayPosition, type HmrOverlaySnapshot } from './dev-overlay-snapshots.js';
import { formatStatusText, getHmrDevOverlayPosition, getOverlayGlobal, type HmrOverlayRuntimeState, type IosOverlayRefs } from './dev-overlay-shared.js';

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
export function getIosOverlayHost(): IosOverlayHost | null {
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

export function ensureIosOverlayRefs(state: HmrOverlayRuntimeState): IosOverlayRefs | null {
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

export function applySnapshotToIosRefs(refs: IosOverlayRefs | null, snapshot: HmrOverlaySnapshot): boolean {
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
