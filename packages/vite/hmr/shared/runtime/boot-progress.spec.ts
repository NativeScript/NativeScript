import { afterEach, describe, expect, it } from 'vitest';
import { applyMonotonicBootProgress, BOOT_IMPORT_PROGRESS_CEILING, BOOT_IMPORT_PROGRESS_MAX, BOOT_IMPORT_PROGRESS_MIN, clearBootProgressState, computeBootImportProgress, formatBootImportDetail } from './boot-progress.js';
import { getGlobalScope } from './global-scope.js';

afterEach(() => {
	clearBootProgressState();
});

describe('computeBootImportProgress', () => {
	it('starts at the floor when nothing has happened', () => {
		expect(computeBootImportProgress({ count: 0, elapsedMs: 0 })).toBe(BOOT_IMPORT_PROGRESS_MIN);
	});

	it('coerces invalid inputs to zero contributions', () => {
		expect(computeBootImportProgress({ count: NaN as any, elapsedMs: -500 })).toBe(BOOT_IMPORT_PROGRESS_MIN);
		expect(computeBootImportProgress({ count: undefined, elapsedMs: undefined })).toBe(BOOT_IMPORT_PROGRESS_MIN);
		expect(computeBootImportProgress({} as any)).toBe(BOOT_IMPORT_PROGRESS_MIN);
	});

	// The bar should advance smoothly across a typical 30+ module application
	// graph rather than spending the whole boot pinned at the floor. These
	// fixtures are the canonical values both writers (heartbeat + injected
	// snippet) must agree on.
	//
	// Formula recap (mirrored in the inline snippet + entry-runtime fallback):
	//   progressFromCount = min(40, floor(count / 2))      // 0..40
	//   progressFromTime  = min(30, floor(elapsedMs / 250)) // 0..30
	//   combined          = 30 + min(62, fromCount + fromTime)
	//   final             = min(94, combined)              // 30..92
	const countOnlyTable: Array<[number, number]> = [
		[1, 30], // floor(1/2) = 0
		[2, 31],
		[10, 35],
		[20, 40],
		[40, 50],
		[80, 70], // count contribution caps at 40 (= 70) — time takes over from here
		[100, 70],
		[200, 70],
	];

	it.each(countOnlyTable)('advances by module count alone (count=%i → progress=%i)', (count, expected) => {
		expect(computeBootImportProgress({ count, elapsedMs: 0 })).toBe(expected);
	});

	const timeOnlyTable: Array<[number, number]> = [
		[0, 30],
		[250, 31],
		[500, 32],
		[2500, 40],
		[5000, 50],
		[7500, 60],
		[10_000, 70],
		[15_500, 92], // time contribution caps at 62 (= 92), the BOOT_IMPORT_PROGRESS_MAX
		[60_000, 92],
	];

	it.each(timeOnlyTable)('advances by elapsed time alone (elapsedMs=%i → progress=%i)', (elapsedMs, expected) => {
		expect(computeBootImportProgress({ count: 0, elapsedMs })).toBe(expected);
	});

	it('combines count and time additively up to the BOOT_IMPORT_PROGRESS_MAX clamp', () => {
		// 80 modules → count contribution 40; 7.5s elapsed → time contribution 30.
		// Sum is 70 (clamped at 62), so the bar reads 30 + 62 = 92 (= MAX).
		expect(computeBootImportProgress({ count: 80, elapsedMs: 7500 })).toBe(BOOT_IMPORT_PROGRESS_MAX);
		// 200 modules + long boot saturates both contributions; the
		// add-then-clamp keeps us at MAX (never reaches CEILING because the
		// CEILING is reserved for accidental rounding overshoot, which our
		// integer math currently can't produce).
		expect(computeBootImportProgress({ count: 200, elapsedMs: 60_000 })).toBe(BOOT_IMPORT_PROGRESS_MAX);
	});

	it('ramps fluidly across a representative cold-boot timeline (no long flat spans)', () => {
		// Snapshot a real-app boot trajectory from t=0 toward saturation
		// sampling the curve every 500ms with a count axis that grows ~10
		// modules/s (typical for an Angular app's static import graph). The
		// contract: the bar must NEVER move backwards AND must produce at
		// least one strictly-increasing reading every ~1s while we're still
		// climbing — otherwise the user perceives the placeholder as
		// "stuck". We stop the inner walk once the bar reaches the cap (the
		// remaining time before 'waiting-for-app' fires is intentionally
		// flat at MAX).
		let prev = -1;
		let lastIncreaseAt = 0;
		for (let elapsedMs = 0; elapsedMs <= 10_000; elapsedMs += 500) {
			const count = Math.floor((elapsedMs / 1000) * 10);
			const value = computeBootImportProgress({ count, elapsedMs });
			expect(value).toBeGreaterThanOrEqual(prev);
			if (value > prev) lastIncreaseAt = elapsedMs;
			if (value < BOOT_IMPORT_PROGRESS_MAX) {
				expect(elapsedMs - lastIncreaseAt).toBeLessThanOrEqual(1500);
			}
			prev = value;
		}
		// And by the end of a 10s/100-module boot, we should be at the cap so
		// the placeholder feels "almost done" before 'waiting-for-app' fires.
		expect(computeBootImportProgress({ count: 100, elapsedMs: 10_000 })).toBe(BOOT_IMPORT_PROGRESS_MAX);
	});

	it('never crosses the BOOT_IMPORT_PROGRESS_CEILING regardless of input', () => {
		expect(computeBootImportProgress({ count: 1_000_000, elapsedMs: 1_000_000 })).toBeLessThanOrEqual(BOOT_IMPORT_PROGRESS_CEILING);
	});
});

