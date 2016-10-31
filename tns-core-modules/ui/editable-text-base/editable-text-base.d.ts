declare module "ui/editable-text-base" {
    import { Property } from "ui/core/properties";
    import { TextBase } from "ui/text-base";

    export let keyboardTypeProperty: Property<EditableTextBase, string>;
    export let returnKeyTypeProperty: Property<EditableTextBase, string>;
    export let editableProperty: Property<EditableTextBase, boolean>;
    export let updateTextTriggerProperty: Property<EditableTextBase, string>;
    export let autocapitalizationTypeProperty: Property<EditableTextBase, string>;
    export let autocorrectProperty: Property<EditableTextBase, boolean>;
    export let hintProperty: Property<EditableTextBase, string>;

    /**
     * Represents the base class for all editable text views.
     */
    export class EditableTextBase extends TextBase {
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