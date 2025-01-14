﻿import { View } from '../core/view';
import { Property, CoercibleProperty } from '../core/properties';
import { EventData } from '../../data/observable';
import type { SliderBase } from './slider-common';

/**
 * Represents a slider component.
 *
 * @nsView Slider
 */
export class Slider extends View {
	/**
	 * String value used when hooking to valueChange event.
	 *
	 * @nsEvent {PropertyChangeData} valueChange
	 */
	static readonly valueChangeEvent = 'valueChange';
	/**
	 * String value used when hooking to accessibilityDecrement event.
	 *
	 * @nsEvent {accessibilityDecrementEvent} accessibilityDecrement
	 */
	static readonly accessibilityDecrementEvent = 'accessibilityDecrement';

	/**
	 * String value used when hooking to accessibilityIncrement event.
	 *
	 * @nsEvent {AccessibilityIncrementEventData} accessibilityIncrement
	 */
	static readonly accessibilityIncrementEvent = 'accessibilityIncrement';

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/SeekBar.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.SeekBar */;

	/**
	 * Gets the native iOS [UISlider](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISlider_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UISlider */;

	/**
	 * Gets or sets a slider current value. The default value is 0.
	 *
	 * @nsProperty
	 */
	value: number;

	/**
	 * Gets or sets a slider min value. The default value is 0.
	 *
	 * @nsProperty
	 */
	minValue: number;

	/**
	 * Gets or sets a slider max value. The default value is 100.
	 *
	 * @nsProperty
	 */
	maxValue: number;

	/**
	 * Increase/Decrease step size for iOS Increment-/Decrement events
	 *
	 * @nsProperty
	 */
	accessibilityStep: number;
}

/**
 * Represents the observable property backing the value property of each Slider instance.
 */
export const valueProperty: CoercibleProperty<Slider, number>;

/**
 * Represents the observable property backing the minValue property of each Slider instance.
 */
export const minValueProperty: Property<Slider, number>;

/**
 * Represents the observable property backing the maxValue property of each Slider instance.
 */
export const maxValueProperty: CoercibleProperty<Slider, number>;

/**
 * Represents the observable property backing the accessibilityStep property of each Slider instance.
 */
export const accessibilityStepProperty: Property<SliderBase, number>;

interface AccessibilityIncrementEventData extends EventData {
	object: Slider;
	value?: number;
}

interface AccessibilityDecrementEventData extends EventData {
	object: Slider;
	value?: number;
}
