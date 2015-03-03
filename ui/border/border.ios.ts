import borderCommon = require("ui/border/border-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import color = require("color");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(borderCommon, exports);

function onCornerRadiusPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <Border>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof UIView) {
        (<UIView>view._nativeView).layer.cornerRadius = data.newValue;
    }
}
(<proxy.PropertyMetadata>borderCommon.Border.cornerRadiusProperty.metadata).onSetNativeValue = onCornerRadiusPropertyChanged;

function onBorderWidthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <Border>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof UIView) {
        (<UIView>view._nativeView).layer.borderWidth = data.newValue;
    }
}
(<proxy.PropertyMetadata>borderCommon.Border.borderWidthProperty.metadata).onSetNativeValue = onBorderWidthPropertyChanged;

function onBorderColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <Border>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof UIView && data.newValue instanceof color.Color) {
        (<UIView>view._nativeView).layer.borderColor = (<color.Color>data.newValue).ios.CGColor;
    }
}
(<proxy.PropertyMetadata>borderCommon.Border.borderColorProperty.metadata).onSetNativeValue = onBorderColorPropertyChanged;

export class Border extends borderCommon.Border {
    //
} 