import utils = require("utils/utils");
import view = require("ui/core/view");
import common = require("ui/layouts/absolute-layout/absolute-layout-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

global.moduleMerge(common, exports);

function setNativeProperty(data: dependencyObservable.PropertyChangeData, setter: (lp: org.nativescript.widgets.CommonLayoutParams) => void) {

    var uiView = data.object;
    if (uiView instanceof view.View) {
        var nativeView: android.view.View = uiView._nativeView;

        var lp = <org.nativescript.widgets.CommonLayoutParams>nativeView.getLayoutParams();
        if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
            lp = new org.nativescript.widgets.CommonLayoutParams();
        }
        setter(lp);
        nativeView.setLayoutParams(lp);
    }
}

function setNativeLeftProperty(data: dependencyObservable.PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.left = data.newValue * utils.layout.getDisplayDensity(); });
}

function setNativeTopProperty(data: dependencyObservable.PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.top = data.newValue * utils.layout.getDisplayDensity(); });
}

(<proxy.PropertyMetadata>common.AbsoluteLayout.leftProperty.metadata).onSetNativeValue = setNativeLeftProperty;
(<proxy.PropertyMetadata>common.AbsoluteLayout.topProperty.metadata).onSetNativeValue = setNativeTopProperty;

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