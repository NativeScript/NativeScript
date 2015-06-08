import borderCommon = require("ui/border/border-common");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
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
    private cornerRadius: number;
    private backgroundColor: number;
    private borderColor: number;
    private bitmap: android.graphics.Bitmap

    constructor(borderWidth: number, borderColor: number, backgroundColor: number, cornerRadius: number, bitmap?: android.graphics.Bitmap) {
        super();

        this.bitmap = bitmap;

        if (bitmap) {
            this.paint = new android.graphics.Paint();
        } else {
            this.backgroundColor = backgroundColor;
            this.setColor(backgroundColor);
        }

        var density = utils.layout.getDisplayDensity();

        this.stroke = borderWidth * density;
        this.borderColor = borderColor;
        this.setStroke(this.stroke, this.borderColor);

        this.cornerRadius = cornerRadius * density;
        this.setCornerRadius(this.cornerRadius);

        return global.__native(this);
    }

    public getStroke(): number {
        return this.stroke;
    }

    public getCornerRadius(): number {
        return this.cornerRadius;
    }

    public getBackgroundColor(): number {
        return this.backgroundColor;
    }

    public getBorderColor(): number {
        return this.borderColor;
    }

    public getBitmap(): android.graphics.Bitmap {
        return this.bitmap;
    }

    public draw(canvas: android.graphics.Canvas): void {
        if (this.paint) {
            canvas.drawBitmap(this.bitmap, this.stroke, this.stroke, this.paint);
        }
        super.draw(canvas);
    }
}
