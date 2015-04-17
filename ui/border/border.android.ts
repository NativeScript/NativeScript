import borderCommon = require("ui/border/border-common");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");
import utils = require("utils/utils");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(borderCommon, exports);

function onBorderPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var border = <Border>data.object;
    border._updateAndroidBorder();
}

(<proxy.PropertyMetadata>borderCommon.Border.cornerRadiusProperty.metadata).onSetNativeValue = onBorderPropertyChanged;
(<proxy.PropertyMetadata>borderCommon.Border.borderWidthProperty.metadata).onSetNativeValue = onBorderPropertyChanged;
(<proxy.PropertyMetadata>borderCommon.Border.borderColorProperty.metadata).onSetNativeValue = onBorderPropertyChanged;

export class Border extends borderCommon.Border {
    public _updateAndroidBorder() {
        if (!this._nativeView) {
            return;
        }

        var nativeView = <android.view.ViewGroup>this._nativeView;

        var backgroundDrawable = nativeView.getBackground();
        if (!(backgroundDrawable instanceof android.graphics.drawable.GradientDrawable)) {
            backgroundDrawable = new android.graphics.drawable.GradientDrawable();
            nativeView.setBackgroundDrawable(backgroundDrawable);
        }

        var gd = <android.graphics.drawable.GradientDrawable>backgroundDrawable;
        var density = utils.layout.getDisplayDensity();
        gd.setCornerRadius(this.cornerRadius * density);

        if (this.borderColor) {
            gd.setStroke(this.borderWidth * density, this.borderColor.android);
        }
        else {
            gd.setStroke(this.borderWidth * density, android.graphics.Color.TRANSPARENT);
        }

        if (this.backgroundColor) {
            gd.setColor(this.backgroundColor.android);
        }
        else {
            gd.setColor(android.graphics.Color.TRANSPARENT);
        }
    }
} 