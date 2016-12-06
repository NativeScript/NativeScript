declare module "ui/editable-text-base" {
    import { TextBase, Property, CssProperty, Style, Color } from "ui/text-base";

    export const keyboardTypeProperty: Property<EditableTextBase, string>;
    export const returnKeyTypeProperty: Property<EditableTextBase, string>;
    export const editableProperty: Property<EditableTextBase, boolean>;
    export const updateTextTriggerProperty: Property<EditableTextBase, string>;
    export const autocapitalizationTypeProperty: Property<EditableTextBase, string>;
    export const autocorrectProperty: Property<EditableTextBase, boolean>;
    export const hintProperty: Property<EditableTextBase, string>;
    export const placeholderColorProperty: CssProperty<Style, Color>;

    /**
     * Represents the base class for all editable text views.
     */
    export class EditableTextBase extends TextBase {
        /**
         * Gets or sets the soft keyboard type. Possible values are contained in the [KeyboardType enumeration](../enums/KeyboardType/README.md).
         */
        keyboardType: "datetime" | "phone" | "number" | "url" | "email";

        /**
         * Gets or sets the soft keyboard return key flavor. Possible values are contained in the [ReturnKeyType enumeration](../enums/ReturnKeyType/README.md).
         */
        returnKeyType: "done" | "next" | "go" | "search" | "send";

        /**
         * Gets or sets a value indicating when the text property will be updated. 
         * Possible values are contained in the [UpdateTextTrigger enumeration](../enums/UpdateTextTrigger/README.md).
         */
        updateTextTrigger: "focusLost" | "textChanged";

        /**
         * Gets or sets the autocapitalization type. Possible values are contained in the [AutocapitalizationType enumeration](../enums/AutocapitalizationType/README.md).
         */
        autocapitalizationType: "none" | "words" | "sentences" | "allCharacters";

        /**
         * Gets or sets whether the instance is editable.
         */
        editable: boolean;

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

    export * from "ui/text-base";
}