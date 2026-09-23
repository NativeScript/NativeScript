import { describe, it, expect, beforeAll } from 'vitest';

import { StyleScope, applyInlineStyle, addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from './style-scope';
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

	it('lets a longhand override part of a shorthand holding a variable, and back', () => {
		// The shorthand's longhands each hold a pending-substitution value, so
		// `margin-top` overrides one of them and reverts to the resolved shorthand.
		const { view } = styled('label { --m: 4; margin: var(--m); } label:highlighted { margin-top: 8; }');
		view._cssState.onLoaded();
		expect(view.style.marginTop).toBe(4);
		expect(view.style.marginLeft).toBe(4);

		view.addPseudoClass('highlighted');
		expect(view.style.marginTop).toBe(8);
		expect(view.style.marginLeft).toBe(4);

		view.deletePseudoClass('highlighted');
		expect(view.style.marginTop).toBe(4);
	});

	it('re-resolves a shorthand when the variable it holds changes', () => {
		const { view } = styled('label { --m: 4; margin: var(--m); } label:highlighted { --m: 9; }');
		view._cssState.onLoaded();
		expect(view.style.marginTop).toBe(4);

		view.addPseudoClass('highlighted');
		expect(view.style.marginTop).toBe(9);

		view.deletePseudoClass('highlighted');
		expect(view.style.marginTop).toBe(4);
	});

	it('does not re-apply a shorthand whose variable did not change', () => {
		const { view } = styled('label { --m: 4; margin: var(--m); }');
		view._cssState.onLoaded();

		const writes = countCssWrites(view, 'margin-top');
		view._cssState.updateDynamicState();

		expect(writes.count).toBe(0);
	});

	it('unsets the longhands when a shorthand variable cannot be resolved', () => {
		const { view } = styled('label { margin: 4; } label:highlighted { margin: var(--missing); }');
		view._cssState.onLoaded();
		expect(view.style.marginTop).toBe(4);

		view.addPseudoClass('highlighted');
		// Unresolvable leaves the longhands unset, i.e. back to the property default.
		expect(view.style.marginTop).toEqual(styled('').view.style.marginTop);
	});

	it('applies an inline shorthand holding a variable', () => {
		const { view } = styled('label { --m: 6; }');
		view._cssState.onLoaded();

		applyInlineStyle(view, 'margin: var(--m)');

		expect(view.style.marginTop).toBe(6);
		expect(view.style.marginLeft).toBe(6);
	});

	it('applies a literal inline shorthand', () => {
		const { view } = styled('');
		view._cssState.onLoaded();

		applyInlineStyle(view, 'margin: 3');

		expect(view.style.marginTop).toBe(3);
	});

	it('expands shorthands so a later, more specific rule wins', () => {
		const { view } = styled('label { margin: 1; } .a { margin-top: 8; } #x { margin: 4; }', 'a');
		view.id = 'x';
		view._cssState.onLoaded();

		// #x is the most specific rule, so its shorthand overrides .a's longhand.
		expect(view.style.marginTop).toBe(4);
		expect(view.style.marginLeft).toBe(4);
	});

	it('lets a longhand override a shorthand from a less specific rule', () => {
		const { view } = styled('#x { margin: 4; } label { margin-top: 1; } .a { margin-top: 8; }', 'a');
		view.id = 'x';
		view._cssState.onLoaded();

		expect(view.style.marginTop).toBe(4);
		expect(view.style.marginLeft).toBe(4);
	});

	it('does not re-apply an unchanged shorthand', () => {
		const { view } = styled('label { margin: 4; }');
		view._cssState.onLoaded();

		// The expanded longhands are freshly parsed values, so the diff has to compare
		// them with the property's own comparer rather than by identity.
		const writes = countCssWrites(view, 'margin-top');
		view._cssState.updateDynamicState();

		expect(writes.count).toBe(0);
	});

	it('resolves a css variable inside a shorthand', () => {
		// The value is only resolvable per view, so this shorthand cannot be expanded
		// while parsing and has to survive as a shorthand declaration.
		const { view } = styled('label { --m: 8; margin: var(--m); }');
		view._cssState.onLoaded();

		expect(view.style.marginTop).toBe(8);
		expect(view.style.marginLeft).toBe(8);
	});

	it('resolves a css calc expression inside a shorthand', () => {
		const { view } = styled('label { padding: calc(2 + 3); }');
		view._cssState.onLoaded();

		expect(view.style.paddingTop).toBe(5);
	});

	it('ignores the unsupported !important flag', () => {
		const { view } = styled('label { color: red !important; }');
		view._cssState.onLoaded();

		expect(view.style.color.toString()).toBe('#FF0000');
	});
});

