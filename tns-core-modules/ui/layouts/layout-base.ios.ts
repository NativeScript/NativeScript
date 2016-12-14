import { LayoutBaseCommon, clipToBoundsProperty } from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {

    get [clipToBoundsProperty.native](): boolean {
        return this._nativeView.clipsToBounds;
    }
    set [clipToBoundsProperty.native](value: boolean) {
        this._nativeView.clipsToBounds = value;
    }
}