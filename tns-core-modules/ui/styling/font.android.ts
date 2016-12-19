import { FontBase, parseFontFamily, genericFontFamilies, parseFont, FontWeight } from "./font-common";
import { enabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "trace";
import * as application from "application";
import * as fs from "file-system";

export * from "./font-common";

const FONTS_BASE_PATH = "/fonts/";
const typefaceCache = new Map<string, android.graphics.Typeface>();
let appAssets: android.content.res.AssetManager;

export class Font extends FontBase {
    public static default = new Font(undefined, undefined, "normal", "normal");

    private _typeface: android.graphics.Typeface;

    constructor(family: string, size: number, style: "normal" | "italic", weight: FontWeight) {
        super(family, size, style, weight);
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: "normal" | "italic"): Font {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    }

    public withFontWeight(weight: FontWeight): Font {
        return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
    }

    public withFontSize(size: number): Font {
        return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
    }

    public getAndroidTypeface(): android.graphics.Typeface {
        if (!this._typeface) {
            var fontStyle = 0;
            if (this.isBold) {
                fontStyle |= android.graphics.Typeface.BOLD;
            }
            if (this.isItalic) {
                fontStyle |= android.graphics.Typeface.ITALIC;
            }

            var typeFace = createTypeface(this);
            this._typeface = android.graphics.Typeface.create(typeFace, fontStyle);
        }
        return this._typeface;
    }

    public getUIFont(defaultFont: UIFont): UIFont {
        return undefined;
    }
}

function loadFontFromFile(fontFamily: string): android.graphics.Typeface {
    appAssets = appAssets || application.android.context.getAssets();
    if (!appAssets) {
        return null;
    }

    let result = typefaceCache.get(fontFamily);
    // Check for undefined explicitly as null mean we tried to load the font, but failed.
    if (result === undefined) {
        result = null;

        var fontAssetPath: string;
        var basePath = fs.path.join(fs.knownFolders.currentApp().path, "fonts", fontFamily);
        if (fs.File.exists(basePath + ".ttf")) {
            fontAssetPath = FONTS_BASE_PATH + fontFamily + ".ttf";
        }
        else if (fs.File.exists(basePath + ".otf")) {
            fontAssetPath = FONTS_BASE_PATH + fontFamily + ".otf";
        }
        else {
            if (traceEnabled) {
                traceWrite("Could not find font file for " + fontFamily, traceCategories.Error, traceMessageType.error);
            }
        }

        if (fontAssetPath) {
            try {
                fontAssetPath = fs.path.join(fs.knownFolders.currentApp().path, fontAssetPath);
                result = android.graphics.Typeface.createFromFile(fontAssetPath)
            } catch (e) {
                if (traceEnabled) {
                    traceWrite("Error loading font asset: " + fontAssetPath, traceCategories.Error, traceMessageType.error);
                }
            }
        }
        typefaceCache.set(fontFamily, result);
    }

    return result;
}

function createTypeface(font: Font): android.graphics.Typeface {
    //http://stackoverflow.com/questions/19691530/valid-values-for-androidfontfamily-and-what-they-map-to
    var fonts = parseFontFamily(font.fontFamily);
    var result = null;
    if (fonts.length === 0) {
        return null;
    }

    for (var i = 0; i < fonts.length; i++) {
        switch (fonts[i].toLowerCase()) {
            case genericFontFamilies.serif:
                result = android.graphics.Typeface.create("serif" + getFontWeightSuffix(font.fontWeight), 0);
                break;

            case genericFontFamilies.sansSerif:
            case genericFontFamilies.system:
                result = android.graphics.Typeface.create("sans-serif" + getFontWeightSuffix(font.fontWeight), 0);
                break;

            case genericFontFamilies.monospace:
                result = android.graphics.Typeface.create("monospace" + getFontWeightSuffix(font.fontWeight), 0);
                break;

            default:
                result = loadFontFromFile(fonts[i]);
                break;
        }

        if (result) {
            return result;
        }
    }

    return null;
}

function getFontWeightSuffix(fontWeight: FontWeight): string {
    switch (fontWeight) {
        case FontWeight.THIN:
            return android.os.Build.VERSION.SDK_INT >= 16 ? "-thin" : "";
        case FontWeight.EXTRA_LIGHT:
        case FontWeight.LIGHT:
            return android.os.Build.VERSION.SDK_INT >= 16 ? "-light" : "";
        case FontWeight.NORMAL:
        case "400":
        case undefined:
        case null:
            return "";
        case FontWeight.MEDIUM:
        case FontWeight.SEMI_BOLD:
            return android.os.Build.VERSION.SDK_INT >= 21 ? "-medium" : "";
        case FontWeight.BOLD:
        case "700":
        case FontWeight.EXTRA_BOLD:
            return "";
        case FontWeight.BLACK:
            return android.os.Build.VERSION.SDK_INT >= 21 ? "-black" : "";
        default:
            throw new Error(`Invalid font weight: "${fontWeight}"`);
    }
}