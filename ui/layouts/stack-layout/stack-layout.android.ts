import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import common = require("ui/layouts/stack-layout/stack-layout-common");
import enums = require("ui/enums");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class StackLayout extends common.StackLayout {

    static setNativeOrientationProperty(data: dependencyObservable.PropertyChangeData): void {
        var stackLayout = <StackLayout>data.object;
        var nativeView = stackLayout._nativeView;
        if (data.newValue === enums.Orientation.vertical) {
            nativeView.setOrientation(org.nativescript.widgets.Orientation.vertical);
        }
        else {
            nativeView.setOrientation(org.nativescript.widgets.Orientation.horzontal);
        }        
    }

    private _layout: org.nativescript.widgets.StackLayout;

    get android(): org.nativescript.widgets.StackLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.StackLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.StackLayout(this._context);
    }
}

(<proxy.PropertyMetadata>common.StackLayout.orientationProperty.metadata).onSetNativeValue = StackLayout.setNativeOrientationProperty;