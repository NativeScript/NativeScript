﻿import { View } from '../core/view';
import { Property } from '../core/properties';

/**
 * Represents a progress component.
 *
 * @nsView Progress
 */
export class Progress extends View {
	/**
	 * String value used when hooking to valueChange event.
	 *
	 * @nsEvent {PropertyChangeData} valueChange
	 */
	static readonly valueChangeEvent = 'valueChange';

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ProgressBar */;

	/**
	 * Gets the native iOS [UIProgressView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIProgressView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIProgressView */;

	/**
	 * Gets or sets a progress current value.
	 *
	 * @nsProperty
	 */
	value: number;

	/**
	 * Gets or sets a progress max value.
	 *
	 * @nsProperty
	 */
	maxValue: number;
}

/**
 * Represents the observable property backing the value property of each Progress instance.
 */
export const valueProperty: Property<Progress, number>;

/**
 * Represents the observable property backing the maxValue property of each Progress instance.
 */
export const maxValueProperty: Property<Progress, number>;
