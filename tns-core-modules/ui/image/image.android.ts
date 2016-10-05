import imageCommon = require("./image-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");
import view = require("ui/core/view");
import enums = require("ui/enums");
import types = require("utils/types");
import imageSource = require("image-source");
import utils = require("utils/utils");
import * as fs from "file-system";
import * as application from "application";

global.moduleMerge(imageCommon, exports);

const FILE_PREFIX = "file:///";
let ASYNC = "async";
let imageFetcher: org.nativescript.widgets.image.Fetcher;
let imageCache: org.nativescript.widgets.image.Cache;
export let currentMode: number;

function onStretchPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    let image = <Image>data.object;
    if (!image.android) {
        return;
    }

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

    image._setNativeImage(data.newValue);
}

export function initImageCache(context: android.content.Context, mode: number = 2, memoryCacheSize: number = 0.25, diskCacheSize: number = 10 * 1024 * 1024): void {
    if (currentMode === mode) {
        return;
    }

    currentMode = mode;
    if (!imageFetcher) {
        imageFetcher = new org.nativescript.widgets.image.Fetcher(context);
    }

    // Disable cache.
    if (mode === 0) {
        if (imageCache != null && imageFetcher != null) {
            imageFetcher.clearCache();
        }
    }

    let params = new org.nativescript.widgets.image.Cache.CacheParams(context, "_imageCache");
    params.setMemCacheSizePercent(memoryCacheSize); // Set memory cache to % of app memory
    params.diskCacheEnabled = mode > 1;
    params.diskCacheSize = diskCacheSize;
    imageCache = org.nativescript.widgets.image.Cache.getInstance(params);
    imageFetcher.addImageCache(imageCache);
    imageFetcher.initCache();
}

initImageCache(application.android.nativeApp);

// register the setNativeValue callback
(<proxy.PropertyMetadata>imageCommon.Image.imageSourceProperty.metadata).onSetNativeValue = onImageSourcePropertyChanged;
(<proxy.PropertyMetadata>imageCommon.Image.stretchProperty.metadata).onSetNativeValue = onStretchPropertyChanged;

export class Image extends imageCommon.Image {
    private _android: org.nativescript.widgets.ImageView;

    public decodeWidth = 0;
    public decodeHeight = 0;
    public useCache = true;

    get android(): org.nativescript.widgets.ImageView {
        return this._android;
    }

    public _createUI() {
        this._android = new org.nativescript.widgets.ImageView(this._context);
        this._createImageSourceFromSrc();
    }

    public _setNativeImage(nativeImage: any) {
        if (!nativeImage) {
            return;
        }
        
        let rotation = nativeImage.rotationAngle ? nativeImage.rotationAngle : 0 ;
        if (rotation > 0) {
             this.android.setRotationAngle(rotation);
        }
        this.android.setImageBitmap(nativeImage.android);
    }

    public _createImageSourceFromSrc() {
        let imageView = this._android;
        if (!imageView) {
            return;
        }

        let value = this.src;
        let async = this.loadMode === ASYNC;
        let owner = new WeakRef<Image>(this);
        let listener = new org.nativescript.widgets.image.Worker.OnImageLoadedListener({
            onImageLoaded: function (success) {
                let that = owner.get();
                if (that) {
                    that._setValue(Image.isLoadingProperty, false);
                }
            }
        });

        this._resetValue(Image.imageSourceProperty);
        if (types.isString(value)) {
            value = value.trim();
            this._setValue(Image.isLoadingProperty, true);

            if (utils.isDataURI(value)) {
                // TODO: Check with runtime what should we do in case of base64 string.
                super._createImageSourceFromSrc();
            }
            else if (imageSource.isFileOrResourcePath(value)) {
                if (value.indexOf(utils.RESOURCE_PREFIX) === 0) {
                    imageFetcher.loadImage(value, imageView, this.decodeWidth, this.decodeHeight, this.useCache, async, listener);
                }
                else {
                    let fileName = value;
                    if (fileName.indexOf("~/") === 0) {
                        fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace("~/", ""));
                    }

                    imageFetcher.loadImage(FILE_PREFIX + fileName, imageView, this.decodeWidth, this.decodeHeight, this.useCache, async, listener);
                }
            }
            else {
                // For backwards compatibility http always use async loading.
                imageFetcher.loadImage(value, imageView, this.decodeWidth, this.decodeHeight, this.useCache, true, listener);
            }
        } else {
            super._createImageSourceFromSrc();
        }
    }
}

export class ImageStyler implements style.Styler {
    // tint color
    private static setTintColorProperty(view: view.View, newValue: any) {
        var imageView = <org.nativescript.widgets.ImageView>view._nativeView;
        imageView.setColorFilter(newValue);
    }

    private static resetTintColorProperty(view: view.View, nativeValue: number) {
        var imageView = <org.nativescript.widgets.ImageView>view._nativeView;
        imageView.clearColorFilter();
    }

    public static registerHandlers() {
        style.registerHandler(style.tintColorProperty, new style.StylePropertyChangedHandler(
            ImageStyler.setTintColorProperty,
            ImageStyler.resetTintColorProperty), "Image");
    }
}

ImageStyler.registerHandlers();