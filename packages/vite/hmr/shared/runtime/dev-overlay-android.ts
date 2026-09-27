/**
 * Android host for the HMR dev overlay (connection + apply-progress chip).
 *
 * The chip is built from plain Android widgets and attached to the Activity's
 * DecorView, so it never enters the NativeScript view tree. The in-tree host
 * (`dev-overlay-tree.ts`) re-parents `page.content` into a wrapper layout to
 * mount its chip; on Android that tears down and re-creates the native view of
 * every descendant (`_tearDownUI` → `_setupUI`), which destroys SurfaceViews and
 * TextureViews (canvas/GPU/video surfaces) under the app's feet. Anything holding
 * a context on such a surface is left pointing at a released native object.
 *
 * Mirrors `dev-overlay-ios.ts`: build once, re-attach when the Activity (and thus
 * its DecorView) is recreated, and fall back to the in-tree host when there is no
 * Activity to attach to (tests, web, early boot).
 */
import { type HmrOverlayPosition, type HmrOverlaySnapshot } from './dev-overlay-snapshots.js';
import { type AndroidOverlayRefs, formatStatusText, getHmrDevOverlayPosition, getOverlayGlobal, type HmrOverlayRuntimeState, resolveCoreExport } from './dev-overlay-shared.js';
import { type AndroidSafeAreaInsets, computeAndroidToastMargin, readAndroidSafeAreaInsets } from './dev-overlay-tree.js';

export type AndroidOverlayHost = {
	android: any;
	activity: any;
	decor: any;
};

export type AndroidPanelLayout = {
	position: HmrOverlayPosition;
	widthPx: number;
	marginPx: { top: number; right: number; bottom: number; left: number };
};

const PANEL_MAX_WIDTH_DP = 320;
const PANEL_PADDING_DP = 16;
const PANEL_RADIUS_DP = 12;
const PANEL_ELEVATION_DP = 8;
const LABEL_SPACING_DP = 10;
const SLIDE_DISTANCE_DP = 80;

const MATCH_PARENT = -1;
const WRAP_CONTENT = -2;

/**
 * `#RRGGBBAA` (the NativeScript `Color` string form used by the in-tree host) to
 * the packed ARGB int Android's `setColor` / `setTextColor` take. The result is a
 * signed 32-bit value like Java's `int` (alpha >= 0x80 makes it negative).
 */
