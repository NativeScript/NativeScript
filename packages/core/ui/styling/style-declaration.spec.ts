import { describe, it, expect } from 'vitest';

import { Color } from '../../color';
import { View } from '../core/view';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';
import { colorProperty } from './style-properties';
import { StyleScope } from './style-scope';
import { getComputedStyle, InlineStyleDeclaration } from './style-declaration';
import { CssProperty, ShorthandProperty, _getRegisteredStyleProperties } from '../core/properties';
import { Style } from './style';
import '../layouts/flexbox-layout';
import '../action-bar';

const CSS = `
.a { --t: 5; --m: 4; --c: red; }
.b { --t: 9; --m: 6; --c: blue; }
`;

interface Tree {
	root: any;
	view: any;
	/** Re-runs the cascade on both views, as a class change on a loaded tree would. */
	cascade(): void;
}

function tree(css: string, view: any = new Label()): Tree {
	const scope = new StyleScope();
	scope.css = css;

	const root: any = new StackLayout();
	root._styleScope = scope;
	root.className = 'a';
	root.addChild(view);
	view._styleScope = scope;

	const cascade = () => {
		root._cssState.onLoaded();
		view._cssState.onLoaded();
	};
	cascade();

	return { root, view, cascade };
}

class NativeView extends View {
	public colorWrites: unknown[] = [];

	public createNativeView() {
		return {};
	}
}
NativeView.prototype[colorProperty.setNative] = function (this: NativeView, value: unknown) {
	this.colorWrites.push(value);
};

const defaults: any = new Label();

