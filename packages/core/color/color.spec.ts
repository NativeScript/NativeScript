import { describe, it, expect } from 'vitest';

import { Color } from '.';

const rgba = (value: string) => new Color(value).toRgbString();

describe('Color', () => {
	it('parses CSS Color 4 color spaces', () => {
		expect(rgba('oklch(0.6 0.2 250)')).toBe('rgba(0, 131, 224, 1.00)');
		expect(rgba('oklch(70% 0.1 30deg / .5)')).toBe('rgba(213, 134, 121, 0.50)');
		expect(rgba('OKLCH(0.6 0.2 250)')).toBe('rgba(0, 131, 224, 1.00)');
		expect(rgba('oklab(0.628 0.225 0.126)')).toBe('rgba(255, 0, 0, 1.00)');
		expect(rgba('lab(50 40 59.5)')).toBe('rgba(191, 87, 0, 1.00)');
		expect(rgba('lch(50 72 56)')).toBe('rgba(191, 87, 0, 1.00)');
		expect(rgba('hwb(0 0% 0%)')).toBe('rgba(255, 0, 0, 1.00)');
		expect(rgba('color(srgb 1 0 0)')).toBe('rgba(255, 0, 0, 1.00)');
	});

	it('parses relative colors', () => {
		expect(rgba('oklch(from #ff0000 calc(l * 0.9) c h)')).toBe('rgba(222, 0, 0, 1.00)');
		expect(rgba('rgb(from red r g b / 50%)')).toBe('rgba(255, 0, 0, 0.50)');
	});

	it('parses the modern rgb() and hsl() syntax', () => {
		expect(rgba('rgb(0 0 0 / 15%)')).toBe('rgba(0, 0, 0, 0.15)');
		expect(rgba('rgb(100% 0% 0%)')).toBe('rgba(255, 0, 0, 1.00)');
		expect(rgba('rgb(255 0 0 / none)')).toBe('rgba(255, 0, 0, 0.00)');
		expect(rgba('hsl(0 100% 50% / 50%)')).toBe('rgba(255, 0, 0, 0.50)');
	});

	it('keeps the legacy syntax on the fast path', () => {
		expect(rgba('rgb(255, 8, 128)')).toBe('rgba(255, 8, 128, 1.00)');
		expect(rgba('rgba(255, 8, 128, 0.5)')).toBe('rgba(255, 8, 128, 0.50)');
		expect(rgba('rgb(255 8 128)')).toBe('rgba(255, 8, 128, 1.00)');
		expect(rgba('hsl(330.9, 100%, 51.6%)')).toBe('rgba(255, 8, 128, 1.00)');
	});

	it('rejects what is not a color', () => {
		expect(() => new Color('oklch(nope)')).toThrow('Invalid color');
		expect(() => new Color('colorful(1 2 3)')).toThrow('Invalid color');
		expect(() => new Color('light-dark(red, blue)')).toThrow('Invalid color');
	});

	it('reports the new functions as valid', () => {
		expect(Color.isValid('oklch(0.6 0.2 250)')).toBe(true);
		expect(Color.isValid('color-mix(in srgb, red, blue)')).toBe(true);
		expect(Color.isValid('nope(1)')).toBe(false);
	});
});
