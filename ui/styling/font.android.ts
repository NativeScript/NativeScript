import enums = require("ui/enums");
import common = require("ui/styling/font-common");

//declare var exports;
//require("utils/module-merge").merge(common, exports);

export class Font extends common.Font {
    public static default = new Font(undefined, enums.FontStyle.normal, enums.FontWeight.normal);

    private _android: android.graphics.Typeface;
    get android(): android.graphics.Typeface {
        if (!this._android) {
            var style: number;
            if (this.isBold) {
                if (this.isItalic) {
                    style = android.graphics.Typeface.BOLD_ITALIC;
                }
                else {
                    style = android.graphics.Typeface.BOLD;
                }
            }
            else if (this.isItalic) {
                style = android.graphics.Typeface.ITALIC;
            }
            else {
                style = android.graphics.Typeface.NORMAL;
            }

            this._android = android.graphics.Typeface.create(this.fontFamily, style);
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
}

