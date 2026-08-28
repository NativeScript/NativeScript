import { describe, it, expect } from 'vitest';

import { StyleScope, applyInlineStyle } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { unsetValue } from '../core/properties';

function scoped(css: string) {
	const scope = new StyleScope();
	scope.css = css;

	const root: any = new StackLayout();
	root._styleScope = scope;

	return { scope, root };
}

function loaded(css: string) {
	const { scope, root } = scoped(css);

	const view: any = new Label();
	root.addChild(view);
	view._styleScope = scope;
	view._cssState.onLoaded();

	return view;
}

function restyle(view: any): void {
	view._cssState.onChange();
	view._cssState.onLoaded();
}

/** Counts css writes per `<view>.<property>`, reporting only the ones that happened. */
function countWrites(targets: Array<[view: any, cssProperty: string]>): () => Record<string, number> {
	const counts: Record<string, number> = {};

	for (const [view, cssProperty] of targets) {
		const style = view.style;
		const key = `${view.cssType}.${cssProperty}`;
		const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(style), `css:${cssProperty}`);

		Object.defineProperty(style, `css:${cssProperty}`, {
			configurable: true,
			get: descriptor.get,
			set(value: unknown) {
				counts[key] = (counts[key] ?? 0) + 1;
				descriptor.set.call(this, value);
			},
		});
	}

	return () => counts;
}

describe('css survives a local value that shadows it', () => {
	it('restores a longhand after a local value is released', () => {
		const view = loaded('label { color: red; }');
		expect(view.style.color.toString()).toBe('#FF0000');

		view.style.color = 'blue';
		view.style.color = unsetValue;
		view._cssState.updateDynamicState();

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it.each([
		['a shorthand', 'label { margin: 4; }'],
		['a longhand', 'label { margin-top: 4; }'],
	])('restores margin from %s after a local value is released', (_name, css) => {
		const view = loaded(css);
		expect(view.style.marginTop).toBe(4);

		view.style.marginTop = 20;
		view.style.marginTop = unsetValue;
		view._cssState.updateDynamicState();

		expect(view.style.marginTop).toBe(4);
	});

	it('restores padding after a local value is released', () => {
		const view = loaded('label { padding: 4; }');

		view.style.paddingTop = 20;
		view.style.paddingTop = unsetValue;
		view._cssState.updateDynamicState();

		expect(view.style.paddingTop).toBe(4);
		expect(view.style.paddingInternal).toBe('4 4 4 4');
	});

	it('restores a value a local one shadowed before css ever ran', () => {
		const { scope, root } = scoped('label { margin: 4; }');

		const view: any = new Label();
		view.style.marginTop = 20;
		root.addChild(view);
		view._styleScope = scope;
		view._cssState.onLoaded();
		expect(view.style.marginTop).toBe(20);

		view.style.marginTop = unsetValue;
		view._cssState.updateDynamicState();

		expect(view.style.marginTop).toBe(4);
	});

	it('restores a value an inline style shadowed', () => {
		const view = loaded('label { margin: 4; }');

		applyInlineStyle(view, 'margin-top: 20');
		expect(view.style.marginTop).toBe(20);

		view.style.marginTop = unsetValue;
		view._cssState.updateDynamicState();

		expect(view.style.marginTop).toBe(4);
	});

	it('restores a value on the next full re-match', () => {
		const view = loaded('label { margin: 4; } .a { color: red; }');

		view.style.marginTop = 20;
		view.style.marginTop = unsetValue;

		view.className = 'a';
		restyle(view);

		expect(view.style.marginTop).toBe(4);
	});

	it('still skips every value nothing disturbed', () => {
		// Verifying the write took effect must not cost a re-application: inherited
		// values, expanded longhands and the ones a shorthand left unset included.
		const { scope, root } = scoped('stacklayout { color: red; font-size: 12; } label { margin: 4; background: blue; }');

		const view: any = new Label();
		root.addChild(view);
		view._styleScope = scope;
		root._cssState.onLoaded();
		view._cssState.onLoaded();

		const writes = countWrites([
			[root, 'color'],
			[root, 'font-size'],
			[view, 'color'],
			[view, 'margin-top'],
			[view, 'background-color'],
			[view, 'background-image'],
		]);

		for (let i = 0; i < 3; i++) {
			root._cssState.updateDynamicState();
			view._cssState.updateDynamicState();
		}

		expect(writes()).toEqual({});
	});
});
