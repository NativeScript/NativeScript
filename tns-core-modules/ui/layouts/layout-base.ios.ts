import { LayoutBaseCommon, clipToBoundsProperty } from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {
    
    [clipToBoundsProperty.getDefault](): boolean {
        return false;
    }
    [clipToBoundsProperty.setNative](value: boolean) {
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