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
        textAlignment: TextAlignment;

        /**
         * Gets or sets text decorations style property.
         */
        textDecoration: TextDecoration;

        /**
         * Gets or sets text transform style property.
         */
        textTransform: TextTransform;

        /**
         * Gets or sets white space style property.
         */
        whiteSpace: WhiteSpace;

        /**
         * Called for every child element declared in xml.
         * This method will add a child element (value) to current element.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        _addChildFromBuilder(name: string, value: any): void;

        /**
         * @private
         * Called when the text property is changed to request layout.
         */
        _requestLayoutOnTextChanged(): void;
        //@endprivate
    }

    export const textProperty: Property<TextBase, string>;
    export const formattedTextProperty: Property<TextBase, FormattedString>;

    export type TextAlignment = "left" | "center" | "right";
    export namespace TextAlignment {
        export const LEFT: "left";
        export const CENTER: "center";
        export const RIGHT: "right";
        export function isValid(value: any): boolean;
        export function parse(value: string): TextAlignment;
    }

    export type TextDecoration = "none" | "underline" | "line-through" | "underline line-through";
    export namespace TextDecoration {
        export const NONE: "none";
        export const UNDERLINE: "underline";
        export const LINE_THROUGH: "line-through";
        export const UNDERLINE_LINE_THROUGH: "underline line-through";
        export function isValid(value: any): boolean;
        export function parse(value: string): TextDecoration;
    }

    export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";
    export namespace TextTransform {
        export const NONE: "none";
        export const CAPITALIZE: "capitalize";
        export const UPPERCASE: "uppercase";
        export const LOWERCASE: "lowercase";
        export function isValid(value: any): boolean;
        export function parse(value: string): TextTransform;
    }

    export type WhiteSpace = "normal" | "nowrap";
    export namespace WhiteSpace {
        export const NORMAL: "normal";
        export const NO_WRAP: "nowrap";
        export function isValid(value: any): boolean;
        export function parse(value: string): WhiteSpace;
    }

    export const textAlignmentProperty: InheritedCssProperty<Style, TextAlignment>;
    export const textDecorationProperty: CssProperty<Style, TextDecoration>;
    export const textTransformProperty: CssProperty<Style, TextTransform>;
    export const whiteSpaceProperty: CssProperty<Style, WhiteSpace>;
    export const letterSpacingProperty: CssProperty<Style, number>;

    //Used by tab view
    export function getTransformedText(text: string, textTransform: TextTransform): string;
}