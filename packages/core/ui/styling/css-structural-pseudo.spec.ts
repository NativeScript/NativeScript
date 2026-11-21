import { describe, it, expect } from 'vitest';

import { createSelector } from './css-selector';
import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { Button } from '../button';

function parentOf(types: string[]) {
	const children = types.map((cssType) => ({ cssType }) as any);
	const parent = {
		getChildIndex: (child: any) => children.indexOf(child),
		getChildAt: (index: number) => children[index],
		getChildrenCount: () => children.length,
	};
	for (const child of children) {
		child.parent = parent;
	}

	return children;
}

function matching(selector: string, types: string[]): number[] {
	const sel = createSelector(selector);

	return parentOf(types)
		.map((child, index) => (sel.match(child) ? index : -1))
		.filter((index) => index !== -1);
}

describe('structural pseudo-classes', () => {
	const five = ['a', 'a', 'a', 'a', 'a'];

	it('match by position among all siblings', () => {
		expect(matching(':first-child', five)).toEqual([0]);
		expect(matching(':last-child', five)).toEqual([4]);
		expect(matching(':only-child', five)).toEqual([]);
		expect(matching(':only-child', ['a'])).toEqual([0]);
	});

	it('match by position among siblings of the same type', () => {
		const types = ['a', 'b', 'a', 'b', 'c'];
		expect(matching(':first-of-type', types)).toEqual([0, 1, 4]);
		expect(matching(':last-of-type', types)).toEqual([2, 3, 4]);
		expect(matching(':only-of-type', types)).toEqual([4]);
		expect(matching(':nth-of-type(2)', types)).toEqual([2, 3]);
		expect(matching(':nth-last-of-type(2)', types)).toEqual([0, 1]);
	});

	it('evaluate an+b formulas', () => {
		expect(matching(':nth-child(odd)', five)).toEqual([0, 2, 4]);
		expect(matching(':nth-child(even)', five)).toEqual([1, 3]);
		expect(matching(':nth-child(3)', five)).toEqual([2]);
		expect(matching(':nth-child(2n+1)', five)).toEqual([0, 2, 4]);
		expect(matching(':nth-child(n+3)', five)).toEqual([2, 3, 4]);
		expect(matching(':nth-child(-n+2)', five)).toEqual([0, 1]);
		expect(matching(':nth-child(3n - 1)', five)).toEqual([1, 4]);
		expect(matching(':nth-last-child(1)', five)).toEqual([4]);
		expect(matching(':nth-last-child(-n+2)', five)).toEqual([3, 4]);
	});

	it('combine with other selectors', () => {
		expect(matching('b:first-child', ['a', 'b'])).toEqual([]);
		expect(matching(':not(:last-child)', ['a', 'b', 'c'])).toEqual([0, 1]);
		expect(matching(':is(:first-child, :last-child)', ['a', 'b', 'c'])).toEqual([0, 2]);
	});

	it('do not match a node without a parent', () => {
		expect(createSelector(':first-child').match(<any>{ cssType: 'a' })).toBe(false);
	});

	it('drop a selector with an unsupported formula', () => {
		expect(matching(':nth-child(odd of .x)', five)).toEqual([]);
		expect(matching(':nth-child(foo)', five)).toEqual([]);
	});

	it('record which siblings their match depends on', () => {
		const flags = (selector: string) => {
			const sel = createSelector(selector);

			return [sel.hasAdjacentCombinator, sel.hasSiblingCombinator, sel.dependsOnNextSibling, sel.dependsOnFollowingSiblings];
		};

		expect(flags('label:first-child')).toEqual([true, false, false, false]);
		expect(flags('label:last-child')).toEqual([false, false, true, false]);
		expect(flags(':only-child')).toEqual([true, false, true, false]);
		expect(flags(':nth-child(2)')).toEqual([false, true, false, false]);
		expect(flags(':first-of-type')).toEqual([false, true, false, false]);
		expect(flags(':nth-last-child(2)')).toEqual([false, false, false, true]);
		expect(flags('.a :last-child label')).toEqual([false, false, true, false]);
	});
});

describe('structural pseudo-classes in a layout', () => {
	function layout(css: string) {
		const scope = new StyleScope();
		scope.css = css;

		const root: any = new StackLayout();
		root._styleScope = scope;
		root._isLoaded = true;

		const add = (view: any = new Label()) => {
			root.addChild(view);
			view._styleScope = scope;
			view._cssState.onLoaded();
			return view;
		};

		return { root, add };
	}

	const color = (view: any) => view.style.color?.toString();

	it('re-match the previous last child when a child is appended', () => {
		const { add } = layout('label { color: red; } label:last-child { color: blue; }');
		const first = add();
		expect(color(first)).toBe('#0000FF');

		const second = add();
		expect(color(first)).toBe('#FF0000');
		expect(color(second)).toBe('#0000FF');
	});

	it('re-match the siblings of an inserted or removed child', () => {
		const { root, add } = layout('label { color: red; } label:first-child { color: green; } label:last-child { color: blue; }');
		const a = add();
		const b = add();
		expect([color(a), color(b)]).toEqual(['#008000', '#0000FF']);

		const c: any = new Label();
		root.insertChild(c, 0);
		c._cssState.onLoaded();
		expect([color(c), color(a), color(b)]).toEqual(['#008000', '#FF0000', '#0000FF']);

		root.removeChild(c);
		expect([color(a), color(b)]).toEqual(['#008000', '#0000FF']);

		root.removeChild(b);
		expect(color(a)).toBe('#0000FF');
	});

	it('re-match every sibling for nth-child', () => {
		const { root, add } = layout('label { color: red; } label:nth-child(even) { color: blue; } label:nth-last-child(2) { background-color: green; }');
		const views = [add(), add(), add()];
		expect(views.map(color)).toEqual(['#FF0000', '#0000FF', '#FF0000']);
		expect(views.map((v) => v.style.backgroundColor?.toString())).toEqual([undefined, '#008000', undefined]);

		const first: any = new Label();
		root.insertChild(first, 0);
		first._cssState.onLoaded();
		expect([first, ...views].map(color)).toEqual(['#FF0000', '#0000FF', '#FF0000', '#0000FF']);

		add(new Button());
		expect([first, ...views].map((v) => v.style.backgroundColor?.toString())).toEqual([undefined, undefined, undefined, '#008000']);
	});
});
