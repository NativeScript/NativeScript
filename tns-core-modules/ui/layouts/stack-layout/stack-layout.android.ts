import { StackLayoutBase, orientationProperty } from "./stack-layout-common";

export * from "./stack-layout-common";

export class StackLayout extends StackLayoutBase {
    private _layout: org.nativescript.widgets.StackLayout;

    get android(): org.nativescript.widgets.StackLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.StackLayout {
        return this._layout;
    }

    public _createNativeView() {
        this._layout = new org.nativescript.widgets.StackLayout(this._context);
    }

    get [orientationProperty.native](): "horizontal" | "vertical" {
        return "vertical";
    }
    set [orientationProperty.native](value: "horizontal" | "vertical") {
        this._layout.setOrientation(value === "vertical" ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal)
    }
}