import { DockLayoutBase, View, dockProperty, stretchLastChildProperty } from "./dock-layout-common";

export * from "./dock-layout-common";

// define native getter and setter for topProperty.
let dockDescriptor: TypedPropertyDescriptor<"left" | "top" | "right" | "bottom"> = {
    enumerable: true,
    configurable: true,
    writable: true,
    get: () => "left",
    set: function (this: View, value: "left" | "top" | "right" | "bottom") {
        const nativeView: android.view.View = this._nativeView;
        const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
            switch (value) {
                case "left":
                    lp.dock = org.nativescript.widgets.Dock.left;
                    break;

                case "top":
                    lp.dock = org.nativescript.widgets.Dock.top;
                    break;

                case "right":
                    lp.dock = org.nativescript.widgets.Dock.right;
                    break;

                case "bottom":
                    lp.dock = org.nativescript.widgets.Dock.bottom;
                    break;

                default:
                    throw new Error(`Invalid value for dock property: ${value}`);
            }

            nativeView.setLayoutParams(lp);
        }
    }
}

// register native properties on View type.
Object.defineProperties(View, {
    [dockProperty.native]: dockDescriptor
});

export class DockLayout extends DockLayoutBase {

    private _layout: org.nativescript.widgets.DockLayout;

    get android(): org.nativescript.widgets.DockLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.DockLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.DockLayout(this._context);
    }

    get [stretchLastChildProperty.native](): boolean {
        return false;
    }
    set [stretchLastChildProperty.native](value: boolean) {
        this._layout.setStretchLastChild(value);
    }
}