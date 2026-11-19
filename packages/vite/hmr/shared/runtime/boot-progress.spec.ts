import { afterEach, describe, expect, it } from 'vitest';
import { applyMonotonicBootProgress, BOOT_IMPORT_PROGRESS_CEILING, BOOT_IMPORT_PROGRESS_MAX, BOOT_IMPORT_PROGRESS_MIN, clearBootProgressState, computeBootImportProgress } from './boot-progress.js';

afterEach(() => {
	clearBootProgressState();
});

describe('computeBootImportProgress', () => {
	it('starts at the floor when nothing has happened', () => {
		expect(computeBootImportProgress(0)).toBe(BOOT_IMPORT_PROGRESS_MIN);
	});

	it('coerces invalid inputs to zero elapsed time', () => {
		expect(computeBootImportProgress(-500)).toBe(BOOT_IMPORT_PROGRESS_MIN);
		expect(computeBootImportProgress(NaN)).toBe(BOOT_IMPORT_PROGRESS_MIN);
		expect(computeBootImportProgress(undefined as any)).toBe(BOOT_IMPORT_PROGRESS_MIN);
	});

	const timeTable: Array<[number, number]> = [
		[0, 30],
		[250, 31],
		[500, 32],
		[2500, 40],
		[5000, 50],
		[7500, 60],
		[10_000, 70],
		[15_500, 92], // saturates at BOOT_IMPORT_PROGRESS_MAX
		[60_000, 92],
	];

	it.each(timeTable)('advances with elapsed time (elapsedMs=%i → progress=%i)', (elapsedMs, expected) => {
		expect(computeBootImportProgress(elapsedMs)).toBe(expected);
	});

	it('never crosses the BOOT_IMPORT_PROGRESS_CEILING regardless of input', () => {
		expect(computeBootImportProgress(1_000_000)).toBe(BOOT_IMPORT_PROGRESS_MAX);
		expect(computeBootImportProgress(Infinity)).toBeLessThanOrEqual(BOOT_IMPORT_PROGRESS_CEILING);
	});
});

describe('applyMonotonicBootProgress', () => {
	it('returns the candidate when no prior value is set', () => {
		expect(applyMonotonicBootProgress(85)).toBe(85);
		expect(applyMonotonicBootProgress(0)).toBe(85);
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
	});

	it('coerces NaN/negative candidates to zero before comparing', () => {
		applyMonotonicBootProgress(85);
		expect(applyMonotonicBootProgress(NaN)).toBe(85);
		expect(applyMonotonicBootProgress(-100)).toBe(85);
	});
});

describe('clearBootProgressState', () => {
	it('resets the ratchet so a re-bootstrap starts fresh', () => {
		applyMonotonicBootProgress(90);

		clearBootProgressState();

		expect(applyMonotonicBootProgress(31)).toBe(31);
	});

	it('survives a clear call when the ratchet was never set', () => {
		expect(() => clearBootProgressState()).not.toThrow();
	});
});
