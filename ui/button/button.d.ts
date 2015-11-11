/**
 * Contains the Button class, which represents a standard button widget.
 */
declare module "ui/button" {
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");
    import view = require("ui/core/view");
    import formattedString = require("text/formatted-string");

    /**
     * Represents a standard Button widget.
     */
    export class Button extends view.View implements formattedString.FormattedStringView, view.AddChildFromBuilder {
        /**
         * Represents the observable property backing the text property of each Button instance.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Dependency property used to support binding operations for the text wrapping of the current button instance.
         */
        public static textWrapProperty: dependencyObservable.Property;

        /**
         * String value used when hooking to tap event.
         */
        public static tapEvent: string;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/Button.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.Button */;

        /**
         * Gets the native [UIButton](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIButton_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UIButton */;

        /**
         * Gets or sets the text (label) displayed by this instance.
         */
        text: string;

        /**
         * Gets or sets whether the Button wraps text or not.
         */
        textWrap: boolean;

        /**
         * Gets or sets the formatted text (label) displayed by this instance.
         */
        formattedText: formattedString.FormattedString;

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when a tap event occurs.
         */
        on(event: "tap", callback: (args: observable.EventData) => void, thisArg?: any);

        /**
         * Called for every child element declared in xml.
         * This method will add a child element (value) to current element.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        _addChildFromBuilder(name: string, value: any): void;
    }
}
