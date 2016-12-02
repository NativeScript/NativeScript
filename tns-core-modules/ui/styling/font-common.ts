import { Font as FontDefinition, ParsedFont } from "ui/styling/font";

export abstract class FontBase implements FontDefinition {
    public static default = undefined;

    private _fontFamily: string;
    private _fontStyle: "normal" | "italic";
    private _fontWeight: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900";
    private _fontSize: number;

    get fontFamily(): string {
        return this._fontFamily;
    }

    get fontStyle(): "normal" | "italic" {
        return this._fontStyle;
    }

    get fontWeight(): "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900" {
        return this._fontWeight;
    }

    get fontSize(): number {
        return this._fontSize;
    }

    get isBold(): boolean {
        return this._fontWeight.toLowerCase() === "bold"
            || this._fontWeight.toLowerCase() === "700";
    }

    get isItalic(): boolean {
        return this._fontStyle.toLowerCase() === "italic";
    }

    protected constructor(family: string, size: number, style: "normal" | "italic", weight: "100" | "200" | "300" | "normal" | "400" | "500" | "600" | "bold" | "700" | "800" | "900") {
        this._fontFamily = family;
        this._fontSize = size;
        this._fontStyle = style;
        this._fontWeight = weight;
    }

    public abstract getAndroidTypeface(): android.graphics.Typeface;
    public abstract getUIFont(defaultFont: UIFont): UIFont;
    public abstract withFontFamily(family: string): FontBase;
    public abstract withFontStyle(style: string): FontBase;
    public abstract withFontWeight(weight: string):FontBase;
    public abstract withFontSize(size: number): FontBase;

    public static equals(value1: FontBase, value2: FontBase): boolean {
        // both values are falsy
        if (!value1 && !value2) {
            return true;
        }

        // only one is falsy
        if (!value1 || !value2) {
            return false;
        }

        return value1.fontFamily === value2.fontFamily &&
            value1.fontSize === value2.fontSize &&
            value1.fontStyle === value2.fontStyle &&
            value1.fontWeight === value2.fontWeight;
    }
}

export function parseFontFamily(value: string): Array<string> {
    const result = new Array<string>();
    if (!value) {
        return result;
    }

    const split = value.split(",");
    for (let i = 0; i < split.length; i++) {
        let str = split[i].trim().replace(/['"]+/g, '');
        if (str) {
            result.push(str);
        }
    }
    return result;
}

export module genericFontFamilies {
    export const serif = "serif";
    export const sansSerif = "sans-serif";
    export const monospace = "monospace";
    export const system = "system";
}

const styles = new Set();
["italic", "oblique"].forEach((val, i, a) => styles.add(val));

// http://www.w3schools.com/cssref/pr_font_weight.asp
//- normal(same as 400)
//- bold(same as 700)
//- 100(Thin) (API16 -thin)
//- 200(Extra Light / Ultra Light) (API16 -light)
//- 300(Light) (API16 -light)
//- 400(Normal) 
//- 500(Medium) (API21 -medium)
//- 600(Semi Bold / Demi Bold) (API21 -medium)
//- 700(Bold) (API16 -bold)
//- 800(Extra Bold / Ultra Bold) (API16 -bold)
//- 900(Black / Heavy) (API21 -black)
const weights = new Set();
["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"].forEach((val, i, a) => weights.add(val));

export function parseFont(fontValue: string): ParsedFont {
    let result: ParsedFont = {
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: "normal"
    }

    const parts = fontValue.split(/\s+/);
    let part: string;
    while (part = parts.shift()) {
        if (part === "normal") {
            // nothing to do here
        }
        else if (part === "small-caps") {
            // The only supported font variant in shorthand font
            result.fontVariant = part;
        }
        else if (styles.has(part)) {
            result.fontStyle = <any>part;
        }
        else if (weights.has(part)) {
            result.fontWeight = <any>part;
        }
        else if (!result.fontSize) {
            let sizes = part.split("/");
            result.fontSize = sizes[0];
            result.lineHeight = sizes.length > 1 ? sizes[1] : undefined;
        }
        else {
            result.fontFamily = part;
            if (parts.length) {
                result.fontFamily += " " + parts.join(" ");
            }
            break;
        }
    }

    return result;
}