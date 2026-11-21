import { describe, it, expect } from 'vitest';

import { CssProperty, unsetValue } from '.';
import { View } from '../view';
import { Label } from '../../label';
import { StackLayout } from '../../layouts/stack-layout';
import { Style } from '../../styling/style';
import { StyleScope } from '../../styling/style-scope';
import { Color } from '../../../color';
import { marginTopProperty } from '../../styling/style-properties';

const ZERO = marginTopProperty.defaultValue;
const NATIVE_DEFAULT = 'native-default';

class NativeView extends View {
	public nativeWrites: unknown[] = [];

	public createNativeView() {
		return {};
	}
}

const nativeInheritProperty = new CssProperty<Style, string>({
	name: 'nativeInherit',
	cssName: 'native-inherit',
	defaultValue: 'default',
});
nativeInheritProperty.register(Style);

NativeView.prototype[nativeInheritProperty.getDefault] = () => NATIVE_DEFAULT;
NativeView.prototype[nativeInheritProperty.setNative] = function (this: NativeView, value: unknown) {
	this.nativeWrites.push(value);
};

function styled<T extends View>(scope: StyleScope, view: T): T {
	(<any>view)._styleScope = scope;
	(<any>view)._cssState.onLoaded();

	return view;
}

/** A styled child added to a styled parent. */
function loaded<T extends View>(css: string, view: T, parent: View = new StackLayout()): T {
	const scope = new StyleScope();
	scope.css = css;

	styled(scope, parent);
	parent._addView(view);
	styled(scope, view);

	return view;
}

function restyle(view: View): void {
	(<any>view)._cssState.onChange();
	(<any>view)._cssState.onLoaded();
}

/** Lets the setters reach the native view without creating one. */
function withNativeUpdates<T extends View>(view: T): T {
	(<any>view)._suspendNativeUpdatesCount = 0;

	return view;
}

describe('css inherit on a non-inherited CssProperty', () => {
	it("resolves to the parent's value", () => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		const view = loaded('label { margin-top: inherit; }', new Label(), parent);

		expect(view.style.marginTop).toBe(8);
	});

	it("follows a later change of the parent's value", () => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		const view = loaded('label { margin-top: inherit; }', new Label(), parent);

		parent.style.marginTop = 12;
		expect(view.style.marginTop).toBe(12);

		parent.style.marginTop = unsetValue;
		expect(view.style.marginTop).toEqual(ZERO);

		parent.style.marginTop = 4;
		expect(view.style.marginTop).toBe(4);
	});

	it("picks up the parent's own css applied after the child", () => {
		const scope = new StyleScope();
		scope.css = 'stacklayout { margin-top: 6; } label { margin-top: inherit; }';
		const parent = new StackLayout();
		const view = new Label();
		parent._addView(view);

		styled(scope, view);
		expect(view.style.marginTop).toEqual(ZERO);

		styled(scope, parent);
		expect(view.style.marginTop).toBe(6);
	});

	it('follows a parent that inherits the value itself', () => {
		const root = new StackLayout();
		const middle = new StackLayout();
		middle.className = 'middle';
		root._addView(middle);
		const view = new Label();
		middle._addView(view);

		const scope = new StyleScope();
		scope.css = '.middle { margin-top: inherit; } label { margin-top: inherit; }';
		styled(scope, root);
		styled(scope, middle);
		styled(scope, view);

		root.style.marginTop = 9;

		expect(middle.style.marginTop).toBe(9);
		expect(view.style.marginTop).toBe(9);
	});

	it('resolves to the default without a parent', () => {
		const scope = new StyleScope();
		scope.css = 'label { margin-top: inherit; }';
		const view = styled(scope, new Label());

		expect(view.style.marginTop).toEqual(ZERO);
	});

	it('resolves to the default when the parent has none', () => {
		const view = loaded('label { margin-top: inherit; }', new Label());

		expect(view.style.marginTop).toEqual(ZERO);
	});

	it.each(['initial', 'unset', 'revert'])("resolves '%s' to the default", (keyword) => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		const view = loaded(`label { margin-top: ${keyword}; }`, new Label(), parent);

		expect(view.style.marginTop).toEqual(ZERO);
	});

	it('takes the new parent value when re-parented', () => {
		const first = new StackLayout();
		first.style.marginTop = 8;
		const second = new StackLayout();
		second.style.marginTop = 16;
		const view = loaded('label { margin-top: inherit; }', new Label(), first);

		first._removeView(view);
		expect(view.style.marginTop).toEqual(ZERO);

		second._addView(view);
		expect(view.style.marginTop).toBe(16);

		first.style.marginTop = 2;
		expect(view.style.marginTop).toBe(16);
		expect(first.style.hasListeners('marginTopChange')).toBe(false);

		second.style.marginTop = 20;
		expect(view.style.marginTop).toBe(20);
	});

	it('stops following once the stylesheet no longer says inherit', () => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		const view = loaded('label { margin-top: inherit; } .fixed { margin-top: 3; }', new Label(), parent);

		view.className = 'fixed';
		restyle(view);
		expect(view.style.marginTop).toBe(3);

		parent.style.marginTop = 12;
		expect(view.style.marginTop).toBe(3);
		expect(parent.style.hasListeners('marginTopChange')).toBe(false);
	});

	it("lets a local value win, and inherits again once it's released", () => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		const view = loaded('label { margin-top: inherit; }', new Label(), parent);

		view.style.marginTop = 20;
		parent.style.marginTop = 12;
		expect(view.style.marginTop).toBe(20);

		view.style.marginTop = unsetValue;
		restyle(view);

		expect(view.style.marginTop).toBe(12);
		parent.style.marginTop = 14;
		expect(view.style.marginTop).toBe(14);
	});

	it('adds no listener to the parent when no child uses inherit', () => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		loaded('label { margin-top: 4; background-color: red; }', new Label(), parent);

		expect(parent.style.hasListeners('marginTopChange')).toBe(false);
		expect(parent.style.hasListeners('backgroundColorChange')).toBe(false);
	});

	it('skips an unchanged inherit on the next cascade pass', () => {
		const parent = new StackLayout();
		parent.style.marginTop = 8;
		const view = loaded('label { margin-top: inherit; }', new Label(), parent);

		let writes = 0;
		view.style.on('marginTopChange', () => writes++);
		view.style.marginTop = 1;
		view.style.marginTop = unsetValue;
		restyle(view);
		writes = 0;

		restyle(view);

		expect(writes).toBe(0);
		expect(view.style.marginTop).toBe(8);
	});

	it("writes the parent's value to the native view", () => {
		const parent = new StackLayout();
		parent.style['nativeInherit'] = 'from-parent';
		const view = loaded('* { native-inherit: inherit; }', withNativeUpdates(new NativeView()), parent);

		parent.style['nativeInherit'] = 'changed';
		parent.style['nativeInherit'] = unsetValue;

		expect(view.nativeWrites).toEqual(['from-parent', 'changed', NATIVE_DEFAULT]);
		expect(view.style['nativeInherit']).toBe('default');
	});
});

