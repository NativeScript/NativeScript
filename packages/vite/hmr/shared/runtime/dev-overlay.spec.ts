import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeIosOverlayLayout, computeIosOverlayWindowLevel, createBootOverlaySnapshot, createConnectionOverlaySnapshot, createUpdateOverlaySnapshot, ensureHmrDevOverlayRuntimeInstalled, setHmrUpdateStage } from './dev-overlay.js';

describe('HMR dev overlay snapshots', () => {
	afterEach(() => {
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
	});

	it('builds a phase-based boot snapshot with attempt detail', () => {
		const snapshot = createBootOverlaySnapshot('importing-main', {
			detail: 'http://localhost:5173/ns/m/src/main.ts?v=1',
			attempt: 2,
			attempts: 6,
		});

		expect(snapshot.visible).toBe(true);
		expect(snapshot.mode).toBe('boot');
		expect(snapshot.phase).toContain('Importing the app entry');
		expect(snapshot.progress).toBe(82);
		expect(snapshot.detail).toContain('Attempt 2/6');
	});

	it('builds a reconnect snapshot without a determinate progress bar', () => {
		const snapshot = createConnectionOverlaySnapshot('reconnecting');

		expect(snapshot.visible).toBe(true);
		expect(snapshot.mode).toBe('connection');
		expect(snapshot.progress).toBeNull();
		expect(snapshot.tone).toBe('warn');
		expect(snapshot.phase).toContain('Reconnecting');
	});

	it('builds an explicit app-root-committed boot snapshot', () => {
		const snapshot = createBootOverlaySnapshot('app-root-committed', {
			detail: 'The real app root replaced the boot placeholder.',
		});

		expect(snapshot.visible).toBe(true);
		expect(snapshot.mode).toBe('boot');
		expect(snapshot.badge).toBe('READY');
		expect(snapshot.phase).toContain('Real app root committed');
		expect(snapshot.progress).toBe(100);
	});
});

describe('HMR dev overlay runtime API', () => {
	beforeEach(() => {
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
	});

	afterEach(() => {
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
	});

	it('installs a stable global API and tracks boot stages', () => {
		const api = ensureHmrDevOverlayRuntimeInstalled(true);
		const sameApi = ensureHmrDevOverlayRuntimeInstalled(false);

		expect(api).toBe(sameApi);
		expect((globalThis as any).__NS_HMR_DEV_OVERLAY__).toBe(api);

		api.setBootStage('loading-core-bridge', {
			detail: 'http://localhost:5173/ns/core/7',
		});

		expect(api.getSnapshot()).toMatchObject({
			visible: true,
			mode: 'boot',
			phase: 'Loading the unified core bridge',
			progress: 54,
		});
	});

	it('switches from connection state back to hidden on hide()', () => {
		const api = ensureHmrDevOverlayRuntimeInstalled(true);

		api.setConnectionStage('offline', {
			detail: 'Waiting for ws://localhost:5173/ns-hmr',
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

// Round-eleven.3 — HMR-applying progress overlay.
//
// These tests pin the snapshot shape (badge / phase / progress /
// tone / mode) for each stage in the cycle so a future refactor
// can't silently flip the colour scheme back to error-red or break
// the stage ordering. Progress percentages are part of the
// contract: they're what the user sees in the overlay's status
// line, and any reshuffle should be a deliberate design decision.
describe('Round-eleven.3 — HMR apply overlay snapshots', () => {
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
		expect(rebooting.phase).toBe('Rebooting Angular');
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

describe('Round-eleven.3 — HMR apply overlay runtime API', () => {
	beforeEach(() => {
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
	});

	afterEach(() => {
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY__;
		delete (globalThis as any).__NS_HMR_DEV_OVERLAY_STATE__;
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

			// After the auto-hide window elapses, the overlay
			// drops back to the hidden DEFAULT_SNAPSHOT.
			vi.advanceTimersByTime(400);
			expect(api.getSnapshot()).toMatchObject({
				visible: false,
				mode: 'hidden',
			});
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
		expect((globalThis as any).__NS_HMR_DEV_OVERLAY__).toBeDefined();
	});
});
