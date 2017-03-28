import {
    HtmlViewBase, View, layout, htmlProperty
} from "./html-view-common";

export * from "./html-view-common";

export class HtmlView extends HtmlViewBase {
    nativeView: UITextView;

    constructor() {
        super();
        const nativeView = UITextView.new()
        nativeView.scrollEnabled = false;
        nativeView.editable = false;
        nativeView.selectable = true;
        nativeView.userInteractionEnabled = true;
        nativeView.dataDetectorTypes = UIDataDetectorTypes.All;

        this.nativeView = nativeView;
    }

    get ios(): UITextView {
        return this.nativeView;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const nativeView = this.nativeView;
        if (nativeView) {
            const width = layout.getMeasureSpecSize(widthMeasureSpec);
            const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

            const height = layout.getMeasureSpecSize(heightMeasureSpec);
            const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

            const desiredSize = layout.measureNativeView(nativeView, width, widthMode, height, heightMode);

            const labelWidth = widthMode === layout.AT_MOST ? Math.min(desiredSize.width, width) : desiredSize.width;
            const measureWidth = Math.max(labelWidth, this.effectiveMinWidth);
            const measureHeight = Math.max(desiredSize.height, this.effectiveMinHeight);

            const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    [htmlProperty.getDefault](): string {
        return "";
    }
    [htmlProperty.setNative](value: string) {
        const htmlString = NSString.stringWithString(value + "");
        const nsData = htmlString.dataUsingEncoding(NSUnicodeStringEncoding);
        this.nativeView.attributedText = NSAttributedString.alloc().initWithDataOptionsDocumentAttributesError(nsData, <any>{ [NSDocumentTypeDocumentAttribute]: NSHTMLTextDocumentType }, null);
    }
}
