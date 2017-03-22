import { Label as LabelDefinition } from ".";
import { Background } from "../styling/background";
import {
    TextBase, View, layout, backgroundInternalProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, whiteSpaceProperty,
    Length, WhiteSpace
} from "../text-base";

import { ios } from "../styling/background";

export * from "../text-base";

enum FixedSize {
    NONE = 0,
    WIDTH = 1,
    HEIGHT = 2,
    BOTH = 3
}

const zeroLength: Length = {
    value: 0,
    unit: "px"
};

export class Label extends TextBase implements LabelDefinition {
    public nativeView: TNSLabel;
    private _fixedSize: FixedSize;

    constructor() {
        super();

        this.nativeView = TNSLabel.new();
        this.nativeView.userInteractionEnabled = true;
    }

    get ios(): TNSLabel {
        return this.nativeView;
    }

    get _nativeView(): TNSLabel {
        return this.nativeView;
    }

    get textWrap(): boolean {
        return this.style.whiteSpace === WhiteSpace.NORMAL;
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? WhiteSpace.NORMAL : WhiteSpace.NO_WRAP;
    }

    public onLoaded() {
        super.onLoaded();
    }

    _requestLayoutOnTextChanged(): void {
        if (this._fixedSize === FixedSize.BOTH) {
            return;
        }
        if (this._fixedSize === FixedSize.WIDTH && !this.textWrap && this.getMeasuredHeight() > 0) {
            // Single line label with fixed width will skip request layout on text change.
            return;
        }
        super._requestLayoutOnTextChanged();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        let nativeView = this.nativeView;
        if (nativeView) {
            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            this._fixedSize = (widthMode === layout.EXACTLY ? FixedSize.WIDTH : FixedSize.NONE)
                | (heightMode === layout.EXACTLY ? FixedSize.HEIGHT : FixedSize.NONE);

            const nativeSize = layout.measureNativeView(nativeView, width, widthMode, height, heightMode);
            let labelWidth = nativeSize.width;

            if (this.textWrap && widthMode === layout.AT_MOST) {
                labelWidth = Math.min(labelWidth, width);
            }

            const measureWidth = Math.max(labelWidth, this.effectiveMinWidth);
            const measureHeight = Math.max(nativeSize.height, this.effectiveMinHeight);

            const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    [whiteSpaceProperty.getDefault](): WhiteSpace {
        return WhiteSpace.NO_WRAP;
    }
    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        const nativeView = this.nativeView;
        switch (value) {
            case WhiteSpace.NORMAL:
                nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
                nativeView.numberOfLines = 0;
                break;
            case WhiteSpace.NO_WRAP:
                nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
                nativeView.numberOfLines = 1;
                break;
            default:
                throw new Error(`Invalid whitespace value: ${value}. Valid values are: "${WhiteSpace.NORMAL}", "${WhiteSpace.NO_WRAP}".`);
        }
    }

    [backgroundInternalProperty.getDefault](): any /* CGColor */ {
        return this.nativeView.layer.backgroundColor;
    }
    [backgroundInternalProperty.setNative](value: Background) {
        if (value instanceof Background) {
            const uiColor = <UIColor>ios.createBackgroundUIColor(this, true);
            value = uiColor ? uiColor.CGColor : null;
        }

        this._setNativeClipToBounds();
        this.nativeView.layer.backgroundColor = value;
    }

    [borderTopWidthProperty.getDefault](): Length {
        return zeroLength;
    }
    [borderTopWidthProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: layout.toDeviceIndependentPixels(this.effectiveBorderTopWidth),
            right: border.right,
            bottom: border.bottom,
            left: border.left
        };
    }

    [borderRightWidthProperty.getDefault](): Length {
        return zeroLength;
    }
    [borderRightWidthProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: layout.toDeviceIndependentPixels(this.effectiveBorderRightWidth),
            bottom: border.bottom,
            left: border.left
        };
    }

    [borderBottomWidthProperty.getDefault](): Length {
        return zeroLength;
    }
    [borderBottomWidthProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: layout.toDeviceIndependentPixels(this.effectiveBorderBottomWidth),
            left: border.left
        };
    }

    [borderLeftWidthProperty.getDefault](): Length {
        return zeroLength;
    }
    [borderLeftWidthProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: border.bottom,
            left: layout.toDeviceIndependentPixels(this.effectiveBorderLeftWidth)
        };
    }

    [paddingTopProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingTopProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: layout.toDeviceIndependentPixels(this.effectivePaddingTop),
            right: padding.right,
            bottom: padding.bottom,
            left: padding.left
        };
    }

    [paddingRightProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingRightProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: layout.toDeviceIndependentPixels(this.effectivePaddingRight),
            bottom: padding.bottom,
            left: padding.left
        };
    }

    [paddingBottomProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingBottomProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: layout.toDeviceIndependentPixels(this.effectivePaddingBottom),
            left: padding.left
        };
    }

    [paddingLeftProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingLeftProperty.setNative](value: Length) {
        let nativeView = this.nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: padding.bottom,
            left: layout.toDeviceIndependentPixels(this.effectivePaddingLeft)
        };
    }
}