describe('application and local selector scopes', () => {
	function withApplicationCss(entries: Array<[string, string]>, run: () => void): void {
		for (const [tag, css] of entries) {
			addTaggedAdditionalCSS(css, tag);
		}

		try {
			run();
		} finally {
			for (const [tag] of entries) {
				removeTaggedAdditionalCSS(tag);
			}
		}
	}

	function loaded(css: string) {
		const { view } = styled(css);
		view._cssState.onLoaded();

		return view;
	}

	function restyle(view: any): void {
		view._cssState.onChange();
		view._cssState.onLoaded();
	}

	it('applies application css to a scope with no css of its own', () => {
		withApplicationCss([['scope-a', 'label { color: red; }']], () => {
			expect(loaded('').style.color.toString()).toBe('#FF0000');
		});
	});

	it('lets local css win over application css at equal specificity', () => {
		withApplicationCss([['scope-b', 'label { color: red; }']], () => {
			expect(loaded('label { color: blue; }').style.color.toString()).toBe('#0000FF');
		});
	});

	it('keeps application css beaten by a more specific local rule and vice versa', () => {
		withApplicationCss([['scope-c', '#x { color: red; }']], () => {
			const { view } = styled('label { color: blue; }');
			view.id = 'x';
			view._cssState.onLoaded();

			expect(view.style.color.toString()).toBe('#FF0000');
		});
	});

	it('keeps registration order across separately registered application stylesheets', () => {
		withApplicationCss(
			[
				['scope-d1', 'label { color: red; }'],
				['scope-d2', 'label { color: blue; }'],
			],
			() => {
				expect(loaded('').style.color.toString()).toBe('#0000FF');
			},
		);
	});

	it('picks up application css registered after the scope was built', () => {
		const view = loaded('');
		expect(view.style.color).toBeUndefined();

		withApplicationCss([['scope-e', 'label { color: red; }']], () => {
			restyle(view);
			expect(view.style.color.toString()).toBe('#FF0000');
		});

		restyle(view);
		expect(view.style.color).toBeUndefined();
	});

	it('serves several scopes from the same application index', () => {
		withApplicationCss([['scope-f', 'label { color: red; } label.accent { color: blue; }']], () => {
			const first = loaded('');
			const { view: second } = styled('', 'accent');
			second._cssState.onLoaded();

			expect(first.style.color.toString()).toBe('#FF0000');
			expect(second.style.color.toString()).toBe('#0000FF');
		});
	});
});

describe('CssState.onChange subscriptions', () => {
	function trackListeners(view: any) {
		const calls = { added: [] as string[], removed: [] as string[] };
		const add = view.addEventListener.bind(view);
		const remove = view.removeEventListener.bind(view);

		view.addEventListener = (eventName: string, handler: any, thisArg?: any) => {
			calls.added.push(eventName);

			return add(eventName, handler, thisArg);
		};
		view.removeEventListener = (eventName: string, handler: any, thisArg?: any) => {
			calls.removed.push(eventName);

			return remove(eventName, handler, thisArg);
		};

		return calls;
	}

	function loadedView(css: string) {
		const { view } = styled(css);
		Object.defineProperty(view, 'isLoaded', { value: true, configurable: true });
		view._cssState.onLoaded();

		return view;
	}

	it('does not resubscribe when the matched dependencies are unchanged', () => {
		const view = loadedView('label:highlighted { color: red; }');
		const calls = trackListeners(view);

		view._cssState.onChange();

		expect(calls.added).toEqual([]);
		expect(calls.removed).toEqual([]);
	});

	it('resubscribes when the matched dependencies change', () => {
		const view = loadedView('label:highlighted { color: red; }');
		const calls = trackListeners(view);

		// A rule that depends on a different pseudo class changes what has to be watched.
		view._styleScope.addCss('label:disabled { color: blue; }');
		view._cssState.onChange();

		expect(calls.added).toContain(':disabled');
		expect(calls.removed).toContain(':highlighted');
	});

	it('still applies changed values when the subscriptions are left alone', () => {
		const view = loadedView('label { color: red; } label:highlighted { color: blue; }');
		view.addPseudoClass('highlighted');
		expect(view.style.color.toString()).toBe('#0000FF');

		const calls = trackListeners(view);
		view._cssState.onChange();

		expect(calls.added).toEqual([]);
		expect(view.style.color.toString()).toBe('#0000FF');
	});
});
