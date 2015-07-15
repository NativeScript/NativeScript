import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import common = require("ui/layouts/wrap-layout/wrap-layout-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class WrapLayout extends common.WrapLayout {

    static setNativeOrientationProperty(data: dependencyObservable.PropertyChangeData): void {
        var wrapLayout = <WrapLayout>data.object;
        var nativeView = wrapLayout._nativeView;
        nativeView.setOrientation(data.newValue);
    }

    static setNativeItemWidthProperty(data: dependencyObservable.PropertyChangeData): void {
        var wrapLayout = <WrapLayout>data.object;
        var nativeView = wrapLayout._nativeView;
        nativeView.setItemWidth(data.newValue);
    }

    static setNativeItemHeightProperty(data: dependencyObservable.PropertyChangeData): void {
        var wrapLayout = <WrapLayout>data.object;
        var nativeView = wrapLayout._nativeView;
        nativeView.setItemHeight(data.newValue);
    }

    private _layout: org.nativescript.widgets.WrapLayout;

    get android(): org.nativescript.widgets.WrapLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.WrapLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.WrapLayout(this._context);
    }
}

(<proxy.PropertyMetadata>common.WrapLayout.orientationProperty.metadata).onSetNativeValue = WrapLayout.setNativeOrientationProperty;
(<proxy.PropertyMetadata>common.WrapLayout.orientationProperty.metadata).onSetNativeValue = WrapLayout.setNativeItemWidthProperty;
(<proxy.PropertyMetadata>common.WrapLayout.orientationProperty.metadata).onSetNativeValue = WrapLayout.setNativeItemHeightProperty;