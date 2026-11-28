import { describe, it, expect } from 'vitest';

import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { _expandCssShorthand, _getStyleProperties } from '../core/properties';
import '../layouts/flexbox-layout';
import '../action-bar';

function isEqual(a: unknown, b: unknown): boolean {
	try {
		expect(a).toEqual(b);

		return true;
	} catch {
		return false;
	}
}

function loaded(css: string): { view: any; root: any } {
	const scope = new StyleScope();
	scope.css = css;

	const root: any = new StackLayout();
	root._styleScope = scope;

	const view: any = new Label();
	root.addChild(view);
	view._styleScope = scope;

	root._cssState.onLoaded();
	view._cssState.onLoaded();

	return { view, root };
}

function changeValues(target: any, eventName: string): unknown[] {
	const values: unknown[] = [];
	target.on(eventName, (args: any) => values.push(args.value));

	return values;
}

const defaults: any = new Label();

describe('inline style assignment', () => {
	it('unsets a longhand the new string drops', () => {
		const { view } = loaded('');

		view.style = 'color: red; margin-top: 4';
		view.style = 'color: blue';

		expect(view.style.color.toString()).toBe('#0000FF');
		expect(view.style.marginTop).toEqual(defaults.style.marginTop);
	});

	it('unsets every longhand of a shorthand the new string drops', () => {
		const { view } = loaded('');

		view.style = 'margin: 4';
		view.style = 'color: red';

		expect(view.style.marginTop).toEqual(defaults.style.marginTop);
		expect(view.style.marginRight).toEqual(defaults.style.marginRight);
		expect(view.style.marginBottom).toEqual(defaults.style.marginBottom);
		expect(view.style.marginLeft).toEqual(defaults.style.marginLeft);
	});

	it('keeps the longhands a narrower string still sets', () => {
		const { view } = loaded('');
		view.style = 'margin: 4';

		const marginTopChanges = changeValues(view.style, 'marginTopChange');
		view.style = 'margin-top: 4';

		expect(view.style.marginTop).toBe(4);
		expect(view.style.marginLeft).toEqual(defaults.style.marginLeft);
		expect(marginTopChanges).toEqual([]);
	});

	it('unsets the longhands of a dropped shorthand holding a variable', () => {
		const { view } = loaded('label { --m: 6; }');

		view.style = 'margin: var(--m)';
		expect(view.style.marginTop).toBe(6);

		view.style = 'color: red';

		expect(view.style.marginTop).toEqual(defaults.style.marginTop);
		expect(view.style.marginLeft).toEqual(defaults.style.marginLeft);
	});

	it('falls back to the stylesheet value of a dropped property', () => {
		const { view } = loaded('label { margin-top: 8; color: green; }');

		view.style = 'margin-top: 20; color: red';
		view.style = 'font-size: 12';

		expect(view.style.marginTop).toBe(8);
		expect(view.style.color.toString()).toBe('#008000');
	});

	it('falls back to the stylesheet value shadowed before css was applied', () => {
		const scope = new StyleScope();
		scope.css = 'label { margin-top: 8; }';
		const root: any = new StackLayout();
		root._styleScope = scope;
		const view: any = new Label();
		root.addChild(view);
		view._styleScope = scope;

		view.style = 'margin-top: 20';
		view._cssState.onLoaded();
		expect(view.style.marginTop).toBe(20);

		view.style = '';

		expect(view.style.marginTop).toBe(8);
	});

	it('falls back to the inherited value of a dropped inherited property', () => {
		const { view } = loaded('stacklayout { color: red; }');

		view.style = 'color: blue';
		view.style = '';

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('clears every inline property when assigned an empty string', () => {
		const { view } = loaded('');

		view.style = 'color: red; margin: 4; font-size: 20';
		view.style = '';

		expect(view.style.color).toBeUndefined();
		expect(view.style.marginTop).toEqual(defaults.style.marginTop);
		expect(view.style.fontSize).toEqual(defaults.style.fontSize);
	});

	it('does not unset and re-apply a property the new string keeps', () => {
		const { view } = loaded('');
		view.style = 'color: red; margin: 4';

		const colorChanges = changeValues(view.style, 'colorChange');
		const marginTopChanges = changeValues(view.style, 'marginTopChange');
		view.style = 'color: blue; margin-top: 4';

		expect(colorChanges.map(String)).toEqual(['#0000FF']);
		expect(marginTopChanges).toEqual([]);
	});

	it('unsets a dropped property applied through the view', () => {
		const { view } = loaded('');

		view.style = 'text: hello; color: red';
		expect(view.text).toBe('hello');

		view.style = 'color: red';

		expect(view.text).toEqual(defaults.text);
	});

	it('removes the css variables the new string drops', () => {
		const { view } = loaded('');

		view.style = '--c: red; color: var(--c)';
		expect(view.style.color.toString()).toBe('#FF0000');

		view.style = 'margin-top: 4';

		expect(view.style.getCssVariable('--c')).toBeNull();
		expect(view.style.color).toBeUndefined();
	});

	it('unsets a kept property whose new value is invalid', () => {
		const { view } = loaded('');

		view.style = 'color: red';
		view.style = 'color: not-a-color';

		expect(view.style.color).toBeUndefined();
	});

	it('keeps an earlier valid declaration when a later one is invalid', () => {
		const { view } = loaded('');

		view.style = 'color: blue';
		view.style = 'color: red; color: not-a-color';

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('does not track a property whose only declaration is invalid', () => {
		const { view } = loaded('');
		view.style.color = 'green';

		view.style = 'color: not-a-color';
		view.style = '';

		expect(view.style.color.toString()).toBe('#008000');
	});

	it('falls back to the stylesheet value of a dropped animatable property', () => {
		const { view } = loaded('label { background-color: green; opacity: 0.5; }');

		view.style = 'background-color: red; opacity: 1';
		expect(view.style.backgroundColor.toString()).toBe('#FF0000');

		view.style = '';

		expect(view.style.backgroundColor.toString()).toBe('#008000');
		expect(view.style.opacity).toBe(0.5);
	});

	it('resets a dropped animatable property without a stylesheet value', () => {
		const { view } = loaded('');

		view.style = 'background-color: red; opacity: 0.5';
		view.style = '';

		expect(view.style.backgroundColor).toEqual(defaults.style.backgroundColor);
		expect(view.style.opacity).toEqual(defaults.style.opacity);
	});

	it('leaves values set from code alone when inline strings never set them', () => {
		const { view } = loaded('');
		view.style.marginTop = 10;

		view.style = 'color: red';
		view.style = '';

		expect(view.style.marginTop).toBe(10);
	});
});

const shorthandCases: [string, string, string][] = [
	['margin', '1 2 3 4', '5 6 7 8'],
	['padding', '1 2 3 4', '5 6 7 8'],
	['gap', '5 6', '7 8'],
	['transform', 'translate(5, 6) scale(2, 3) rotate(45)', 'translate(7, 8) scale(4, 5) rotate(90)'],
	['background', 'red url("~/a.png") no-repeat center', 'blue url("~/b.png") repeat-x left'],
	['border-color', 'red green blue yellow', 'yellow blue green red'],
	['border-width', '1 2 3 4', '5 6 7 8'],
	['border-radius', '1 2 3 4', '5 6 7 8'],
	['font', 'italic bold 12 Arial', 'normal 300 14 Courier'],
	['flex-flow', 'column wrap', 'row-reverse wrap-reverse'],
	['flex', '2 3', '4 5'],
	['android-content-inset', '1 2', '3 4'],
];

function longhandsOf(shorthand: string, value: string): string[] {
	const expanded = _expandCssShorthand(shorthand, value);
	expect(expanded, `${shorthand}: ${value} expands`).toBeTruthy();

	return expanded.map(([longhand]) => longhand);
}

function propertyName(cssName: string): string {
	return _getStyleProperties().find((p) => p.cssLocalName === cssName)?.name ?? cssName;
}

describe('inline style assignment with shorthands', () => {
	describe.each(shorthandCases)('%s', (shorthand, value, otherValue) => {
		it('applies, then unsets every longhand when dropped', () => {
			const { view } = loaded('');
			const longhands = longhandsOf(shorthand, value);

			view.style = `${shorthand}: ${value}`;
			expect(longhands.some((l) => !isEqual(view.style[l], defaults.style[l]))).toBe(true);

			view.style = 'color: red';

			for (const l of longhands) {
				expect(view.style[l], l).toEqual(defaults.style[l]);
			}
		});

		it('falls back to the stylesheet longhands when dropped', () => {
			const css = `label { ${shorthand}: ${otherValue}; }`;
			const { view } = loaded(css);
			const { view: reference } = loaded(css);
			const longhands = longhandsOf(shorthand, value);

			view.style = `${shorthand}: ${value}`;
			view.style = '';

			for (const l of longhands) {
				expect(view.style[l], l).toEqual(reference.style[l]);
			}
		});

		it('moves each longhand at most once when the shorthand value changes', () => {
			const { view } = loaded('');
			view.style = `${shorthand}: ${value}`;

			const changes = longhandsOf(shorthand, otherValue).map((l) => changeValues(view.style, `${propertyName(l)}Change`));
			view.style = `${shorthand}: ${otherValue}`;

			for (const values of changes) {
				expect(values.length).toBeLessThanOrEqual(1);
			}
		});
	});

	it('lets a later longhand override the shorthand within one string', () => {
		const { view } = loaded('');

		view.style = 'margin: 4; margin-top: 8';
		expect(view.style.marginTop).toBe(8);
		expect(view.style.marginLeft).toBe(4);

		view.style = 'margin-top: 8; margin: 4';
		expect(view.style.marginTop).toBe(4);
	});

	it('keeps only the overriding longhand when narrowed to it', () => {
		const { view } = loaded('');
		view.style = 'margin: 4; margin-top: 8';

		const marginTopChanges = changeValues(view.style, 'marginTopChange');
		view.style = 'margin-top: 8';

		expect(view.style.marginTop).toBe(8);
		expect(view.style.marginLeft).toEqual(defaults.style.marginLeft);
		expect(marginTopChanges).toEqual([]);
	});

	it('keeps a longhand of one shorthand when narrowed to it from the shorthand', () => {
		const { view } = loaded('');
		view.style = 'border-width: 2';

		const topChanges = changeValues(view.style, 'borderTopWidthChange');
		view.style = 'border-top-width: 2';

		expect(view.style.borderTopWidth).toBe(2);
		expect(view.style.borderLeftWidth).toEqual(defaults.style.borderLeftWidth);
		expect(topChanges).toEqual([]);
	});

	it('resets a longhand the shorthand stops expanding to', () => {
		const { view } = loaded('');

		view.style = 'flex-flow: column wrap';
		expect(view.style.flexWrap).toBe('wrap');

		view.style = 'flex-flow: column';

		expect(view.style.flexDirection).toBe('column');
		expect(view.style.flexWrap).toEqual(defaults.style.flexWrap);
	});

	it('unsets the previous longhands when the shorthand becomes unparsable', () => {
		const { view } = loaded('');
		view.style = 'margin: 4';

		view.style = 'margin: oops';

		expect(view.style.marginTop).toEqual(defaults.style.marginTop);
		expect(view.style.marginLeft).toEqual(defaults.style.marginLeft);
	});

	it('applies longhands after a css-wide keyword shorthand', () => {
		const { view } = loaded('label { margin: 6; }');

		view.style = 'margin: 4';
		view.style = 'margin: unset';
		expect(view.style.marginTop).toBe(6);

		view.style = 'margin-top: 3';

		expect(view.style.marginTop).toBe(3);
		expect(view.style.marginLeft).toBe(6);
	});
});
