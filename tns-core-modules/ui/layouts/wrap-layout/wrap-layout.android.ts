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
         const layout = this._layout = new org.nativescript.widgets.WrapLayout(this._context);
         return layout;
    }

    [orientationProperty.getDefault](): "horizontal" | "vertical" {
        return "vertical";
    }
    [orientationProperty.setNative](value: "horizontal" | "vertical") {
        this._layout.setOrientation(value === "vertical" ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal)
    }

    [itemWidthProperty.getDefault](): Length {
        return "auto";
    }
    [itemWidthProperty.setNative](value: Length) {
        this._layout.setItemWidth(Length.toDevicePixels(value, -1));
    }

    [itemHeightProperty.getDefault](): Length {
        return "auto";
    }
    [itemHeightProperty.setNative](value: Length) {
        this._layout.setItemHeight(Length.toDevicePixels(value, -1));
    }
}