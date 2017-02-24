import { LayoutBaseCommon, clipToBoundsProperty } from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {
    
    get [clipToBoundsProperty.native](): boolean {
        return false;
    }
    set [clipToBoundsProperty.native](value: boolean) {
        this._setNativeClipToBounds();
    }

    _setNativeClipToBounds() {
        if (this.clipToBounds) {
            this._nativeView.clipsToBounds = true;
        } else {
            super._setNativeClipToBounds();
        }
    }
}