/**
 * Contains the ListPicker class.
 * @module "ui/list-picker"
 */ /** */

import { View, Property } from "../core/view";

/**
 * Represents an list picker.
 */
export class ListPicker extends View {
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

export interface ItemsSource {
    length: number;
    getItem(index: number): any;
}

export const selectedIndexProperty: Property<ListPicker, number>;
export const itemsProperty: Property<ListPicker, any[] | ItemsSource>;
