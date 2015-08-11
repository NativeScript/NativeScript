import common = require("ui/label/label-common");
import definition = require("ui/label");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils");
import viewModule = require("ui/core/view");

function onTextWrapPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var label = <Label>data.object;

    if (data.newValue) {
        label.ios.lineBreakMode = NSLineBreakMode.NSLineBreakByWordWrapping;
        label.ios.numberOfLines = 0;
    }
    else {
        label.ios.lineBreakMode = NSLineBreakMode.NSLineBreakByTruncatingTail;
        label.ios.numberOfLines = 1;
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.Label.textWrapProperty.metadata).onSetNativeValue = onTextWrapPropertyChanged;

global.moduleMerge(common, exports);

class UILabelImpl extends UILabel {
    static new(): UILabelImpl {
        return <UILabelImpl>super.new();
    }

    private _owner: Label;

    public initWithOwner(owner: Label): UILabelImpl {
        this._owner = owner;
        return this;
    }

    public textRectForBoundsLimitedToNumberOfLines(bounds: CGRect, numberOfLines: number): CGRect {
        var rect = super.textRectForBoundsLimitedToNumberOfLines(bounds, numberOfLines);
        var textRect = CGRectMake(
            - (this._owner.borderWidth + this._owner.style.paddingLeft),
            - (this._owner.borderWidth + this._owner.style.paddingTop),
            rect.size.width + (this._owner.borderWidth + this._owner.style.paddingLeft + this._owner.style.paddingRight + this._owner.borderWidth),
            rect.size.height + (this._owner.borderWidth + this._owner.style.paddingTop + this._owner.style.paddingBottom + this._owner.borderWidth)
            );
        return textRect;
    }

    public drawTextInRect(rect: CGRect): void {
        var textRect = CGRectMake(
            (this._owner.borderWidth + this._owner.style.paddingLeft),
            (this._owner.borderWidth + this._owner.style.paddingTop),
            rect.size.width - (this._owner.borderWidth + this._owner.style.paddingLeft + this._owner.style.paddingRight + this._owner.borderWidth),
            rect.size.height - (this._owner.borderWidth + this._owner.style.paddingTop + this._owner.style.paddingBottom + this._owner.borderWidth)
            );
        super.drawTextInRect(textRect);
    }
}

export class Label extends common.Label {
    private _ios: UILabel;

    constructor(options?: definition.Options) {
        super(options);

        //this._ios = new UILabel();
        this._ios = UILabelImpl.new().initWithOwner(this);
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
            if (!this.textWrap) {
                labelWidth = Math.min(labelWidth, width);
            }

            var measureWidth = Math.max(labelWidth, this.minWidth);
            var measureHeight = Math.max(nativeSize.height, this.minHeight);

            var widthAndState = viewModule.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = viewModule.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }
} 