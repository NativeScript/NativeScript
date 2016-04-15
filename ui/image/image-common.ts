import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import imageSource = require("image-source");
import definition = require("ui/image");
import enums = require("ui/enums");
import platform = require("platform");
import utils = require("utils/utils");

import * as types from "utils/types";

var SRC = "src";
var IMAGE_SOURCE = "imageSource";

var IMAGE = "Image";
var ISLOADING = "isLoading";
var STRETCH = "stretch";

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
var AffectsLayout = platform.device.os === platform.platformNames.android ? dependencyObservable.PropertyMetadataSettings.None : dependencyObservable.PropertyMetadataSettings.AffectsLayout;

function onSrcPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    var value = data.newValue;

    if (types.isString(value)) {
        value = value.trim();
        image.imageSource = null;
        image["_url"] = value;

        image._setValue(Image.isLoadingProperty, true);

        var source = new imageSource.ImageSource();

        if (utils.isDataURI(value)) {
            var base64Data = value.split(",")[1];
            if (types.isDefined(base64Data)) {
                source.fromBase64(base64Data).then(r => {
                    image.imageSource = source;
                    image._setValue(Image.isLoadingProperty, false);
                });
            }
        }
        else if (imageSource.isFileOrResourcePath(value)) {
            if (value.indexOf(utils.RESOURCE_PREFIX) === 0) {
                source.fromResource(value.substr(utils.RESOURCE_PREFIX.length)).then(r => {
                    image.imageSource = source;
                    image._setValue(Image.isLoadingProperty, false);
                });
            } else {
                source.fromFile(value).then(r => {
                    image.imageSource = source;
                    image._setValue(Image.isLoadingProperty, false);
                });
            }
        } else {
            imageSource.fromUrl(value).then((r) => {
                if (image["_url"] === value) {
                    image.imageSource = r;
                    image._setValue(Image.isLoadingProperty, false);
                }
            });
        }
    }
    else if (value instanceof imageSource.ImageSource) {
        // Support binding the imageSource trough the src property
        image.imageSource = value;
    }
    else {
        image.imageSource = imageSource.fromNativeSource(value);
    }
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

    constructor(options?: definition.Options) {
        super(options);
    }

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

    public _setNativeImage(nativeImage: any) {
        //
    }
}
