import { describe, it, expect, vi } from 'vitest';

import { buildSfcCompleteDetail, buildSfcFailedDetail, buildSfcLoadingDetail, buildSfcRemountDetail, buildSfcSkippedDetail, driveVueSfcUpdateOverlay } from './vue-sfc-update-overlay.js';

describe('buildSfcLoadingDetail', () => {
	it('returns the file-path form on the happy path', () => {
		expect(buildSfcLoadingDetail('/src/components/Home.vue')).toBe('Loading /src/components/Home.vue');
	});

	it('falls back to a generic string when the path is missing/unknown', () => {
		expect(buildSfcLoadingDetail(undefined)).toBe('Loading SFC update');
		expect(buildSfcLoadingDetail('')).toBe('Loading SFC update');
		expect(buildSfcLoadingDetail('<unknown>')).toBe('Loading SFC update');
	});
});

describe('buildSfcRemountDetail', () => {
	it('returns the file-path form on the happy path', () => {
		expect(buildSfcRemountDetail('/src/components/Home.vue')).toBe('Re-mounting /src/components/Home.vue');
	});

	it('falls back to a generic string when the path is missing/unknown', () => {
		expect(buildSfcRemountDetail(undefined)).toBe('Re-mounting view tree');
		expect(buildSfcRemountDetail('')).toBe('Re-mounting view tree');
	});
});

describe('buildSfcCompleteDetail', () => {
	it('includes the rounded ms when the path is known', () => {
		expect(buildSfcCompleteDetail('/src/components/Home.vue', 42)).toBe('Updated /src/components/Home.vue in 42ms');
	});

	it('falls back to a generic string when the path is missing', () => {
		expect(buildSfcCompleteDetail(undefined, 17)).toBe('Update applied in 17ms');
	});

	it('rounds fractional elapsed values', () => {
		expect(buildSfcCompleteDetail('/x.vue', 123.7)).toBe('Updated /x.vue in 124ms');
	});

	it('clamps invalid elapsed values to 0ms', () => {
		expect(buildSfcCompleteDetail('/x.vue', NaN)).toBe('Updated /x.vue in 0ms');
		expect(buildSfcCompleteDetail('/x.vue', -5)).toBe('Updated /x.vue in 0ms');
	});
});

describe('buildSfcSkippedDetail', () => {
	it('returns the file-path form on the happy path', () => {
		expect(buildSfcSkippedDetail('/src/components/Home.vue')).toBe('Skipped /src/components/Home.vue');
	});

	it('falls back to a generic string when the path is missing', () => {
		expect(buildSfcSkippedDetail(undefined)).toBe('No SFC swap required');
	});
});

describe('buildSfcFailedDetail', () => {
	it('returns the file-path form on the happy path', () => {
		expect(buildSfcFailedDetail('/src/components/Home.vue')).toBe('Update failed for /src/components/Home.vue');
	});

	it('falls back to a generic string when the path is missing', () => {
		expect(buildSfcFailedDetail(undefined)).toBe('SFC update failed');
	});
});

