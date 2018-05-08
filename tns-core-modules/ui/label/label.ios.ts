import { Label as LabelDefinition } from ".";
import { Background } from "../styling/background";
import {
    TextBase, View, layout,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, whiteSpaceProperty,
    Length, WhiteSpace, booleanConverter, CSSType
} from "../text-base";

import { ios } from "../styling/background";

export * from "../text-base";

enum FixedSize {
    NONE = 0,
    WIDTH = 1,
    HEIGHT = 2,
    BOTH = 3
}

@CSSType("Label")
export class Label extends TextBase implements LabelDefinition {
    nativeViewProtected: TNSLabel;
    private _fixedSize: FixedSize;

    constructor() {
        super();

        this.nativeViewProtected = TNSLabel.new();
        this.nativeViewProtected.userInteractionEnabled = true;
    }

    get ios(): TNSLabel {
        return this.nativeViewProtected;
    }

    get textWrap(): boolean {
        return this.style.whiteSpace === "normal";
    }
    set textWrap(value: boolean) {        
        if (typeof value === "string") {
            value = booleanConverter(value)
        }

        this.style.whiteSpace = value ? "normal" : "nowrap";
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
        let nativeView = this.nativeViewProtected;
        if (nativeView) {
            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            this._fixedSize = (widthMode === layout.EXACTLY ? FixedSize.WIDTH : FixedSize.NONE)
                | (heightMode === layout.EXACTLY ? FixedSize.HEIGHT : FixedSize.NONE);

            // NOTE: utils.measureNativeView(...) relies on UIView.sizeThatFits(...) that 
            // seems to have various issues when laying out UILabel instances.
            // We use custom measure logic here that relies on overriden 
            // UILabel.textRectForBounds:limitedToNumberOfLines: in TNSLabel widget. 
            const nativeSize = this._measureNativeView(width, widthMode, height, heightMode);
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

    private _measureNativeView(width: number, widthMode: number, height: number, heightMode: number): { width: number, height: number } {
        const view = <UILabel>this.nativeViewProtected;

        const nativeSize = view.textRectForBoundsLimitedToNumberOfLines(
            CGRectMake(
                0,
                0,
                widthMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : layout.toDeviceIndependentPixels(width),
                heightMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : layout.toDeviceIndependentPixels(height)
            ), 0).size;

        nativeSize.width = layout.round(layout.toDevicePixels(nativeSize.width));
        nativeSize.height = layout.round(layout.toDevicePixels(nativeSize.height));
        return nativeSize;
    }

    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        const nativeView = this.nativeViewProtected;
        switch (value) {
            case "normal":
                nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
                nativeView.numberOfLines = 0;
                break;
            case "nowrap":
            case "initial":
                nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
                nativeView.numberOfLines = 1;
                break;
        }
    }

    _redrawNativeBackground(value: UIColor | Background): void {
        if (value instanceof Background) {
            ios.createBackgroundUIColor(this, (color: UIColor) => {
                const cgColor = color ? color.CGColor : null;
                this.nativeViewProtected.layer.backgroundColor = cgColor;
            }, true);
        }

        this._setNativeClipToBounds();
    }

    [borderTopWidthProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: layout.toDeviceIndependentPixels(this.effectiveBorderTopWidth),
            right: border.right,
            bottom: border.bottom,
            left: border.left
        };
    }

    [borderRightWidthProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: layout.toDeviceIndependentPixels(this.effectiveBorderRightWidth),
            bottom: border.bottom,
            left: border.left
        };
    }

    [borderBottomWidthProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: layout.toDeviceIndependentPixels(this.effectiveBorderBottomWidth),
            left: border.left
        };
    }

    [borderLeftWidthProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: border.bottom,
            left: layout.toDeviceIndependentPixels(this.effectiveBorderLeftWidth)
        };
    }

    [paddingTopProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const padding = nativeView.padding;
        nativeView.padding = {
            top: layout.toDeviceIndependentPixels(this.effectivePaddingTop),
            right: padding.right,
            bottom: padding.bottom,
            left: padding.left
        };
    }

    [paddingRightProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: layout.toDeviceIndependentPixels(this.effectivePaddingRight),
            bottom: padding.bottom,
            left: padding.left
        };
    }

    [paddingBottomProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: layout.toDeviceIndependentPixels(this.effectivePaddingBottom),
            left: padding.left
        };
    }

    [paddingLeftProperty.setNative](value: Length) {
        const nativeView = this.nativeViewProtected;
        const padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: padding.bottom,
            left: layout.toDeviceIndependentPixels(this.effectivePaddingLeft)
        };
    }
}

Label.prototype.recycleNativeView = "auto";