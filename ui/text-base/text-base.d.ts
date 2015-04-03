declare module "ui/text-base" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import formattedString = require("text/formatted-string");

    /**
     * Represents the base class for all text views.
     */
    export class TextBase extends view.View {

        /**
         * Dependency property used to support binding operations for the text of the current text-base instance.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Dependency property used to support binding operations for the formatted text of the current text-base instance.
         */
        public static formattedTextProperty: dependencyObservable.Property;

        constructor(options?: Options);

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
    }

    /**
     * Defines interface for an optional parameter used to create a text-base component.
     */
    export interface Options extends view.Options {
        /**
         * Gets or sets the text.
         */
        text?: string;
    }
}