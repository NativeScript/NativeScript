/**
 * Contains the DatePicker class.
 */
declare module "ui/date-picker" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents an date picker.
     */
    export class DatePicker extends view.View {
        public static yearProperty: dependencyObservable.Property;
        public static monthProperty: dependencyObservable.Property;
        public static dayProperty: dependencyObservable.Property;

        constructor();

        /**
         * Gets the native [android.widget.DatePicker](http://developer.android.com/reference/android/widget/DatePicker.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.widget.DatePicker;

        /**
         * Gets the native iOS [UIDatePicker](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UIDatePicker;

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
    }
} 