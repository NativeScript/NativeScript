import { describe, it, expect, afterEach } from 'vitest';

import { Length, FixedLength, PercentLength } from './length-shared';
import { Label } from '../label';

describe('rem lengths', () => {
	afterEach(() => Length.setRootFontSize(16));

	it('are multiples of the root font size, 16 by default', () => {
		expect(Length.getRootFontSize()).toBe(16);
		expect(Length.parse('1rem')).toBe(16);
		expect(FixedLength.parse(' 0.5rem ')).toBe(8);
		expect(PercentLength.parse('1.5rem')).toBe(24);
		expect(PercentLength.parse('-1rem')).toBe(-16);
	});

	it('follow a root font size set before parsing', () => {
		Length.setRootFontSize(10);

		expect(Length.parse('2rem')).toBe(20);
	});

	it('ignore an invalid root font size', () => {
		Length.setRootFontSize(0);
		Length.setRootFontSize(NaN);

		expect(Length.getRootFontSize()).toBe(16);
	});

	it('reject an invalid rem value', () => {
		expect(() => Length.parse('remrem')).toThrow('Invalid value');
	});

	it('leave other units as they were', () => {
		expect(Length.parse('10')).toBe(10);
		expect(Length.parse('10px')).toEqual({ unit: 'px', value: 10 });
		expect(PercentLength.parse('50%')).toEqual({ unit: '%', value: 0.5 });
	});

	it('apply to css lengths and font sizes', () => {
		const label = new Label();
		label.style['css:margin-top'] = '0.5rem';
		label.style['css:font-size'] = '1.25rem';

		expect(label.style.marginTop).toBe(8);
		expect(label.style.fontSize).toBe(20);
	});

	it('apply in the font shorthand', () => {
		const label = new Label();
		label.style['css:font'] = 'italic 2rem serif';

		expect(label.style.fontSize).toBe(32);
	});
});
