declare module "ui/text-base" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import formattedString = require("text/formatted-string");

    /**
     * Represents the base class for all text views.
     */
    export class TextBase extends view.View implements view.AddChildFromBuilder, formattedString.FormattedStringView {

        /**
         * Dependency property used to support binding operations for the text of the current text-base instance.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Dependency property used to support binding operations for the formatted text of the current text-base instance.
         */
        public static formattedTextProperty: dependencyObservable.Property;

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
        formattedText: formattedString.FormattedString;

        /**
         * Called for every child element declared in xml.
         * This method will add a child element (value) to current element.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        _addChildFromBuilder(name: string, value: any): void;

        //@private
        _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData): void;
        _setFormattedTextPropertyToNative(value: any): void;
        /**
         * @private
         * Called when the text property is changed to request layout.
         */
        _requestLayoutOnTextChanged(): void;
        //@endprivate
    }
}