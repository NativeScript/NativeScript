import { LayoutBaseCommon, clipToBoundsProperty } from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {
    nativeViewProtected: UIView;
    
    [clipToBoundsProperty.getDefault](): boolean {
        return false;
    }
    [clipToBoundsProperty.setNative](value: boolean) {
        this._setNativeClipToBounds();
    }

    _setNativeClipToBounds() {
        if (this.clipToBounds) {
            this.nativeViewProtected.clipsToBounds = true;
        } else {
            super._setNativeClipToBounds();
        }
    }
}