import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createBootOverlaySnapshot, createConnectionOverlaySnapshot, ensureHmrDevOverlayRuntimeInstalled } from './dev-overlay.js';

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
