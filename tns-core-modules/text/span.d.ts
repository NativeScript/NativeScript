declare module "text/span" {
    import colorModule = require("color");
    import bindable = require("ui/core/bindable");
    import formattedString = require("text/formatted-string");

    /**
     * A class used to create a single part of formatted string with a common text properties.
     */
    class Span extends bindable.Bindable {
        /**
         * Gets or sets the font family of the span.
         */
        public fontFamily: string;

        /**
         * Gets or sets the font size of the span.
         */
        public fontSize: number;

        /**
         * Gets or sets the font attributes of the span.
         * It could be set to more than one value e.g. (Bold | Italic).
         */
        public fontAttributes: number;

        /**
         * Gets or sets the font foreground color of the span.
         */
        public foregroundColor: colorModule.Color;

        /**
         * Gets or sets the font background color of the span.
         */
        public backgroundColor: colorModule.Color;

        /**
         * Gets or sets underline for the span.
         */
        public underline: number;

        /**
         * Gets or sets strikethrough for the span.
         */
        public strikethrough: number;

        /**
         * A collection of modifiers build upon all text related properties.
         */
        public spanModifiers: Array<any>;

        /**
         * Gets or sets the text for the span.
         */
        public text: string;

        /**
         * An instance of the parent formatted string (used internally to support some short hand property settings).
         */
        public parentFormattedString: formattedString.FormattedString;

        /**
         * Updates all span modifiers according to current values of all text related properties.
         */
        public updateSpanModifiers(parent: formattedString.FormattedString): void;

        /**
         * Initializes a process of updating a span (text related property(s)).
         */
        public beginEdit(): void;

        /**
         * Ends the process previously initiated by beginEdit and updates the span modifiers collection.
         */
        public endEdit(): void;
    }
}