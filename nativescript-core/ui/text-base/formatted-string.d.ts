/**
 * Contains the FormattedString and Span classes, which are used to create a formatted (rich text) strings.
 * @module "ui/text-base/formatted-string"
 */ /** */

import { Span } from "./span";
import { ObservableArray } from "../../data/observable-array";
import { ViewBase } from "../core/view";
import { Color } from "../../color";
import { FontStyle, FontWeight } from "../styling/font";
import { TextDecoration } from "../text-base";

export { Span };

/**
 * A class used to create a formatted (rich text) string.
 */
export class FormattedString extends ViewBase {

    /**
     * An observable collection of Span objects used to define common text properties.
     */
    public spans: ObservableArray<Span>;

    /**
     * A human readable representation of the formatted string.
     */
    public toString(): string;

    /**
     * Gets or sets the font family which will be used for all spans that doesn't have a specific value.
     */
    public fontFamily: string;

    /**
     * Gets or sets the font size which will be used for all spans that doesn't have a specific value.
     */
    public fontSize: number;

    /**
     * Gets or sets the font style which will be used for all spans that doesn't have a specific value.
     */
    public fontStyle: FontStyle;

    /**
     * Gets or sets the font weight which will be used for all spans that doesn't have a specific value.
     */
    public fontWeight: FontWeight;

    /**
     * Gets or sets text decorations which will be used for all spans that doesn't have a specific value.
     */
    public textDecoration: TextDecoration;

    /**
     * Gets or sets the font foreground color which will be used for all spans that doesn't have a specific value.
     */
    public color: Color;

    /**
     * Gets or sets the font background color which will be used for all spans that doesn't have a specific value.
     */
    public backgroundColor: Color;
}
