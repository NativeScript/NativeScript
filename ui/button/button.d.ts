/**
 * Contains the Button class, which represents a standard button widget.
 */
declare module "ui/button" {
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");
    import view = require("ui/core/view");
    import formattedString = require("text/formatted-string");

    /**
     * Known event names.
     */
    export module knownEvents {
        export var tap: string;
    }

    /**
     * Represents a standard Button widget.
     */
    export class Button extends view.View {
        /**
         * Represents the observable property backing the text property of each Button instance.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/Button.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.widget.Button;

        /**
         * Gets the native [UIButton](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIButton_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UIButton;

        /**
         * Gets or sets the text (label) displayed by this instance.
         */
        text: string;

        /**
         * Gets or sets the formatted text (label) displayed by this instance.
         */
        formattedText: formattedString.FormattedString;

        on(event: string, callback: (data: observable.EventData) => void);
        on(event: "tap", callback: (args: observable.EventData) => void);
    }
}