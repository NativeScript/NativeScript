import { colorMixToRgbA } from '../../color/color-utils';

describe('css-color-mix', () => {
	// all examples from:
	// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix

	it('empty', () => {
		const value = colorMixToRgbA('');
		expect(value).toBe('');
	});

	it('color-mix(in oklab, var(--color-black) 50%, transparent)', () => {
		const value = colorMixToRgbA('color-mix(in oklab, black 50%, transparent)');
		expect(value).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('color-mix(in hsl, hsl(200 50 80), coral 80%)', () => {
		const value = colorMixToRgbA('color-mix(in hsl, hsl(200 50 80), coral 80%)');
		expect(value).toBe('rgba(240, 144, 110, 1)');
	});

	it('color-mix(in lch longer hue, hsl(200deg 50% 80%), coral)', () => {
		const value = colorMixToRgbA('color-mix(in lch longer hue, hsl(200deg 50% 80%), coral)');
		expect(value).toBe('rgba(217, 170, 155, 1)');
	});

	it('color-mix(in srgb, plum, #f00)', () => {
		const value = colorMixToRgbA('color-mix(in srgb, plum, #f00)');
		expect(value).toBe('rgba(238, 80, 111, 1)');
	});

	it('color-mix(in lab, plum 60%, #f00 50%)', () => {
		const value = colorMixToRgbA('color-mix(in lab, plum 60%, #f00 50%)');
		expect(value).toBe('rgba(236, 87, 121, 1)');
	});

	it('color-mix(in --swop5c, red, blue)', () => {
		const value = colorMixToRgbA('color-mix(in --swop5c, red, blue)');
		expect(value).toBe('rgba(128, 0, 128, 1)');
	});
});
