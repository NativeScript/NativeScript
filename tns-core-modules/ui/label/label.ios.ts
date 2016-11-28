import { Label as LabelDefinition } from "ui/label";
import { TextBase, whiteSpaceProperty } from "ui/text-base";
import {
    View, layout, backgroundInternalProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty
} from "ui/core/view";
import { Background, ios } from "ui/styling/background";

export * from "ui/text-base";

enum FixedSize {
    NONE = 0,
    WIDTH = 1,
    HEIGHT = 2,
    BOTH = 3
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

    get [borderTopWidthProperty.native](): number {
        return 0;
    }
    set [borderTopWidthProperty.native](value: number) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: value,
            right: border.right,
            bottom: border.bottom,
            left: border.left
        };
    }

    get [borderRightWidthProperty.native](): number {
        return 0;
    }
    set [borderRightWidthProperty.native](value: number) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: value,
            bottom: border.bottom,
            left: border.left
        };
    }

    get [borderBottomWidthProperty.native](): number {
        return 0;
    }
    set [borderBottomWidthProperty.native](value: number) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: value,
            left: border.left
        };
    }

    get [borderLeftWidthProperty.native](): number {
        return 0;
    }
    set [borderLeftWidthProperty.native](value: number) {
        let nativeView = this._nativeView;
        let border = nativeView.borderThickness;
        nativeView.borderThickness = {
            top: border.top,
            right: border.right,
            bottom: border.bottom,
            left: value
        };
    }

    get [paddingTopProperty.native](): number {
        return 0;
    }
    set [paddingTopProperty.native](value: number) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: value,
            right: padding.right,
            bottom: padding.bottom,
            left: padding.left
        };
    }

    get [paddingRightProperty.native](): number {
        return 0;
    }
    set [paddingRightProperty.native](value: number) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: value,
            bottom: padding.bottom,
            left: padding.left
        };
    }

    get [paddingBottomProperty.native](): number {
        return 0;
    }
    set [paddingBottomProperty.native](value: number) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: value,
            left: padding.left
        };
    }

    get [paddingLeftProperty.native](): number {
        return 0;
    }
    set [paddingLeftProperty.native](value: number) {
        let nativeView = this._nativeView;
        let padding = nativeView.padding;
        nativeView.padding = {
            top: padding.top,
            right: padding.right,
            bottom: padding.bottom,
            left: value
        };
    }
}