import borderCommon = require("ui/border/border-common");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(borderCommon, exports);

function onCornerRadiusPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <Border>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof android.view.ViewGroup) {
        var gd = new android.graphics.drawable.GradientDrawable();

        gd.setCornerRadius(data.newValue);
        gd.setStroke(view.borderWidth, view.borderColor.android);

        (<android.view.View>view._nativeView).setBackgroundDrawable(gd);
    }
}
(<proxy.PropertyMetadata>borderCommon.Border.cornerRadiusProperty.metadata).onSetNativeValue = onCornerRadiusPropertyChanged;

function onBorderWidthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <Border>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof android.view.ViewGroup) {
        var gd = new android.graphics.drawable.GradientDrawable();

        gd.setCornerRadius(view.cornerRadius);
        gd.setStroke(data.newValue, view.borderColor.android);

        (<android.view.View>view._nativeView).setBackgroundDrawable(gd);
    }
}
(<proxy.PropertyMetadata>borderCommon.Border.borderWidthProperty.metadata).onSetNativeValue = onBorderWidthPropertyChanged;

function onBorderColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <Border>data.object;
    if (!view._nativeView) {
        return;
    }

    if (view._nativeView instanceof android.view.ViewGroup && data.newValue instanceof color.Color) {
        var gd = new android.graphics.drawable.GradientDrawable();

        gd.setCornerRadius(view.cornerRadius);
        gd.setStroke(view.borderWidth, data.newValue.android);

        (<android.view.View>view._nativeView).setBackgroundDrawable(gd);
    }
}
(<proxy.PropertyMetadata>borderCommon.Border.borderColorProperty.metadata).onSetNativeValue = onBorderColorPropertyChanged;

export class Border extends borderCommon.Border {
    //
} 