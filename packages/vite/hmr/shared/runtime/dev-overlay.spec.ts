import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// @nativescript/core can't evaluate in Node; the overlay reads its classes only when drawing.
vi.mock('@nativescript/core/application', () => ({}));
vi.mock('@nativescript/core/color', () => ({}));
vi.mock('@nativescript/core/ui', () => ({}));
import { computeAndroidToastMargin, computeIosOverlayLayout, computeIosOverlayWindowLevel, iosOverlayCapturesTouch, createConnectionOverlaySnapshot, createUpdateOverlaySnapshot, getHmrDevOverlayPosition } from './dev-overlay.js';
import { applySnapshotToIosRefs } from './dev-overlay-ios.js';
import { applySnapshotToLiveRefs } from './dev-overlay-tree.js';
import { getGlobalScope } from './global-scope.js';
import { NS_DEV_SYMBOL_KEY, nsDev } from './dev-globals.js';

type DevOverlayModule = typeof import('./dev-overlay.js');
let ensureHmrDevOverlayRuntimeInstalled: DevOverlayModule['ensureHmrDevOverlayRuntimeInstalled'];
let setHmrDevOverlayPosition: DevOverlayModule['setHmrDevOverlayPosition'];
let setHmrUpdateStage: DevOverlayModule['setHmrUpdateStage'];

// The overlay runtime state is module state: each case gets a fresh instance.
beforeEach(async () => {
	vi.resetModules();
	({ ensureHmrDevOverlayRuntimeInstalled, setHmrDevOverlayPosition, setHmrUpdateStage } = await import('./dev-overlay.js'));
});

describe('HMR dev overlay snapshots', () => {
	afterEach(() => {
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	it('builds a reconnect snapshot without a determinate progress bar', () => {
		const snapshot = createConnectionOverlaySnapshot('reconnecting');

		expect(snapshot.visible).toBe(true);
		expect(snapshot.mode).toBe('connection');
		expect(snapshot.progress).toBeNull();
		expect(snapshot.tone).toBe('warn');
		expect(snapshot.phase).toContain('reconnect');
	});
});

describe('HMR dev overlay runtime API', () => {
	beforeEach(() => {
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	afterEach(() => {
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	it('installs a stable global API', () => {
		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		const sameApi = ensureHmrDevOverlayRuntimeInstalled(false);

		expect(api).toBe(sameApi);
		expect(nsDev().overlay).toBe(api);
	});

	it('switches from connection state back to hidden on hide()', () => {
		const api = ensureHmrDevOverlayRuntimeInstalled(true);

		api.setConnectionStage('offline', {
			detail: 'Waiting for ws://localhost:5173/vite-hmr',
		});
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'connection',
			badge: 'OFFLINE',
		});

		api.hide('healthy');
		expect(api.getSnapshot()).toMatchObject({
			visible: false,
			mode: 'hidden',
			badge: 'HMR',
		});
	});
});

describe('iOS overlay window level', () => {
	it('lifts the overlay one step above UIWindowLevelAlert when available', () => {
		// UIWindowLevelAlert is 2000 in UIKit; our overlay must win against
		// system alerts, app-presented modals, and sheets. Returning
		// 2001 guarantees that stacking when the platform exposes the
		// constant.
		expect(computeIosOverlayWindowLevel(2000)).toBe(2001);
		expect(computeIosOverlayWindowLevel(1.5)).toBeCloseTo(2.5);
	});

	it('falls back to the documented default when the platform constant is missing', () => {
		// NativeScript's metadata generator does not always expose
		// UIWindowLevelAlert as a top-level global, so our caller passes
		// `null` in that case. We then use the documented constant value
		// (2000) and lift it to 2001.
		for (const missing of [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
			expect(computeIosOverlayWindowLevel(missing as any)).toBe(2001);
		}
	});
});

describe('iOS overlay layout', () => {
	const baseSafe = { top: 47, bottom: 34, left: 0, right: 0 };

	it('centers the panel horizontally and vertically within the view', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 36,
		});
		expect(layout.panel.width).toBe(340);
		// Centered: (390 - 340) / 2 = 25
		expect(layout.panel.x).toBe(25);
		// The panel is well below the top inset so it stays vertically centered.
		const expectedHeight = 16 * 2 + 20 + 10 + 36;
		expect(layout.panel.height).toBe(expectedHeight);
		expect(layout.panel.y).toBeCloseTo((844 - expectedHeight) / 2);
	});

	it('never crosses the top safe-area inset (notch / Dynamic Island)', () => {
		// Small viewport where the center-computed Y would overlap the top
		// inset. We clamp the panel to `top + minTopInset` so the user can
		// always read the overlay without it tucking behind the notch.
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 120,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 20,
		});
		expect(layout.panel.y).toBe(47 + 20);
	});

	it('shrinks the panel to fit narrower screens and honors horizontal safe-area', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 320,
			viewHeight: 600,
			safeInsets: { top: 20, bottom: 20, left: 40, right: 40 },
			titleHeight: 18,
			statusHeight: 30,
		});
		// 320 - 2*24 - 40 - 40 = 192, capped below the 340 default.
		expect(layout.panel.width).toBe(192);
		// Still horizontally centered.
		expect(layout.panel.x).toBe((320 - 192) / 2);
	});

	it('omits label spacing when one label has zero height', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 0,
			statusHeight: 48,
		});
		// spacing collapses to 0 when title is empty, so panel height = 2*pad + 48 = 80
		expect(layout.panel.height).toBe(80);
		// status.y equals the top padding since there's no title to offset from.
		expect(layout.status.y).toBe(16);
	});

	it('uses inner width for both labels and leaves equal horizontal padding', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 24,
			statusHeight: 16,
		});
		const innerWidth = layout.panel.width - 2 * 16;
		expect(layout.title.width).toBe(innerWidth);
		expect(layout.status.width).toBe(innerWidth);
		expect(layout.title.x).toBe(16);
		expect(layout.status.x).toBe(16);
	});

	it('produces a backdrop that fills the entire view', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 812,
			viewHeight: 375,
			safeInsets: { top: 0, bottom: 0, left: 44, right: 44 },
			titleHeight: 18,
			statusHeight: 18,
		});
		// Backdrop always covers the full view regardless of safe-area insets so
		// the dim layer reaches under the status bar and home indicator.
		expect(layout.backdrop).toEqual({ x: 0, y: 0, width: 812, height: 375 });
	});

	it('guards against NaN and negative inputs', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: Number.NaN,
			viewHeight: -200,
			safeInsets: { top: Number.NaN, bottom: -5, left: -2, right: 0 },
			titleHeight: Number.NaN,
			statusHeight: -10,
		});
		// Every metric must be non-negative and finite so UIKit frames remain
		// valid even if an upstream measurement glitched during rotation.
		for (const rect of [layout.backdrop, layout.panel, layout.title, layout.status]) {
			expect(rect.x).toBeGreaterThanOrEqual(0);
			expect(rect.y).toBeGreaterThanOrEqual(0);
			expect(rect.width).toBeGreaterThanOrEqual(0);
			expect(rect.height).toBeGreaterThanOrEqual(0);
		}
	});
});