describe('formatBootImportDetail', () => {
	it('falls back to the generic module-graph line before any module has ticked', () => {
		expect(formatBootImportDetail({ count: 0 })).toBe('Loading the module graph…');
		expect(formatBootImportDetail({})).toBe('Loading the module graph…');
	});

	it('emits the count + last-module line once at least one module has evaluated', () => {
		expect(formatBootImportDetail({ count: 7, lastModule: '/src/main.ts' })).toBe('Evaluated 7 modules\n/src/main.ts');
	});

	it('omits the trailing module path line when only the count is known', () => {
		expect(formatBootImportDetail({ count: 7 })).toBe('Evaluated 7 modules');
	});

	it('clamps negative counts and non-strings defensively', () => {
		expect(formatBootImportDetail({ count: -3 as any, lastModule: 7 as any })).toBe('Loading the module graph…');
	});
});

describe('applyMonotonicBootProgress', () => {
	it('returns the candidate when no prior value is set', () => {
		expect(applyMonotonicBootProgress(85)).toBe(85);
		expect(getGlobalScope().__NS_HMR_BOOT_LAST_PROGRESS__).toBe(85);
	});

	it('ratchets forward when each candidate exceeds the previous', () => {
		applyMonotonicBootProgress(83);
		applyMonotonicBootProgress(85);
		expect(applyMonotonicBootProgress(88)).toBe(88);
	});

	it('clamps to the previous peak when a smaller candidate arrives (the snippet/heartbeat anti-stutter contract)', () => {
		applyMonotonicBootProgress(90);
		// Heartbeat just hit 90 via the time axis; a fresh module ticks the
		// snippet, which computes a count-only candidate of 86. Without the
		// ratchet the bar would visibly drop from 90 → 86. The contract is:
		// the displayed value never goes backwards.
		expect(applyMonotonicBootProgress(86)).toBe(90);
		expect(getGlobalScope().__NS_HMR_BOOT_LAST_PROGRESS__).toBe(90);
	});

	it('treats stale non-numeric globals as zero so a leftover from a prior boot can not stick the bar', () => {
		getGlobalScope().__NS_HMR_BOOT_LAST_PROGRESS__ = 'definitely not a number' as any;
		expect(applyMonotonicBootProgress(85)).toBe(85);
	});

	it('coerces NaN/negative candidates to zero before comparing', () => {
		applyMonotonicBootProgress(85);
		expect(applyMonotonicBootProgress(NaN)).toBe(85);
		expect(applyMonotonicBootProgress(-100)).toBe(85);
	});
});

describe('clearBootProgressState', () => {
	it('removes every boot-progress global so a re-bootstrap starts fresh', () => {
		const g: any = getGlobalScope();
		g.__NS_HMR_BOOT_MODULE_COUNT__ = 50;
		g.__NS_HMR_BOOT_LAST_MODULE__ = '/src/main.ts';
		g.__NS_HMR_BOOT_LAST_PROGRESS__ = 90;
		g.__NS_HMR_BOOT_LAST_PROGRESS_AT__ = Date.now();
		g.__NS_HMR_BOOT_IMPORT_STARTED_AT__ = Date.now();
		g.__NS_HMR_BOOT_LAST_YIELD_AT__ = Date.now();

		clearBootProgressState();

		expect(g.__NS_HMR_BOOT_MODULE_COUNT__).toBeUndefined();
		expect(g.__NS_HMR_BOOT_LAST_MODULE__).toBeUndefined();
		expect(g.__NS_HMR_BOOT_LAST_PROGRESS__).toBeUndefined();
		expect(g.__NS_HMR_BOOT_LAST_PROGRESS_AT__).toBeUndefined();
		expect(g.__NS_HMR_BOOT_IMPORT_STARTED_AT__).toBeUndefined();
		expect(g.__NS_HMR_BOOT_LAST_YIELD_AT__).toBeUndefined();
	});

	it('survives a clear call when the globals were never set', () => {
		expect(() => clearBootProgressState()).not.toThrow();
	});
});
