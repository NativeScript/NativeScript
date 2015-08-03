import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import common = require("ui/layouts/wrap-layout/wrap-layout-common");
import enums = require("ui/enums");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class WrapLayout extends common.WrapLayout {

    static setNativeOrientationProperty(data: dependencyObservable.PropertyChangeData): void {
        var wrapLayout = <WrapLayout>data.object;
        var nativeView = wrapLayout._nativeView;
        nativeView.setOrientation(data.newValue === enums.Orientation.vertical ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horzontal);
    }

    static setNativeItemWidthProperty(data: dependencyObservable.PropertyChangeData): void {
        var wrapLayout = <WrapLayout>data.object;
        var nativeView = wrapLayout._nativeView;
        nativeView.setItemWidth(data.newValue * utils.layout.getDisplayDensity());
    }

    static setNativeItemHeightProperty(data: dependencyObservable.PropertyChangeData): void {
        var wrapLayout = <WrapLayout>data.object;
        var nativeView = wrapLayout._nativeView;
        nativeView.setItemHeight(data.newValue * utils.layout.getDisplayDensity());
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
(<proxy.PropertyMetadata>common.WrapLayout.itemWidthProperty.metadata).onSetNativeValue = WrapLayout.setNativeItemWidthProperty;
(<proxy.PropertyMetadata>common.WrapLayout.itemHeightProperty.metadata).onSetNativeValue = WrapLayout.setNativeItemHeightProperty;