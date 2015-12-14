import common = require("./label-common");
import definition = require("ui/label");
import * as enumsModule from "ui/enums";
import * as viewModule from "ui/core/view";
import * as utilsModule from "utils/utils";

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

            var vm: typeof viewModule = require("ui/core/view");

            var widthAndState = vm.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = vm.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }
} 