describe('iOS overlay layout — toast positions', () => {
	const baseSafe = { top: 47, bottom: 34, left: 0, right: 0 };

	it("position='top' pins the panel to safeInsets.top + toastVerticalInset", () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 36,
			position: 'top',
		});
		// 47 (safe top) + 8 (default toastVerticalInset) = 55
		expect(layout.panel.y).toBe(47 + 8);
		// X stays centered horizontally — toast affects vertical only.
		expect(layout.panel.x).toBe((390 - 340) / 2);
	});

	it("position='bottom' pins the panel above the home-indicator safe area", () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 36,
			position: 'bottom',
		});
		// panelHeight = 16*2 + 20 + 10 + 36 = 98
		// expected y = 844 - 34 (bottom safe) - 98 (panel) - 8 (inset) = 704
		expect(layout.panel.y).toBe(844 - 34 - 98 - 8);
	});

	it("position='top' falls back to a non-negative y when safe insets are 0", () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: { top: 0, bottom: 0, left: 0, right: 0 },
			titleHeight: 20,
			statusHeight: 20,
			position: 'top',
		});
		// 0 (safe top) + 8 (default toastVerticalInset) = 8
		expect(layout.panel.y).toBe(8);
	});

	it("position='bottom' clamps to top safe-area + minTopInset on too-small viewports", () => {
		// Tiny viewport where the bottom-anchored desired y would be
		// negative — we must clamp to the top safe-area + minTopInset
		// rather than tucking the panel off-screen.
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 100,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 20,
			position: 'bottom',
		});
		expect(layout.panel.y).toBeGreaterThanOrEqual(47 + 20);
	});

	it("position='center' (default) preserves the original centered layout", () => {
		const layoutA = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 36,
			position: 'center',
		});
		const layoutB = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 36,
			// position omitted — must default to 'center' so existing
			// callers (and the snapshot tests above) keep their
			// behaviour.
		});
		expect(layoutA.panel.y).toBe(layoutB.panel.y);
		const expectedHeight = 16 * 2 + 20 + 10 + 36;
		expect(layoutA.panel.y).toBeCloseTo((844 - expectedHeight) / 2);
	});

	it('honors caller-supplied toastVerticalInset for tighter / looser chips', () => {
		const layout = computeIosOverlayLayout({
			viewWidth: 390,
			viewHeight: 844,
			safeInsets: baseSafe,
			titleHeight: 20,
			statusHeight: 20,
			position: 'top',
			toastVerticalInset: 24,
		});
		expect(layout.panel.y).toBe(47 + 24);
	});
});

