/**
 * Contains the DatePicker class.
 * @module "ui/date-picker"
 */ /** */

import { View, Property } from "../core/view";

export const yearProperty: Property<DatePicker, number>;
export const monthProperty: Property<DatePicker, number>;
export const dayProperty: Property<DatePicker, number>;
export const dateProperty: Property<DatePicker, Date>;
export const maxDate: Property<DatePicker, Date>;
export const minDate: Property<DatePicker, Date>;

/**
 * Represents an date picker.
 */
export class DatePicker extends View {
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
     */
    year: number;

    /**
     * Gets or sets the month. The months start from 1.
     */
    month: number;

    /**
     * Gets or sets the day. The days start from 1.
     */
    day: number;

    /**
     * Gets or sets the entire date.
     */
    date: Date;

    /**
     * Gets or sets the max date.
     */
    maxDate: Date;

    /**
     * Gets or sets the min date.
     */
    minDate: Date;
}
