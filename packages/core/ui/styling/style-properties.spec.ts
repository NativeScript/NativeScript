import { describe, it, expect } from 'vitest';

import { Label } from '../label';
import { Color } from '../../color';

describe('border-color shorthand', () => {
	it('applies a function color with nested arguments to all sides', () => {
		const label = new Label();
		label.style.borderColor = 'color-mix(in srgb, red 50%, blue)' as any;

		const expected = new Color('color-mix(in srgb, red 50%, blue)');
		expect(label.style.borderTopColor).toEqual(expected);
		expect(label.style.borderRightColor).toEqual(expected);
		expect(label.style.borderBottomColor).toEqual(expected);
		expect(label.style.borderLeftColor).toEqual(expected);
	});

	it('splits per-side colors around function values', () => {
		const label = new Label();
		label.style.borderColor = 'red rgb(1, 2, 3) blue color-mix(in srgb, red 35%, blue)' as any;

		expect(label.style.borderTopColor).toEqual(new Color('red'));
		expect(label.style.borderRightColor).toEqual(new Color('rgb(1, 2, 3)'));
		expect(label.style.borderBottomColor).toEqual(new Color('blue'));
		expect(label.style.borderLeftColor).toEqual(new Color('color-mix(in srgb, red 35%, blue)'));
	});

	it('still accepts comma-separated colors', () => {
		const label = new Label();
		label.style.borderColor = 'red,blue' as any;

		expect(label.style.borderTopColor).toEqual(new Color('red'));
		expect(label.style.borderBottomColor).toEqual(new Color('red'));
		expect(label.style.borderRightColor).toEqual(new Color('blue'));
		expect(label.style.borderLeftColor).toEqual(new Color('blue'));
	});
});
