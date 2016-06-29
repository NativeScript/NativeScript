import common = require("./dock-layout-common");
import {Dock} from "ui/enums";
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {PropertyChangeData} from "ui/core/dependency-observable";

global.moduleMerge(common, exports);

function setNativeDockProperty(data: PropertyChangeData) {
    var view = data.object;
    if (view instanceof View) {
        var nativeView: android.view.View = view._nativeView;
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
            switch (data.newValue) {
                case Dock.left:
                    lp.dock = org.nativescript.widgets.Dock.left;
                    break;
                case Dock.top:
                    lp.dock = org.nativescript.widgets.Dock.top;
                    break;
                case Dock.right:
                    lp.dock = org.nativescript.widgets.Dock.right;
                    break;
                case Dock.bottom:
                    lp.dock = org.nativescript.widgets.Dock.bottom;
                    break;
                default:
                    throw new Error("Invalid dock value: " + data.newValue + " on element: " + view);
            }

            nativeView.setLayoutParams(lp);
        }
    }
}

(<PropertyMetadata>common.DockLayout.dockProperty.metadata).onSetNativeValue = setNativeDockProperty;

function setNativeStretchLastChildProperty(data: PropertyChangeData) {
    let dockLayout = <DockLayout>data.object;
    let nativeView = dockLayout._nativeView;
    nativeView.setStretchLastChild(data.newValue);
}

(<PropertyMetadata>common.DockLayout.stretchLastChildProperty.metadata).onSetNativeValue = setNativeStretchLastChildProperty;

export class DockLayout extends common.DockLayout {

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
}