export function hexRgbaToAndroidArgb(value: string): number {
	const hex = String(value || '')
		.trim()
		.replace(/^#/, '');
	const expanded =
		hex.length === 3 || hex.length === 4
			? hex
					.split('')
					.map((c) => c + c)
					.join('')
			: hex;
	const padded = expanded.length === 6 ? `${expanded}FF` : expanded;
	if (!/^[0-9a-fA-F]{8}$/.test(padded)) {
		return 0;
	}
	const r = parseInt(padded.slice(0, 2), 16);
	const g = parseInt(padded.slice(2, 4), 16);
	const b = parseInt(padded.slice(4, 6), 16);
	const a = parseInt(padded.slice(6, 8), 16);
	return (a << 24) | (r << 16) | (g << 8) | b | 0;
}

/**
 * Pixel placement for the chip inside a DecorView-sized FrameLayout. Margins reuse
 * the in-tree host's safe-area math (dp) scaled by density; the width is capped by
 * whatever horizontal room the host leaves after those margins.
 */
export function computeAndroidPanelLayout(input: { position: HmrOverlayPosition; density: number; hostWidthPx?: number; safeInsets?: AndroidSafeAreaInsets | null; maxPanelWidthDp?: number }): AndroidPanelLayout {
	const density = Number.isFinite(input.density) && input.density > 0 ? input.density : 1;
	const margin = computeAndroidToastMargin({ position: input.position, safeInsets: input.safeInsets });
	const marginPx = {
		top: Math.round(margin.top * density),
		right: Math.round(margin.right * density),
		bottom: Math.round(margin.bottom * density),
		left: Math.round(margin.left * density),
	};
	const maxWidthPx = Math.round((input.maxPanelWidthDp ?? PANEL_MAX_WIDTH_DP) * density);
	const hostWidthPx = Math.max(0, Number(input.hostWidthPx) || 0);
	const available = hostWidthPx > 0 ? Math.max(0, hostWidthPx - marginPx.left - marginPx.right) : maxWidthPx;
	return { position: input.position, widthPx: Math.min(maxWidthPx, available), marginPx };
}

export function getAndroidOverlayHost(): AndroidOverlayHost | null {
	const g = getOverlayGlobal();
	const android = g.android;
	if (!android?.widget?.FrameLayout || !android?.widget?.LinearLayout || !android?.widget?.TextView || !android?.view?.View || !android?.view?.Gravity) {
		return null;
	}
	let activity: any = null;
	try {
		const Application = resolveCoreExport('Application');
		activity = Application?.android?.foregroundActivity || Application?.android?.startActivity || null;
	} catch {}
	let decor: any = null;
	try {
		decor = activity?.getWindow?.()?.getDecorView?.() || null;
	} catch {}
	if (!activity || !decor) {
		return null;
	}
	return { android, activity, decor };
}

function readDensity(activity: any): number {
	try {
		const density = Number(activity?.getResources?.()?.getDisplayMetrics?.()?.density);
		if (Number.isFinite(density) && density > 0) {
			return density;
		}
	} catch {}
	return 1;
}

function sameJavaObject(a: any, b: any): boolean {
	if (!a || !b) return false;
	if (a === b) return true;
	try {
		return typeof a.equals === 'function' ? !!a.equals(b) : false;
	} catch {
		return false;
	}
}

function gravityFor(android: any, position: HmrOverlayPosition): number {
	const Gravity = android.view.Gravity;
	if (position === 'top') return Gravity.TOP | Gravity.CENTER_HORIZONTAL;
	if (position === 'bottom') return Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
	return Gravity.CENTER;
}

function detachRoot(refs: AndroidOverlayRefs | null): void {
	if (!refs?.root) return;
	try {
		const parent = refs.root.getParent?.();
		if (parent && typeof parent.removeView === 'function') {
			parent.removeView(refs.root);
		}
	} catch {}
}

function buildAndroidOverlayRefs(host: AndroidOverlayHost, state: HmrOverlayRuntimeState): AndroidOverlayRefs | null {
	const { android, activity, decor } = host;
	try {
		const density = readDensity(activity);
		const dp = (value: number) => Math.round(value * density);
		const FrameLayout = android.widget.FrameLayout;
		const LinearLayout = android.widget.LinearLayout;
		const TextView = android.widget.TextView;

		const root = new FrameLayout(activity);
		root.setClickable(false);
		root.setFocusable(false);
		root.setVisibility(android.view.View.GONE);

		const panel = new LinearLayout(activity);
		panel.setOrientation(LinearLayout.VERTICAL);
		panel.setPadding(dp(PANEL_PADDING_DP), dp(PANEL_PADDING_DP), dp(PANEL_PADDING_DP), dp(PANEL_PADDING_DP));
		try {
			panel.setElevation(dp(PANEL_ELEVATION_DP));
		} catch {}

		let panelBackground: any = null;
		try {
			panelBackground = new android.graphics.drawable.GradientDrawable();
			panelBackground.setCornerRadius(dp(PANEL_RADIUS_DP));
			panelBackground.setColor(hexRgbaToAndroidArgb('#FFFFFFFF'));
			panel.setBackground(panelBackground);
		} catch {
			panelBackground = null;
		}

		const titleLabel = new TextView(activity);
		titleLabel.setGravity(android.view.Gravity.CENTER);
		try {
			titleLabel.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 18);
			titleLabel.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
		} catch {}

		const statusLabel = new TextView(activity);
		statusLabel.setGravity(android.view.Gravity.CENTER);
		try {
			statusLabel.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 13);
		} catch {}

		panel.addView(titleLabel, new LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT));
		const statusParams = new LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT);
		try {
			statusParams.topMargin = dp(LABEL_SPACING_DP);
		} catch {}
		panel.addView(statusLabel, statusParams);

		root.addView(panel, new FrameLayout.LayoutParams(dp(PANEL_MAX_WIDTH_DP), WRAP_CONTENT));
		decor.addView(root, new FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT));

		return {
			decor,
			root,
			panel,
			panelBackground,
			titleLabel,
			statusLabel,
			density,
			wasVisible: false,
			currentPosition: getHmrDevOverlayPosition(),
		};
	} catch (err) {
		if (state.verbose) {
			console.warn('[ns-hmr-overlay] Android overlay construction failed:', (err as any)?.message || err);
		}
		return null;
	}
}

export function ensureAndroidOverlayRefs(state: HmrOverlayRuntimeState): AndroidOverlayRefs | null {
	const host = getAndroidOverlayHost();
	if (!host) return null;
	if (state.androidRefs) {
		let attached = false;
		try {
			attached = sameJavaObject(state.androidRefs.decor, host.decor) && !!state.androidRefs.root.getParent?.();
		} catch {}
		if (attached) return state.androidRefs;
		// The Activity was recreated (rotation, fold, config change): the old
		// DecorView is gone, so the chip must be rebuilt on the new one.
		detachRoot(state.androidRefs);
		state.androidRefs = null;
	}
	if (state.androidBuildFailed) return null;
	const built = buildAndroidOverlayRefs(host, state);
	if (built) {
		state.androidRefs = built;
	} else {
		state.androidBuildFailed = true;
	}
	return state.androidRefs;
}

