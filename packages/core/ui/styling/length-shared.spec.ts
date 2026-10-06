import { afterEach, describe, it, expect, vi } from 'vitest';

import { PercentLength } from './length-shared';
import { layout } from '../../utils/layout-helper';

describe('PercentLength.toDeviceIndependentPixels', () => {
	afterEach(() => vi.restoreAllMocks());

	it('resolves percent values against a basis in dips', () => {
		expect(PercentLength.toDeviceIndependentPixels({ unit: '%', value: -0.5 }, 0, 200)).toBe(-100);
		expect(PercentLength.toDeviceIndependentPixels({ unit: '%', value: 0.25 }, 0, 200)).toBe(50);
	});

	it('resolves percent values against an empty size', () => {
		expect(PercentLength.toDeviceIndependentPixels({ unit: '%', value: -0.5 }, 0, 0)).toBe(-0);
	});

	it('passes fractional dip values through', () => {
		expect(PercentLength.toDeviceIndependentPixels(10.25)).toBe(10.25);
		expect(PercentLength.toDeviceIndependentPixels({ unit: 'dip', value: -10.25 })).toBe(-10.25);
	});

	it('converts pixels using display density without rounding', () => {
		vi.spyOn(layout, 'toDeviceIndependentPixels').mockImplementation((value) => value / 2);

		expect(PercentLength.toDeviceIndependentPixels({ unit: 'px', value: 10.5 })).toBe(5.25);
		expect(PercentLength.toDeviceIndependentPixels({ unit: 'px', value: -10.5 })).toBe(-5.25);
	});

	it('preserves fractional percentage results', () => {
		expect(PercentLength.toDeviceIndependentPixels({ unit: '%', value: 0.25 }, 0, 101)).toBe(25.25);
	});

	it('uses the supplied fallback for auto and unset values', () => {
		expect(PercentLength.toDeviceIndependentPixels(undefined, 0, 200)).toBe(0);
		expect(PercentLength.toDeviceIndependentPixels(null, 0, 200)).toBe(0);
		expect(PercentLength.toDeviceIndependentPixels('auto', 0, 200)).toBe(0);
		expect(PercentLength.toDeviceIndependentPixels('auto', 12, 200)).toBe(12);
	});

	it('defaults the fallback and percentage basis to NaN', () => {
		expect(PercentLength.toDeviceIndependentPixels('auto')).toBeNaN();
		expect(PercentLength.toDeviceIndependentPixels(undefined)).toBeNaN();
		expect(PercentLength.toDeviceIndependentPixels({ unit: '%', value: 0.5 })).toBeNaN();
	});
});
