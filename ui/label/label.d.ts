/**
 * Contains the Label class, which represents a standard label widget.
 */
declare module "ui/label" {
    import dependencyObservable = require("ui/core/dependency-observable");
    import textBase = require("ui/text-base");

    /**
     * Represents a text label.
     */
    export class Label extends textBase.TextBase {

        /**
         * Dependency property used to support binding operations for the text wrapping of the current label instance.
         */
        public static textWrapProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/TextView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.TextView */;

        /**
         * Gets the native [UILabel](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UILabel_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UILabel */;

        /**
         * Gets or sets whether the Label wraps text or not.
         */
        textWrap: boolean;
    }
}