function slideDistancePx(refs: AndroidOverlayRefs, position: HmrOverlayPosition): number {
	const px = Math.round(SLIDE_DISTANCE_DP * (refs.density || 1));
	return position === 'bottom' ? px : -px;
}

function animateAndroidPanelIn(refs: AndroidOverlayRefs, position: HmrOverlayPosition): void {
	const { panel } = refs;
	try {
		panel.setTranslationY(slideDistancePx(refs, position));
		panel.setAlpha(0);
		const android = getOverlayGlobal().android;
		const animator = panel.animate().translationY(0).alpha(1).setDuration(320);
		try {
			animator.setInterpolator(new android.view.animation.DecelerateInterpolator());
		} catch {}
		animator.start();
	} catch {
		try {
			panel.setTranslationY(0);
			panel.setAlpha(1);
		} catch {}
	}
}

function animateAndroidPanelOut(refs: AndroidOverlayRefs, position: HmrOverlayPosition, onComplete: () => void): void {
	const { panel } = refs;
	const finish = () => {
		try {
			onComplete();
		} catch {}
		try {
			panel.setTranslationY(0);
			panel.setAlpha(1);
		} catch {}
	};
	try {
		const g = getOverlayGlobal();
		const android = g.android;
		const Runnable = g.java?.lang?.Runnable;
		if (!Runnable) {
			finish();
			return;
		}
		const animator = panel.animate().translationY(slideDistancePx(refs, position)).alpha(0).setDuration(220);
		try {
			animator.setInterpolator(new android.view.animation.AccelerateInterpolator());
		} catch {}
		animator.withEndAction(new Runnable({ run: finish })).start();
	} catch {
		finish();
	}
}

export function applySnapshotToAndroidRefs(refs: AndroidOverlayRefs | null, snapshot: HmrOverlaySnapshot): boolean {
	if (!refs) return false;
	try {
		const android = getOverlayGlobal().android;
		const View = android.view.View;
		const visible = snapshot.visible && (snapshot.mode === 'connection' || snapshot.mode === 'update');
		const wasVisible = !!refs.wasVisible;
		const position = getHmrDevOverlayPosition();
		const previousPosition = refs.currentPosition || position;
		const isToast = position !== 'center';

		if (!visible) {
			if (wasVisible && isToast) {
				animateAndroidPanelOut(refs, previousPosition, () => refs.root.setVisibility(View.GONE));
			} else {
				refs.root.setVisibility(View.GONE);
			}
			refs.wasVisible = false;
			refs.currentPosition = position;
			return true;
		}

		refs.titleLabel.setText(String(snapshot.title || ''));
		refs.statusLabel.setText(formatStatusText(snapshot));

		const isError = snapshot.tone === 'error';
		const isSuccess = snapshot.tone === 'success';
		const textColor = hexRgbaToAndroidArgb(isError ? '#b41810e6' : isSuccess ? '#0e6e2fff' : '#563e3fb1');
		refs.titleLabel.setTextColor(textColor);
		refs.statusLabel.setTextColor(textColor);
		try {
			refs.panelBackground?.setColor(hexRgbaToAndroidArgb(isSuccess ? '#E6F8E9FF' : '#FFFFFFFF'));
		} catch {}
		// Toast positions keep the app visible and reachable: transparent, touches
		// pass through. The centered connection overlay behaves like a scrim.
		const wash = isToast ? '#00000000' : isError ? '#b4181068' : isSuccess ? '#1f883d80' : '#a1771683';
		refs.root.setBackgroundColor(hexRgbaToAndroidArgb(wash));
		refs.root.setClickable(!isToast);

		let hostWidthPx = 0;
		try {
			hostWidthPx = Number(refs.decor.getWidth?.()) || 0;
		} catch {}
		const layout = computeAndroidPanelLayout({ position, density: refs.density, hostWidthPx, safeInsets: readAndroidSafeAreaInsets() });
		try {
			const FrameLayout = android.widget.FrameLayout;
			const params = new FrameLayout.LayoutParams(layout.widthPx, WRAP_CONTENT);
			params.gravity = gravityFor(android, position);
			params.setMargins(layout.marginPx.left, layout.marginPx.top, layout.marginPx.right, layout.marginPx.bottom);
			refs.panel.setLayoutParams(params);
		} catch {}

		refs.root.setVisibility(View.VISIBLE);
		try {
			refs.root.bringToFront();
		} catch {}

		const justAppeared = !wasVisible || previousPosition !== position;
		if (justAppeared && isToast) {
			animateAndroidPanelIn(refs, position);
		} else {
			try {
				refs.panel.setTranslationY(0);
				refs.panel.setAlpha(1);
			} catch {}
		}

		refs.wasVisible = true;
		refs.currentPosition = position;
		return true;
	} catch (err) {
		console.warn('[ns-hmr-overlay] Android overlay apply failed:', (err as any)?.message || err);
		return false;
	}
}
