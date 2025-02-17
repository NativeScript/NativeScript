﻿import { View } from '../core/view';
import { Property } from '../core/properties';

export const yearProperty: Property<DatePicker, number>;
export const monthProperty: Property<DatePicker, number>;
export const dayProperty: Property<DatePicker, number>;
export const dateProperty: Property<DatePicker, Date>;
export const maxDate: Property<DatePicker, Date>;
export const minDate: Property<DatePicker, Date>;
export const iosPreferredDatePickerStyleProperty: Property<DatePicker, number>;

/**
 * Represents an date picker.
 *
 * @nsView DatePicker
 */
export class DatePicker extends View {
	/**
	 * String value used when hooking to dateChange event.
	 *
	 * @nsEvent {PropertyChangeData} dateChange
	 */
	public static dateChangeEvent: string;

	/**
	 * Gets the native [android.widget.DatePicker](http://developer.android.com/reference/android/widget/DatePicker.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.DatePicker */;

	/**
	 * Gets the native iOS [UIDatePicker](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIDatePicker */;

	/**
	 * Gets or sets the year.
	 *
	 * @nsProperty
	 */
	year: number;

	/**
	 * Gets or sets the month. The months start from 1.
	 *
	 * @nsProperty
	 */
	month: number;

	/**
	 * Gets or sets the day. The days start from 1.
	 *
	 * @nsProperty
	 */
	day: number;

	/**
	 * Gets or sets the entire date.
	 *
	 * @nsProperty
	 */
	date: Date;

	/**
	 * Gets or sets the max date.
	 *
	 * @nsProperty
	 */
	maxDate: Date;

	/**
	 * Gets or sets the min date.
	 *
	 * @nsProperty
	 */
	minDate: Date;

	/**
	 * Gets or set the UIDatePickerStyle of the date picker in iOS 13.4+. Defaults to 0.
	 * Valid values are numbers:
	 *  - 0: automatic (system picks the concrete style based on the current platform and date picker mode)
	 *  - 1: wheels (the date picker displays as a wheel picker)
	 *  - 2: compact (the date picker displays as a label that when tapped displays a calendar-style editor)
	 *  - 3: inline  (the date pickers displays as an inline, editable field)
	 *
	 * @nsProperty
	 */
	iosPreferredDatePickerStyle: number;

	/**
	 * Gets or sets whether the time should be shown.
	 *
	 * @nsProperty
	 */
	showTime: boolean;
}