describe('view.inlineStyle', () => {
	it('is one declaration object per view', () => {
		const { view } = tree('');

		expect(view.inlineStyle).toBeInstanceOf(InlineStyleDeclaration);
		expect(view.inlineStyle).toBe(view.inlineStyle);
	});

	it('reads an empty string for a value the stylesheet set', () => {
		const { view } = tree('label { color: red; margin-top: 4; }');

		expect(view.style.marginTop).toBe(4);
		expect(view.inlineStyle.marginTop).toBe('');
		expect(view.inlineStyle.getPropertyValue('color')).toBe('');
		expect(view.inlineStyle.length).toBe(0);
		expect(view.inlineStyle.cssText).toBe('');
	});

	it('reads local values from code, view properties, attributes and strings, serialized', () => {
		const { view } = tree('label { margin-top: 4; }');

		view.color = 'red';
		view.style.opacity = 0.5;
		view.style.marginTop = '10%';
		view.style = 'padding-left: 3px';

		expect(view.inlineStyle.color).toBe('rgb(255, 0, 0)');
		expect(view.inlineStyle.opacity).toBe('0.5');
		expect(view.inlineStyle.getPropertyValue('margin-top')).toBe('10%');
		expect(view.inlineStyle.paddingLeft).toBe('3px');
		expect(view.inlineStyle.length).toBe(4);
		expect([...view.inlineStyle]).toEqual(expect.arrayContaining(['color', 'opacity', 'margin-top', 'padding-left']));
	});

	it('reads the specified var() and calc() expression, not its substitution', () => {
		const { root, view, cascade } = tree(CSS);

		view.style.marginTop = 'calc(2 + var(--t))';
		expect(view.style.marginTop).toBe(7);
		expect(view.inlineStyle.marginTop).toBe('calc(2 + var(--t))');

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(11);
		expect(view.inlineStyle.marginTop).toBe('calc(2 + var(--t))');
	});

	it('reads the expression of a var() value whose variable is undefined', () => {
		const { view } = tree('label { margin-top: 4; }');

		view.style.marginTop = 'var(--missing)';

		expect(view.style.marginTop).toBe(4);
		expect(view.inlineStyle.marginTop).toBe('var(--missing)');
		expect(view.inlineStyle.length).toBe(1);
	});

	it('reads a var() shorthand on the shorthand only', () => {
		const { view } = tree(CSS);

		view.style = 'margin: var(--m)';

		expect(view.style.marginTop).toBe(4);
		expect(view.inlineStyle.margin).toBe('var(--m)');
		expect(view.inlineStyle.marginTop).toBe('');
		expect(view.inlineStyle.marginLeft).toBe('');
		expect(view.inlineStyle.cssText).toBe('margin: var(--m);');
	});

	it('reads an empty shorthand once a longhand of its var() value is overwritten', () => {
		const { view } = tree(CSS);

		view.style.margin = 'var(--m)';
		view.style.marginTop = 1;

		expect(view.inlineStyle.margin).toBe('');
		expect(view.inlineStyle.marginTop).toBe('1');
	});

	it('composes a shorthand whose longhands are all local', () => {
		const { view } = tree('');

		view.style.margin = '4 6';
		expect(view.inlineStyle.margin).toBe('4 6');

		view.style.marginBottom = 5;
		expect(view.inlineStyle.margin).toBe('4 6 5');

		view.style.margin = 3;
		expect(view.inlineStyle.margin).toBe('3');

		view.style.borderColor = 'red';
		expect(view.inlineStyle.borderColor).toBe('rgb(255, 0, 0)');
	});

	describe('shorthand composition', () => {
		const SHORTHANDS: Record<string, [written: string, composed: string]> = {
			margin: ['1 2 3 4', '1 2 3 4'],
			padding: ['1 2 1 2', '1 2'],
			gap: ['4 8', '4 8'],
			'border-color': ['red blue', 'rgb(255, 0, 0) rgb(0, 0, 255)'],
			'border-width': ['1 2 3', '1 2 3'],
			'border-radius': ['5', '5'],
			transform: ['translate(10, 20) scale(2, 2) rotate(45)', 'translate(10, 20) scale(2, 2) rotate3d(0, 0, 45)'],
			font: ['italic bold 12 Arial', 'italic bold 12 Arial'],
			'flex-flow': ['row wrap', 'row wrap'],
			flex: ['1 0', '1 0'],
			'android-content-inset': ['4 8', '4 8'],
			// The background longhands do not all take part in one shorthand write.
			background: ['red', ''],
		};

		it('has a case for every registered shorthand', () => {
			const shorthands = [..._getRegisteredStyleProperties()].filter((p) => p instanceof ShorthandProperty).map((p) => p.cssLocalName);

			expect(shorthands.filter((name) => !SHORTHANDS[name])).toEqual([]);
		});

		for (const [name, [written, composed]] of Object.entries(SHORTHANDS)) {
			it(`composes ${name}: ${written}`, () => {
				const { view } = tree('');

				view.style[name] = written;

				expect(view.inlineStyle.getPropertyValue(name)).toBe(composed);
				if (composed) {
					expect(getComputedStyle(view).getPropertyValue(name)).toBe(composed);

					const other: any = tree('').view;
					other.inlineStyle.setProperty(name, composed);
					expect(other.inlineStyle.cssText).toBe(view.inlineStyle.cssText);
				}
			});
		}

		it('serializes an identity transform as none', () => {
			const { view } = tree('');

			expect(getComputedStyle(view).transform).toBe('none');
		});
	});

	it('reads an empty shorthand while a longhand is not local', () => {
		const { view } = tree('label { margin-left: 2; }');

		view.style.marginTop = 4;
		view.style.marginRight = 4;
		view.style.marginBottom = 4;

		expect(view.inlineStyle.margin).toBe('');
	});

	it('writes local values that reach change events and the native view', () => {
		const view = new NativeView();
		(<any>view)._suspendNativeUpdatesCount = 0;
		const changes: unknown[] = [];
		view.style.on('colorChange', (args: any) => changes.push(args.value));

		view.inlineStyle.color = 'red';
		view.inlineStyle.setProperty('color', 'blue');

		expect(changes.map(String)).toEqual(['#FF0000', '#0000FF']);
		expect(view.colorWrites.map(String)).toEqual(['#FF0000', '#0000FF']);
		expect(view.inlineStyle.color).toBe('rgb(0, 0, 255)');
	});

	it('writes var() values that stay current', () => {
		const { root, view, cascade } = tree(CSS);

		view.inlineStyle.marginTop = 'var(--t)';
		expect(view.style.marginTop).toBe(5);

		root.className = 'b';
		cascade();

		expect(view.style.marginTop).toBe(9);
	});

	it('removes a declaration, falling back to the stylesheet', () => {
		const { view } = tree('label { margin-top: 4; }');
		view.marginTop = 10;

		expect(view.inlineStyle.removeProperty('margin-top')).toBe('10');
		expect(view.style.marginTop).toBe(4);
		expect(view.inlineStyle.marginTop).toBe('');

		view.marginTop = 10;
		view.inlineStyle.marginTop = '';
		expect(view.style.marginTop).toBe(4);
	});

	it('removes every longhand of a shorthand', () => {
		const { view } = tree('');
		view.style.padding = '1 2';

		expect(view.inlineStyle.removeProperty('padding')).toBe('1 2');
		expect(view.style.paddingLeft).toEqual(defaults.style.paddingLeft);
		expect(view.inlineStyle.length).toBe(0);
	});

	it('reads, writes and removes inline css-variables', () => {
		const { view, cascade } = tree(CSS);

		view.inlineStyle.setProperty('--t', '20');
		view.inlineStyle.marginTop = 'var(--t)';
		cascade();

		expect(view.inlineStyle.getPropertyValue('--t')).toBe('20');
		expect(view.style.marginTop).toBe(20);
		expect(view.inlineStyle.cssText).toBe('--t: 20; margin-top: var(--t);');

		expect(view.inlineStyle.removeProperty('--t')).toBe('20');
		cascade();
		expect(view.style.marginTop).toBe(5);
	});

	describe('cssText', () => {
		it('replaces every local value, including those set from code', () => {
			const { view } = tree('label { margin-top: 4; }');
			view.color = 'red';
			view.marginTop = 10;
			view.style.opacity = 0.5;

			view.inlineStyle.cssText = 'opacity: 0.25; padding-left: 2';

			expect(view.style.color).toBeUndefined();
			expect(view.style.marginTop).toBe(4);
			expect(view.style.opacity).toBe(0.25);
			expect(view.style.paddingLeft).toBe(2);
			expect(view.inlineStyle.cssText).toBe('padding-left: 2; opacity: 0.25;');
		});

		it('differs from view.style = string, which keeps values set from code', () => {
			const { view } = tree('');
			view.color = 'red';
			view.style = 'opacity: 0.25';
			view.style = 'padding-left: 2';

			expect(view.style.color.toString()).toBe('#FF0000');
			expect(view.style.opacity).toBe(1);
			expect(view.style.paddingLeft).toBe(2);
		});

		it('keeps a value the new text declares without a change in between', () => {
			const { view } = tree('');
			view.color = 'red';
			const changes: unknown[] = [];
			view.style.on('colorChange', (args: any) => changes.push(args.value));

			view.inlineStyle.cssText = 'color: red';

			expect(changes).toEqual([]);
			expect(view.inlineStyle.color).toBe('rgb(255, 0, 0)');
		});

		it('is what assigning a string to view.inlineStyle does', () => {
			const { view } = tree(CSS);
			view.color = 'red';

			view.inlineStyle = 'margin: var(--m)';

			expect(view.style.color).toBeUndefined();
			expect(view.style.marginTop).toBe(4);
			expect(view.inlineStyle.cssText).toBe('margin: var(--m);');
		});

		it('lists a longhand that overrides part of a var() shorthand after the shorthand', () => {
			const { view } = tree(CSS);
			view.style.margin = 'var(--m)';
			view.style.marginLeft = 1;

			expect(view.inlineStyle.cssText).toBe('margin: var(--m); margin-left: 1;');

			const serialized = view.inlineStyle.cssText;
			view.inlineStyle.cssText = serialized;
			expect(view.style.marginLeft).toBe(1);
			expect(view.style.marginTop).toBe(4);
		});

		it('round-trips through its own serialization', () => {
			const { view } = tree(CSS);
			view.inlineStyle.cssText = '--x: 3; color: red; margin: var(--m); padding-top: calc(1 + var(--t)); box-shadow: 1 2 3 blue';
			const text = view.inlineStyle.cssText;

			view.inlineStyle.cssText = '';
			expect(view.inlineStyle.cssText).toBe('');
			view.inlineStyle.cssText = text;

			expect(view.inlineStyle.cssText).toBe(text);
			expect(view.style.paddingTop).toBe(6);
			expect(view.style.marginLeft).toBe(4);
		});
	});

	it('reads the local value of an animated property while a keyframe overrides it', () => {
		const { view } = tree('');
		view.style.opacity = 0.5;

		view.style['keyframe:opacity'] = 0.2;

		expect(view.inlineStyle.opacity).toBe('0.5');
		expect(getComputedStyle(view).opacity).toBe('0.2');
	});

	it('leaves framework-internal values out', () => {
		const { view } = tree('label { background-color: red; font-size: 20; }');
		const background = view.style.backgroundInternal;
		const font = view.style.fontInternal;

		expect(view.inlineStyle.length).toBe(0);
		expect(view.inlineStyle.cssText).toBe('');

		view.attributeStyleMap.clear();

		expect(view.style.backgroundInternal).toBe(background);
		expect(view.style.fontInternal).toBe(font);
	});

	it('cannot be replaced by a non-string', () => {
		const { view } = tree('');

		expect(() => (view.inlineStyle = {})).toThrow(/read-only/);
	});
});

