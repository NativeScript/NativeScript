import enums = require("ui/enums");
import common = require("ui/styling/font-common");
import utils = require("utils/utils");

var DEFAULT_SERIF = "Times New Roman";
var DEFAULT_SANS_SERIF = "Helvetica";
var DEFAULT_MONOSPACE = "Courier New";

export class Font extends common.Font {
    public static default = new Font(undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _ios: UIFontDescriptor;
    get ios(): UIFontDescriptor {
        if (!this._ios) {
            var fontFamily = this.getFontFamilyRespectingGenericFonts(this.fontFamily);

            var symbolicTraits: number = 0;
            if (this.isBold) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold;
            }
            if (this.isItalic) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic;
            }

            if (fontFamily) {
                this._ios = UIFontDescriptor.fontDescriptorWithNameSize(fontFamily, 0);
                if (symbolicTraits) {
                    this._ios = this._ios.fontDescriptorWithSymbolicTraits(symbolicTraits);
                }
            }

            if(!this._ios) {
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

    private getFontFamilyRespectingGenericFonts(fontFamily: string): string {
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
}

