import { describe, it, expect, beforeAll } from 'vitest';

import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';

/**
 * Counts how many times css applies a value to a style property, by wrapping the
 * `css:<name>` accessor the css state writes through.
 */
function countCssWrites(view: any, cssProperty: string): { count: number; values: unknown[] } {
	const style = view.style;
	const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(style), `css:${cssProperty}`);
	const result = { count: 0, values: [] as unknown[] };

	Object.defineProperty(style, `css:${cssProperty}`, {
		configurable: true,
		get: descriptor.get,
		set(value: unknown) {
			result.count++;
			result.values.push(value);
			descriptor.set.call(this, value);
		},
	});

	return result;
}

function styled(css: string, className?: string): { view: any; scope: StyleScope } {
	const scope = new StyleScope();
	scope.css = css;

	const root = new StackLayout();
	root._styleScope = scope;

	const view = new Label();
	root.addChild(view);
	view._styleScope = scope;
	if (className) {
		view.className = className;
	}

	return { view, scope };
}

describe('CssState.setPropertyValues', () => {
	it('applies matched declarations', () => {
		const { view } = styled('label { color: red; }');
		view._cssState.onLoaded();

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('does not re-apply values that did not change', () => {
		const { view } = styled('label { color: red; }');
		view._cssState.onLoaded();

		const writes = countCssWrites(view, 'color');
		for (let i = 0; i < 5; i++) {
			view._cssState.updateDynamicState();
		}

		expect(writes.count).toBe(0);
	});

	it('applies values that did change', () => {
		const { view } = styled('label { color: red; } label:highlighted { color: blue; }');
		view._cssState.onLoaded();

		const writes = countCssWrites(view, 'color');
		view.addPseudoClass('highlighted');

		expect(writes.count).toBe(1);
		expect(view.style.color.toString()).toBe('#0000FF');

		view.deletePseudoClass('highlighted');
		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('unsets declarations that stopped matching', () => {
		const { view } = styled('label:highlighted { background-color: blue; }');
		view._cssState.onLoaded();

		view.addPseudoClass('highlighted');
		expect(view.style.backgroundColor.toString()).toBe('#0000FF');

		view.deletePseudoClass('highlighted');
		expect(view.style.backgroundColor).toBeUndefined();
	});

	it('keeps scoped css variables registered across updates', () => {
		const { view } = styled('label { --brand: red; color: var(--brand); }');
		view._cssState.onLoaded();

		expect(view.style.color.toString()).toBe('#FF0000');

		// A second pass resets the scoped variables before re-applying, so the
		// variable has to be registered again even though its value is unchanged.
		view._cssState.updateDynamicState();
		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('re-evaluates css expressions when the variable they depend on changes', () => {
		const { view } = styled('label { --brand: red; color: var(--brand); } label:highlighted { --brand: blue; }');
		view._cssState.onLoaded();
		expect(view.style.color.toString()).toBe('#FF0000');

		view.addPseudoClass('highlighted');
		expect(view.style.color.toString()).toBe('#0000FF');

		view.deletePseudoClass('highlighted');
		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('does not re-apply an unchanged css expression', () => {
		const { view } = styled('label { --brand: red; color: var(--brand); }');
		view._cssState.onLoaded();

		const writes = countCssWrites(view, 'color');
		view._cssState.updateDynamicState();

		expect(writes.count).toBe(0);
	});

	it('keeps a shorthand applied when an overlapping longhand stops matching', () => {
		// Unsetting `margin-top` resets what `margin` had set, so the skip-unchanged
		// path cannot be taken for values a removal can clear.
		const { view } = styled('label { margin: 4; } label:highlighted { margin-top: 8; }');
		view._cssState.onLoaded();
		expect(view.style.marginTop).toBe(4);

		view.addPseudoClass('highlighted');
		expect(view.style.marginTop).toBe(8);

		view.deletePseudoClass('highlighted');
		expect(view.style.marginTop).toBe(4);
	});

	it('ignores the unsupported !important flag', () => {
		const { view } = styled('label { color: red !important; }');
		view._cssState.onLoaded();

		expect(view.style.color.toString()).toBe('#FF0000');
	});
});