describe('driveVueSfcUpdateOverlay', () => {
	function makeClock(initial = 1000, step = 10) {
		let t = initial;
		return () => {
			const v = t;
			t += step;
			return v;
		};
	}

	function makeStageRecorder() {
		const stages: Array<{ stage: string; detail?: string }> = [];
		const setUpdateStage = vi.fn((stage: string, info?: { detail?: string }) => {
			stages.push({ stage, detail: info?.detail });
		});
		const hide = vi.fn();
		return { stages, setUpdateStage, hide };
	}

	it("walks 'evicting' → 'reimporting' → 'rebooting' → 'complete' on the happy path", async () => {
		const { stages, setUpdateStage } = makeStageRecorder();
		const applyComponent = vi.fn(async () => {});
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => ({ name: 'Home' }),
				applyComponent,
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: true,
				now: makeClock(),
			},
		);
		expect(result.completed).toBe(true);
		expect(result.swapped).toBe(true);
		expect(result.error).toBeUndefined();
		expect(applyComponent).toHaveBeenCalledTimes(1);
		expect(stages.map((s) => s.stage)).toEqual(['evicting', 'reimporting', 'rebooting', 'complete']);
		expect(stages[3]).toEqual({ stage: 'complete', detail: expect.stringMatching(/^Updated \/src\/components\/Home\.vue in \d+ms$/) });
	});

	it("calls 'complete' with a skip detail when loadComponent returns null (no swap required)", async () => {
		const { stages, setUpdateStage } = makeStageRecorder();
		const applyComponent = vi.fn(async () => {});
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Details.vue',
				loadComponent: async () => null,
				applyComponent,
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: true,
				now: makeClock(),
			},
		);
		expect(result.swapped).toBe(false);
		expect(result.completed).toBe(true);
		expect(applyComponent).not.toHaveBeenCalled();
		expect(stages.map((s) => s.stage)).toEqual(['evicting', 'reimporting', 'complete']);
		expect(stages[2].detail).toBe('Skipped /src/components/Details.vue');
	});

	it("emits 'complete' with a failure detail when loadComponent throws (toast must NOT stay on 60%)", async () => {
		const { stages, setUpdateStage } = makeStageRecorder();
		const applyComponent = vi.fn(async () => {});
		const boom = new Error('load failed');
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => {
					throw boom;
				},
				applyComponent,
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: true,
				now: makeClock(),
			},
		);
		expect(result.swapped).toBe(false);
		expect(result.completed).toBe(true);
		expect(result.error).toBe(boom);
		expect(applyComponent).not.toHaveBeenCalled();
		expect(stages.map((s) => s.stage)).toEqual(['evicting', 'reimporting', 'complete']);
		expect(stages[2].detail).toBe('Update failed for /src/components/Home.vue');
	});

	it("emits 'complete' with a failure detail when applyComponent throws", async () => {
		const { stages, setUpdateStage } = makeStageRecorder();
		const boom = new Error('mount failed');
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => ({ name: 'Home' }),
				applyComponent: async () => {
					throw boom;
				},
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: true,
				now: makeClock(),
			},
		);
		expect(result.swapped).toBe(false);
		expect(result.completed).toBe(true);
		expect(result.error).toBe(boom);
		expect(stages.map((s) => s.stage)).toEqual(['evicting', 'reimporting', 'rebooting', 'complete']);
		expect(stages[3].detail).toBe('Update failed for /src/components/Home.vue');
	});

	it('does NOT touch the overlay when gating is disabled (NS_VITE_PROGRESS_OVERLAY=0) but still performs the swap', async () => {
		const setUpdateStage = vi.fn();
		const applyComponent = vi.fn(async () => {});
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => ({ name: 'Home' }),
				applyComponent,
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: false,
			},
		);
		expect(setUpdateStage).not.toHaveBeenCalled();
		expect(applyComponent).toHaveBeenCalledTimes(1);
		expect(result.swapped).toBe(true);
		expect(result.completed).toBe(true);
	});

	it('soft-fails when the overlay API is missing (production builds, no overlay installed)', async () => {
		const applyComponent = vi.fn(async () => {});
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => ({ name: 'Home' }),
				applyComponent,
			},
			{
				getOverlay: () => null,
				overlayEnabled: true,
			},
		);
		expect(result.swapped).toBe(true);
		expect(result.completed).toBe(true);
		expect(applyComponent).toHaveBeenCalledTimes(1);
	});

	it('swallows overlay setUpdateStage throws — the HMR cycle must complete regardless', async () => {
		const setUpdateStage = vi.fn(() => {
			throw new Error('overlay broken');
		});
		const applyComponent = vi.fn(async () => {});
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => ({ name: 'Home' }),
				applyComponent,
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: true,
			},
		);
		expect(result.swapped).toBe(true);
		expect(result.completed).toBe(true);
		expect(applyComponent).toHaveBeenCalledTimes(1);
	});

	it('swallows getOverlay throws (e.g. globalThis access denied) and still completes the swap', async () => {
		const applyComponent = vi.fn(async () => {});
		const result = await driveVueSfcUpdateOverlay(
			{
				filePath: '/src/components/Home.vue',
				loadComponent: async () => ({ name: 'Home' }),
				applyComponent,
			},
			{
				getOverlay: () => {
					throw new Error('denied');
				},
				overlayEnabled: true,
			},
		);
		expect(result.swapped).toBe(true);
		expect(result.completed).toBe(true);
	});

	it('falls back to generic detail strings when the file path is missing', async () => {
		const { stages, setUpdateStage } = makeStageRecorder();
		await driveVueSfcUpdateOverlay(
			{
				filePath: undefined,
				loadComponent: async () => ({ name: 'Unknown' }),
				applyComponent: async () => {},
			},
			{
				getOverlay: () => ({ setUpdateStage }),
				overlayEnabled: true,
				now: makeClock(),
			},
		);
		expect(stages[0].detail).toBe('Loading SFC update');
		expect(stages[1].detail).toBe('Loading SFC update');
		expect(stages[2].detail).toBe('Re-mounting view tree');
		expect(stages[3].detail).toMatch(/^Update applied in \d+ms$/);
	});
});
