import enums = require("ui/enums");
import common = require("ui/styling/font-common");
import application = require("application");
import trace = require("trace");
import types = require("utils/types");

var typefaceCache = new Map<string, android.graphics.Typeface>();
var appAssets: android.content.res.AssetManager;

export class Font extends common.Font {
    public static default = new Font(undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _android: android.graphics.Typeface;
    get android(): android.graphics.Typeface {
        if (!this._android) {
            var style: number = 0;

            if (this.isBold) {
                style |= android.graphics.Typeface.BOLD;
            }

            if (this.isItalic) {
                style |= android.graphics.Typeface.ITALIC;
            }

            var typeFace = this.getTypeFace(this.fontFamily);
            this._android = android.graphics.Typeface.create(typeFace, style);
        }
        return this._android;
    }

    constructor(family: string, style: string, weight: string) {
        super(family, style, weight);
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: string): Font {
        return new Font(this.fontFamily, style, this.fontWeight);
    }

    public withFontWeight(weight: string): Font {
        return new Font(this.fontFamily, this.fontStyle, weight);
    }

    private getTypeFace(fontFamily: string): android.graphics.Typeface {
        if (!fontFamily) {
            return null;
        }

        switch (fontFamily.toLowerCase()) {
            case common.genericFontFamilies.serif:
                return android.graphics.Typeface.SERIF;

            case common.genericFontFamilies.sansSerif:
                return android.graphics.Typeface.SANS_SERIF;

            case common.genericFontFamilies.monospace:
                return android.graphics.Typeface.MONOSPACE;

            default:
                return this.loadFontFromAsset(fontFamily);
        }
    }

    private loadFontFromAsset(fontFamily: string): android.graphics.Typeface {
        appAssets = appAssets || application.android.context.getAssets();
        if (!appAssets) {
            return null;
        }

        var result = typefaceCache.get(fontFamily);
        // Check for undefined explicitly as null mean we tried to load the font, but failed.
        if (types.isUndefined(result)) {
            result = null;
            var fontAsset = "app/fonts/" + fontFamily + ".ttf";
            try {
                result = android.graphics.Typeface.createFromAsset(appAssets, fontAsset);
            } catch (e) {
                trace.write("Cannot find font asset: " + fontAsset, trace.categories.Error, trace.messageType.error);
            }
            typefaceCache.set(fontFamily, result);
        }

        return result;
    }
}
