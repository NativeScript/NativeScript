import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import enums = require("ui/enums");
import proxy = require("ui/core/proxy");
import common = require("ui/layouts/dock-layout/dock-layout-common");

global.moduleMerge(common, exports);

function setNativeDockProperty(data: dependencyObservable.PropertyChangeData) {

    var uiView = data.object;
    if (uiView instanceof view.View) {
        var nativeView: android.view.View = uiView._nativeView;

        var lp = <org.nativescript.widgets.CommonLayoutParams>nativeView.getLayoutParams();
        if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
            lp = new org.nativescript.widgets.CommonLayoutParams();
        }
    
        switch (data.newValue) {
            case enums.Dock.left:
                lp.dock = org.nativescript.widgets.Dock.left;
                break;
            case enums.Dock.top:
                lp.dock = org.nativescript.widgets.Dock.top;
                break;
            case enums.Dock.right:
                lp.dock = org.nativescript.widgets.Dock.right;
                break;
            case enums.Dock.bottom:
                lp.dock = org.nativescript.widgets.Dock.bottom;
                break;
            default:
                throw new Error("Invalid dock value: " + data.newValue + " on element: " + uiView);
        }

        nativeView.setLayoutParams(lp);
    }
}

(<proxy.PropertyMetadata>common.DockLayout.dockProperty.metadata).onSetNativeValue = setNativeDockProperty;

export class DockLayout extends common.DockLayout {

    static setNativeStretchLastChildProperty(data: dependencyObservable.PropertyChangeData) {
        var dockLayout = <DockLayout>data.object;
        var nativeView = dockLayout._nativeView;
        nativeView.setStretchLastChild(data.newValue);
    }

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

(<proxy.PropertyMetadata>common.DockLayout.stretchLastChildProperty.metadata).onSetNativeValue = DockLayout.setNativeStretchLastChildProperty;