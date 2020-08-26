import { Slider as SliderDefinition } from '.';
import { View, CSSType } from '../core/view';
import { Property, CoercibleProperty } from '../core/properties';

// TODO: Extract base Range class for slider and progress
@CSSType('Slider')
export class SliderBase extends View implements SliderDefinition {
	public value: number;
	public minValue: number;
	public maxValue: number;
}

SliderBase.prototype.recycleNativeView = 'auto';

/**
 * Represents the observable property backing the value property of each Slider instance.
 */
export const valueProperty = new CoercibleProperty<SliderBase, number>({
	name: 'value',
	defaultValue: 0,
	coerceValue: (target, value) => {
		value = Math.max(value, target.minValue);
		value = Math.min(value, target.maxValue);

		return value;
	},
	valueConverter: (v) => (global.isIOS ? parseFloat(v) : parseInt(v)),
});
valueProperty.register(SliderBase);

/**
 * Represents the observable property backing the minValue property of each Slider instance.
 */
export const minValueProperty = new Property<SliderBase, number>({
	name: 'minValue',
	defaultValue: 0,
	valueChanged: (target, oldValue, newValue) => {
		maxValueProperty.coerce(target);
		valueProperty.coerce(target);
	},
	valueConverter: (v) => (global.isIOS ? parseFloat(v) : parseInt(v)),
});
minValueProperty.register(SliderBase);

/**
 * Represents the observable property backing the maxValue property of each Slider instance.
 */
export const maxValueProperty = new CoercibleProperty<SliderBase, number>({
	name: 'maxValue',
	defaultValue: 100,
	coerceValue: (target, value) => {
		let minValue = target.minValue;
		if (value < minValue) {
			value = minValue;
		}

		return value;
	},
	valueChanged: (target, oldValue, newValue) => valueProperty.coerce(target),
	valueConverter: (v) => (global.isIOS ? parseFloat(v) : parseInt(v)),
});
maxValueProperty.register(SliderBase);
