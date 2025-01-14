import { View } from '../core/view';
import { Property } from '../core/properties';
import { ItemsSource } from './list-picker-common';

/**
 * Represents an list picker.
 *
 * @nsView ListPicker
 */
export class ListPicker extends View {
	/**
	 * @nsEvent {PropertyChangeData} selectedIndexChange
	 */
	public static selectedIndexChangeEvent: string;

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
	 *
	 * @nsProperty
	 */
	selectedIndex: number;

	/**
	 * Gets or set the items collection of the ListPicker.
	 * The items property can be set to an array or an object defining length and getItem(index) method.
	 *
	 * @nsProperty
	 */
	items: any[] | ItemsSource;
}

export const selectedIndexProperty: Property<ListPicker, number>;
export const itemsProperty: Property<ListPicker, any[] | ItemsSource>;
