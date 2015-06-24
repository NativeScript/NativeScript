import enums = require("ui/enums");
import common = require("ui/styling/font-common");

var DEFAULT_SERIF = "Times New Roman";
var DEFAULT_SANS_SERIF = "Helvetica";
var DEFAULT_MONOSPACE = "Courier New";

var systemFontFamilies = new Set();
var systemFonts = new Set();

function initSystemFotns() {
    var nsFontFamilies = UIFont.familyNames();
    for (var i = 0; i < nsFontFamilies.count; i++) {
        var family = nsFontFamilies.objectAtIndex(i);
        systemFontFamilies.add(family);

        var nsFonts = UIFont.fontNamesForFamilyName(family);
        for (var j = 0; j < nsFonts.count; j++) {
            var font = nsFonts.objectAtIndex(j);
            systemFonts.add(font);
        }
    }
}
initSystemFotns();

export class Font extends common.Font {
    public static default = new Font(undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _ios: UIFontDescriptor;
    get ios(): UIFontDescriptor {
        if (!this._ios) {
            var symbolicTraits: number = 0;
            if (this.isBold) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold;
            }
            if (this.isItalic) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic;
            }

            this._ios = resolveFontDescriptor(this.fontFamily, symbolicTraits);

            if (!this._ios) {
                this._ios = UIFontDescriptor.new().fontDescriptorWithSymbolicTraits(symbolicTraits);
            }
        }
        return this._ios;
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
}

function resolveFontDescriptor(fontFamilyValue: string, symbolicTraits: number): UIFontDescriptor {
    var fonts = common.parseFontFamily(fontFamilyValue);
    var result: UIFontDescriptor = null;
    if (fonts.length === 0) {
        return null;
    }

    for (var i = 0; i < fonts.length; i++) {
        var fontFamily = getFontFamilyRespectingGenericFonts(fonts[i]);
        if (systemFontFamilies.has(fontFamily)) {
            // This is a font family - we should apply symbolic traits if there are such
            result = UIFontDescriptor.fontDescriptorWithNameSize(fontFamily, 0);
            if (symbolicTraits) {
                result = result.fontDescriptorWithSymbolicTraits(symbolicTraits);
            }
        }
        else if (systemFonts.has(fontFamily)) {
            // This is an actual font - don't apply symbolic traits
            result = UIFontDescriptor.fontDescriptorWithNameSize(fontFamily, 0);
        }
        else {
            // TODO: Handle custom fonts when they are supported.
        }

        if (result) {
            return result;
        }
    }

    return null;
}

function getFontFamilyRespectingGenericFonts(fontFamily: string): string {
    if (!fontFamily) {
        return fontFamily;
    }

    switch (fontFamily.toLowerCase()) {
        case common.genericFontFamilies.serif:
            return DEFAULT_SERIF;

        case common.genericFontFamilies.sansSerif:
            return DEFAULT_SANS_SERIF;

        case common.genericFontFamilies.monospace:
            return DEFAULT_MONOSPACE;

        default:
            return fontFamily;
    }
}