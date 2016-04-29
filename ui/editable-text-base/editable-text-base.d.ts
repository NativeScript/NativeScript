declare module "ui/editable-text-base" {
    import dependencyObservable = require("ui/core/dependency-observable");
    import textBase = require("ui/text-base");

    /**
     * Represents the base class for all editable text views.
     */
    export class EditableTextBase extends textBase.TextBase {
        public static keyboardTypeProperty: dependencyObservable.Property;
        public static returnKeyTypeProperty: dependencyObservable.Property;
        public static editableProperty: dependencyObservable.Property;
        public static updateTextTriggerProperty: dependencyObservable.Property;
        public static autocapitalizationTypeProperty: dependencyObservable.Property;
        public static autocorrectProperty: dependencyObservable.Property;

        /**
         * Gets or sets the soft keyboard type. Possible values are contained in the [KeyboardType enumeration](../enums/KeyboardType/README.md).
         */
        keyboardType: string;

        /**
         * Gets or sets the soft keyboard return key flavor. Possible values are contained in the [ReturnKeyType enumeration](../enums/ReturnKeyType/README.md).
         */
        returnKeyType: string;

        /**
         * Gets or sets whether the instance is editable.
         */
        editable: boolean;

        /**
         * Gets or sets a value indicating when the text property will be updated. 
         * Possible values are contained in the [UpdateTextTrigger enumeration](../enums/UpdateTextTrigger/README.md).
         */
        updateTextTrigger: string;

        /**
         * Gets or sets the autocapitalization type. Possible values are contained in the [AutocapitalizationType enumeration](../enums/AutocapitalizationType/README.md).
         */
        autocapitalizationType: string;

        /**
         * Enables or disables autocorrection.
         */
        autocorrect: boolean;

        /**
         * Gets or sets the placeholder text.
         */
        hint: string;

        /**
         * Hides the soft input method, ususally a soft keyboard.
         */
        dismissSoftInput(): void;
    }
}