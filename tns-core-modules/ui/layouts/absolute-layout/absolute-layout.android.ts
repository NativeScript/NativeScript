import utils = require("utils/utils");
import common = require("./absolute-layout-common");
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {PropertyChangeData} from "ui/core/dependency-observable";

global.moduleMerge(common, exports);

function setNativeProperty(data: PropertyChangeData, setter: (lp: org.nativescript.widgets.CommonLayoutParams) => void) {
    var view = data.object;
    if (view instanceof View) {
        var nativeView: android.view.View = view._nativeView;
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
            setter(lp);
            nativeView.setLayoutParams(lp);
        }
    }
}

function setNativeLeftProperty(data: PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.left = data.newValue * utils.layout.getDisplayDensity(); });
}

function setNativeTopProperty(data: PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.top = data.newValue * utils.layout.getDisplayDensity(); });
}

(<PropertyMetadata>common.AbsoluteLayout.leftProperty.metadata).onSetNativeValue = setNativeLeftProperty;
(<PropertyMetadata>common.AbsoluteLayout.topProperty.metadata).onSetNativeValue = setNativeTopProperty;

export class AbsoluteLayout extends common.AbsoluteLayout {

    private _layout: org.nativescript.widgets.AbsoluteLayout;

    get android(): org.nativescript.widgets.AbsoluteLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.AbsoluteLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.AbsoluteLayout(this._context);
    }
}