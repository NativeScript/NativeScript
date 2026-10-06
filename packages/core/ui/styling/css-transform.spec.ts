import { describe, it, expect } from 'vitest';

import { transformConverter, isPercentTranslate } from './css-transform';
import { translateXProperty, translateYProperty } from './style-properties';

describe('transformConverter', () => {
	it('parses translate dip values', () => {
		const { translate } = transformConverter('translate(10, -20)');

		expect(translate.x).toBe(10);
		expect(translate.y).toBe(-20);
	});

	it('parses translate px values', () => {
		const { translate } = transformConverter('translate(10px, -20px)');

		expect(translate.x).toEqual({ unit: 'px', value: 10 });
		expect(translate.y).toEqual({ unit: 'px', value: -20 });
	});

	it('parses translate percent values instead of silently treating them as dips', () => {
		const { translate } = transformConverter('translate(-50%, -50%)');

		expect(translate.x).toEqual({ unit: '%', value: -0.5 });
		expect(translate.y).toEqual({ unit: '%', value: -0.5 });
	});

	it('parses a single translate argument with an implied zero y', () => {
		const { translate } = transformConverter('translate(-50%)');

		expect(translate.x).toEqual({ unit: '%', value: -0.5 });
		expect(translate.y).toBe(0);
	});

	it('parses translateX/translateY functions', () => {
		const { translate } = transformConverter('translateX(-50%) translateY(25%)');

		expect(translate.x).toEqual({ unit: '%', value: -0.5 });
		expect(translate.y).toEqual({ unit: '%', value: 0.25 });
	});

	it('keeps percent translate values alongside other transform functions', () => {
		const { translate, scale } = transformConverter('translate(-50%, -50%) scale(2)');

		expect(translate.x).toEqual({ unit: '%', value: -0.5 });
		expect(translate.y).toEqual({ unit: '%', value: -0.5 });
		expect(scale.x).toBe(2);
		expect(scale.y).toBe(2);
	});

	it('merges duplicate translate functions axis-wise preserving percent units', () => {
		const { translate } = transformConverter('translate(10, 0) translateY(25%)');

		expect(translate.x).toBe(10);
		expect(translate.y).toEqual({ unit: '%', value: 0.25 });
	});

	it('sums multiple dip contributions on one translate axis', () => {
		const { translate } = transformConverter('translate(10, 20) translateX(30)');

		expect(translate.x).toBe(40);
		expect(translate.y).toBe(20);
	});

	it('sums same-unit translate contributions keeping the unit', () => {
		const { translate } = transformConverter('translateX(50%) translateX(25%)');

		expect(translate.x).toEqual({ unit: '%', value: 0.75 });
	});

	it('degrades mixed-unit translate sums on one axis like the old parser', () => {
		const { translate } = transformConverter('translate(10, 0) translateX(-50%)');

		// -50% cannot be summed with 10dip statically; it degrades to its
		// numeric value (-50dip), matching the pre-fix parsing behavior.
		expect(translate.x).toBe(-40);
		expect(translate.y).toBe(0);
	});

	it('returns the identity translate for none', () => {
		const { translate } = transformConverter('none');

		expect(translate.x).toBe(0);
		expect(translate.y).toBe(0);
	});
});

describe('translateX/translateY property converters', () => {
	it('parses percent values', () => {
		expect(translateXProperty._valueConverter('-50%')).toEqual({ unit: '%', value: -0.5 });
		expect(translateYProperty._valueConverter('25%')).toEqual({ unit: '%', value: 0.25 });
	});

	it('parses dip and px values', () => {
		expect(translateXProperty._valueConverter('10')).toBe(10);
		expect(translateXProperty._valueConverter('10px')).toEqual({ unit: 'px', value: 10 });
	});
});

describe('isPercentTranslate', () => {
	it('recognizes parsed percentages', () => {
		expect(isPercentTranslate({ unit: '%', value: -0.5 })).toBe(true);
		expect(isPercentTranslate({ unit: '%', value: 0 })).toBe(true);
	});

	it('returns false for other lengths and unset values', () => {
		expect(isPercentTranslate(10)).toBe(false);
		expect(isPercentTranslate({ unit: 'dip', value: 10 })).toBe(false);
		expect(isPercentTranslate({ unit: 'px', value: 10 })).toBe(false);
		expect(isPercentTranslate('auto')).toBe(false);
		expect(isPercentTranslate('50%')).toBe(false);
		expect(isPercentTranslate(undefined)).toBe(false);
		expect(isPercentTranslate(null)).toBe(false);
	});
});
