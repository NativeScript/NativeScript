import { describe, it, expect, vi } from 'vitest';
import { calc } from '@csstools/css-calc';

import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { unsetValue } from '../core/properties';
import '../layouts/flexbox-layout';

vi.mock('@csstools/css-calc', async (importOriginal) => {
	const original = await importOriginal<typeof import('@csstools/css-calc')>();

	return { ...original, calc: vi.fn(original.calc) };
});

const CSS = `
.a { --t: 5; --c: red; --o: 0.5; --bg: green; --m: 4; --u: 1; }
.b { --t: 9; --c: blue; --o: 0.25; --bg: yellow; --m: 6; --u: 1; }
.c { --t: 5; --c: red; --o: 0.5; --bg: green; --m: 4; --u: 2; }
`;

interface Tree {
	root: any;
	view: any;
	/** Re-runs the cascade on both views, as a class change on a loaded tree would. */
	cascade(): void;
}

function tree(css: string, rootClass = 'a'): Tree {
	const scope = new StyleScope();
	scope.css = css;

	const root: any = new StackLayout();
	root._styleScope = scope;
	root.className = rootClass;

	const view: any = new Label();
	root.addChild(view);
	view._styleScope = scope;

	return {
		root,
		view,
		cascade() {
			root._cssState.onLoaded();
			view._cssState.onLoaded();
		},
	};
}

function changeValues(target: any, eventName: string): unknown[] {
	const values: unknown[] = [];
	target.on(eventName, (args: any) => values.push(args.value));

	return values;
}

const defaults: any = new Label();

