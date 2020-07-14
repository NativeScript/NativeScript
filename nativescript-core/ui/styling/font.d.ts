/**
 * @module "ui/styling/font"
 */ /** */

export class Font {
    public static default: Font;

    public fontFamily: string;
    public fontStyle: FontStyle;
    public fontWeight: FontWeight;
    public fontSize: number;

    public isBold: boolean;
    public isItalic: boolean;

    constructor(family: string, size: number, style: FontStyle, weight: FontWeight);

    public getAndroidTypeface(): any /* android.graphics.Typeface */;
    public getUIFont(defaultFont: any /* UIFont */): any /* UIFont */;

    public withFontFamily(family: string): Font;
    public withFontStyle(style: string): Font;
    public withFontWeight(weight: string): Font;
    public withFontSize(size: number): Font;

    public static equals(value1: Font, value2: Font): boolean;
}

export type FontStyle = "normal" | "italic";
export namespace FontStyle {
    export const NORMAL: "normal";
    export const ITALIC: "italic";
    export function isValid(value: any): boolean;
    export function parse(value: string): FontStyle;
}

export type FontWeight = "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900";
export namespace FontWeight {
    export const THIN: "100";
    export const EXTRA_LIGHT: "200";
    export const LIGHT: "300";
    export const NORMAL: "normal";
    export const MEDIUM: "500";
    export const SEMI_BOLD: "600";
    export const BOLD: "bold";
    export const EXTRA_BOLD: "800";
    export const BLACK: "900";
    export function isValid(value: any): boolean;
    export function parse(value: string): FontWeight;
}

export interface ParsedFont {
    fontStyle?: FontStyle;
    fontVariant?: string;
    fontWeight?: FontWeight,
    lineHeight?: string,
    fontSize?: string,
    fontFamily?: string
}

export function parseFont(fontValue: string): ParsedFont;

export module ios {
    export function registerFont(fontFile: string);
}
