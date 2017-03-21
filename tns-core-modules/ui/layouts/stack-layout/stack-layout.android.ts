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
         const layout = this._layout = new org.nativescript.widgets.StackLayout(this._context);
         return layout;
    }

    [orientationProperty.getDefault](): "horizontal" | "vertical" {
        return "vertical";
    }
    [orientationProperty.setNative](value: "horizontal" | "vertical") {
        this._layout.setOrientation(value === "vertical" ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal)
    }
}