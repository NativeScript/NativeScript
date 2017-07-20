/**
 * Contains the Slider class, which represents a standard slider component.
 * @module "ui/slider"
 */ /** */

import { View, Property, CoercibleProperty } from "../core/view";

/**
 * Represents a slider component.
 */
export class Slider extends View {
    /**
     * Gets the native [android widget](http://developer.android.com/reference/android/widget/SeekBar.html) that represents the user interface for this component. Valid only when running on Android OS.
     */
    android: any /* android.widget.SeekBar */;

    /**
     * Gets the native iOS [UISlider](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISlider_Class/) that represents the user interface for this component. Valid only when running on iOS.
     */
    ios: any /* UISlider */;

    /**
     * Gets or sets a slider current value. The default value is 0.
     */
    value: number;

    /**
     * Gets or sets a slider min value. The default value is 0.
     */
    minValue: number;

    /**
     * Gets or sets a slider max value. The default value is 100.
     */
    maxValue: number;
}

/**
 * Represents the observable property backing the value property of each Slider instance.
 */
export const valueProperty: CoercibleProperty<Slider, number>;

/**
 * Represents the observable property backing the minValue property of each Slider instance.
 */
export const minValueProperty: Property<Slider, number>;

/**
 * Represents the observable property backing the maxValue property of each Slider instance.
 */
export const maxValueProperty: CoercibleProperty<Slider, number>;
