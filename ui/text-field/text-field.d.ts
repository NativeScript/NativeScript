/**
 * Contains the TextField class, which represents an editable single-line box.
 */
declare module "ui/text-field" {
    import editableTextBase = require("ui/editable-text-base");

    /**
     * Represents an editable text field.
     */
    export class TextField extends editableTextBase.EditableTextBase {
        public static returnPressEvent: string;

        constructor(options?: editableTextBase.Options);
        
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
    }

    /**
     * Defines interface for an optional parameter used to create a editable-text-base component.
     */
    export interface Options extends editableTextBase.Options {
        /**
         * Gets or sets if a text field is for password entry.
         */
        secure?: boolean;
    }
} 
