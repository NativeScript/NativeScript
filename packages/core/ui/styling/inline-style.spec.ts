import { describe, it, expect } from 'vitest';

import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';

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