describe('style property registration', () => {
	it('accepts a property without a css name', () => {
		const property = new CssProperty<Style, string>({ name: 'nameless', cssName: undefined });

		expect(() => property.register(Style)).not.toThrow();
	});
});

describe('view.attributeStyleMap', () => {
	it('gets and sets typed local values, returning the written instance', () => {
		const { view } = tree('label { margin-top: 4; }');
		const red = new Color('red');

		view.attributeStyleMap.set('color', red);

		expect(view.attributeStyleMap.get('color')).toBe(red);
		expect(view.style.color).toBe(red);
		expect(view.attributeStyleMap.get('margin-top')).toBeUndefined();
		expect(view.attributeStyleMap.has('margin-top')).toBe(false);
	});

	it('parses string writes', () => {
		const { view } = tree('');

		view.attributeStyleMap.set('margin-top', '10%');

		expect(view.attributeStyleMap.get('margin-top')).toEqual({ unit: '%', value: 0.1 });
	});

	it('deletes and clears local values', () => {
		const { view } = tree('label { margin-top: 4; }');
		view.marginTop = 10;
		view.color = 'red';
		view.style = '--x: 1';

		expect(view.attributeStyleMap.size).toBe(3);
		expect([...view.attributeStyleMap.keys()]).toEqual(['--x', 'margin-top', 'color']);

		expect(view.attributeStyleMap.delete('margin-top')).toBe(true);
		expect(view.attributeStyleMap.delete('margin-top')).toBe(false);
		expect(view.style.marginTop).toBe(4);

		view.attributeStyleMap.clear();
		expect(view.attributeStyleMap.size).toBe(0);
		expect(view.style.color).toBeUndefined();
		expect(view.style.getCssVariable('--x')).toBeNull();
	});

	it('rejects an unknown property', () => {
		const { view } = tree('');

		expect(() => view.attributeStyleMap.set('not-a-property', 1)).toThrow(TypeError);
	});

	it('cannot be replaced', () => {
		const { view } = tree('');

		expect(() => (view.attributeStyleMap = {})).toThrow(/read-only/);
	});
});

