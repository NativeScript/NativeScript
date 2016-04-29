import common = require("./html-view-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import * as utils from "utils/utils";
import * as view from "ui/core/view";

function onHtmlPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <HtmlView>data.object;
    if (!view.ios) {
        return;
    }

    var types = require("utils/types");

    if (types.isString(data.newValue)) {
        var htmlString = NSString.stringWithString(data.newValue);
        var nsData = htmlString.dataUsingEncoding(NSUnicodeStringEncoding);
        view.ios.attributedText = NSAttributedString.alloc().initWithDataOptionsDocumentAttributesError(nsData, <any>{ [NSDocumentTypeDocumentAttribute]: NSHTMLTextDocumentType }, null);
    } else {
        view.ios.attributedText = NSAttributedString.new();
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.HtmlView.htmlProperty.metadata).onSetNativeValue = onHtmlPropertyChanged;

global.moduleMerge(common, exports);

export class HtmlView extends common.HtmlView {
    private _ios: UITextView;

    constructor() {
        super();
        this._ios = UITextView.new();

        this._ios.scrollEnabled = false;
        this._ios.editable = false;
        this._ios.selectable = true;
        this._ios.userInteractionEnabled = true;
        this._ios.dataDetectorTypes = UIDataDetectorTypes.UIDataDetectorTypeAll;
    }

    get ios(): UITextView {
        return this._ios;
    }

    get _nativeView(): UITextView {
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

            labelWidth = Math.min(labelWidth, width);

            var measureWidth = Math.max(labelWidth, this.minWidth);
            var measureHeight = Math.max(nativeSize.height, this.minHeight);

            var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }
} 
