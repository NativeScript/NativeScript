/**
 * Contains the Progress class, which represents a component capable of showing progress.
 */
declare module "ui/progress" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a progress component.
     */
    export class Progress extends view.View {
        /**
         * Represents the observable property backing the value property of each Progress instance.
         */
        public static valueProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the maxValue property of each Progress instance.
         */
        public static maxValueProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.widget.ProgressBar;

        /**
         * Gets the native iOS [UIProgressView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIProgressView_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UIProgressView;

        /**
         * Gets or sets a progress current value.
         */
        value: number;

        /**
         * Gets or sets a progress max value.
         */
        maxValue: number;
    }
}