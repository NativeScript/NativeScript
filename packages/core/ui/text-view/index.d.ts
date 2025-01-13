﻿import { EditableTextBase } from '../editable-text-base';
import { Property } from '../core/properties';

/**
 * Represents an editable multiline text view.
 *
 * @nsView TextView
 */
export class TextView extends EditableTextBase {
	/**
	 * String value used when hooking to the returnPress event.
	 *
	 * @nsEvent returnPress
	 */
	public static returnPressEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/EditText.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.EditText */;

	/**
	 * Gets the native iOS [UITextView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITextView */;

	/**
	 * Limits input to a certain number of lines.
	 *
	 * @nsProperty
	 */
	maxLines: number;
}

export const maxLinesProperty: Property<EditableTextBase, number>;
