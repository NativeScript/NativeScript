import { LayoutBaseCommon, clipToBoundsProperty } from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {
    nativeView: UIView;
    
    [clipToBoundsProperty.getDefault](): boolean {
        return false;
    }
    [clipToBoundsProperty.setNative](value: boolean) {
        this._setNativeClipToBounds();
    }

    _setNativeClipToBounds() {
        if (this.clipToBounds) {
            this.nativeView.clipsToBounds = true;
        } else {
            super._setNativeClipToBounds();
        }
    }
}