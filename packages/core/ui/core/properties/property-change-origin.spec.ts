import { describe, it, expect } from 'vitest';

import { CoercibleProperty, Property } from '.';
import { View } from '../view';
import { Label } from '../../label';
import { StackLayout } from '../../layouts/stack-layout';
import { Color } from '../../../color';
import { Observable, PropertyChangeData } from '../../../data/observable';
import { opacityProperty } from '../../styling/style-properties';

class TestView extends View {
	public test: string;
	public coerced: number;

	public createNativeView() {
		return {};
	}
}

const testProperty = new Property<TestView, string>({
	name: 'test',
	defaultValue: undefined,
});
testProperty.register(TestView);

const coercedProperty = new CoercibleProperty<TestView, number>({
	name: 'coerced',
	defaultValue: 0,
	coerceValue: (target, value) => value,
});
coercedProperty.register(TestView);

function record(target: Observable, eventName: string): PropertyChangeData[] {
	const events: PropertyChangeData[] = [];
	target.on(eventName, (data: PropertyChangeData) => events.push(data));

	return events;
}

describe('PropertyChangeData.origin', () => {
	it('is script for a local set of a Property', () => {
		const view = new TestView();
		const events = record(view, 'testChange');

		view.test = 'value';

		expect(events.map((e) => e.origin)).toEqual(['script']);
	});

	it('is script for a local set of a CoercibleProperty', () => {
		const view = new TestView();
		const events = record(view, 'coercedChange');

		view.coerced = 5;

		expect(events.map((e) => e.origin)).toEqual(['script']);
	});

	it('is native for nativeValueChange', () => {
		const view = new TestView();
		const events = record(view, 'testChange');

		testProperty.nativeValueChange(view, 'from-native');

		expect(events.map((e) => e.origin)).toEqual(['native']);
	});

	it('is script for a local set of a style property', () => {
		const view = new Label();
		const events = record(view.style, 'colorChange');

		view.style.color = new Color('red');

		expect(events.map((e) => e.origin)).toEqual(['script']);
	});

	it('is css for a css set of a style property', () => {
		const view = new Label();
		const events = record(view.style, 'colorChange');

		view.style['css:color'] = 'red';

		expect(events.map((e) => e.origin)).toEqual(['css']);
	});

	it('is inherited for a css value propagated to a child', () => {
		const parent = new StackLayout();
		const child = new Label();
		parent.addChild(child);

		const parentEvents = record(parent.style, 'colorChange');
		const childEvents = record(child.style, 'colorChange');

		parent.style.color = new Color('blue');

		expect(parentEvents.map((e) => e.origin)).toEqual(['script']);
		expect(childEvents.map((e) => e.origin)).toEqual(['inherited']);
		expect(child.style.color.hex).toBe(parent.style.color.hex);
	});

	it('is inherited for a view property propagated to a child', () => {
		const parent = new StackLayout();
		const child = new Label();
		parent.addChild(child);

		const parentEvents = record(parent, 'bindingContextChange');
		const childEvents = record(child, 'bindingContextChange');

		parent.bindingContext = { name: 'ctx' };

		expect(parentEvents.map((e) => e.origin)).toEqual(['script']);
		expect(childEvents.map((e) => e.origin)).toEqual(['inherited']);
	});

	it('is animation for a keyframe set', () => {
		const view = new Label();
		const events = record(view.style, 'opacityChange');

		view.style[opacityProperty.keyframe] = 0.5;

		expect(events.map((e) => e.origin)).toEqual(['animation']);
	});

	it('is css for a css set of an animatable property', () => {
		const view = new Label();
		const events = record(view.style, 'opacityChange');

		view.style['css:opacity'] = 0.5;

		expect(events.map((e) => e.origin)).toEqual(['css']);
	});

	it('is script on the longhands of a local shorthand set', () => {
		const view = new Label();
		const top = record(view.style, 'marginTopChange');
		const left = record(view.style, 'marginLeftChange');

		view.style.margin = '5';

		expect(top.map((e) => e.origin)).toEqual(['script']);
		expect(left.map((e) => e.origin)).toEqual(['script']);
	});

	it('is css on the longhands of a css shorthand set', () => {
		const view = new Label();
		const top = record(view.style, 'marginTopChange');
		const left = record(view.style, 'marginLeftChange');

		view.style['css:margin'] = '5';

		expect(top.map((e) => e.origin)).toEqual(['css']);
		expect(left.map((e) => e.origin)).toEqual(['css']);
	});

	it('is undefined for Observable.notifyPropertyChange', () => {
		const observable = new Observable();
		const events = record(observable, Observable.propertyChangeEvent);

		observable.notifyPropertyChange('name', 'new', 'old');

		expect(events.length).toBe(1);
		expect(events[0].origin).toBeUndefined();
	});
});
