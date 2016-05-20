/**
 * Contains the ListPicker class.
 */
declare module "ui/list-picker" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents an list picker.
     */
    export class ListPicker extends view.View {
        public static selectedIndexProperty: dependencyObservable.Property;
        public static itemsProperty: dependencyObservable.Property;

        constructor();

        /**
         * Gets the native [android.widget.NumberPicker](http://developer.android.com/reference/android/widget/NumberPicker.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.NumberPicker */;

        /**
         * Gets the native iOS [UIPickerView](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UIPickerView */;

        /**
         * Gets or sets the selected index.
         */
        selectedIndex: number;

        /**
         * Gets or set the items collection of the ListPicker. 
         * The items property can be set to an array or an object defining length and getItem(index) method.
         */
        items: any;
    }
} 
