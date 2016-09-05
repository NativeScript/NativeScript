import imageCommon = require("./image-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import * as enumsModule from "ui/enums";
import style = require("ui/styling/style");
import view = require("ui/core/view");
import background = require("ui/styling/background");
import utils = require("utils/utils");

global.moduleMerge(imageCommon, exports);

var enums: typeof enumsModule;
function ensureEnums() {
    if (!enums) {
        enums = require("ui/enums");
    }
}

function onStretchPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    if (!image.android) {
        return;
    }

    ensureEnums();

    switch (data.newValue) {
        case enums.Stretch.aspectFit:
            image.android.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
            break;
        case enums.Stretch.aspectFill:
            image.android.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
            break;
        case enums.Stretch.fill:
            image.android.setScaleType(android.widget.ImageView.ScaleType.FIT_XY);
            break;
        case enums.Stretch.none:
        default:
            image.android.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
            break;
    }
}

function onImageSourcePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    if (!image.android) {
        return;
    }

    image._setNativeImage(data.newValue ? data.newValue.android : null);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>imageCommon.Image.imageSourceProperty.metadata).onSetNativeValue = onImageSourcePropertyChanged;
(<proxy.PropertyMetadata>imageCommon.Image.stretchProperty.metadata).onSetNativeValue = onStretchPropertyChanged;

export class Image extends imageCommon.Image {
    private _android: org.nativescript.widgets.ImageView;

    get android(): org.nativescript.widgets.ImageView {
        return this._android;
    }

    public onUnloaded() {
        super.onUnloaded();
        if(!this._isNativeSource) {
            this._recycle();
        }
    }

    public _createUI() {
        this._android = new org.nativescript.widgets.ImageView(this._context);
    }

    public _setNativeImage(nativeImage: any) {
        if(!this._wasNativeSource) {
            this._recycle();
        }
        this.android.setImageBitmap(nativeImage);
    }

    private _recycle() {
        let drawable: any = this.android.getDrawable();
        if(drawable) {
            let bitmap = drawable.getBitmap();
            if(bitmap) {
                drawable.getBitmap().recycle();
            }
        }
    }
}

export class ImageStyler implements style.Styler {
    // Corner radius
    private static setBorderRadiusProperty(v: view.View, newValue: any, defaultValue?: any) {
        if (!v._nativeView) {
            return;
        }
        var val = Math.round(newValue * utils.layout.getDisplayDensity());
        (<org.nativescript.widgets.ImageView>v._nativeView).setCornerRadius(val);
        background.ad.onBackgroundOrBorderPropertyChanged(v);
    }

    private static resetBorderRadiusProperty(v: view.View, nativeValue: any) {
        if (!v._nativeView) {
            return;
        }
        (<org.nativescript.widgets.ImageView>v._nativeView).setCornerRadius(0);
        background.ad.onBackgroundOrBorderPropertyChanged(v);
    }

    // Border width
    private static setBorderWidthProperty(v: view.View, newValue: any, defaultValue?: any) {
        if (!v._nativeView) {
            return;
        }

        var val = Math.round(newValue * utils.layout.getDisplayDensity());
        (<org.nativescript.widgets.ImageView>v._nativeView).setBorderWidth(val);
        background.ad.onBackgroundOrBorderPropertyChanged(v);
    }

    private static resetBorderWidthProperty(v: view.View, nativeValue: any) {
        if (!v._nativeView) {
            return;
        }
        (<org.nativescript.widgets.ImageView>v._nativeView).setBorderWidth(0);
        background.ad.onBackgroundOrBorderPropertyChanged(v);
    }

    // tint color
    private static setColorProperty(view: view.View, newValue: any) {
        var imageView = <org.nativescript.widgets.ImageView>view._nativeView;
        imageView.setColorFilter(newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var imageView = <org.nativescript.widgets.ImageView>view._nativeView;
        imageView.clearColorFilter();
    }

    public static registerHandlers() {
        // Use the same handler for all background/border properties
        // Note: There is no default value getter - the default value is handled in background.ad.onBackgroundOrBorderPropertyChanged

        style.registerHandler(style.borderRadiusProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setBorderRadiusProperty,
            ImageStyler.resetBorderRadiusProperty), "Image");

        style.registerHandler(style.borderWidthProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setBorderWidthProperty,
            ImageStyler.resetBorderWidthProperty), "Image");

        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setColorProperty,
            ImageStyler.resetColorProperty), "Image");
    }
}

ImageStyler.registerHandlers();
