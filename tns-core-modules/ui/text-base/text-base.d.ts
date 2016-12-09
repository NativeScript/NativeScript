declare module "ui/text-base" {
    import { View, AddChildFromBuilder, Property, CssProperty, InheritedCssProperty, Style } from "ui/core/view";
    import { FormattedString, FormattedStringView } from "text/formatted-string";

    export * from "ui/core/view";
    export { FormattedString, FormattedStringView } from "text/formatted-string";

    /**
     * Represents the base class for all text views.
     */
    export class TextBase extends View implements AddChildFromBuilder, FormattedStringView {
        /**
         * Gets or sets the text.
         */
        text: string;

        /**
         * Gets or sets a formatted string.
         */
        formattedText: FormattedString;

        /**
         * Gets or sets font-size style property.
         */
        fontSize: number;

        /**
         * Gets or sets letterSpace style property.
         */
        letterSpacing: number;

        /**
         * Gets or sets text-alignment style property.
         */
        textAlignment: "left" | "center" | "right";

        /**
         * Gets or sets text decorations style property.
         */
        textDecoration: "none" | "underline" | "lineThrough";

        /**
         * Gets or sets text transform style property.
         */
        textTransform: "none" | "capitalize" | "uppercase" | "lowercase";

        /**
         * Gets or sets white space style property.
         */
        whiteSpace: "normal" | "nowrap";

        /**
         * Called for every child element declared in xml.
         * This method will add a child element (value) to current element.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        _addChildFromBuilder(name: string, value: any): void;

        //@private
        // _onTextPropertyChanged(value: string): void;
        // _setFormattedTextPropertyToNative(value: any): void;
        /**
         * @private
         * Called when the text property is changed to request layout.
         */
        _requestLayoutOnTextChanged(): void;
        //@endprivate
    }

    export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";

    export function getTransformedText(text: string, transform: TextTransform): string;

    export const textProperty: Property<TextBase, string>;
    export const formattedTextProperty: Property<TextBase, FormattedString>;

    export const textAlignmentProperty: InheritedCssProperty<Style, "left" | "center" | "right">;
    export const textDecorationProperty: CssProperty<Style, "none" | "underline" | "line-through">;
    export const textTransformProperty: CssProperty<Style, TextTransform>;
    export const whiteSpaceProperty: CssProperty<Style, "normal" | "nowrap">;
    export const letterSpacingProperty: CssProperty<Style, number>;
}