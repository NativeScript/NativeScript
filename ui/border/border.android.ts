import borderCommon = require("ui/border/border-common");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import utils = require("utils/utils");
import styleModule = require("ui/styling/style");

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
//(<proxy.PropertyMetadata>styleModule.backgroundColorProperty.metadata).onSetNativeValue = onBorderPropertyChanged;

export class Border extends borderCommon.Border {
    public _updateAndroidBorder() {
        if (!this._nativeView) {
            return;
        }

        var viewGroup = <android.view.ViewGroup>this._nativeView;

        var bkg = <BorderGradientDrawable>viewGroup.getBackground();

        if (!(bkg instanceof BorderGradientDrawable)) {
            bkg = new BorderGradientDrawable();
            viewGroup.setBackground(bkg);
        }

        bkg.borderWidth = this.borderWidth;
        bkg.cornerRadius = this.cornerRadius;
        bkg.borderColor = this.borderColor ? this.borderColor.android : android.graphics.Color.TRANSPARENT;
        bkg.backgroundColor = this.backgroundColor ? this.backgroundColor.android : android.graphics.Color.TRANSPARENT;

        var value = this.style._getValue(styleModule.backgroundImageSourceProperty);
        bkg.bitmap = value ? value.android : undefined;
    }
}

class BorderGradientDrawable extends android.graphics.drawable.GradientDrawable {
    private _density = utils.layout.getDisplayDensity();

    constructor() {
        super();

        return global.__native(this);
    }

    private _borderWidth: number;
    get borderWidth(): number {
        return this._borderWidth;
    }
    set borderWidth(value: number) {
        if (this._borderWidth !== value) {
            this._borderWidth = value;

            this.setStroke(this._borderWidth * this._density, this._borderColor);
        }
    }

    private _cornerRadius: number;
    get cornerRadius(): number {
        return this._cornerRadius;
    }
    set cornerRadius(value: number) {
        if (this._cornerRadius !== value) {
            this._cornerRadius = value;

            this.setCornerRadius(this._cornerRadius);
        }
    }

    private _borderColor: number;
    get borderColor(): number {
        return this._borderColor;
    }
    set borderColor(value: number) {
        if (this._borderColor !== value) {
            this._borderColor = value;

            this.setStroke(this._borderWidth * this._density, this._borderColor);
        }
    }

    private _backgroundColor: number;
    get backgroundColor(): number {
        return this._backgroundColor;
    }
    set backgroundColor(value: number) {
        if (this._backgroundColor !== value) {
            this._backgroundColor = value;

            this.setColor(this._backgroundColor);
        }
    }

    private _bitmap: android.graphics.Bitmap
    get bitmap(): android.graphics.Bitmap {
        return this._bitmap;
    }
    set bitmap(value: android.graphics.Bitmap) {
        if (this._bitmap !== value) {
            this._bitmap = value;

            this.invalidateSelf();
        }
    }

    public draw(canvas: android.graphics.Canvas): void {
        if (this.bitmap) {
            this.setColor(android.graphics.Color.TRANSPARENT);

            var stroke = this._borderWidth * this._density;
            canvas.drawBitmap(this.bitmap, stroke, stroke, undefined);
        }
        super.draw(canvas);
    }
}
