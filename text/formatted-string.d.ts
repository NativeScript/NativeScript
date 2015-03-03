/**
 * Contains the FormattedString and Span classes, which are used to create a formatted (rich text) strings.
 */
declare module "text/formatted-string" {
    import spanModule = require("text/span");
    import observable = require("data/observable");
    import observableArray = require("data/observable-array");
    import colorModule = require("color");

    /**
     * A class used to create a formatted (rich text) string.
     */
    class FormattedString extends observable.Observable {
        /**
         * An observable collection of Span objects used to define common text properties.
         */
        public spans: observableArray.ObservableArray<spanModule.Span>;

        /**
         * Initializes a new instance of FormattedString class.
         */
        constructor();

        /**
         * A human readable representation of the formatted string.
         */
        public toString(): string;

        /**
         * Gets or sets the font family which will be used for all spans that not have a specific value for font family.
         */
        public fontFamily: string;

        /**
         * Gets or sets the font size which will be used for all spans that not have a specific value for font size.
         */
        public fontSize: number;

        /**
         * Gets or sets the font attributes which will be used for all spans that not have a specific value for font attributes.
         */
        public fontAttributes: number;

        /**
         * Gets or sets the font foreground color which will be used for all spans that not have a specific value for font foreground color.
         */
        public foregroundColor: colorModule.Color;

        /**
         * Gets or sets the font background color which will be used for all spans that not have a specific value for font background color.
         */
        public backgroundColor: colorModule.Color;

        /**
         * Gets or sets underline which will be used for all spans that not have a specific value for underline.
         */
        public underline: number;

        /**
         * Gets or sets strikethrough which will be used for all spans that not have a specific value for strikethrough.
         */
        public strikethrough: number;

        /**
         * Propogates binding context through the spans collection.
         * @param newBindingContext The value of the newly set binding context.
         */
        public updateSpansBindingContext(newBindingContext: any): void
    }
}