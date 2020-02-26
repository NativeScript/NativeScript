/**
 * Contains the TextView class, which represents an editable multi-line line box.
 * @module "ui/text-view"
 */ /** */

import { EditableTextBase } from "../editable-text-base";
import { Property } from "../text-base";

/**
 * Represents an editable multiline text view.
 */
export class TextView extends EditableTextBase {
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
     */
    maxLines: number;
}

export const maxLinesProperty: Property<EditableTextBase, number>;
