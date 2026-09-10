import { describe, it, expect } from 'vitest';

import { InheritedProperty, unsetValue } from './index';
import { StackLayout } from '../../layouts/stack-layout';
import { Label } from '../../label';

// Mirrors the private `ValueSource` enum in ./index.
const ValueSource = {
	Default: 0,
	Inherited: 1,
	Css: 2,
	Local: 3,
};

class TestView extends StackLayout {
	public testInherited: string;

	public createNativeView(): Object {
		return {};
	}
}

const testInheritedProperty = new InheritedProperty<TestView, string>({
	name: 'testInherited',
	defaultValue: undefined,
});
testInheritedProperty.register(TestView);

function valueSourceOf(view: any): number {
	return view[testInheritedProperty.sourceKey] || ValueSource.Default;
}

function tree(): { root: TestView; child: TestView; grandChild: TestView } {
	const root = new TestView();
	const child = new TestView();
	const grandChild = new TestView();

	root.addChild(child);
	child.addChild(grandChild);

	return { root, child, grandChild };
}

function recordChanges(view: any, eventName: string): unknown[] {
	const values: unknown[] = [];
	view.on(eventName, (data: any) => values.push(data.value));

	return values;
}

describe('InheritedProperty', () => {
	it('propagates a value down the tree', () => {
		const { root, child, grandChild } = tree();

		root.testInherited = 'a';

		expect(child.testInherited).toBe('a');
		expect(grandChild.testInherited).toBe('a');
		expect(valueSourceOf(root)).toBe(ValueSource.Local);
		expect(valueSourceOf(child)).toBe(ValueSource.Inherited);
		expect(valueSourceOf(grandChild)).toBe(ValueSource.Inherited);
	});

	it('resets inheriting descendants when the value is unset', () => {
		const { root, child, grandChild } = tree();
		root.testInherited = 'a';

		const childChanges = recordChanges(child, 'testInheritedChange');
		const grandChildChanges = recordChanges(grandChild, 'testInheritedChange');

		root.testInherited = unsetValue;

		expect(root.testInherited).toBeUndefined();
		expect(child.testInherited).toBeUndefined();
		expect(grandChild.testInherited).toBeUndefined();
		expect(valueSourceOf(root)).toBe(ValueSource.Default);
		expect(valueSourceOf(child)).toBe(ValueSource.Default);
		expect(valueSourceOf(grandChild)).toBe(ValueSource.Default);
		expect(childChanges).toEqual([undefined]);
		expect(grandChildChanges).toEqual([undefined]);
	});

	it("resets inheriting descendants when the value is set to 'initial'", () => {
		const { root, child, grandChild } = tree();
		root.testInherited = 'a';

		root.testInherited = <any>'initial';

		expect(child.testInherited).toBeUndefined();
		expect(grandChild.testInherited).toBeUndefined();
	});

	it('leaves a descendant that holds a local value untouched', () => {
		const { root, child, grandChild } = tree();
		root.testInherited = 'a';
		child.testInherited = 'local';

		root.testInherited = unsetValue;

		expect(child.testInherited).toBe('local');
		expect(valueSourceOf(child)).toBe(ValueSource.Local);
		expect(grandChild.testInherited).toBe('local');
		expect(valueSourceOf(grandChild)).toBe(ValueSource.Inherited);
	});

	it('propagates again after a reset', () => {
		const { root, child, grandChild } = tree();
		root.testInherited = 'a';
		root.testInherited = unsetValue;

		root.testInherited = 'b';

		expect(child.testInherited).toBe('b');
		expect(grandChild.testInherited).toBe('b');
		expect(valueSourceOf(grandChild)).toBe(ValueSource.Inherited);
	});
});

describe('bindingContext', () => {
	it('is reset on descendants when the root unsets it', () => {
		const root = new StackLayout();
		const container = new StackLayout();
		const label = new Label();
		root.addChild(container);
		container.addChild(label);

		const context = { name: 'a' };
		root.bindingContext = context;
		expect(container.bindingContext).toBe(context);
		expect(label.bindingContext).toBe(context);

		const labelChanges = recordChanges(label, 'bindingContextChange');

		root.bindingContext = unsetValue;

		expect(root.bindingContext).toBeUndefined();
		expect(container.bindingContext).toBeUndefined();
		expect(label.bindingContext).toBeUndefined();
		expect(labelChanges).toEqual([undefined]);
	});
});