describe('local values with css expressions', () => {
	it('re-substitutes an inline longhand when a variable changes', () => {
		const { root, view, cascade } = tree(`${CSS} .s { margin-left: calc(2 + var(--t)); }`);
		view.className = 's';
		view.style = 'margin-top: calc(2 + var(--t))';
		cascade();
		expect(view.style.marginTop).toBe(7);

		root.className = 'b';
		cascade();

		expect(view.style.marginLeft).toBe(11);
		expect(view.style.marginTop).toBe(11);
	});

	it('re-substitutes an inline shorthand when a variable changes', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = 'margin: var(--m)';
		cascade();
		expect(view.style.marginTop).toBe(4);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(6);
		expect(view.style.marginRight).toBe(6);
		expect(view.style.marginBottom).toBe(6);
		expect(view.style.marginLeft).toBe(6);
	});

	it('substitutes a style write from code and keeps it current', () => {
		const { root, view, cascade } = tree(CSS);
		cascade();

		view.style.marginTop = 'calc(2 + var(--t))';
		expect(view.style.marginTop).toBe(7);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(11);
	});

	it('substitutes a view property write from code and keeps it current', () => {
		const { root, view, cascade } = tree(CSS);
		cascade();

		view.marginTop = 'var(--t)';
		expect(view.marginTop).toBe(5);

		root.className = 'b';
		cascade();

		expect(view.marginTop).toBe(9);
	});

	it('substitutes a shorthand write from code and keeps it current', () => {
		const { root, view, cascade } = tree(CSS);
		cascade();

		view.style.margin = 'var(--m) calc(1 + var(--m))';
		expect(view.style.marginTop).toBe(4);
		expect(view.style.marginRight).toBe(5);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(6);
		expect(view.style.marginRight).toBe(7);
		expect(view.style.marginBottom).toBe(6);
		expect(view.style.marginLeft).toBe(7);
	});

	it('lets a later code write win over an inline expression', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = 'margin-top: var(--t); margin: var(--m)';
		cascade();

		view.style.marginTop = 3;
		view.style.marginLeft = 2;
		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(3);
		expect(view.style.marginLeft).toBe(2);
		expect(view.style.marginRight).toBe(6);
	});

	it('lets a later code write win over a code expression', () => {
		const { root, view, cascade } = tree(CSS);
		cascade();
		view.style.marginTop = 'var(--t)';
		view.style.padding = 'var(--m)';

		view.marginTop = 3;
		view.style.padding = 2;
		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(3);
		expect(view.style.paddingLeft).toBe(2);
	});

	it('releases the expression on reset', () => {
		const { root, view, cascade } = tree(`${CSS} label { margin-top: 8; }`);
		cascade();
		view.style.marginTop = 'var(--t)';
		expect(view.style.marginTop).toBe(5);

		view.style.marginTop = unsetValue;
		expect(view.style.marginTop).toBe(8);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(8);
	});

	it('releases the expression when an inline string drops it', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = 'margin-top: var(--t)';
		cascade();

		view.style = '';
		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toEqual(defaults.style.marginTop);
	});

	it('does not write again when the substituted value is unchanged', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = 'margin-top: calc(2 + var(--t)); margin: var(--m) var(--t)';
		view.style.color = 'var(--c)';
		cascade();

		const marginTopChanges = changeValues(view.style, 'marginTopChange');
		const marginLeftChanges = changeValues(view.style, 'marginLeftChange');
		const colorChanges = changeValues(view.style, 'colorChange');
		const localValueVersion = view.style._localValueVersion;

		// Only --u differs between .a and .c.
		root.className = 'c';
		cascade();

		expect(marginTopChanges).toEqual([]);
		expect(marginLeftChanges).toEqual([]);
		expect(colorChanges).toEqual([]);
		expect(view.style._localValueVersion).toBe(localValueVersion);
	});

	it('keeps an inherited property and its inheriting children current', () => {
		const { root, view, cascade } = tree(CSS);
		cascade();

		root.style.color = 'var(--c)';
		expect(view.style.color.toString()).toBe('#FF0000');

		root.className = 'b';
		cascade();

		expect(root.style.color.toString()).toBe('#0000FF');
		expect(view.style.color.toString()).toBe('#0000FF');
	});

	it('keeps animatable properties current', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = 'opacity: var(--o)';
		view.style.backgroundColor = 'var(--bg)';
		cascade();
		expect(view.style.opacity).toBe(0.5);
		expect(view.style.backgroundColor.toString()).toBe('#008000');

		root.className = 'b';
		cascade();

		expect(view.style.opacity).toBe(0.25);
		expect(view.style.backgroundColor.toString()).toBe('#FFFF00');
	});

	it('treats an unresolved variable as unset until it resolves', () => {
		const { root, view, cascade } = tree(`.a { } .b { --x: 3; } label { margin-top: 8; }`);
		cascade();

		expect(() => (view.style.marginTop = 'var(--x)')).not.toThrow();
		expect(view.style.marginTop).toBe(8);

		root.className = 'b';
		cascade();
		expect(view.style.marginTop).toBe(3);

		root.className = 'a';
		cascade();
		expect(view.style.marginTop).toBe(8);
	});

	it('treats an unresolved variable in an inline shorthand as unset until it resolves', () => {
		const { root, view, cascade } = tree(`.a { } .b { --x: 3; } label { margin: 8; }`);
		view.style = 'margin: var(--x)';
		cascade();
		expect(view.style.marginLeft).toBe(8);

		root.className = 'b';
		cascade();
		expect(view.style.marginLeft).toBe(3);

		root.className = 'a';
		cascade();
		expect(view.style.marginLeft).toBe(8);
	});

	it('releases the expressions of longhands a plain shorthand write omits', () => {
		const { root, view, cascade } = tree(`.a { --f: column wrap; } .b { --f: row wrap-reverse; }`);
		cascade();
		view.style.flexFlow = 'var(--f)';
		expect(view.style.flexWrap).toBe('wrap');

		view.style.flexFlow = 'row';
		root.className = 'b';
		cascade();

		expect(view.style.flexDirection).toBe('row');
		expect(view.style.flexWrap).toBe('wrap');
	});

	it('falls back when a variable changes to an invalid value, then recovers', () => {
		const { root, view, cascade } = tree(`.a { --t: 5; } .b { --t: oops; } label { margin-top: 8; }`);
		cascade();
		view.style.marginTop = 'var(--t)';
		expect(view.style.marginTop).toBe(5);

		root.className = 'b';
		expect(cascade).not.toThrow();
		expect(view.style.marginTop).toBe(8);

		root.className = 'a';
		cascade();
		expect(view.style.marginTop).toBe(5);
	});

	it('follows a chain of inline variables', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = '--a: var(--t); margin-top: calc(1 + var(--a))';
		cascade();
		expect(view.style.marginTop).toBe(6);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(10);
	});

	it('switches from a fallback once the variable is defined', () => {
		const { root, view, cascade } = tree(`.a { } .b { --x: 3; }`);
		view.style = 'margin-top: var(--x, 4)';
		cascade();
		expect(view.style.marginTop).toBe(4);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(3);
	});

	it('does not substitute again when no variable it read changed', () => {
		const { root, view, cascade } = tree(CSS);
		view.style = 'margin: calc(1 + var(--m))';
		view.style.marginTop = 'calc(2 + var(--t))';
		cascade();
		const calcCalls = vi.mocked(calc).mock.calls.length;

		// Only --u differs between .a and .c.
		root.className = 'c';
		cascade();
		expect(vi.mocked(calc).mock.calls.length).toBe(calcCalls);

		root.className = 'b';
		cascade();
		expect(vi.mocked(calc).mock.calls.length).toBeGreaterThan(calcCalls);
		expect(view.style.marginTop).toBe(11);
		expect(view.style.marginLeft).toBe(7);
	});
});
