import { describe, it, expect } from 'vitest';

import { View } from '../core/view';
import { Color } from '../../color';

function styledView(ownsBoxStyle: boolean) {
	const view = new View();
	view._appliesOwnBoxStyle = ownsBoxStyle;
	const background = view.style.backgroundInternal;
	view.style.paddingTop = 10;
	view.style.borderTopWidth = 2;
	view.style.borderTopColor = new Color('red');
	view.style.borderTopLeftRadius = 4;
	view.style.backgroundColor = new Color('blue');
	view.style.boxShadow = '0 2px 4px black' as never;
	view.style.clipPath = 'circle(50%)';

	return { view, background };
}

describe('views that apply their own box style', () => {
	it('keep the style values but skip the derived padding, border and background state', () => {
		const { view, background } = styledView(true);

		expect(view.style.paddingTop).toBe(10);
		expect(view.style.borderTopWidth).toBe(2);
		expect(view.style.backgroundColor.hex).toBe('#0000FF');
		expect(view.effectivePaddingTop).toBe(0);
		expect(view.effectiveBorderTopWidth).toBe(0);
		expect(view.style.backgroundInternal).toBe(background);
	});

	it('leaves core views deriving them as before', () => {
		const { view, background } = styledView(false);

		expect(view.effectivePaddingTop).toBeGreaterThan(0);
		expect(view.effectiveBorderTopWidth).toBeGreaterThan(0);
		expect(view.style.backgroundInternal).not.toBe(background);
		expect(view.style.backgroundInternal.color.hex).toBe('#0000FF');
		expect(view.style.backgroundInternal.hasBorderRadius()).toBe(true);
		expect(view.style.backgroundInternal.hasBoxShadows()).toBe(true);
	});
});
