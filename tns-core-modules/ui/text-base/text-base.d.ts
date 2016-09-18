declare module "ui/text-base" {
    import {View, AddChildFromBuilder} from "ui/core/view";
    import {FormattedString, FormattedStringView} from "text/formatted-string";
    import {Property} from "ui/core/properties";

    /**
     * Represents the base class for all text views.
     */
    export class TextBase extends View implements AddChildFromBuilder, FormattedStringView {
        // /**
        //  * Dependency property used to support binding operations for the text of the current text-base instance.
        //  */
        // public static textProperty: dependencyObservable.Property;

        // /**
        //  * Dependency property used to support binding operations for the formatted text of the current text-base instance.
        //  */
        // public static formattedTextProperty: dependencyObservable.Property;

        /**
         * Gets or sets the text.
         */
        text: string;

        /**
         * Gets or sets text-alignment style property.
         */
        textAlignment: string;

        /**
         * Gets or sets font-size style property.
         */
        fontSize: number;

        /**
         * Gets or sets a formatted string.
         */
        formattedText: FormattedString;

        /**
         * Called for every child element declared in xml.
         * This method will add a child element (value) to current element.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        _addChildFromBuilder(name: string, value: any): void;

        //@private
        _onTextPropertyChanged(value: string): void;
        _setFormattedTextPropertyToNative(value: any): void;
        /**
         * @private
         * Called when the text property is changed to request layout.
         */
        _requestLayoutOnTextChanged(): void;
        //@endprivate
    }

    export let textProperty: Property<TextBase, string>;
    export let formattedTextProperty: Property<TextBase, FormattedString>;
}