import { WrapLayoutBase, orientationProperty, itemWidthProperty, itemHeightProperty, Length } from "./wrap-layout-common";

export * from "./wrap-layout-common";

export class WrapLayout extends WrapLayoutBase {
    private _layout: org.nativescript.widgets.WrapLayout;

    get android(): org.nativescript.widgets.WrapLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.WrapLayout {
        return this._layout;
    }

    public _createNativeView() {
        this._layout = new org.nativescript.widgets.WrapLayout(this._context);
    }

    get [orientationProperty.native](): "horizontal" | "vertical" {
        return "vertical";
    }
    set [orientationProperty.native](value: "horizontal" | "vertical") {
        this._layout.setOrientation(value === "vertical" ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal)
    }

    get [itemWidthProperty.native](): Length {
        return "auto";
    }
    set [itemWidthProperty.native](value: Length) {
        this._layout.setItemWidth(Length.toDevicePixels(value, -1));
    }

    get [itemHeightProperty.native](): Length {
        return "auto";
    }
    set [itemHeightProperty.native](value: Length) {
        this._layout.setItemHeight(Length.toDevicePixels(value, -1));
    }
}