import borderCommon = require("ui/border/border-common");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import utils = require("utils/utils");
import color = require("color");

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
    public _updateAndroidBorder(bmp?: android.graphics.Bitmap) {
        if (!this._nativeView) {
            return;
        }

        (<android.view.ViewGroup>this._nativeView).setBackgroundDrawable(new BorderGradientDrawable(this.borderWidth,
            this.borderColor ? this.borderColor.android : android.graphics.Color.TRANSPARENT,
            this.backgroundColor ? this.backgroundColor.android : android.graphics.Color.TRANSPARENT,
            this.cornerRadius,
            bmp));
    }
}

class BorderGradientDrawable extends android.graphics.drawable.GradientDrawable {
    private paint: android.graphics.Paint;
    private stroke: number;
    private bitmap: android.graphics.Bitmap

    constructor(borderWidth: number, borderColor: number, backgroundColor: number, cornerRadius: number, bitmap?: android.graphics.Bitmap) {
        super();

        this.bitmap = bitmap;

        if (bitmap) {
            this.paint = new android.graphics.Paint();
        } else {
            this.setColor(backgroundColor);
        }

        var density = utils.layout.getDisplayDensity();

        this.stroke = borderWidth * density;
        this.setStroke(this.stroke, borderColor);

        var cornerRadius = borderWidth * density;
        this.setCornerRadius(cornerRadius);

        return global.__native(this);
    }

    public draw(canvas: android.graphics.Canvas): void {
        if (this.paint) {
            canvas.drawBitmap(this.bitmap, this.stroke, this.stroke, this.paint);
        }
        super.draw(canvas);
    }
}