describe('view.computedStyleMap()', () => {
	it('returns the cascade winner, as view.style does', () => {
		const { view } = tree(`${CSS} label { margin-top: 4; color: red; }`);
		view.style.opacity = 0.5;

		const map = view.computedStyleMap();

		expect(map).toBe(view.computedStyleMap());
		expect(map.get('margin-top')).toBe(4);
		expect(map.get('color')).toBe(view.style.color);
		expect(map.get('opacity')).toBe(0.5);
		expect(map.get('--m')).toBe('4');
		expect(map.has('color')).toBe(true);
		expect(map.has('not-a-property')).toBe(false);

		view.marginTop = 8;
		expect(map.get('margin-top')).toBe(8);
	});

	it('iterates every longhand', () => {
		const { view } = tree('');
		const map = view.computedStyleMap();

		const names = [...map.keys()];
		expect(names).toContain('margin-top');
		expect(names).not.toContain('margin');
		expect(names.some((name) => name.startsWith('_'))).toBe(false);
		expect(map.size).toBe(names.length);
	});
});

describe('getComputedStyle', () => {
	it('is live and cached per view', () => {
		const { root, view, cascade } = tree(`${CSS} label { color: var(--c); }`);
		const computed = getComputedStyle(view);

		expect(getComputedStyle(view)).toBe(computed);
		expect(computed.color).toBe('rgb(255, 0, 0)');

		root.className = 'b';
		cascade();

		expect(computed.color).toBe('rgb(0, 0, 255)');
		expect(computed.getPropertyValue('--c')).toBe('blue');
	});

	it('returns canonical strings whatever form the value was written in', () => {
		const { view } = tree('label { margin-top: 10%; }');
		view.backgroundColor = '#FF000080';
		view.style.marginLeft = '4px';
		view.style.padding = '2';

		const computed = getComputedStyle(view);

		expect(computed.backgroundColor).toBe('rgba(255, 0, 0, 0.502)');
		expect(computed.marginTop).toBe('10%');
		expect(computed.getPropertyValue('margin-left')).toBe('4px');
		expect(computed.padding).toBe('2');
		expect(computed.opacity).toBe('1');
		expect(computed.getPropertyValue('not-a-property')).toBe('');
	});

	it('throws on writes', () => {
		const { view } = tree('');
		const computed: any = getComputedStyle(view);

		expect(() => (computed.color = 'red')).toThrow(/read-only/);
		expect(() => computed.setProperty('color', 'red')).toThrow(/read-only/);
		expect(() => computed.removeProperty('color')).toThrow(/read-only/);
		expect(() => (computed.cssText = 'color: red')).toThrow(/read-only/);
		expect(view.style.color).toBeUndefined();
	});
});
