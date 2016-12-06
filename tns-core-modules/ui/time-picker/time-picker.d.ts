/**
 * Contains the TimePicker class.
 */
declare module "ui/time-picker" {
    import { View, Property } from "ui/core/view";

    /**
     * Represents an time picker.
     */
    export class TimePicker extends View {
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
         */
        hour: number;

        /**
         * Gets or sets the time minute.
         */
        minute: number;

        /**
         * Gets or sets the time.
         */
        time: Date;

        /**
         * Gets or sets the max time hour.
         */
        maxHour: number;

        /**
         * Gets or sets the max time minute.
         */
        maxMinute: number;

        /**
         * Gets or sets the min time hour.
         */
        minHour: number;

        /**
         * Gets or sets the min time minute.
         */
        minMinute: number;

        /**
         * Gets or sets the minute interval.
         */
        minuteInterval: number;
    }

    export let hourProperty: Property<TimePicker, number>;
    export let maxHourProperty: Property<TimePicker, number>;
    export let minHourProperty: Property<TimePicker, number>;

    export let minuteProperty: Property<TimePicker, number>;
    export let maxMinuteProperty: Property<TimePicker, number>;
    export let minMinuteProperty: Property<TimePicker, number>;

    export let timeProperty: Property<TimePicker, Date>;
    export let minuteIntervalProperty: Property<TimePicker, number>;
}