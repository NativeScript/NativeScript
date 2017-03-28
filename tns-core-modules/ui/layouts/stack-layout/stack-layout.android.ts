import { StackLayoutBase, orientationProperty } from "./stack-layout-common";

export * from "./stack-layout-common";

export class StackLayout extends StackLayoutBase {
    nativeView: org.nativescript.widgets.StackLayout;

    public _createNativeView() {
         return new org.nativescript.widgets.StackLayout(this._context);
    }

    [orientationProperty.setNative](value: "horizontal" | "vertical") {
        this.nativeView.setOrientation(value === "vertical" ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal)
    }
}