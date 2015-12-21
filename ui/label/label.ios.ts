import common = require("./label-common");
import definition = require("ui/label");
import * as enumsModule from "ui/enums";
import * as utilsModule from "utils/utils";
import * as backgroundModule from "ui/styling/background";
import view = require("ui/core/view");
import style = require("ui/styling/style");
import styling = require("ui/styling");

global.moduleMerge(common, exports);

class UILabelImpl extends UILabel {

    private _owner: WeakRef<Label>;

    public static initWithOwner(owner: WeakRef<Label>): UILabelImpl {
        let labelImpl = <UILabelImpl>UILabelImpl.new();
        labelImpl._owner = owner;
        return labelImpl;
    }

    public textRectForBoundsLimitedToNumberOfLines(bounds: CGRect, numberOfLines: number): CGRect {
        let rect = super.textRectForBoundsLimitedToNumberOfLines(bounds, numberOfLines);
        let owner = this._owner.get();
        if (owner) {
            let size = rect.size;
            rect = CGRectMake(
                - (owner.borderWidth + owner.style.paddingLeft),
                - (owner.borderWidth + owner.style.paddingTop),
                size.width + (owner.borderWidth + owner.style.paddingLeft + owner.style.paddingRight + owner.borderWidth),
                size.height + (owner.borderWidth + owner.style.paddingTop + owner.style.paddingBottom + owner.borderWidth)
            );
        }

        return rect;
    }

    public drawTextInRect(rect: CGRect): void {
        let owner = this._owner.get();
        let textRect: CGRect;
        let size = rect.size;
        if (owner) {
            textRect = CGRectMake((owner.borderWidth + owner.style.paddingLeft), (owner.borderWidth + owner.style.paddingTop),
                size.width - (owner.borderWidth + owner.style.paddingLeft + owner.style.paddingRight + owner.borderWidth),
                size.height - (owner.borderWidth + owner.style.paddingTop + owner.style.paddingBottom + owner.borderWidth));
        }
        else {
            textRect = CGRectMake(0, 0, size.width, size.height);
        }

        super.drawTextInRect(textRect);
    }
}

export class Label extends common.Label {
    private _ios: UILabel;

    constructor(options?: definition.Options) {
        super(options);

        this._ios = UILabelImpl.initWithOwner(new WeakRef(this));
        this._ios.userInteractionEnabled = true;
    }

    get ios(): UILabel {
        return this._ios;
    }

    get _nativeView(): UILabel {
        return this._ios;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var nativeView = this._nativeView;
        if (nativeView) {
            var utils: typeof utilsModule = require("utils/utils");

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

            var nativeSize = nativeView.sizeThatFits(CGSizeMake(width, height));
            var labelWidth = nativeSize.width;

            var enums: typeof enumsModule = require("ui/enums");

            if (!this.textWrap && this.style.whiteSpace !== enums.WhiteSpace.nowrap) {
                labelWidth = Math.min(labelWidth, width);
            }

            var measureWidth = Math.max(labelWidth, this.minWidth);
            var measureHeight = Math.max(nativeSize.height, this.minHeight);

            var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }
} 

export class LabelStyler implements style.Styler {
    //Background methods
    private static setBackgroundInternalProperty(view: view.View, newValue: any) {
        var uiLabel: UILabel = <UILabel>view._nativeView;
        if (uiLabel && uiLabel.layer) {
            var flipImage = true;
            var background: typeof backgroundModule = require("ui/styling/background");
            var uiColor = <UIColor>background.ios.createBackgroundUIColor(view, flipImage);
            var cgColor = uiColor ? uiColor.CGColor : null;
            uiLabel.layer.backgroundColor = cgColor;
        }
    }

    private static resetBackgroundInternalProperty(view: view.View, nativeValue: any) {
        var uiLabel: UILabel = <UILabel>view._nativeView;
        if (uiLabel && uiLabel.layer) {
            var uiColor = <UIColor>nativeValue;
            var cgColor = uiColor ? uiColor.CGColor : null;
            uiLabel.layer.backgroundColor = cgColor;
        }
    }

    private static getNativeBackgroundInternalValue(view: view.View): any {
        var uiLabel: UILabel = <UILabel>view._nativeView;
        if (uiLabel && uiLabel.layer && uiLabel.layer.backgroundColor) {
            return UIColor.colorWithCGColor(uiLabel.layer.backgroundColor);
        }

        return undefined;
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundInternalProperty, new style.StylePropertyChangedHandler(
            LabelStyler.setBackgroundInternalProperty,
            LabelStyler.resetBackgroundInternalProperty,
            LabelStyler.getNativeBackgroundInternalValue), "Label");
    }
}

LabelStyler.registerHandlers();
