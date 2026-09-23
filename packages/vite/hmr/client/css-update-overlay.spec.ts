import { describe, it, expect } from 'vitest';
import { buildCssApplyingDetail, buildCssAppliedDetail } from './css-update-overlay';

describe('buildCssApplyingDetail', () => {
	it('uses the singular form for a single update', () => {
		expect(buildCssApplyingDetail(1)).toBe('Applying CSS update');
	});

	it('uses the plural form for multiple updates', () => {
		expect(buildCssApplyingDetail(3)).toBe('Applying 3 CSS updates');
	});

	it('falls back to the singular form for zero/invalid counts', () => {
		expect(buildCssApplyingDetail(0)).toBe('Applying CSS update');
		expect(buildCssApplyingDetail(NaN)).toBe('Applying CSS update');
	});
});

describe('buildCssAppliedDetail', () => {
	it('uses the singular form for a single update', () => {
		expect(buildCssAppliedDetail(1)).toBe('CSS update applied');
	});

	it('uses the plural form for multiple updates', () => {
		expect(buildCssAppliedDetail(2)).toBe('2 CSS updates applied');
	});

	it('falls back to the singular form for zero/invalid counts', () => {
		expect(buildCssAppliedDetail(0)).toBe('CSS update applied');
		expect(buildCssAppliedDetail(NaN)).toBe('CSS update applied');
	});
});
