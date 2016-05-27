import common = require("./layout-base-common");

export class LayoutBase extends common.LayoutBase {
    public _onClipToBoundsChanged(oldValue: boolean, newValue: boolean) {
        if (this._nativeView) {
            this._nativeView.clipsToBounds = newValue;
        }
    }
}