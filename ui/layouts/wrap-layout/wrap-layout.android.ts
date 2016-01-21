import utils = require("utils/utils");
import common = require("./wrap-layout-common");
import {Orientation} from "ui/enums";
import {PropertyMetadata} from "ui/core/proxy";
import {PropertyChangeData} from "ui/core/dependency-observable";

global.moduleMerge(common, exports);

function setNativeOrientationProperty(data: PropertyChangeData): void {
    var wrapLayout = <WrapLayout>data.object;
    var nativeView = wrapLayout._nativeView;
    nativeView.setOrientation(data.newValue === Orientation.vertical ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal);
}

function setNativeItemWidthProperty(data: PropertyChangeData): void {
    var wrapLayout = <WrapLayout>data.object;
    var nativeView = wrapLayout._nativeView;
    nativeView.setItemWidth(data.newValue * utils.layout.getDisplayDensity());
}

function setNativeItemHeightProperty(data: PropertyChangeData): void {
    var wrapLayout = <WrapLayout>data.object;
    var nativeView = wrapLayout._nativeView;
    nativeView.setItemHeight(data.newValue * utils.layout.getDisplayDensity());
}

(<PropertyMetadata>common.WrapLayout.orientationProperty.metadata).onSetNativeValue = setNativeOrientationProperty;
(<PropertyMetadata>common.WrapLayout.itemWidthProperty.metadata).onSetNativeValue = setNativeItemWidthProperty;
(<PropertyMetadata>common.WrapLayout.itemHeightProperty.metadata).onSetNativeValue = setNativeItemHeightProperty;

export class WrapLayout extends common.WrapLayout {
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