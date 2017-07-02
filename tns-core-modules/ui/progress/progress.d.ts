/**
 * Contains the Progress class, which represents a component capable of showing progress.
 * @module "ui/progress"
 */ /** */

import { View, Property } from "../core/view";

/**
 * Represents a progress component.
 */
export class Progress extends View {
    /**
     * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
     */
    android: any /* android.widget.ProgressBar */;

    /**
     * Gets the native iOS [UIProgressView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIProgressView_Class/) that represents the user interface for this component. Valid only when running on iOS.
     */
    ios: any /* UIProgressView */;

    /**
     * Gets or sets a progress current value.
     */
    value: number;

    /**
     * Gets or sets a progress max value.
     */
    maxValue: number;
}

/**
 * Represents the observable property backing the value property of each Progress instance.
 */
export const valueProperty: Property<Progress, number>;

/**
 * Represents the observable property backing the maxValue property of each Progress instance.
 */
export const maxValueProperty: Property<Progress, number>;