// Android in-tree toast margins. NativeScript runs every Android
// activity edge-to-edge, so the overlay wrapper extends under the
// status bar / navigation bar; these tests pin the rule that the
// chip's margin absorbs the system-bar safe-area insets so it is
// never clipped behind them (the bug shown in the original screenshots).
describe('Android toast margin', () => {
	const insets = { top: 24, bottom: 48, left: 0, right: 0 };

	it("position='top' adds the status-bar inset to the top margin", () => {
		const m = computeAndroidToastMargin({ position: 'top', safeInsets: insets });
		// baseVerticalInset (8) + status bar (24) = 32
		expect(m.top).toBe(32);
		expect(m.bottom).toBe(0);
		// baseHorizontalInset (16) + 0 horizontal inset on each side.
		expect(m.left).toBe(16);
		expect(m.right).toBe(16);
	});

	it("position='bottom' adds the navigation-bar inset to the bottom margin", () => {
		const m = computeAndroidToastMargin({ position: 'bottom', safeInsets: insets });
		expect(m.top).toBe(0);
		// baseVerticalInset (8) + nav bar (48) = 56
		expect(m.bottom).toBe(56);
		expect(m.left).toBe(16);
		expect(m.right).toBe(16);
	});

	it("position='center' keeps a fixed margin and ignores insets", () => {
		const m = computeAndroidToastMargin({ position: 'center', safeInsets: insets });
		expect(m).toEqual({ top: 24, right: 24, bottom: 24, left: 24 });
	});

	it('folds horizontal insets (landscape cutout / gesture pill) into the side margins', () => {
		const m = computeAndroidToastMargin({ position: 'top', safeInsets: { top: 0, bottom: 0, left: 30, right: 44 } });
		expect(m.left).toBe(16 + 30);
		expect(m.right).toBe(16 + 44);
	});

	it('falls back to base margins when no insets are available (null = non-Android)', () => {
		// readAndroidSafeAreaInsets() returns null off-Android, so the
		// chip behaves exactly as before this change on iOS / web / tests.
		const top = computeAndroidToastMargin({ position: 'top', safeInsets: null });
		expect(top).toEqual({ top: 8, right: 16, bottom: 0, left: 16 });
		const bottom = computeAndroidToastMargin({ position: 'bottom' });
		expect(bottom).toEqual({ top: 0, right: 16, bottom: 8, left: 16 });
	});

	it('honors caller-supplied base insets', () => {
		const m = computeAndroidToastMargin({ position: 'top', safeInsets: insets, baseVerticalInset: 12, baseHorizontalInset: 20 });
		expect(m.top).toBe(12 + 24);
		expect(m.left).toBe(20);
		expect(m.right).toBe(20);
	});

	it('guards against NaN / negative insets', () => {
		const m = computeAndroidToastMargin({
			position: 'top',
			safeInsets: { top: Number.NaN, bottom: -10, left: -5, right: Number.POSITIVE_INFINITY },
		});
		// NaN top → 0 inset, so just the base vertical inset remains.
		expect(m.top).toBe(8);
		// Negative / non-finite horizontal insets clamp to 0.
		expect(m.left).toBe(16);
		expect(m.right).toBe(16);
		for (const v of [m.top, m.right, m.bottom, m.left]) {
			expect(Number.isFinite(v)).toBe(true);
			expect(v).toBeGreaterThanOrEqual(0);
		}
	});
});

