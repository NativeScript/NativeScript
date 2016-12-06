import { Label as LabelDefinition } from "ui/label";
import {
    Background, TextBase, View, layout, backgroundInternalProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, whiteSpaceProperty,
    Length
} from "ui/text-base";

import { ios } from "ui/styling/background";

export * from "ui/text-base";

enum FixedSize {
    NONE = 0,
    WIDTH = 1,
    HEIGHT = 2,
    BOTH = 3
}

const zeroLength: Length = {
    value: 0,
    unit: "px"
}

export class Label extends TextBase implements LabelDefinition {
    private _ios: TNSLabel;
    private _fixedSize: FixedSize;

    constructor() {
        super();

        this._ios = TNSLabel.new();
        this._ios.userInteractionEnabled = true;
    }

    get ios(): TNSLabel {
        return this._ios;
    }

    get _nativeView(): TNSLabel {
        return this._ios;
    }

    get textWrap(): boolean {
        return this.style.whiteSpace === "normal";
    }
    set textWrap(value: boolean) {
        this.style.whiteSpace = value ? "normal" : "nowrap";
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
        let nativeView = this._nativeView;
        if (nativeView) {
            let width = layout.getMeasureSpecSize(widthMeasureSpec);
            let widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            let height = layout.getMeasureSpecSize(heightMeasureSpec);
            let heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            if (widthMode === layout.UNSPECIFIED) {
                width = Number.POSITIVE_INFINITY;
            }

            if (heightMode === layout.UNSPECIFIED) {
                height = Number.POSITIVE_INFINITY;
            }

            this._fixedSize = (widthMode === layout.EXACTLY ? FixedSize.WIDTH : FixedSize.NONE)
                | (heightMode === layout.EXACTLY ? FixedSize.HEIGHT : FixedSize.NONE);

            let nativeSize = nativeView.sizeThatFits(CGSizeMake(width, height));
            let labelWidth = nativeSize.width;

            if (!this.textWrap && this.style.whiteSpace !== "nowrap") {
                labelWidth = Math.min(labelWidth, width);
            }

            let style = this.style;
            let measureWidth = Math.max(labelWidth, style.effectiveMinWidth);
            let measureHeight = Math.max(nativeSize.height, style.effectiveMinHeight);

            let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    get [whiteSpaceProperty.native](): "nowrap" | "normal" {
        return "normal";
    }
    set [whiteSpaceProperty.native](value: string) {
        let nativeView = this.nativeView;
        if (value === "normal") {
            nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
            nativeView.numberOfLines = 0;
        }
        else {
            nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
            nativeView.numberOfLines = 1;
        }
    }

    get [backgroundInternalProperty.native](): UIColor {
        let nativeView = this._nativeView;
        if (nativeView.layer && nativeView.layer.backgroundColor) {
            return UIColor.colorWithCGColor(nativeView.layer.backgroundColor);
        }

        return undefined;
    }
    set [backgroundInternalProperty.native](value: UIColor | Background) {
        let nativeView = this._nativeView;

        let cgColor = null;
        if (value instanceof UIColor) {
            cgColor = value.CGColor;
        } else {
            let uiColor = <UIColor>ios.createBackgroundUIColor(this, true);
            cgColor = uiColor ? uiColor.CGColor : null;
        }

        nativeView.layer.backgroundColor = cgColor;
    }

    get [borderTopWidthProperty.native](): Length {
        return zeroLength;
    }
    set [borderTopWidthProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: this.style.effectiveBorderTopWidth,
            right: border.right,
            bottom: border.bottom,
            left: border.left
        };
    }

    get [borderRightWidthProperty.native](): Length {
        return zeroLength;
    }
    set [borderRightWidthProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: this.style.effectiveBorderRightWidth,
            bottom: border.bottom,
            left: border.left
        };
    }

    get [borderBottomWidthProperty.native](): Length {
        return zeroLength;
    }
    set [borderBottomWidthProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: this.style.effectiveBorderBottomWidth,
            left: border.left
        };
    }

    get [borderLeftWidthProperty.native](): Length {
        return zeroLength;
    }
    set [borderLeftWidthProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: border.bottom,
            left: this.style.effectiveBorderLeftWidth
        };
    }

    get [paddingTopProperty.native](): Length {
        return zeroLength;
    }
    set [paddingTopProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: this.style.effectivePaddingTop,
            right: padding.right,
            bottom: padding.bottom,
            left: padding.left
        };
    }

    get [paddingRightProperty.native](): Length {
        return zeroLength;
    }
    set [paddingRightProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: this.style.effectivePaddingRight,
            bottom: padding.bottom,
            left: padding.left
        };
    }

    get [paddingBottomProperty.native](): Length {
        return zeroLength;
    }
    set [paddingBottomProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: this.style.effectivePaddingBottom,
            left: padding.left
        };
    }

    get [paddingLeftProperty.native](): Length {
        return zeroLength;
    }
    set [paddingLeftProperty.native](value: Length) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: padding.bottom,
            left: this.style.effectivePaddingLeft
        };
    }
}