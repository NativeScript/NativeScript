import enums = require("ui/enums");
import definitios = require("ui/styling/font");

export class Font implements definitios.Font {
    public static default = new Font(undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _fontFamily: string;
    private _fontStyle: string;
    private _fontWeight: string;

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

    get ios(): UIFontDescriptor {
        return undefined;
    }

    get android(): android.graphics.Typeface {
        return undefined;
    }

    constructor(family: string, style: string, weight: string) {
        this._fontFamily = family;
        this._fontStyle = style;
        this._fontWeight = weight;
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
}