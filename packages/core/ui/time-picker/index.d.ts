import { View } from '../core/view';
import { Property } from '../core/properties';

/**
 * Represents an time picker.
 *
 * @nsView TimePicker
 */
export class TimePicker extends View {
	/**
	 * String value used when hooking to the timeChange event.
	 *
	 * @nsEvent timeChange
	 */
	public static timeChangeEvent: string;

	/**
	 * Gets the native [android.widget.TimePicker](http://developer.android.com/reference/android/widget/TimePicker.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.TimePicker */;

	/**
	 * Gets the native iOS [UIDatePicker](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIDatePicker */;

	/**
	 * Gets or sets the time hour.
	 *
	 * @nsProperty
	 */
	hour: number;

	/**
	 * Gets or sets the time minute.
	 *
	 * @nsProperty
	 */
	minute: number;

	/**
	 * Gets or sets the time.
	 *
	 * @nsProperty
	 */
	time: Date;

	/**
	 * Gets or sets the max time hour.
	 *
	 * @nsProperty
	 */
	maxHour: number;

	/**
	 * Gets or sets the max time minute.
	 *
	 * @nsProperty
	 */
	maxMinute: number;

	/**
	 * Gets or sets the min time hour.
	 *
	 * @nsProperty
	 */
	minHour: number;

	/**
	 * Gets or sets the min time minute.
	 *
	 * @nsProperty
	 */
	minMinute: number;

	/**
	 * Gets or sets the minute interval.
	 *
	 * @nsProperty
	 */
	minuteInterval: number;

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
}

export const hourProperty: Property<TimePicker, number>;
export const maxHourProperty: Property<TimePicker, number>;
export const minHourProperty: Property<TimePicker, number>;

export const minuteProperty: Property<TimePicker, number>;
export const maxMinuteProperty: Property<TimePicker, number>;
export const minMinuteProperty: Property<TimePicker, number>;

export const timeProperty: Property<TimePicker, Date>;
export const minuteIntervalProperty: Property<TimePicker, number>;

export const iosPreferredDatePickerStyleProperty: Property<TimePicker, number>;
