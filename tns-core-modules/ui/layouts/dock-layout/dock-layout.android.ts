import { DockLayoutBase, View, dockProperty, stretchLastChildProperty } from "./dock-layout-common";

export * from "./dock-layout-common";

View.prototype[dockProperty.setNative] = function(this: View, value: "left" | "top" | "right" | "bottom") {
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

export class DockLayout extends DockLayoutBase {

    private _layout: org.nativescript.widgets.DockLayout;

    get android(): org.nativescript.widgets.DockLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.DockLayout {
        return this._layout;
    }

    public _createNativeView() {
        const layout = this._layout = new org.nativescript.widgets.DockLayout(this._context);
        return layout;
    }

    [stretchLastChildProperty.getDefault](): boolean {
        return false;
    }
    [stretchLastChildProperty.setNative](value: boolean) {
        this._layout.setStretchLastChild(value);
    }
}