import { Slider as SliderDefinition } from '.';
import { AccessibilityRole } from '../../accessibility';
import { CoercibleProperty, Property } from '../core/properties';
import { CSSType, View } from '../core/view';
import { LinearGradient } from '../styling/linear-gradient';

// TODO: Extract base Range class for slider and progress
@CSSType('Slider')
export class SliderBase extends View implements SliderDefinition {
	static readonly valueChangeEvent = 'valueChange';
	static readonly accessibilityIncrementEvent = 'accessibilityIncrement';
	static readonly accessibilityDecrementEvent = 'accessibilityDecrement';

	public value: number;
	public minValue: number;
	public maxValue: number;

	// Optional gradients for the filled (min/left) and unfilled (max/right) tracks.
	public minTrackGradient: LinearGradient | null;
	public maxTrackGradient: LinearGradient | null;

	get accessibilityStep(): number {
		return this.style.accessibilityStep;
	}

	set accessibilityStep(value: number) {
		this.style.accessibilityStep = value;
	}

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
	valueConverter: (v) => (__APPLE__ ? parseFloat(v) : parseInt(v)),
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
	valueConverter: (v) => (__APPLE__ ? parseFloat(v) : parseInt(v)),
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
	valueConverter: (v) => (__APPLE__ ? parseFloat(v) : parseInt(v)),
});
maxValueProperty.register(SliderBase);

/**
 * Represents the observable property backing the minTrackGradient property of each Slider instance.
 */
export const minTrackGradientProperty = new Property<SliderBase, LinearGradient | null>({
	name: 'minTrackGradient',
	defaultValue: null,
	valueChanged: (target, oldValue, newValue) => {
		// Platform specific handlers will observe and apply gradients when native view is available.
	},
});
minTrackGradientProperty.register(SliderBase);

/**
 * Represents the observable property backing the maxTrackGradient property of each Slider instance.
 */
export const maxTrackGradientProperty = new Property<SliderBase, LinearGradient | null>({
	name: 'maxTrackGradient',
	defaultValue: null,
	valueChanged: (target, oldValue, newValue) => {
		// Platform specific handlers will observe and apply gradients when native view is available.
	},
});
maxTrackGradientProperty.register(SliderBase);
