import { describe, expect, it } from 'vitest';
import { BOOT_PLACEHOLDER_MOTION, computeBootProgressFillScale, formatBootDetailLine, formatBootPrimaryLine, getBootPlaceholderPalette } from './boot-placeholder-ui.js';

describe('getBootPlaceholderPalette', () => {
	it('returns the calm info palette by default', () => {
		const palette = getBootPlaceholderPalette('info');
		expect(palette.cardBackground).toBe('#FFFFFF');
		expect(palette.progressFill).toBe('#3B6FE5');
		expect(palette.titleText).toBe('#0F172A');
	});

	it('returns a high-contrast error palette when the snapshot tone is error', () => {
		const info = getBootPlaceholderPalette('info');
		const error = getBootPlaceholderPalette('error');
		expect(error.titleText).not.toBe(info.titleText);
		expect(error.progressFill).toBe('#B41810');
	});

	it('falls back to the info palette for unknown or missing tones', () => {
		expect(getBootPlaceholderPalette(null)).toEqual(getBootPlaceholderPalette('info'));
		expect(getBootPlaceholderPalette(undefined)).toEqual(getBootPlaceholderPalette('info'));
		expect(getBootPlaceholderPalette('warn' as any)).toEqual(getBootPlaceholderPalette('info'));
	});
});

describe('BOOT_PLACEHOLDER_MOTION', () => {
	it('keeps every motion phase under half a second so the placeholder never feels sluggish', () => {
		expect(BOOT_PLACEHOLDER_MOTION.entranceDurationMs).toBeLessThanOrEqual(500);
		expect(BOOT_PLACEHOLDER_MOTION.progressDurationMs).toBeLessThanOrEqual(500);
		expect(BOOT_PLACEHOLDER_MOTION.brandPulseDurationMs).toBeGreaterThanOrEqual(800); // pulse should feel ambient
	});

	it('starts the entrance scale below 1 so easing produces an obvious "settle"', () => {
		expect(BOOT_PLACEHOLDER_MOTION.entranceFromScale).toBeGreaterThan(0.85);
		expect(BOOT_PLACEHOLDER_MOTION.entranceFromScale).toBeLessThan(1);
	});

	it('keeps the progress fill transition shorter than the boot heartbeat tick', () => {
		// The session-bootstrap heartbeat re-asserts 'importing-main' every
		// 250 ms; if the fill animation took longer than that, consecutive
		// ticks would queue up and the bar would visibly lag behind the
		// numeric percent.
		expect(BOOT_PLACEHOLDER_MOTION.progressDurationMs).toBeLessThan(250);
	});

	it('keeps the brand pulse opacity floor visible so the badge never disappears', () => {
		expect(BOOT_PLACEHOLDER_MOTION.brandPulseMinOpacity).toBeGreaterThan(0.4);
		expect(BOOT_PLACEHOLDER_MOTION.brandPulseMinOpacity).toBeLessThan(1);
	});
});

describe('computeBootProgressFillScale', () => {
	it('maps 0 → 100 % linearly into a [minScale, 1] scaleX factor', () => {
		expect(computeBootProgressFillScale(0)).toBeCloseTo(0.01, 4);
		expect(computeBootProgressFillScale(25)).toBeCloseTo(0.25, 4);
		expect(computeBootProgressFillScale(50)).toBeCloseTo(0.5, 4);
		expect(computeBootProgressFillScale(92)).toBeCloseTo(0.92, 4);
		expect(computeBootProgressFillScale(100)).toBe(1);
	});

	it('clamps above 100 % and below 0 % so the fill never overshoots or collapses below the floor', () => {
		expect(computeBootProgressFillScale(120)).toBe(1);
		expect(computeBootProgressFillScale(-20)).toBeCloseTo(0.01, 4);
	});

	it('treats null / undefined / NaN as zero progress (always shows the visible floor)', () => {
		expect(computeBootProgressFillScale(null)).toBeCloseTo(0.01, 4);
		expect(computeBootProgressFillScale(undefined)).toBeCloseTo(0.01, 4);
		expect(computeBootProgressFillScale(Number.NaN)).toBeCloseTo(0.01, 4);
	});

	it('honors a custom minScale floor', () => {
		expect(computeBootProgressFillScale(0, 0.05)).toBeCloseTo(0.05, 4);
		expect(computeBootProgressFillScale(50, 0.05)).toBeCloseTo(0.5, 4);
	});
});

describe('formatBootPrimaryLine', () => {
	it('renders "phase (XX%)" when both phase and numeric progress are present', () => {
		expect(formatBootPrimaryLine({ phase: 'Importing the app entry', progress: 55 })).toBe('Importing the app entry (55%)');
	});

	it('rounds the progress to a whole percent', () => {
		expect(formatBootPrimaryLine({ phase: 'Loading', progress: 33.6 })).toBe('Loading (34%)');
	});

	it('omits the parenthetical when progress is null or non-numeric', () => {
		expect(formatBootPrimaryLine({ phase: 'Retrying after a boot failure', progress: null })).toBe('Retrying after a boot failure');
		expect(formatBootPrimaryLine({ phase: 'Retry', progress: Number.NaN as any })).toBe('Retry');
	});

	it('returns the empty string for null / undefined snapshots', () => {
		expect(formatBootPrimaryLine(null)).toBe('');
		expect(formatBootPrimaryLine(undefined)).toBe('');
	});
});

describe('formatBootDetailLine', () => {
	it('returns the detail string verbatim', () => {
		expect(formatBootDetailLine({ detail: 'Loading the module graph…' })).toBe('Loading the module graph…');
	});

	it('returns the empty string for missing / non-string details', () => {
		expect(formatBootDetailLine({ detail: '' })).toBe('');
		expect(formatBootDetailLine({ detail: undefined as any })).toBe('');
		expect(formatBootDetailLine({ detail: 42 as any })).toBe('');
		expect(formatBootDetailLine(null)).toBe('');
	});
});