describe('HMR overlay position config', () => {
	beforeEach(() => {
		delete getGlobalScope().__NS_HMR_OVERLAY_POSITION__;
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	afterEach(() => {
		delete getGlobalScope().__NS_HMR_OVERLAY_POSITION__;
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	it("defaults to 'top' so the centered modal does NOT obscure app UI", () => {
		expect(getHmrDevOverlayPosition()).toBe('top');
	});

	it('reads a stored override from the global flag', () => {
		getGlobalScope().__NS_HMR_OVERLAY_POSITION__ = 'bottom';
		expect(getHmrDevOverlayPosition()).toBe('bottom');
		getGlobalScope().__NS_HMR_OVERLAY_POSITION__ = 'center';
		expect(getHmrDevOverlayPosition()).toBe('center');
	});

	it('falls back to the default when an unknown value is stored', () => {
		getGlobalScope().__NS_HMR_OVERLAY_POSITION__ = 'left';
		expect(getHmrDevOverlayPosition()).toBe('top');
		getGlobalScope().__NS_HMR_OVERLAY_POSITION__ = 42;
		expect(getHmrDevOverlayPosition()).toBe('top');
	});

	it('setHmrDevOverlayPosition updates the global and ignores invalid values', () => {
		setHmrDevOverlayPosition('bottom');
		expect(getGlobalScope().__NS_HMR_OVERLAY_POSITION__).toBe('bottom');
		setHmrDevOverlayPosition('center');
		expect(getGlobalScope().__NS_HMR_OVERLAY_POSITION__).toBe('center');
		// Invalid input must NOT clobber a previously-set value, so a
		// typo in dev code can't accidentally reset the position.
		setHmrDevOverlayPosition('elsewhere' as any);
		expect(getGlobalScope().__NS_HMR_OVERLAY_POSITION__).toBe('center');
	});
});

// HMR-applying progress overlay.
//
// These tests pin the snapshot shape (badge / phase / progress /
// tone / mode) for each stage in the cycle so a future refactor
// can't silently flip the colour scheme back to error-red or break
// the stage ordering. Progress percentages are part of the
// contract: they're what the user sees in the overlay's status
// line, and any reshuffle should be a deliberate design decision.
describe('HMR apply overlay snapshots', () => {
	it("emits a 'received' frame at 5% with success tone and mode='update'", () => {
		const snapshot = createUpdateOverlaySnapshot('received', { detail: 'Updating /src/app/foo.ts' });
		expect(snapshot.visible).toBe(true);
		expect(snapshot.mode).toBe('update');
		expect(snapshot.tone).toBe('success');
		expect(snapshot.badge).toBe('HMR');
		expect(snapshot.title).toBe('HMR update applying...');
		expect(snapshot.phase).toBe('Preparing update');
		expect(snapshot.progress).toBe(5);
		expect(snapshot.busy).toBe(true);
		// Detail propagates so the overlay can show the changed file path.
		expect(snapshot.detail).toContain('/src/app/foo.ts');
	});

	it("walks 'evicting' (30%) → 'reimporting' (60%) → 'rebooting' (90%)", () => {
		const evicting = createUpdateOverlaySnapshot('evicting');
		expect(evicting.progress).toBe(30);
		expect(evicting.phase).toBe('Invalidating module cache');
		expect(evicting.tone).toBe('success');
		expect(evicting.busy).toBe(true);

		const reimporting = createUpdateOverlaySnapshot('reimporting');
		expect(reimporting.progress).toBe(60);
		expect(reimporting.phase).toBe('Re-importing entry');
		expect(reimporting.tone).toBe('success');

		const rebooting = createUpdateOverlaySnapshot('rebooting');
		expect(rebooting.progress).toBe(90);
		expect(rebooting.phase).toBe('Rebooting app');
		expect(rebooting.tone).toBe('success');
	});

	it("emits a 'complete' frame at 100% with applied title and busy=false", () => {
		const snapshot = createUpdateOverlaySnapshot('complete', { detail: 'Total 412ms' });
		expect(snapshot.progress).toBe(100);
		expect(snapshot.title).toBe('HMR update applied');
		expect(snapshot.phase).toBe('Update applied');
		expect(snapshot.tone).toBe('success');
		// 'complete' is the rest frame — the activity indicator on
		// supported surfaces stops spinning.
		expect(snapshot.busy).toBe(false);
		expect(snapshot.detail).toContain('Total 412ms');
	});

	it("emits a 'failed' frame with the error tone and the failure detail", () => {
		const snapshot = createUpdateOverlaySnapshot('failed', { detail: 'Transform failed' });
		expect(snapshot.title).toBe('HMR update failed');
		expect(snapshot.tone).toBe('error');
		expect(snapshot.busy).toBe(false);
		expect(snapshot.progress).toBeNull();
		expect(snapshot.detail).toBe('Transform failed');
	});

	it("carries the code block and the action on a 'failed' frame only", () => {
		const action = { label: 'Restart app', onTap: () => {} };
		expect(createUpdateOverlaySnapshot('failed', { detail: 'boom', code: '1 | x(', action })).toMatchObject({ detail: 'boom', code: '1 | x(', action });
		const restart = createUpdateOverlaySnapshot('restart-required', { detail: 'reason', code: 'frame', action });
		expect(restart.code).toBeUndefined();
		expect(restart.action).toBeUndefined();
		expect(createUpdateOverlaySnapshot('failed', { detail: 'boom' }).action).toBeUndefined();
	});

	it("emits a 'restart-required' frame with its own tone and the reason as detail", () => {
		const snapshot = createUpdateOverlaySnapshot('restart-required', { detail: 'hot.decline() in /src/a.ts' });
		expect(snapshot).toMatchObject({ visible: true, mode: 'update', title: 'Restart required', tone: 'warn', busy: false, progress: null, detail: 'hot.decline() in /src/a.ts' });
	});

	// Progress must monotonically increase across stages so the bar
	// never visually rewinds during a normal HMR cycle. If the
	// scheduler ever re-orders stages we want the test to fail loudly.
	it('produces a strictly increasing progress sequence across stages', () => {
		const stages: Array<'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete'> = ['received', 'evicting', 'reimporting', 'rebooting', 'complete'];
		const progresses = stages.map((s) => createUpdateOverlaySnapshot(s).progress as number);
		for (let i = 1; i < progresses.length; i++) {
			expect(progresses[i]).toBeGreaterThan(progresses[i - 1]);
		}
	});

	it('honors caller-supplied progress overrides while keeping the stage tone', () => {
		const snapshot = createUpdateOverlaySnapshot('rebooting', { progress: 73, detail: 'Custom detail' });
		expect(snapshot.progress).toBe(73);
		expect(snapshot.tone).toBe('success');
		expect(snapshot.detail).toBe('Custom detail');
	});
});

describe('HMR apply overlay runtime API', () => {
	beforeEach(() => {
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	afterEach(() => {
		delete getGlobalScope()[Symbol.for(NS_DEV_SYMBOL_KEY)];
	});

	it('drives the overlay through update stages via setUpdateStage', () => {
		const api = ensureHmrDevOverlayRuntimeInstalled(true);

		api.setUpdateStage('received', { detail: 'Updating /src/main.ts' });
		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'update',
			tone: 'success',
			progress: 5,
		});

		api.setUpdateStage('evicting', { detail: 'Invalidating 132 modules' });
		expect(api.getSnapshot().progress).toBe(30);

		api.setUpdateStage('reimporting');
		expect(api.getSnapshot().progress).toBe(60);

		api.setUpdateStage('rebooting');
		expect(api.getSnapshot().progress).toBe(90);
	});

	it("schedules an auto-hide after 'complete' rather than dismissing immediately", () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			api.setUpdateStage('complete', { detail: 'Total 412ms' });

			// Immediately after 'complete', the overlay is still
			// visible so the user gets a moment of acknowledgement.
			expect(api.getSnapshot()).toMatchObject({
				visible: true,
				mode: 'update',
				progress: 100,
			});

			// When 'complete' fires without a preceding 'received',
			// the cycle had no recorded start timestamp, so the
			// minimum-visible window (800ms) wins over the standard
			// 600ms auto-hide. After 1s the overlay drops back to
			// DEFAULT_SNAPSHOT.
			vi.advanceTimersByTime(1000);
			expect(api.getSnapshot()).toMatchObject({
				visible: false,
				mode: 'hidden',
			});
		} finally {
			vi.useRealTimers();
		}
	});

	// A fast HMR cycle (50ms total) still must hold the overlay
	// long enough for the user to perceive it. We assert the full
	// sequence: 'received' → 'complete' immediately after, then
	// verify the auto-hide stretches to honor the minimum-visible
	// window.
	it('holds the overlay for at least UPDATE_MIN_VISIBLE_MS after a fast cycle', () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			api.setUpdateStage('received', { detail: '/src/foo.ts' });
			vi.advanceTimersByTime(50);
			api.setUpdateStage('complete', { detail: 'Total 50ms' });

			// Even after the standard 600ms hold, the overlay should
			// still be visible because the cycle started only 50ms
			// before complete, so we owe the user another ~750ms of
			// visibility (800ms min - 50ms elapsed = 750ms remaining).
			vi.advanceTimersByTime(600);
			expect(api.getSnapshot()).toMatchObject({
				visible: true,
				mode: 'update',
				progress: 100,
			});

			// After enough total time elapses, the overlay hides.
			vi.advanceTimersByTime(300);
			expect(api.getSnapshot()).toMatchObject({
				visible: false,
				mode: 'hidden',
			});
		} finally {
			vi.useRealTimers();
		}
	});

	// Slow cycles already exceed the min-visible threshold by the
	// time 'complete' fires; we must NOT add extra hold on top —
	// the standard UPDATE_AUTO_HIDE_MS (600ms) wins.
	it('uses standard hold (not min-visible padding) when cycle already exceeded threshold', () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			api.setUpdateStage('received', { detail: '/src/big.ts' });
			vi.advanceTimersByTime(2000); // simulate a slow cycle (e.g., big SCSS recompile)
			api.setUpdateStage('complete', { detail: 'Total 2000ms' });

			// Standard 600ms hold; no extra padding because the
			// cycle has already been on screen for 2000ms.
			vi.advanceTimersByTime(700);
			expect(api.getSnapshot()).toMatchObject({
				visible: false,
				mode: 'hidden',
			});
		} finally {
			vi.useRealTimers();
		}
	});

	it("drops the 'failed' action once the overlay moves to 'restart-required'", () => {
		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		const action = { label: 'Restart app', onTap: vi.fn() };
		api.setUpdateStage('failed', { detail: 'boom', action });
		expect(api.getSnapshot().action).toBe(action);
		api.setUpdateStage('restart-required', { detail: 'requested from the error overlay' });
		expect(api.getSnapshot().action).toBeUndefined();
	});

	it("keeps 'restart-required' on screen over later update, connection and hide calls", () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			api.setUpdateStage('complete', { detail: 'previous cycle' });
			api.setUpdateStage('restart-required', { detail: 'hot.decline() in /src/a.ts' });
			api.setUpdateStage('received', { detail: 'next cycle' });
			api.setUpdateStage('complete', { detail: 'next cycle' });
			api.setConnectionStage('reconnecting');
			api.setConnectionStage('healthy');
			api.hide('healthy');
			vi.advanceTimersByTime(5000);
			expect(api.getSnapshot()).toMatchObject({ visible: true, mode: 'update', title: 'Restart required', detail: 'hot.decline() in /src/a.ts' });
		} finally {
			vi.useRealTimers();
		}
	});

	// A common race: cycle-1 reaches 'complete' (auto-hide
	// scheduled), then cycle-2 starts and posts 'received' before
	// the timer fires. Cycle-1's hide MUST NOT pull cycle-2's
	// in-progress overlay off the screen.
	it("does not hide cycle-N+1's overlay when cycle-N's auto-hide fires", () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			api.setUpdateStage('complete', { detail: 'cycle 1' });
			// Cycle 2 starts before the auto-hide elapses.
			vi.advanceTimersByTime(50);
			api.setUpdateStage('received', { detail: 'cycle 2' });

			// Now the cycle-1 timer fires (or would have).
			vi.advanceTimersByTime(500);

			// The cycle-2 'received' frame must still be on screen.
			expect(api.getSnapshot()).toMatchObject({
				visible: true,
				mode: 'update',
				progress: 5,
			});
			expect(api.getSnapshot().detail).toContain('cycle 2');
		} finally {
			vi.useRealTimers();
		}
	});

	// Boot/connection transitions must always win over any pending
	// HMR auto-hide; otherwise a poorly-timed cycle could yank the
	// boot overlay off after a reconnect.
	it('cancels the auto-hide timer when boot or connection stages reassert control', () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			api.setUpdateStage('complete');
			expect(api.getSnapshot().mode).toBe('update');

			// Connection overlay takes over (e.g., websocket dropped).
			api.setConnectionStage('reconnecting');
			expect(api.getSnapshot().mode).toBe('connection');

			// The cycle-1 timer must NOT subsequently downgrade the
			// connection overlay back to 'hidden'.
			vi.advanceTimersByTime(500);
			expect(api.getSnapshot().mode).toBe('connection');
		} finally {
			vi.useRealTimers();
		}
	});

	it('exposes setHmrUpdateStage as a top-level helper that mirrors the API', () => {
		// Before any setHmrUpdateStage call, the overlay is hidden.
		// Calling the top-level helper installs the API on globalThis
		// and applies the snapshot.
		const snapshot = setHmrUpdateStage('received', { detail: 'top-level' });
		expect(snapshot).toMatchObject({
			visible: true,
			mode: 'update',
			tone: 'success',
			progress: 5,
		});
		expect(nsDev().overlay).toBeDefined();
	});

	// The cycle clock — used by the auto-hide minimum-visible window —
	// must be stamped against the FIRST 'received' frame of a cycle,
	// not a later re-assertion.
	it("preserves updateCycleStartedAt when 'received' fires twice in the same cycle", () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			// Cycle 1 starts at t=0 (pending message arrives)
			api.setUpdateStage('received', { detail: 'pending: /src/foo.ts' });
			vi.advanceTimersByTime(120);
			// Angular handler re-asserts 'received' 120ms later. Detail
			// text updates, but the cycle clock must NOT reset.
			api.setUpdateStage('received', { detail: 'angular: /src/foo.ts' });
			vi.advanceTimersByTime(80);
			// The cycle has been on screen for 200ms total. Complete
			// fires at t=200ms. The auto-hide must use the cycle's
			// ORIGINAL start (t=0) for the min-visible math: 800ms
			// min - 200ms elapsed = 600ms remainder. Combined with
			// the 600ms standard hold, total post-complete hold = 600ms.
			api.setUpdateStage('complete', { detail: 'Total 200ms' });
			// At t=750ms (550ms after complete) the overlay is still
			// visible because we owe at least 600ms post-complete.
			vi.advanceTimersByTime(550);
			expect(api.getSnapshot()).toMatchObject({
				visible: true,
				mode: 'update',
				progress: 100,
			});
			// At t=900ms (700ms after complete) it's gone.
			vi.advanceTimersByTime(150);
			expect(api.getSnapshot()).toMatchObject({
				visible: false,
				mode: 'hidden',
			});
		} finally {
			vi.useRealTimers();
		}
	});

	// Defensive: a brand-new cycle (no in-progress 'update' state)
	// MUST stamp a fresh cycle start. Without this we'd end up
	// reusing the previous cycle's startedAt forever.
	it("DOES stamp updateCycleStartedAt when 'received' fires from a hidden state", () => {
		vi.useFakeTimers();
		try {
			const api = ensureHmrDevOverlayRuntimeInstalled(true);
			// Cycle 1 happens and finishes
			api.setUpdateStage('received', { detail: 'cycle 1' });
			vi.advanceTimersByTime(40);
			api.setUpdateStage('complete', { detail: 'Total 40ms' });
			vi.advanceTimersByTime(2000); // long past auto-hide
			expect(api.getSnapshot()).toMatchObject({ visible: false, mode: 'hidden' });

			// Cycle 2 starts fresh much later
			api.setUpdateStage('received', { detail: 'cycle 2' });
			vi.advanceTimersByTime(50);
			api.setUpdateStage('complete', { detail: 'Total 50ms' });

			// Cycle 2's hold should be timed against ITS OWN 'received'
			// (50ms ago), NOT cycle 1's stamped-then-cleared start.
			// Min-visible 800ms - 50ms elapsed = 750ms remainder, so
			// at +600ms post-complete it should still be visible.
			vi.advanceTimersByTime(700);
			expect(api.getSnapshot()).toMatchObject({
				visible: true,
				mode: 'update',
				progress: 100,
			});
			vi.advanceTimersByTime(150);
			expect(api.getSnapshot()).toMatchObject({ visible: false, mode: 'hidden' });
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('iOS overlay layout — code block and action button', () => {
	const base = { viewWidth: 390, viewHeight: 844, safeInsets: { top: 47, bottom: 34, left: 0, right: 0 }, titleHeight: 20, statusHeight: 36, position: 'top' as const };

	it('stacks the code block and the button below the status, growing the panel', () => {
		const layout = computeIosOverlayLayout({ ...base, codeHeight: 60, actionHeight: 36 });
		expect(layout.code).toEqual({ x: 16, y: 16 + 20 + 10 + 36 + 10, width: 340 - 32, height: 60 });
		expect(layout.action).toEqual({ x: 16, y: layout.code.y + 60 + 10, width: 340 - 32, height: 36 });
		expect(layout.panel.height).toBe(layout.action.y + 36 + 16);
	});

	it('leaves the panel as before without either', () => {
		const plain = computeIosOverlayLayout(base);
		expect(plain.panel.height).toBe(16 * 2 + 20 + 10 + 36);
		expect(plain.code.height).toBe(0);
		expect(plain.action.height).toBe(0);
		expect(computeIosOverlayLayout({ ...base, actionHeight: 36 }).action.y).toBe(16 + 20 + 10 + 36 + 10);
	});
});

describe('iOS overlay touch pass-through', () => {
	const actionHitRect = { x: 41, y: 200, width: 308, height: 36 };

	it('a toast takes touches on its button only', () => {
		expect(iosOverlayCapturesTouch({ x: 100, y: 210 }, { blocking: false, actionHitRect })).toBe(true);
		expect(iosOverlayCapturesTouch({ x: 100, y: 150 }, { blocking: false, actionHitRect })).toBe(false);
		expect(iosOverlayCapturesTouch({ x: 20, y: 210 }, { blocking: false, actionHitRect })).toBe(false);
	});

	it('a toast without a button lets every touch through', () => {
		expect(iosOverlayCapturesTouch({ x: 100, y: 210 }, { blocking: false, actionHitRect: null })).toBe(false);
	});

	it('the centered overlay takes every touch', () => {
		expect(iosOverlayCapturesTouch({ x: 0, y: 0 }, { blocking: true, actionHitRect: null })).toBe(true);
	});
});

describe('iOS overlay window — action button', () => {
	beforeEach(() => {
		delete getGlobalScope().__NS_HMR_OVERLAY_POSITION__;
	});

	function fakeIosRefs(passThrough: boolean) {
		const label = () => ({ hidden: false, text: '', frame: null as any, sizeThatFits: () => ({ height: 20 }) });
		const actionButton = {
			hidden: true,
			frame: null as any,
			title: '',
			setTitleForState(title: string) {
				actionButton.title = title;
			},
		};
		return {
			window: { hidden: true, userInteractionEnabled: false },
			controller: { view: { bounds: { size: { width: 390, height: 844 } }, safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 } } },
			backdrop: { frame: null },
			panel: { frame: null, alpha: 1 },
			titleLabel: label(),
			statusLabel: label(),
			codeLabel: { ...label(), hidden: true },
			actionButton,
			actionHandler: {},
			actionHitRect: null as any,
			currentAction: undefined as any,
			passThrough,
			wasVisible: false,
			currentPosition: 'top' as const,
		};
	}

	it('shows the button with its label and takes touches on it only', () => {
		const refs = fakeIosRefs(true);
		const action = { label: 'Restart app', onTap: vi.fn() };

		applySnapshotToIosRefs(refs, createUpdateOverlaySnapshot('failed', { detail: 'boom', code: '1 | x(', action }));

		expect(refs.actionButton).toMatchObject({ hidden: false, title: 'Restart app' });
		expect(refs.codeLabel).toMatchObject({ hidden: false, text: '1 | x(' });
		expect(refs.currentAction).toBe(action);
		const layout = computeIosOverlayLayout({ viewWidth: 390, viewHeight: 844, safeInsets: { top: 47, bottom: 34, left: 0, right: 0 }, titleHeight: 20, statusHeight: 20, codeHeight: 20, actionHeight: 36, position: 'top' });
		expect(refs.actionHitRect).toEqual({ x: layout.panel.x + layout.action.x, y: layout.panel.y + layout.action.y, width: layout.action.width, height: 36 });
		expect(refs.window.userInteractionEnabled).toBe(true);
	});

	it('hides the button and stops taking touches on the next stage', () => {
		const refs = fakeIosRefs(true);
		applySnapshotToIosRefs(refs, createUpdateOverlaySnapshot('failed', { detail: 'boom', action: { label: 'Restart app', onTap: vi.fn() } }));

		applySnapshotToIosRefs(refs, createUpdateOverlaySnapshot('restart-required', { detail: 'requested from the error overlay' }));

		expect(refs.actionButton.hidden).toBe(true);
		expect(refs.actionHitRect).toBeNull();
		expect(refs.currentAction).toBeUndefined();
	});

	it('without the pass-through window, a toast takes touches only while a button is shown', () => {
		const refs = fakeIosRefs(false);
		applySnapshotToIosRefs(refs, createUpdateOverlaySnapshot('received', { detail: 'a.ts' }));
		expect(refs.window.userInteractionEnabled).toBe(false);
		applySnapshotToIosRefs(refs, createUpdateOverlaySnapshot('failed', { detail: 'boom', action: { label: 'Restart app', onTap: vi.fn() } }));
		expect(refs.window.userInteractionEnabled).toBe(true);
	});
});

describe('in-tree overlay — action button', () => {
	beforeEach(() => {
		delete getGlobalScope().__NS_HMR_OVERLAY_POSITION__;
	});

	function fakeLiveRefs() {
		const panel = { requestLayout() {} };
		return {
			overlay: { visibility: 'collapse', isUserInteractionEnabled: false },
			titleLabel: { text: '', parent: panel },
			statusLabel: { text: '' },
			codeLabel: { text: '', visibility: 'collapse' },
			actionButton: { text: '', visibility: 'collapse' },
			currentAction: undefined as any,
			wasVisible: false,
			currentPosition: 'top' as const,
		};
	}

	it('shows the button on the failed stage and makes the overlay interactive only then', () => {
		const refs = fakeLiveRefs();
		const action = { label: 'Restart app', onTap: vi.fn() };

		applySnapshotToLiveRefs(refs, createUpdateOverlaySnapshot('failed', { detail: 'boom', code: '1 | x(', action }));
		expect(refs.actionButton).toMatchObject({ visibility: 'visible', text: 'Restart app' });
		expect(refs.codeLabel).toMatchObject({ visibility: 'visible', text: '1 | x(' });
		expect(refs.currentAction).toBe(action);
		expect(refs.overlay.isUserInteractionEnabled).toBe(true);

		applySnapshotToLiveRefs(refs, createUpdateOverlaySnapshot('restart-required', { detail: 'reason' }));
		expect(refs.actionButton.visibility).toBe('collapse');
		expect(refs.codeLabel.visibility).toBe('collapse');
		expect(refs.currentAction).toBeUndefined();
		expect(refs.overlay.isUserInteractionEnabled).toBe(false);
	});
});
