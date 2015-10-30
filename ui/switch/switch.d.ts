/**
 * Contains the Switch class, which represents a standard switch component.
 */
declare module "ui/switch" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a switch component.
     */
    export class Switch extends view.View {

        /**
         * Represents the observable property backing the checked property of each Switch instance.
         */
        public static checkedProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/Switch.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.Switch */;

        /**
         * Gets the native iOS [UISwitch](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISwitch_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UISwitch */;

        /**
         * Gets or sets if a switch is checked or not.
         */
        checked: boolean;
    }
}
