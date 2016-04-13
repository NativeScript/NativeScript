import enums = require("ui/enums");
import definitios = require("ui/styling/font");
import * as converters from "./converters";

export class Font implements definitios.Font {
    public static default = undefined;

    private _fontFamily: string;
    private _fontStyle: string;
    private _fontWeight: string;
    private _fontSize: number;

    get fontFamily(): string {
        return this._fontFamily;
    }
    set fontFamily(value: string) {
        throw new Error("fontFamily is read-only");
    }

    get fontStyle(): string {
        return this._fontStyle;
    }
    set fontStyle(value: string) {
        throw new Error("fontStyle is read-only");
    }

    get fontWeight(): string {
        return this._fontWeight;
    }
    set fontWeight(value: string) {
        throw new Error("fontWeight is read-only");
    }

    get fontSize(): number {
        return this._fontSize;
    }
    set fontSize(value: number) {
        throw new Error("fontSize is read-only");
    }

    get isBold(): boolean {
        return this._fontWeight.toLowerCase() === enums.FontWeight.bold;;
    }
    set isBold(value: boolean) {
        throw new Error("isBold is read-only");
    }

    get isItalic(): boolean {
        return this._fontStyle.toLowerCase() === enums.FontStyle.italic;;
    }
    set isItalic(value: boolean) {
        throw new Error("isItalic is read-only");
    }

    constructor(family: string, size: number, style: string, weight: string) {
        this._fontFamily = family;
        this._fontSize = size;
        this._fontStyle = style;
        this._fontWeight = weight;
    }

    public getAndroidTypeface(): android.graphics.Typeface {
        return undefined;
    }

    public getUIFont(defaultFont: UIFont): UIFont {
        return undefined;
    }

    public withFontFamily(family: string): Font {
        throw new Error("This should be called on the derived class");
    }

    public withFontStyle(style: string): Font {
        throw new Error("This should be called on the derived class");
    }

    public withFontWeight(weight: string): Font {
        throw new Error("This should be called on the derived class");
    }

    public withFontSize(size: number): Font {
        throw new Error("This should be called on the derived class");
    }

    public static equals(value1: Font, value2: Font): boolean {
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

    public static parse(cssValue: string): Font {
        var parsed = parseFont(cssValue);

        var size = converters.fontSizeConverter(parsed.fontSize);
        size = !!size ? size : undefined;

        return new Font(parsed.fontFamily, size, parsed.fontStyle, parsed.fontWeight);
    }
}

export function parseFontFamily(value: string): Array<string> {
    var result = new Array<string>();
    if (!value) {
        return result;
    }

    var split = value.split(",");
    for (var i = 0; i < split.length; i++) {
        var str = split[i].trim().replace(/['"]+/g, '');
        if (str) {
            result.push(str);
        }
    }
    return result;
}

export module genericFontFamilies {
    export var serif = "serif";
    export var sansSerif = "sans-serif";
    export var monospace = "monospace";
    export var system = "system";
}

var styles = new Set();
["italic", "oblique"].forEach((val, i, a) => styles.add(val));
var weights = new Set();
["bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"].forEach((val, i, a) => weights.add(val));

interface ParsedFont {
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: string,
    lineHeight?: string,
    fontSize?: string,
    fontFamily?: string
}

function parseFont(fontValue: string): ParsedFont {
    var result: ParsedFont = {
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: "normal",
    }

    var parts = fontValue.split(/\s+/);
    var part: string;
    while (part = parts.shift()) {
        if (part === "normal") {
            // nothing to do here
        }
        else if (part === "small-caps") {
            // The only supported font variant in shorthand font
            result.fontVariant = part;
        }
        else if (styles.has(part)) {
            result.fontStyle = part
        }
        else if (weights.has(part)) {
            result.fontWeight = part;
        }
        else if (!result.fontSize) {
            var sizes = part.split("/");
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
