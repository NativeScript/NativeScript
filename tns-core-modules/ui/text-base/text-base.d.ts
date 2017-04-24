/**
 * @module "ui/text-base"
 */ /** */

import { View, AddChildFromBuilder, Property, CssProperty, InheritedCssProperty, Style, Length } from "../core/view";
import { FormattedString } from "../../text/formatted-string";

export * from "../core/view";
export { FormattedString } from "../../text/formatted-string";

export class TextBase extends View implements AddChildFromBuilder {
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
     * Gets or sets padding style property.
     */
    padding: string | Length;

    /**
     * Specify the bottom padding of this layout.
     */
    paddingBottom: Length;

    /**
     * Specify the left padding of this layout.
     */
    paddingLeft: Length;

    /**
     * Specify the right padding of this layout.
     */
    paddingRight: Length;

    /**
     * Specify the top padding of this layout.
     */
    paddingTop: Length;
    
    /**
     * Called for every child element declared in xml.
     * This method will add a child element (value) to current element.
     * @private
     * @param name - Name of the element.
     * @param value - Value of the element.
     */
    _addChildFromBuilder(name: string, value: any): void;

    //@private
    /**
     * Called when the text property is changed to request layout.
     * @private
     */
    _requestLayoutOnTextChanged(): void;

    /**
     * @private
     */
    _setNativeText(): void;
    //@endprivate
}

export const textProperty: Property<TextBase, string>;
export const formattedTextProperty: Property<TextBase, FormattedString>;

export type WhiteSpace = "initial" | "normal" | "nowrap";
export type TextAlignment = "initial" | "left" | "center" | "right";
export type TextTransform = "initial" | "none" | "capitalize" | "uppercase" | "lowercase";
export type TextDecoration = "none" | "underline" | "line-through" | "underline line-through";

export const textAlignmentProperty: InheritedCssProperty<Style, TextAlignment>;
export const textDecorationProperty: CssProperty<Style, TextDecoration>;
export const textTransformProperty: CssProperty<Style, TextTransform>;
export const whiteSpaceProperty: CssProperty<Style, WhiteSpace>;
export const letterSpacingProperty: CssProperty<Style, number>;

//Used by tab view
export function getTransformedText(text: string, textTransform: TextTransform): string;
