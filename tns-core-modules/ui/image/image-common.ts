import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import imageSource = require("image-source");
import definition = require("ui/image");
import enums = require("ui/enums");
import platform = require("platform");
import utils = require("utils/utils");
import color = require("color");

import * as types from "utils/types";

var SRC = "src";
var IMAGE_SOURCE = "imageSource";
var LOAD_MODE = "loadMode";

var SYNC = "sync";
var ASYNC = "async";

var IMAGE = "Image";
var ISLOADING = "isLoading";
var STRETCH = "stretch";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? dependencyObservable.PropertyMetadataSettings.None : dependencyObservable.PropertyMetadataSettings.AffectsLayout;

function onSrcPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    // Check for delay...
    image._createImageSourceFromSrc();
}

export class Image extends view.View implements definition.Image {

    public static srcProperty = new dependencyObservable.Property(SRC, IMAGE,
        new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, onSrcPropertyChanged));

    // None on purpose. for iOS we trigger it manually if needed. Android layout handles it.
    public static imageSourceProperty = new dependencyObservable.Property(IMAGE_SOURCE, IMAGE,
        new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None));

    public static isLoadingProperty = new dependencyObservable.Property(ISLOADING, IMAGE,
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.None));

    public static stretchProperty = new dependencyObservable.Property(STRETCH, IMAGE,
        new proxy.PropertyMetadata(enums.Stretch.aspectFit, AffectsLayout));
        
    public static loadModeProperty = new dependencyObservable.Property(LOAD_MODE, IMAGE,
        new proxy.PropertyMetadata(SYNC, 0, null, (value) => value === SYNC || value === ASYNC, null));

    get imageSource(): imageSource.ImageSource {
        return this._getValue(Image.imageSourceProperty);
    }
    set imageSource(value: imageSource.ImageSource) {
        this._setValue(Image.imageSourceProperty, value);
    }

    get src(): any {
        return this._getValue(Image.srcProperty);
    }
    set src(value: any) {
        this._setValue(Image.srcProperty, value);
    }

    get isLoading(): boolean {
        return this._getValue(Image.isLoadingProperty);
    }

    get stretch(): string {
        return this._getValue(Image.stretchProperty);
    }
    set stretch(value: string) {
        this._setValue(Image.stretchProperty, value);
    }

    get loadMode(): "sync" | "async" {
        return this._getValue(Image.loadModeProperty);
    }
    set loadMode(value: "sync" | "async") {
        this._setValue(Image.loadModeProperty, value);
    }

    get tintColor(): color.Color {
        return this.style.tintColor;
    }

    set tintColor(value: color.Color) {
        this.style.tintColor = value;
    } 

    public _setNativeImage(nativeImage: any) {
        //
    }
    
    /**
     * @internal
     */
    _createImageSourceFromSrc(): void {
        var value = this.src;
        if (types.isString(value)) {
            value = value.trim();
            this.imageSource = null;
            this["_url"] = value;

            this._setValue(Image.isLoadingProperty, true);

            var source = new imageSource.ImageSource();
            var imageLoaded = () => {
                let currentValue = this.src;
                if (!types.isString(this.src) || value !== currentValue.trim()) {
                    return;
                }
                this.imageSource = source;
                this._setValue(Image.isLoadingProperty, false);
            }
            if (utils.isDataURI(value)) {
                var base64Data = value.split(",")[1];
                if (types.isDefined(base64Data)) {
                    if (this.loadMode === SYNC) {
                        source.loadFromBase64(base64Data);
                        imageLoaded();
                    } else if (this.loadMode === ASYNC) {
                        source.fromBase64(base64Data).then(imageLoaded);
                    }
                }
            }
            else if (imageSource.isFileOrResourcePath(value)) {
                if (value.indexOf(utils.RESOURCE_PREFIX) === 0) {
                    let resPath = value.substr(utils.RESOURCE_PREFIX.length);
                    if (this.loadMode === SYNC) {
                        source.loadFromResource(resPath);
                        imageLoaded();
                    } else if (this.loadMode === ASYNC) {
                        this.imageSource = null;
                        source.fromResource(resPath).then(imageLoaded);
                    }
                } else {
                    if (this.loadMode === SYNC) {
                        source.loadFromFile(value);
                        imageLoaded();
                    } else if (this.loadMode === ASYNC) {
                        this.imageSource = null;
                        source.fromFile(value).then(imageLoaded);
                    }
                }
            } else {
                this.imageSource = null;
                imageSource.fromUrl(value).then((r) => {
                    if (this["_url"] === value) {
                        this.imageSource = r;
                        this._setValue(Image.isLoadingProperty, false);
                    }
                });
            }
        }
        else if (value instanceof imageSource.ImageSource) {
            // Support binding the imageSource trough the src property
            this.imageSource = value;
            this._setValue(Image.isLoadingProperty, false);
        }
        else {
            this.imageSource = imageSource.fromNativeSource(value);
            this._setValue(Image.isLoadingProperty, false);
        }
    }
}
