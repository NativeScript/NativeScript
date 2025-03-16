import { Color } from '../../color';

describe('css-color-mix', () => {
	// all examples from:
	// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix

	it('color-mix(in oklab, var(--color-black) 50%, transparent)', () => {
		const color = new Color('color-mix(in oklab, black 50%, transparent)');
		expect(color.toRgbString()).toBe('rgba(0, 0, 0, 0.50)');
	});

	it('color-mix(in hsl, hsl(200 50 80), coral 80%)', () => {
		const color = new Color('color-mix(in hsl, hsl(200 50 80), coral 80%)');
		expect(color.toRgbString()).toBe('rgba(239, 144, 110, 1.00)');
	});

	it('color-mix(in lch longer hue, hsl(200deg 50% 80%), coral)', () => {
		const color = new Color('color-mix(in lch longer hue, hsl(200deg 50% 80%), coral)');
		expect(color.toRgbString()).toBe('rgba(217, 169, 155, 1.00)');
	});

	it('color-mix(in srgb, plum, #f00)', () => {
		const color = new Color('color-mix(in srgb, plum, #f00)');
		expect(color.toRgbString()).toBe('rgba(238, 80, 110, 1.00)');
	});

	it('color-mix(in lab, plum 60%, #f00 50%)', () => {
		const color = new Color('color-mix(in lab, plum 60%, #f00 50%)');
		expect(color.toRgbString()).toBe('rgba(236, 87, 120, 1.00)');
	});

	it('color-mix(in --swop5c, red, blue)', () => {
		const color = new Color('color-mix(in --swop5c, red, blue)');
		expect(color.toRgbString()).toBe('rgba(127, 0, 127, 1.00)');
	});
});
