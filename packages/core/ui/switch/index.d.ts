import { View } from '../core/view';
import { Property } from '../core/properties';
import { Color } from '../../color';

/**
 * Represents a switch component.
 */
export class Switch extends View {
	public static checkedChangeEvent: string;

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

	/**
	 * Gets or sets the background color of the Switch when it is turned off.
	 */
	offBackgroundColor: Color;
}

/**
 * Represents the observable property backing the checked property of each Switch instance.
 */
export const checkedProperty: Property<Switch, boolean>;
