import { EditableTextBase } from '../editable-text-base';
import { Property } from '../core/properties';

export const secureProperty: Property<TextField, boolean>;

/**
 * Represents an editable text field.
 */
export class TextField extends EditableTextBase {
	public static returnPressEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/EditText.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.EditText */;

	/**
	 * Gets the native iOS [UITextField](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextField_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITextField */;

	/**
	 * Gets or sets if a text field is for password entry.
	 */
	secure: boolean;

	/**
	 * Gets or sets if a text field should dismiss on return.
	 */
	closeOnReturn: boolean;

	/**
	 * iOS only (to avoid 12+ auto suggested strong password handling)
	 */
	secureWithoutAutofill: boolean;

	/**
	 * iOS only update placeholder attributed text style
	 */
	_updateAttributedPlaceholder?(): void;
}
