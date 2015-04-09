import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import imageSource = require("image-source");
import definition = require("ui/image");
import trace = require("trace");
import enums = require("ui/enums");
import utils = require("utils/utils");
import types = require("utils/types");

var SRC = "src";
var IMAGE_SOURCE = "imageSource";

var IMAGE = "Image";
var ISLOADING = "isLoading";
var STRETCH = "stretch";

function isValidSrc(src: any): boolean {
    return types.isString(src);
}

function onSrcPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    var value = data.newValue;

    if (isValidSrc(value)) {
        value = value.trim();
        image.imageSource = null;
        image["_url"] = value;

        image._setValue(Image.isLoadingProperty, true);

        if (imageSource.isFileOrResourcePath(value)) {
            image.imageSource = imageSource.fromFileOrResource(value);
            image._setValue(Image.isLoadingProperty, false);
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
        // Support binding the iamgeSource trough the src propoerty
        image.imageSource = value;
    }
}

export class Image extends view.View implements definition.Image {

    public static srcProperty = new dependencyObservable.Property(
        SRC,
        IMAGE,
        new proxy.PropertyMetadata(
            "",
            dependencyObservable.PropertyMetadataSettings.None,
            onSrcPropertyChanged
            )
        );

    public static imageSourceProperty = new dependencyObservable.Property(
        IMAGE_SOURCE,
        IMAGE,
        new proxy.PropertyMetadata(
            undefined,
            // None on purpose. for iOS we trigger it manually if needed. Android layout handles it.
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

    get imageSource(): imageSource.ImageSource {
        return this._getValue(Image.imageSourceProperty);
    }
    set imageSource(value: imageSource.ImageSource) {
        this._setValue(Image.imageSourceProperty, value);
    }

    get src(): string {
        return this._getValue(Image.srcProperty);
    }
    set src(value: string) {
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

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {

        // We don't call super because we measure native view with specific size.     
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        trace.write(this + " :onMeasure: " + utils.layout.getMode(widthMode) + " " + width + ", " + utils.layout.getMode(heightMode) + " " + height, trace.categories.Layout);

        var nativeWidth = this.imageSource ? this.imageSource.width : 0;
        var nativeHeight = this.imageSource ? this.imageSource.height : 0;

        var measureWidth = Math.max(nativeWidth, this.minWidth);
        var measureHeight = Math.max(nativeHeight, this.minHeight);

        var finiteWidth: boolean = widthMode !== utils.layout.UNSPECIFIED;
        var finiteHeight: boolean = heightMode !== utils.layout.UNSPECIFIED;

        if (nativeWidth !== 0 && nativeHeight !== 0 && (finiteWidth || finiteHeight)) {
            var scale = Image.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight, this.stretch);
            var resultW = Math.floor(nativeWidth * scale.width);
            var resultH = Math.floor(nativeHeight * scale.height);

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
