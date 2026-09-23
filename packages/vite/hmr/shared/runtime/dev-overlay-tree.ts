/**
 * In-tree overlay backend: the boot placeholder page and the live/update
 * toast chip rendered inside the app's own view tree (Android, and the iOS
 * fallback when the UIWindow backend can't build). Pure margin math
 * (`computeAndroidToastMargin`) is exported separately so the safe-area rules
 * stay unit-testable without a device.
 */

import { BOOT_PLACEHOLDER_MOTION, computeBootProgressFillScale, formatBootDetailLine, formatBootPrimaryLine } from './boot-placeholder-ui.js';
import { BOOT_TITLE, type HmrOverlayPosition, type HmrOverlaySnapshot } from './dev-overlay-snapshots.js';
import { asColor, formatStatusText, getHmrDevOverlayPosition, getOverlayGlobal, getRuntimeState, resolveCoreExport, type BootOverlayRefs, type LiveOverlayRefs } from './dev-overlay-shared.js';

export function buildBootOverlayRefs(snapshot: HmrOverlaySnapshot): BootOverlayRefs | null {
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

export function applySnapshotToBootRefs(refs: BootOverlayRefs | null, snapshot: HmrOverlaySnapshot): void {
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

function findBootDetailLabel(): any {
	const g = getOverlayGlobal();
	return g.__NS_DEV_BOOT_DETAIL_LABEL__ || null;
}

function findBootProgressFill(): any {
	const g = getOverlayGlobal();
	return g.__NS_DEV_BOOT_PROGRESS_FILL__ || null;
}

export function updateBootStatusLabel(snapshot: HmrOverlaySnapshot): void {
	const statusLabel = findBootStatusLabel();
	const detailLabel = findBootDetailLabel();
	const progressFill = findBootProgressFill();
	const activityIndicator = findBootActivityIndicator();

	// New (card) layout: phase line + detail line live in separate
	// labels so the typography can differ. Legacy (single-label)
	// layout: keep the original combined "phase (X%)\ndetail" text so
	// nothing visually regresses for runtimes still attached to the
	// older placeholder shape.
	const hasSplitLabels = !!detailLabel;
	const phaseLine = formatBootPrimaryLine(snapshot);
	const detailLine = formatBootDetailLine(snapshot);
	const combinedText = formatStatusText(snapshot) || 'Preparing the HTTP HMR bootstrap (4%)';

	if (!statusLabel) {
		if (activityIndicator) {
			try {
				activityIndicator.busy = !!snapshot.busy;
				activityIndicator.visibility = snapshot.visible && snapshot.mode === 'boot' && snapshot.busy ? 'visible' : 'collapse';
			} catch {}
		}
		applyBootProgressFill(progressFill, snapshot);
		return;
	}

	try {
		statusLabel.text = hasSplitLabels ? phaseLine || 'Preparing the HTTP HMR bootstrap' : combinedText;
		// Card layout uses the calibrated phase-text colour from the
		// palette; legacy single-label layout keeps the original muted
		// brown so we don't visually regress mid-session.
		const phaseColorHex = snapshot.tone === 'error' ? '#B91C1C' : hasSplitLabels ? '#475569' : '#563e3fb1';
		statusLabel.color = asColor(phaseColorHex);
		if (typeof statusLabel.requestLayout === 'function') {
			statusLabel.requestLayout();
		}
		const parent = statusLabel.parent;
		if (parent && typeof parent.requestLayout === 'function') {
			parent.requestLayout();
		}
	} catch {}

	if (detailLabel) {
		try {
			detailLabel.text = detailLine;
			detailLabel.color = asColor(snapshot.tone === 'error' ? '#DC2626' : '#94A3B8');
			detailLabel.visibility = detailLine ? 'visible' : 'collapse';
		} catch {}
	}

	applyBootProgressFill(progressFill, snapshot);

	if (activityIndicator) {
		try {
			activityIndicator.busy = !!snapshot.busy;
			activityIndicator.visibility = snapshot.visible && snapshot.mode === 'boot' && snapshot.busy ? 'visible' : 'collapse';
		} catch {}
	}
}

// Drive the progress fill scaleX from the snapshot. Uses NS's view
// animate API for a smooth 220 ms easeOut between heartbeat ticks; a
// monotonic ratchet on `globalThis.__NS_DEV_BOOT_PROGRESS_LAST_SCALE__`
// guards against the fill snapping backwards if a less-progressed
// snapshot ever lands between ticks (mirrors the JS-side
// `applyMonotonicBootProgress` contract).
function applyBootProgressFill(progressFill: any, snapshot: HmrOverlaySnapshot): void {
	if (!progressFill) return;
	const g = getOverlayGlobal();
	const isError = snapshot.tone === 'error';
	progressFill.backgroundColor = asColor(isError ? '#B41810' : '#3B6FE5');
	const targetScale = computeBootProgressFillScale(snapshot.progress ?? null);
	const previousRaw = Number(g.__NS_DEV_BOOT_PROGRESS_LAST_SCALE__);
	const previous = Number.isFinite(previousRaw) ? previousRaw : 0;
	const next = Math.max(previous, targetScale);
	g.__NS_DEV_BOOT_PROGRESS_LAST_SCALE__ = next;
	try {
		// NS view.animate scales around `originX`/`originY`; the
		// placeholder builder pins `originX = 0` so the fill grows
		// rightward. animate() may be unavailable in some headless
		// test environments — fall through to a direct property set.
		if (typeof progressFill.animate === 'function') {
			progressFill
				.animate({
					scale: { x: next, y: 1 },
					duration: BOOT_PLACEHOLDER_MOTION.progressDurationMs,
					curve: 'easeOut',
				})
				.catch(() => {
					try {
						progressFill.scaleX = next;
					} catch {}
				});
		} else {
			progressFill.scaleX = next;
		}
	} catch {
		progressFill.scaleX = next;
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

// Safe-area insets (in device-independent pixels) for the in-tree
// Android live/update overlay. Read at runtime from the foreground
// activity's root window insets; null on non-Android runtimes (iOS,
// tests) so the toast falls back to its base margins.
export type AndroidSafeAreaInsets = { top: number; bottom: number; left: number; right: number };

// Resolved margin (top/right/bottom/left, in DIPs) for the in-tree toast
// chip. Fed straight into `panel.margin` as a "top right bottom left"
// string.
export type AndroidToastMargin = { top: number; right: number; bottom: number; left: number };

function readCachedAndroidSafeAreaInsets(): AndroidSafeAreaInsets | null {
	const g = getOverlayGlobal();
	const cached = g.__NS_HMR_ANDROID_SAFE_INSETS__;
	if (cached && typeof cached.top === 'number') {
		return cached as AndroidSafeAreaInsets;
	}
	return null;
}

/**
 * Read the Android system-bar safe-area insets (status bar / navigation
 * bar / display cutout) in device-independent pixels.
 *
 * NativeScript runs every Android activity edge-to-edge, so the overlay
 * wrapper fills the whole window — we need these insets to keep the toast
 * chip out from under the system bars (see `computeAndroidToastMargin`).
 *
 * Returns null on non-Android runtimes (iOS / web / vitest) so callers
 * fall back to base margins. The last good reading is cached on the
 * global so a transient null (e.g. insets queried before the decor view
 * is attached) reuses the previous value instead of snapping the chip
 * back under the status bar.
 */
function readAndroidSafeAreaInsets(): AndroidSafeAreaInsets | null {
	const g = getOverlayGlobal();
	// `android.*` is exposed as a global only on the NativeScript Android
	// runtime; its absence means iOS, web, or a test environment.
	const androidNs = g.android || (typeof (globalThis as any).android !== 'undefined' ? (globalThis as any).android : undefined);
	if (!androidNs) {
		return null;
	}
	try {
		const Application = resolveCoreExport('Application');
		const activity = Application?.android?.foregroundActivity || Application?.android?.startActivity;
		const decorView = activity?.getWindow?.()?.getDecorView?.();
		const rootInsets = decorView?.getRootWindowInsets?.();
		if (!rootInsets) {
			return readCachedAndroidSafeAreaInsets();
		}

		let density = 1;
		try {
			const metricsDensity = Number(activity?.getResources?.()?.getDisplayMetrics?.()?.density);
			if (Number.isFinite(metricsDensity) && metricsDensity > 0) {
				density = metricsDensity;
			}
		} catch {}

		let px = { top: 0, bottom: 0, left: 0, right: 0 };
		const WindowInsets = androidNs.view?.WindowInsets;
		const Type = WindowInsets?.Type;
		if (typeof rootInsets.getInsets === 'function' && Type && typeof Type.systemBars === 'function') {
			// API 30+: query the system bars + display cutout so notches /
			// camera holes are respected in landscape.
			let mask = Type.systemBars();
			if (typeof Type.displayCutout === 'function') {
				mask = mask | Type.displayCutout();
			}
			const i = rootInsets.getInsets(mask);
			px = { top: Number(i?.top) || 0, bottom: Number(i?.bottom) || 0, left: Number(i?.left) || 0, right: Number(i?.right) || 0 };
		} else {
			// API < 30 fallback.
			px = {
				top: Number(rootInsets.getSystemWindowInsetTop?.()) || 0,
				bottom: Number(rootInsets.getSystemWindowInsetBottom?.()) || 0,
				left: Number(rootInsets.getSystemWindowInsetLeft?.()) || 0,
				right: Number(rootInsets.getSystemWindowInsetRight?.()) || 0,
			};
		}

		const insets: AndroidSafeAreaInsets = {
			top: px.top / density,
			bottom: px.bottom / density,
			left: px.left / density,
			right: px.right / density,
		};
		g.__NS_HMR_ANDROID_SAFE_INSETS__ = insets;
		return insets;
	} catch {
		return readCachedAndroidSafeAreaInsets();
	}
}

/**
 * Margin math for the in-tree (Android) live/update toast chip.
 *
 * NativeScript enables edge-to-edge on every Android activity
 * (`@nativescript/core` → `application.android.ts` → `enableEdgeToEdge`),
 * so the page content — and therefore the overlay wrapper we inject into
 * it — extends underneath the status bar and navigation bar. A fixed
 * top/bottom margin leaves the chip tucked behind the system bars, where
 * it gets clipped (Android 15 / API 35 enforces edge-to-edge, so this is
 * now the norm rather than the exception).
 *
 * This pure helper folds the system-bar safe-area insets into the chip's
 * margin so the toast always clears the status bar (top position) /
 * navigation bar (bottom position). It is deterministic and free of
 * native deps so the rules stay unit-testable — the runtime reads the
 * live insets via `readAndroidSafeAreaInsets()` and forwards them here.
 *
 *   - 'top':    margin.top    = baseVerticalInset + safeInsets.top
 *   - 'bottom': margin.bottom = baseVerticalInset + safeInsets.bottom
 *   - 'center': fixed `centerMargin` all around (vertically centered, so
 *               it never approaches the system bars on normal viewports).
 *
 * Horizontal margins always include the relevant safe-area inset so a
 * landscape display cutout / gesture pill doesn't clip the chip edge.
 */
export function computeAndroidToastMargin(input: { position: HmrOverlayPosition; safeInsets?: AndroidSafeAreaInsets | null; baseVerticalInset?: number; baseHorizontalInset?: number; centerMargin?: number }): AndroidToastMargin {
	// Clamp to a finite, non-negative number; fall back to `fallback`
	// for missing/NaN input so a glitched measurement can't produce a
	// negative or NaN margin (which NativeScript would silently drop).
	const clamp = (value: any, fallback: number): number => {
		const n = Number(value);
		return Number.isFinite(n) && n >= 0 ? n : fallback;
	};

	const safe = {
		top: clamp(input.safeInsets?.top, 0),
		bottom: clamp(input.safeInsets?.bottom, 0),
		left: clamp(input.safeInsets?.left, 0),
		right: clamp(input.safeInsets?.right, 0),
	};
	const baseVerticalInset = clamp(input.baseVerticalInset, 8);
	const baseHorizontalInset = clamp(input.baseHorizontalInset, 16);
	const centerMargin = clamp(input.centerMargin, 24);

	if (input.position === 'center') {
		return { top: centerMargin, right: centerMargin, bottom: centerMargin, left: centerMargin };
	}

	const left = Math.round(baseHorizontalInset + safe.left);
	const right = Math.round(baseHorizontalInset + safe.right);

	if (input.position === 'bottom') {
		return { top: 0, right, bottom: Math.round(baseVerticalInset + safe.bottom), left };
	}

	// 'top' (and any unexpected value) hugs the status-bar safe area.
	return { top: Math.round(baseVerticalInset + safe.top), right, bottom: 0, left };
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

export function ensureLiveOverlayRefs(snapshot: HmrOverlaySnapshot): LiveOverlayRefs | null {
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

export function applySnapshotToLiveRefs(refs: Pick<LiveOverlayRefs, 'overlay' | 'titleLabel' | 'statusLabel'> & Partial<Pick<LiveOverlayRefs, 'wasVisible' | 'currentPosition'>>, snapshot: HmrOverlaySnapshot): void;
export function applySnapshotToLiveRefs(refs: null, snapshot: HmrOverlaySnapshot): void;
export function applySnapshotToLiveRefs(refs: any, snapshot: HmrOverlaySnapshot): void {
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

			// Position-aware alignment. The wrapper GridLayout fills the
			// page content area. NativeScript runs every Android activity
			// edge-to-edge, so that area extends under the status bar and
			// navigation bar — we fold the system-bar safe-area insets into
			// the chip's margin (via computeAndroidToastMargin) so a top
			// chip clears the status bar and a bottom chip clears the nav
			// bar instead of being clipped behind them. readAndroidSafeAreaInsets
			// returns null off-Android, so the margins collapse to their base
			// values (no behavioural change on iOS's in-tree fallback / tests).
			try {
				if (position === 'top' || position === 'bottom') {
					const m = computeAndroidToastMargin({ position, safeInsets: readAndroidSafeAreaInsets() });
					panel.verticalAlignment = position;
					panel.margin = `${m.top} ${m.right} ${m.bottom} ${m.left}`;
				} else {
					panel.verticalAlignment = 'middle';
					panel.margin = 24;
				}
			} catch {}

			// Force a tight re-measure so the StackLayout panel hugs the
			// CURRENT title+status text. Connection stages can swap between
			// frames whose text wraps to a different number of lines (e.g. a
			// long 'reconnecting' "Retrying ws://…" detail vs. the short
			// 'offline' message). Without an explicit relayout the panel can
			// retain the tallest height it ever measured, leaving an oversized
			// gap between title and message. Mirrors updateBootStatusLabel.
			try {
				refs.titleLabel.requestLayout?.();
				refs.statusLabel.requestLayout?.();
				panel.requestLayout?.();
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
		// Steady-state refresh (e.g. offline → reconnecting → offline while
		// already visible): no slide animation fires here, so clear any
		// transform residue a previously-interrupted slide-in/out may have
		// left on the panel. Otherwise the chip can appear shifted or
		// faded across rapid connection-stage swaps.
		if (visible && panel) {
			try {
				panel.translateY = 0;
				panel.opacity = 1;
			} catch {}
		}
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
