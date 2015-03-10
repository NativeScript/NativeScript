import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import imageSource = require("image-source");
import definition = require("ui/image");
import trace = require("trace");
import enums = require("ui/enums");
import utils = require("utils/utils");

var SOURCE = "source";
var URL = "url";
var IMAGE = "Image";
var ISLOADING = "isLoading";
var STRETCH = "stretch";

var RESOURCE_PREFIX = "res://";

function isResource(value: string): boolean {
    return value.indexOf(RESOURCE_PREFIX) === 0;
}

function isUrl(value: string): boolean {
    return value.indexOf("http://") === 0 || value.indexOf("https://") === 0;
}

function isAppFile(value: string): boolean {
    return value.indexOf("~/") === 0;
}

function isValidUrl(url: string): boolean {
    var value = url ? url.trim() : "";
    return value !== "" && (isResource(value) || isAppFile(value) || isUrl(value));
}

function onUrlPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    var value: string = data.newValue;

    if (isValidUrl(value)) {
        value = value.trim();
        image.source = null;
        image["_url"] = value;

        image._setValue(Image.isLoadingProperty, true);

        if (isResource(value)) {
            image.source = imageSource.fromResource(value.substr(RESOURCE_PREFIX.length));
            image._setValue(Image.isLoadingProperty, false);
        }
        else if (isAppFile(value)) {
            image.source = imageSource.fromFile(value);
            image._setValue(Image.isLoadingProperty, false);
        } else {
            imageSource.fromUrl(value).then((r) => {
                if (image["_url"] === value) {
                    image.source = r;
                    image._setValue(Image.isLoadingProperty, false);
                }
            });
        }
    }
}

export class Image extends view.View implements definition.Image {

    public static urlProperty = new dependencyObservable.Property(
        URL,
        IMAGE,
        new proxy.PropertyMetadata(
            "",
            dependencyObservable.PropertyMetadataSettings.None,
            onUrlPropertyChanged
            )
        );

    public static sourceProperty = new dependencyObservable.Property(
        SOURCE,
        IMAGE,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.None
            )
        );

    public static isLoadingProperty = new dependencyObservable.Property(
        ISLOADING,
        IMAGE,
        new proxy.PropertyMetadata(
            false,
            dependencyObservable.PropertyMetadataSettings.None
            )
        );

    public static stretchProperty = new dependencyObservable.Property(
        STRETCH,
        IMAGE,
        new proxy.PropertyMetadata(
            enums.Stretch.aspectFit,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout
            )
        );

    constructor(options?: definition.Options) {
        super(options);
    }

    get source(): imageSource.ImageSource {
        return this._getValue(Image.sourceProperty);
    }
    set source(value: imageSource.ImageSource) {
        this._setValue(Image.sourceProperty, value);
    }

    get url(): string {
        return this._getValue(Image.urlProperty);
    }
    set url(value: string) {
        this._setValue(Image.urlProperty, value);
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

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        // We don't call super because we measure native view with specific size.     
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);

        var nativeWidth = this.source ? this.source.width : 0;
        var nativeHeight = this.source ? this.source.height : 0;

        var measureWidth = Math.max(nativeWidth, this.minWidth);
        var measureHeight = Math.max(nativeHeight, this.minHeight);

        var finiteWidth: boolean = widthMode !== utils.layout.UNSPECIFIED;
        var finiteHeight: boolean = heightMode !== utils.layout.UNSPECIFIED;

        if (nativeWidth !== 0 && nativeHeight !== 0 && (finiteWidth || finiteHeight)) {
            var scale = Image.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight, this.stretch);
            var resultW = nativeWidth * scale.width;
            var resultH = nativeHeight * scale.height;

            measureWidth = finiteWidth ? Math.min(resultW, width) : resultW;
            measureHeight = finiteHeight ? Math.min(resultH, height) : resultH;

            trace.write("Image stretch: " + this.stretch +
                ", nativeWidth: " + nativeWidth +
                ", nativeHeight: " + nativeHeight, trace.categories.Layout);
        }

        var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    private static computeScaleFactor(measureWidth: number, measureHeight: number, widthIsFinite: boolean, heightIsFinite: boolean, nativeWidth: number, nativeHeight: number, imageStretch: string): { width: number; height: number } {
        var scaleW = 1;
        var scaleH = 1;

        if ((imageStretch === enums.Stretch.aspectFill || imageStretch === enums.Stretch.aspectFit || imageStretch === enums.Stretch.fill) &&
            (widthIsFinite || heightIsFinite)) {

            scaleW = (nativeWidth > 0) ? measureWidth / nativeWidth : 0;
            scaleH = (nativeHeight > 0) ? measureHeight / nativeHeight : 0;

            if (!widthIsFinite) {
                scaleW = scaleH;
            }
            else if (!heightIsFinite) {
                scaleH = scaleW;
            }
            else {
                // No infinite dimensions.
                switch (imageStretch) {
                    case enums.Stretch.aspectFit:
                        scaleH = scaleW < scaleH ? scaleW : scaleH;
                        scaleW = scaleH;
                        break;
                    case enums.Stretch.aspectFill:
                        scaleH = scaleW > scaleH ? scaleW : scaleH;
                        scaleW = scaleH;
                        break;
                }
            }
        }
        return { width: scaleW, height: scaleH };
    }
}