describe('css inherit on a CssAnimationProperty', () => {
	it("resolves background-color to the parent's value and follows it", () => {
		const parent = new StackLayout();
		parent.style.backgroundColor = new Color('red');
		const view = loaded('label { background-color: inherit; }', new Label(), parent);

		expect(view.style.backgroundColor?.hex).toBe('#FF0000');

		parent.style.backgroundColor = new Color('blue');
		expect(view.style.backgroundColor?.hex).toBe('#0000FF');

		parent.style.backgroundColor = unsetValue;
		expect(view.style.backgroundColor).toBeUndefined();
	});

	it('resolves opacity to the parent value', () => {
		const parent = new StackLayout();
		parent.style.opacity = 0.5;
		const view = loaded('label { opacity: inherit; }', new Label(), parent);

		expect(view.style.opacity).toBe(0.5);
	});

	it('keeps the inherited css value current under a local value', () => {
		const parent = new StackLayout();
		parent.style.backgroundColor = new Color('red');
		const view = loaded('label { background-color: inherit; }', new Label(), parent);

		view.style.backgroundColor = new Color('green');
		parent.style.backgroundColor = new Color('blue');
		expect(view.style.backgroundColor.hex).toBe('#008000');

		view.style.backgroundColor = unsetValue;
		expect(view.style.backgroundColor.hex).toBe('#0000FF');
	});

	it.each(['initial', 'unset'])("resolves '%s' to the default", (keyword) => {
		const parent = new StackLayout();
		parent.style.backgroundColor = new Color('red');
		const view = loaded(`label { background-color: ${keyword}; }`, new Label(), parent);

		expect(view.style.backgroundColor).toBeUndefined();
	});

	it('takes the new parent value when re-parented', () => {
		const first = new StackLayout();
		first.style.opacity = 0.5;
		const second = new StackLayout();
		second.style.opacity = 0.25;
		const view = loaded('label { opacity: inherit; }', new Label(), first);

		first._removeView(view);
		expect(view.style.opacity).toBe(1);

		second._addView(view);
		expect(view.style.opacity).toBe(0.25);
		expect(first.style.hasListeners('opacityChange')).toBe(false);
	});

	it('stops following once the stylesheet no longer says inherit', () => {
		const parent = new StackLayout();
		parent.style.opacity = 0.5;
		const view = loaded('label { opacity: inherit; } .fixed { opacity: 0.75; }', new Label(), parent);

		view.className = 'fixed';
		restyle(view);
		parent.style.opacity = 0.25;

		expect(view.style.opacity).toBe(0.75);
		expect(parent.style.hasListeners('opacityChange')).toBe(false);
	});
});

describe('css-wide keywords on a shorthand', () => {
	it("resolves margin: inherit to the parent's longhands", () => {
		const parent = new StackLayout();
		parent.style.margin = '1 2 3 4';
		const view = loaded('label { margin: inherit; }', new Label(), parent);

		expect([view.style.marginTop, view.style.marginRight, view.style.marginBottom, view.style.marginLeft]).toEqual([1, 2, 3, 4]);

		parent.style.marginLeft = 8;
		expect(view.style.marginLeft).toBe(8);
	});

	it("resolves border-color: inherit to the parent's colors", () => {
		const parent = new StackLayout();
		parent.style.borderColor = 'red';
		const view = loaded('label { border-color: inherit; }', new Label(), parent);

		expect(view.style.borderTopColor.hex).toBe('#FF0000');
		expect(view.style.borderLeftColor.hex).toBe('#FF0000');
	});

	it('resolves margin: initial to the defaults', () => {
		const parent = new StackLayout();
		parent.style.margin = '5';
		const view = loaded('label { margin: 7; } .reset { margin: initial; }', new Label(), parent);

		view.className = 'reset';
		restyle(view);

		expect(view.style.marginTop).toEqual(ZERO);
		expect(view.style.marginLeft).toEqual(ZERO);
	});

	it("resolves font: inherit to the parent's font", () => {
		const parent = new StackLayout();
		parent.style.fontSize = 22;
		const view = loaded('label { font-size: 10; } .whole { font: inherit; }', new Label(), parent);

		view.className = 'whole';
		restyle(view);

		expect(view.style.fontSize).toBe(22);
	});
});
