/**
 * Contains the Switch class, which represents a standard switch component.
 */
declare module "ui/switch" {
    import { View, Property } from "ui/core/view";

    /**
     * Represents a switch component.
     */
    export class Switch extends View {

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

    /**
     * Represents the observable property backing the checked property of each Switch instance.
     */
    export const checkedProperty: Property<Switch, boolean>;
}