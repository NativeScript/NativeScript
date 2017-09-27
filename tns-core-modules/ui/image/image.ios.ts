import {
    ImageSource, ImageBase, stretchProperty, imageSourceProperty, tintColorProperty, srcProperty, layout, Color,
    traceEnabled, traceWrite, traceCategories
} from "./image-common";

export * from "./image-common";

export class Image extends ImageBase {
    nativeViewProtected: UIImageView;
    private _imageSourceAffectsLayout: boolean = true;
    private _templateImageWasCreated: boolean;

    constructor() {
        super();

        //TODO: Think of unified way of setting all the default values.
        const imageView = UIImageView.new();
        imageView.contentMode = UIViewContentMode.ScaleAspectFit;
        imageView.userInteractionEnabled = true;
        this.nativeViewProtected = imageView;
        this._setNativeClipToBounds();
    }

    private setTintColor(value: Color) {
        if (value && this.nativeViewProtected.image && !this._templateImageWasCreated) {
            this.nativeViewProtected.image = this.nativeViewProtected.image.imageWithRenderingMode(UIImageRenderingMode.AlwaysTemplate);
            this._templateImageWasCreated = true;
        } else if (this.nativeViewProtected.image && this._templateImageWasCreated) {
            this._templateImageWasCreated = false;
            this.nativeViewProtected.image = this.nativeViewProtected.image.imageWithRenderingMode(UIImageRenderingMode.Automatic);
        }
        this.nativeViewProtected.tintColor = value ? value.ios : null;
    }

    public _setNativeImage(nativeImage: UIImage) {
        this.nativeViewProtected.image = nativeImage;
        this._templateImageWasCreated = false;
        this.setTintColor(this.style.tintColor);

        if (this._imageSourceAffectsLayout) {
            this.requestLayout();
        }
    }

    _setNativeClipToBounds() {
        // Always set clipsToBounds for images
        this.nativeViewProtected.clipsToBounds = true;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // We don't call super because we measure native view with specific size.     
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const nativeWidth = this.imageSource ? layout.toDevicePixels(this.imageSource.width) : 0;
        const nativeHeight = this.imageSource ? layout.toDevicePixels(this.imageSource.height) : 0;

        let measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
        let measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);

        const finiteWidth: boolean = widthMode !== layout.UNSPECIFIED;
        const finiteHeight: boolean = heightMode !== layout.UNSPECIFIED;

        this._imageSourceAffectsLayout = widthMode !== layout.EXACTLY || heightMode !== layout.EXACTLY;

        if (nativeWidth !== 0 && nativeHeight !== 0 && (finiteWidth || finiteHeight)) {
            const scale = Image.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight, this.stretch);
            const resultW = Math.round(nativeWidth * scale.width);
            const resultH = Math.round(nativeHeight * scale.height);

            measureWidth = finiteWidth ? Math.min(resultW, width) : resultW;
            measureHeight = finiteHeight ? Math.min(resultH, height) : resultH;

            if (traceEnabled()) {
                traceWrite("Image stretch: " + this.stretch +
                    ", nativeWidth: " + nativeWidth +
                    ", nativeHeight: " + nativeHeight, traceCategories.Layout);
            }
        }

        const widthAndState = Image.resolveSizeAndState(measureWidth, width, widthMode, 0);
        const heightAndState = Image.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    private static computeScaleFactor(measureWidth: number, measureHeight: number, widthIsFinite: boolean, heightIsFinite: boolean, nativeWidth: number, nativeHeight: number, imageStretch: string): { width: number; height: number } {
        let scaleW = 1;
        let scaleH = 1;

        if ((imageStretch === "aspectFill" || imageStretch === "aspectFit" || imageStretch === "fill") &&
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
                    case "aspectFit":
                        scaleH = scaleW < scaleH ? scaleW : scaleH;
                        scaleW = scaleH;
                        break;
                    case "aspectFill":
                        scaleH = scaleW > scaleH ? scaleW : scaleH;
                        scaleW = scaleH;
                        break;
                }
            }
        }
        return { width: scaleW, height: scaleH };
    }

    [stretchProperty.setNative](value: "none" | "aspectFill" | "aspectFit" | "fill") {
        switch (value) {
            case "aspectFit":
                this.nativeViewProtected.contentMode = UIViewContentMode.ScaleAspectFit;
                break;

            case "aspectFill":
                this.nativeViewProtected.contentMode = UIViewContentMode.ScaleAspectFill;
                break;

            case "fill":
                this.nativeViewProtected.contentMode = UIViewContentMode.ScaleToFill;
                break;

            case "none":
            default:
                this.nativeViewProtected.contentMode = UIViewContentMode.TopLeft;
                break;
        }
    }

    [tintColorProperty.setNative](value: Color) {
        this.setTintColor(value);
    }

    [imageSourceProperty.setNative](value: ImageSource) {
        this._setNativeImage(value ? value.ios : null);
    }

    [srcProperty.setNative](value: any) {
        this._createImageSourceFromSrc(value);
    }
}