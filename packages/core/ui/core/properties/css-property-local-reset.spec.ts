import { describe, it, expect } from 'vitest';

import { CssProperty, unsetValue } from '.';
import { View } from '../view';
import { Label } from '../../label';
import { StackLayout } from '../../layouts/stack-layout';
import { Style } from '../../styling/style';
import { StyleScope } from '../../styling/style-scope';
import { marginTopProperty } from '../../styling/style-properties';
import { PropertyChangeData } from '../../../data/observable';

const NATIVE_DEFAULT = 'native-default';

class NativeView extends View {
	public nativeWrites: unknown[] = [];

	public createNativeView() {
		return {};
	}
}

const nativeTestProperty = new CssProperty<Style, string>({
	name: 'nativeTest',
	cssName: 'native-test',
	defaultValue: 'default',
});
nativeTestProperty.register(Style);

NativeView.prototype[nativeTestProperty.getDefault] = () => NATIVE_DEFAULT;
NativeView.prototype[nativeTestProperty.setNative] = function (this: NativeView, value: unknown) {
	this.nativeWrites.push(value);
};

function loaded<T extends View>(css: string, view: T, parent: View = new StackLayout()): T {
	const scope = new StyleScope();
	scope.css = css;

	(<any>parent)._styleScope = scope;
	(<any>parent)._cssState.onLoaded();

	parent._addView(view);
	(<any>view)._styleScope = scope;
	(<any>view)._cssState.onLoaded();

	return view;
}

/** Lets the setters reach the native view without creating one. */
function withNativeUpdates<T extends View>(view: T): T {
	(<any>view)._suspendNativeUpdatesCount = 0;

	return view;
}

describe('CssProperty local reset', () => {
	it.each([
		['unsetValue', unsetValue],
		["'unset'", 'unset'],
		["'initial'", 'initial'],
		["''", ''],
	])('restores the css value when reset with %s', (_name, reset) => {
		const view = loaded('label { margin-top: 4; }', new Label());

		view.style.marginTop = 20;
		view.style.marginTop = <any>reset;

		expect(view.style.marginTop).toBe(4);
	});

	it('restores the css value when reset through the view', () => {
		const view = loaded('label { margin-top: 4; }', new Label());

		view.marginTop = 20;
		view.marginTop = <any>unsetValue;

		expect(view.marginTop).toBe(4);
	});

	it('restores a css value written through a shorthand', () => {
		const view = loaded('label { margin: 4; }', new Label());

		view.style.marginTop = 20;
		view.style.marginTop = unsetValue;

		expect(view.style.marginTop).toBe(4);
	});

	it('restores an evaluated css variable', () => {
		const view = loaded('label { --gap: 4; margin-top: var(--gap); }', new Label());

		view.style.marginTop = 20;
		view.style.marginTop = unsetValue;

		expect(view.style.marginTop).toBe(4);
	});

	it('restores a css value the local value shadowed before css ran', () => {
		const view = new Label();
		view.style.marginTop = 20;
		loaded('label { margin-top: 4; }', view);
		expect(view.style.marginTop).toBe(20);

		view.style.marginTop = unsetValue;

		expect(view.style.marginTop).toBe(4);
	});

	it('falls back to the default when no css rule sets the property', () => {
		const view = loaded('label { color: red; }', new Label());

		view.style.marginTop = 20;
		view.style.marginTop = unsetValue;

		expect(view.style.marginTop).toBe(marginTopProperty.defaultValue);
	});

	it('lets the css own the property again', () => {
		const view = loaded('label { margin-top: 4; } .wide { margin-top: 8; }', new Label());

		view.style.marginTop = 20;
		view.style.marginTop = unsetValue;
		view.className = 'wide';
		(<any>view)._cssState.onChange();
		(<any>view)._cssState.onLoaded();

		expect(view.style.marginTop).toBe(8);
	});

	it('notifies the css value as a script change', () => {
		const view = loaded('label { margin-top: 4; }', new Label());
		view.style.marginTop = 20;

		const events: PropertyChangeData[] = [];
		view.style.on('marginTopChange', (data: PropertyChangeData) => events.push(data));

		view.style.marginTop = unsetValue;

		expect(events.map((e) => [e.value, e.oldValue, e.origin])).toEqual([[4, 20, 'script']]);
	});

	it('writes the css value to the native view', () => {
		const view = withNativeUpdates(loaded('* { native-test: from-css; }', new NativeView()));

		view.style['nativeTest'] = 'local';
		view.style['nativeTest'] = unsetValue;

		expect(view.nativeWrites).toEqual(['local', 'from-css']);
		expect(view.style['nativeTest']).toBe('from-css');
	});

	it('restores the native default when no css rule sets the property', () => {
		const view = withNativeUpdates(loaded('* { color: red; }', new NativeView()));

		view.style['nativeTest'] = 'local';
		view.style['nativeTest'] = unsetValue;

		expect(view.nativeWrites).toEqual(['local', NATIVE_DEFAULT]);
		expect(view.style['nativeTest']).toBe('default');
	});
});

describe('InheritedCssProperty local reset', () => {
	it('restores the css value', () => {
		const view = loaded('label { color: red; }', new Label());

		view.style.color = <any>'blue';
		view.style.color = unsetValue;

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('prefers the css value over the inherited one', () => {
		const parent = new StackLayout();
		parent.style.color = <any>'green';
		const view = loaded('label { color: red; }', new Label(), parent);

		view.style.color = <any>'blue';
		view.style.color = unsetValue;

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('inherits again when no css rule sets the property', () => {
		const parent = new StackLayout();
		parent.style.color = <any>'green';
		const view = loaded('label { margin-top: 4; }', new Label(), parent);

		view.style.color = <any>'blue';
		view.style.color = unsetValue;

		expect(view.style.color.toString()).toBe('#008000');
	});

	it('passes the restored css value down to inheriting children', () => {
		const middle = loaded('.middle { color: red; }', new StackLayout());
		middle.className = 'middle';
		(<any>middle)._cssState.onChange();
		(<any>middle)._cssState.onLoaded();

		const child = new Label();
		middle.addChild(child);

		middle.style.color = <any>'blue';
		expect(child.style.color.toString()).toBe('#0000FF');

		middle.style.color = unsetValue;

		expect(middle.style.color.toString()).toBe('#FF0000');
		expect(child.style.color.toString()).toBe('#FF0000');
	});
});
