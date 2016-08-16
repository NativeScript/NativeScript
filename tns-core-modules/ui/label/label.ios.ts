import common = require("./label-common");
import * as enums from "ui/enums";
import * as utils from "utils/utils";
import * as backgroundModule from "ui/styling/background";
import {View} from "ui/core/view";
import style = require("ui/styling/style");

global.moduleMerge(common, exports);

var background: typeof backgroundModule;
function ensureBackground() {
    if (!background) {
        background = require("ui/styling/background");
    }
}

enum FixedSize {
    NONE = 0,
    WIDTH = 1,
    HEIGHT = 2,
    BOTH = 3
}

export class Label extends common.Label {
    private _ios: UILabel;
    private _fixedSize: FixedSize;

    constructor() {
        super();

        this._ios = TNSLabel.new();
        this._ios.userInteractionEnabled = true;
    }

    get ios(): UILabel {
        return this._ios;
    }

    get _nativeView(): UILabel {
        return this._ios;
    }

    public onLoaded() {
        super.onLoaded();
    }

    _requestLayoutOnTextChanged(): void {
        console.log("requestLayout called --------------------------------------->");
        if (this._fixedSize === FixedSize.BOTH) {
            return;
        }
        if (this._fixedSize === FixedSize.WIDTH && !this.textWrap) {
            // Single line label with fixed width will skip request layout on text change.
            return;
        }
        console.log("actual requestLayout called --------------------------------------->");
        super._requestLayoutOnTextChanged();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var nativeView = this._nativeView;
        if (nativeView) {
            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            if (widthMode === utils.layout.UNSPECIFIED) {
                width = Number.POSITIVE_INFINITY;
            }

            if (heightMode === utils.layout.UNSPECIFIED) {
                height = Number.POSITIVE_INFINITY;
            }

            if (this.text !== "") {
                this._fixedSize = (widthMode === utils.layout.EXACTLY ? FixedSize.WIDTH : FixedSize.NONE)
                    | (heightMode === utils.layout.EXACTLY ? FixedSize.HEIGHT : FixedSize.NONE);
            }
            else {
                this._fixedSize = FixedSize.NONE;
            }

            var nativeSize = nativeView.sizeThatFits(CGSizeMake(width, height));
            var labelWidth = nativeSize.width;

            if (!this.textWrap && this.style.whiteSpace !== enums.WhiteSpace.nowrap) {
                labelWidth = Math.min(labelWidth, width);
            }

            var measureWidth = Math.max(labelWidth, this.minWidth);
            var measureHeight = Math.max(nativeSize.height, this.minHeight);

            var widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }
}

let zeroInsets = UIEdgeInsetsZero;

export class LabelStyler implements style.Styler {
    //Background methods
    private static setBackgroundInternalProperty(view: View, newValue: any) {
        var uiLabel: UILabel = <UILabel>view._nativeView;
        if (uiLabel && uiLabel.layer) {
            var flipImage = true;
            ensureBackground();
            var uiColor = <UIColor>background.ios.createBackgroundUIColor(view, flipImage);
            var cgColor = uiColor ? uiColor.CGColor : null;
            uiLabel.layer.backgroundColor = cgColor;
        }
    }

    private static resetBackgroundInternalProperty(view: View, nativeValue: any) {
        var uiLabel: UILabel = <UILabel>view._nativeView;
        if (uiLabel && uiLabel.layer) {
            var uiColor = <UIColor>nativeValue;
            var cgColor = uiColor ? uiColor.CGColor : null;
            uiLabel.layer.backgroundColor = cgColor;
        }
    }

    private static getNativeBackgroundInternalValue(view: View): any {
        var uiLabel: UILabel = <UILabel>view._nativeView;
        if (uiLabel && uiLabel.layer && uiLabel.layer.backgroundColor) {
            return UIColor.colorWithCGColor(uiLabel.layer.backgroundColor);
        }

        return undefined;
    }

    private static setBorderWidthProperty(view: View, newValue: number) {
        LabelStyler.setNativeBorderWidth(view, newValue);
    }

    private static resetBorderWidthProperty(view: View, nativeValue: number) {
        LabelStyler.setNativeBorderWidth(view, nativeValue);
    }

    private static setNativeBorderWidth(view: View, newValue: number) {
        let nativeView = <UIView>view._nativeView;
        if (nativeView instanceof UIView) {
            nativeView.layer.borderWidth = newValue;
        }
        if (nativeView instanceof TNSLabel) {
            nativeView.borderThickness = { top: newValue, left: newValue, bottom: newValue, right: newValue };
        }
    }

    private static getBorderWidthProperty(view: View): number {
        let nativeView = <UIView>view._nativeView;
        if (nativeView instanceof UIView) {
            return nativeView.layer.borderWidth;
        }
        return 0;
    }

    private static setPaddingProperty(view: View, newValue: UIEdgeInsets) {
        LabelStyler.setNativePadding(view, newValue);
    }

    private static resetPaddingProperty(view: View, nativeValue: UIEdgeInsets) {
        LabelStyler.setNativePadding(view, nativeValue);
    }

    private static setNativePadding(view: View, padding: UIEdgeInsets) {
        let nativeView = <UIView>view._nativeView;
        if (nativeView instanceof TNSLabel) {
            nativeView.padding = { top: padding.top, left: padding.left, bottom: padding.bottom, right: padding.right };
        }
    }

    private static getPaddingProperty(view: View): UIEdgeInsets {
        let nativeView = <UIView>view._nativeView;
        if (nativeView instanceof TNSLabel) {
            return nativeView.padding;
        }
        return zeroInsets;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundInternalProperty, new style.StylePropertyChangedHandler(
            LabelStyler.setBackgroundInternalProperty,
            LabelStyler.resetBackgroundInternalProperty,
            LabelStyler.getNativeBackgroundInternalValue), "Label");
        style.registerHandler(style.borderWidthProperty, new style.StylePropertyChangedHandler(
            LabelStyler.setBorderWidthProperty,
            LabelStyler.resetBorderWidthProperty,
            LabelStyler.getBorderWidthProperty), "Label");
        style.registerHandler(style.nativePaddingsProperty, new style.StylePropertyChangedHandler(
            LabelStyler.setPaddingProperty,
            LabelStyler.resetPaddingProperty,
            LabelStyler.getPaddingProperty), "Label");
    }
}

LabelStyler.registerHandlers();