import { Slider as SliderDefinition } from '.';
import { AccessibilityRole } from '../../accessibility';
import { CoercibleProperty, Property } from '../core/properties';
import { CSSType, View } from '../core/view';

// TODO: Extract base Range class for slider and progress
@CSSType('Slider')
export class SliderBase extends View implements SliderDefinition {
	static readonly accessibilityIncrementEvent = 'accessibilityIncrement';
	static readonly accessibilityDecrementEvent = 'accessibilityDecrement';

	public value: number;
	public minValue: number;
	public maxValue: number;

	get accessibilityStep(): number {
		return this.style.accessibilityStep;
	}

	set accessibilityStep(value: number) {
		this.style.accessibilityStep = value;
	}

	accessible = true;
	accessibilityRole = AccessibilityRole.Adjustable;
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
		const minValue = target.minValue;
		if (value < minValue) {
			value = minValue;
		}

		return value;
	},
	valueChanged: (target, oldValue, newValue) => valueProperty.coerce(target),
	valueConverter: (v) => (global.isIOS ? parseFloat(v) : parseInt(v)),
});
maxValueProperty.register(SliderBase);
