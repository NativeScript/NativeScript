import * as common from "./color-common";

export class Color extends common.Color {
    private _ios: UIColor;

    get ios(): UIColor {
        if (!this._ios) {
            // iOS Color is using floating-point values in the [0, 1] range, so divide the components by 255
            this._ios = UIColor.alloc().initWithRedGreenBlueAlpha(this.r / 255, this.g / 255, this.b / 255, this.a / 255);
        }
        return this._ios;
    }
}