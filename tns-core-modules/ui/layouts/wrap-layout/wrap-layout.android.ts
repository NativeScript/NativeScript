import { WrapLayoutBase, orientationProperty, itemWidthProperty, itemHeightProperty } from "./wrap-layout-common";

export * from "./wrap-layout-common";

export class WrapLayout extends WrapLayoutBase {
    private _layout: org.nativescript.widgets.WrapLayout;

    get android(): org.nativescript.widgets.WrapLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.WrapLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.WrapLayout(this._context);
    }

    get [orientationProperty.native](): "horizontal" | "vertical" {
        return "vertical";
    }
    set [orientationProperty.native](value: "horizontal" | "vertical") {
        this._layout.setOrientation(value === "vertical" ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal)
    }

    get [itemWidthProperty.native](): number {
        return 0;
    }
    set [itemWidthProperty.native](value: number) {
        this._layout.setItemWidth(this.effectiveItemWidth);
    }

    get [itemHeightProperty.native](): number {
        return 0;
    }
    set [itemHeightProperty.native](value: number) {
        this._layout.setItemHeight(this.effectiveItemHeight);
    }
}