/**
 * Contains the HtmlView class, which represents a standard html view widget.
 */
declare module "ui/html-view" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a view with html content.
     */
    export class HtmlView extends view.View {

        /**
         * Dependency property used to support binding operations for the html of the current HtmlView instance.
         */
        public static htmlProperty: dependencyObservable.Property;

        constructor(options?: Options);

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/TextView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.widget.TextView;

        /**
         * Gets the native [UILabel](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UILabel_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UILabel;

        /**
         * Gets or sets html string for the HtmlView.
         */
        html: string;
    }

    /**
     * Provides a set of most common options for creating a HtmlView.
     */
    export interface Options extends view.Options {
        /**
         * Gets or sets the html content of a HtmlView.
         */
        html?: string;
    }
}