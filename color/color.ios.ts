import common = require("color/color-common");

var AMP = "#";

export class Color extends common.Color {
    private _ios: UIColor;

    get ios(): UIColor {
        if (!this._ios) {
            // iOS Color is using floating-point values in the [0, 1] range, so divide the components by 255
            this._ios = UIColor.alloc().initWithRedGreenBlueAlpha(this.r / 255, this.g / 255, this.b / 255, this.a / 255);
        }
        return this._ios;
    }

    public _argbFromString(hex: string): number {
        if (hex.charAt(0) === AMP) {
            hex = hex.substr(1);
        }

        var intVal = parseInt(hex, 16);
        if (hex.length === 6) {
            // add the alpha component since the provided string is RRGGBB
            intVal |= 255 << 24;
        }

        return intVal;
    }
} 