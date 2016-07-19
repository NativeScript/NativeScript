import imageCommon = require("./image-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import enums = require("ui/enums");
import * as trace from "trace";
import * as utils from "utils/utils";

global.moduleMerge(imageCommon, exports);

function onStretchPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;

    switch (data.newValue) {
        case enums.Stretch.aspectFit:
            image.ios.contentMode = UIViewContentMode.ScaleAspectFit;
            break;
        case enums.Stretch.aspectFill:
            image.ios.contentMode = UIViewContentMode.ScaleAspectFill;
            break;
        case enums.Stretch.fill:
            image.ios.contentMode = UIViewContentMode.ScaleToFill;
            break;
        case enums.Stretch.none:
        default:
            image.ios.contentMode = UIViewContentMode.TopLeft;
            break;
    }
}

function onImageSourcePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var image = <Image>data.object;
    image._setNativeImage(data.newValue ? data.newValue.ios : null);
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>imageCommon.Image.imageSourceProperty.metadata).onSetNativeValue = onImageSourcePropertyChanged;
(<proxy.PropertyMetadata>imageCommon.Image.stretchProperty.metadata).onSetNativeValue = onStretchPropertyChanged;

export class Image extends imageCommon.Image {
    private _ios: UIImageView;
    private _imageSourceAffectsLayout: boolean = true;

    constructor() {
        super();

        //TODO: Think of unified way of setting all the default values.
        this._ios = UIImageView.new();
        this._ios.contentMode = UIViewContentMode.ScaleAspectFit;
        this._ios.clipsToBounds = true;
        this._ios.userInteractionEnabled = true;
    }

    get ios(): UIImageView {
        return this._ios;
    }

    public _setNativeImage(nativeImage: any) {
        this.ios.image = nativeImage;

        if (this._imageSourceAffectsLayout) {
            this.requestLayout();
        }
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // We don't call super because we measure native view with specific size.     
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var nativeWidth = this.imageSource ? this.imageSource.width : 0;
        var nativeHeight = this.imageSource ? this.imageSource.height : 0;

        var measureWidth = Math.max(nativeWidth, this.minWidth);
        var measureHeight = Math.max(nativeHeight, this.minHeight);

        var finiteWidth: boolean = widthMode !== utils.layout.UNSPECIFIED;
        var finiteHeight: boolean = heightMode !== utils.layout.UNSPECIFIED;
        
        this._imageSourceAffectsLayout = widthMode !== utils.layout.EXACTLY || heightMode !== utils.layout.EXACTLY;
        
        if (nativeWidth !== 0 && nativeHeight !== 0 && (finiteWidth || finiteHeight)) {
            var scale = Image.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight, this.stretch);
            var resultW = Math.round(nativeWidth * scale.width);
            var resultH = Math.round(nativeHeight * scale.height);

            measureWidth = finiteWidth ? Math.min(resultW, width) : resultW;
            measureHeight = finiteHeight ? Math.min(resultH, height) : resultH;

            if (trace.enabled) {
                trace.write("Image stretch: " + this.stretch +
                    ", nativeWidth: " + nativeWidth +
                    ", nativeHeight: " + nativeHeight, trace.categories.Layout);
            }
        }

        var widthAndState = Image.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = Image.resolveSizeAndState(measureHeight, height, heightMode, 0);

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
