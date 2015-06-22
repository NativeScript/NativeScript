import enums = require("ui/enums");
import common = require("ui/styling/font-common");

//declare var exports;
//require("utils/module-merge").merge(common, exports);

export class Font extends common.Font {
    public static default = new Font(undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _ios: UIFontDescriptor;
    get ios(): UIFontDescriptor {
        if (!this._ios) {
            this._ios = UIFontDescriptor.fontDescriptorWithNameSize(this.fontFamily, 0);
            if (this.isBold) {
                if (this.isItalic) {
                    this._ios = this._ios.fontDescriptorWithSymbolicTraits(
                        UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic |
                        UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold);
                }
                else {
                    this._ios = this._ios.fontDescriptorWithSymbolicTraits(
                        UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitBold);
                }
            }
            else if (this.isItalic) {
                this._ios = this._ios.fontDescriptorWithSymbolicTraits(
                    UIFontDescriptorSymbolicTraits.UIFontDescriptorTraitItalic);
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

