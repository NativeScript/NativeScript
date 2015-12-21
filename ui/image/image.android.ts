import imageCommon = require("./image-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import * as enumsModule from "ui/enums";
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import styling = require("ui/styling");
import view = require("ui/core/view");
import background = require("ui/styling/background");
import utils = require("utils/utils");

global.moduleMerge(imageCommon, exports);

function onStretchPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    if (!image.android) {
        return;
    }

    var enums: typeof enumsModule = require("ui/enums");

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

    public _createUI() {
        this._android = new org.nativescript.widgets.ImageView(this._context);
    }

    public _setNativeImage(nativeImage: any) {
        this.android.setImageBitmap(nativeImage);
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

    public static registerHandlers() {
        // Use the same handler for all background/border properties
        // Note: There is no default value getter - the default value is handled in background.ad.onBackgroundOrBorderPropertyChanged

        style.registerHandler(style.borderRadiusProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setBorderRadiusProperty,
            ImageStyler.resetBorderRadiusProperty), "Image");

        style.registerHandler(style.borderWidthProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setBorderWidthProperty,
            ImageStyler.resetBorderWidthProperty), "Image");
    }
}

ImageStyler.registerHandlers();
