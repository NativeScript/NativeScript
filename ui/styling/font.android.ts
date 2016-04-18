import enums = require("ui/enums");
import common = require("./font-common");
import * as applicationModule from "application";
import * as typesModule from "utils/types";
import * as traceModule from "trace";
import * as fileSystemModule from "file-system";

var application: typeof applicationModule;
function ensureApplication() {
    if (!application) {
        application = require("application");
    }
}

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

var trace: typeof traceModule;
function ensureTrace() {
    if (!trace) {
        trace = require("trace");
    }
}

var fs: typeof fileSystemModule;
function ensureFS() {
    if (!fs) {
        fs = require("file-system");
    }
}

var typefaceCache = new Map<string, android.graphics.Typeface>();
var appAssets: android.content.res.AssetManager;
var FONTS_BASE_PATH = "/fonts/";

export class Font extends common.Font {
    public static default = new Font(undefined, undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _typeface: android.graphics.Typeface;

    constructor(family: string, size: number, style: string, weight: string) {
        super(family, size, style, weight);
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: string): Font {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    }

    public withFontWeight(weight: string): Font {
        return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
    }

    public withFontSize(size: number): Font {
        return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
    }

    public getAndroidTypeface(): android.graphics.Typeface {
        if (!this._typeface) {
            this._typeface = createTypeface(this);
        }
        return this._typeface;
    }
}

function loadFontFromFile(fontFamily: string): android.graphics.Typeface {
    ensureApplication();

    appAssets = appAssets || application.android.context.getAssets();
    if (!appAssets) {
        return null;
    }

    ensureTypes();

    var result = typefaceCache.get(fontFamily);
    // Check for undefined explicitly as null mean we tried to load the font, but failed.
    if (types.isUndefined(result)) {
        result = null;

        ensureTrace();
        ensureFS();

        var fontAssetPath: string;
        var basePath = fs.path.join(fs.knownFolders.currentApp().path, "fonts", fontFamily);
        if (fs.File.exists(basePath + ".ttf")) {
            fontAssetPath = FONTS_BASE_PATH + fontFamily + ".ttf";
        }
        else if (fs.File.exists(basePath + ".otf")) {
            fontAssetPath = FONTS_BASE_PATH + fontFamily + ".otf";
        }
        else {
            trace.write("Could not find font file for " + fontFamily, trace.categories.Error, trace.messageType.error);
        }

        if (fontAssetPath) {
            try {
                fontAssetPath = fs.path.join(fs.knownFolders.currentApp().path, fontAssetPath);
                result = android.graphics.Typeface.createFromFile(fontAssetPath)
            } catch (e) {
                trace.write("Error loading font asset: " + fontAssetPath, trace.categories.Error, trace.messageType.error);
            }
        }
        typefaceCache.set(fontFamily, result);
    }

    return result;
}

function createTypeface(font: Font): android.graphics.Typeface {
    //http://stackoverflow.com/questions/19691530/valid-values-for-androidfontfamily-and-what-they-map-to

    var fontStyle = 0;
    if (font.isBold) {
        fontStyle |= android.graphics.Typeface.BOLD;
    }
    if (font.isItalic) {
        fontStyle |= android.graphics.Typeface.ITALIC;
    }

    var fonts = common.parseFontFamily(font.fontFamily);
    var result = null;
    if (fonts.length === 0) {
        return null;
    }

    for (var i = 0; i < fonts.length; i++) {
        switch (fonts[i].toLowerCase()) {
            case common.genericFontFamilies.serif:
                result = android.graphics.Typeface.create("serif" + getFontWeightSuffix(font.fontWeight), fontStyle);
                break;

            case common.genericFontFamilies.sansSerif:
            case common.genericFontFamilies.system:
                result = android.graphics.Typeface.create("sans-serif" + getFontWeightSuffix(font.fontWeight), fontStyle);
                break;

            case common.genericFontFamilies.monospace:
                result = android.graphics.Typeface.create("monospace" + getFontWeightSuffix(font.fontWeight), fontStyle);
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

function getFontWeightSuffix(fontWeight: string): string {
    switch (fontWeight) {
        case enums.FontWeight.thin:
            return android.os.Build.VERSION.SDK_INT >= 16 ? "-thin" : "";
        case enums.FontWeight.extraLight:
        case enums.FontWeight.light:
            return android.os.Build.VERSION.SDK_INT >= 16 ? "-light" : "";
        case enums.FontWeight.normal:
        case "400":
        case undefined:
        case null:
            return "";
        case enums.FontWeight.medium:
        case enums.FontWeight.semiBold:
            return android.os.Build.VERSION.SDK_INT >= 21 ? "-medium" : "";
        case enums.FontWeight.bold:
        case "700":
        case enums.FontWeight.extraBold:
            return "";
        case enums.FontWeight.black:
            return android.os.Build.VERSION.SDK_INT >= 21 ? "-black" : "";
        default:
            throw new Error(`Invalid font weight: "${fontWeight}"`);
    }
}
