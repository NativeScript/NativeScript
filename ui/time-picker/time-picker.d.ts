/**
 * Contains the TimePicker class.
 */
declare module "ui/time-picker" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import native_api = require("native-api");

    /**
     * Represents an time picker.
     */
    export class TimePicker extends view.View {
        public static hourProperty: dependencyObservable.Property;
        public static minuteProperty: dependencyObservable.Property;

        constructor();

        /**
         * Gets the native [android.widget.TimePicker](http://developer.android.com/reference/android/widget/TimePicker.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: native_api.android.widget.TimePicker;

        /**
         * Gets the native iOS [UIDatePicker](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: native_api.UIDatePicker;

        /**
         * Gets or sets the time hour.
         */
        hour: number;

        /**
         * Gets or sets the time minute.
         */
        minute: number;
    }
} 
