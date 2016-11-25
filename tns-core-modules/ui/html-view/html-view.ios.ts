import { HtmlView as HtmlViewDefinition } from "ui/html-view";
import { Property } from "ui/core/properties";
import { View, layout } from "ui/core/view";

export * from "ui/core/view";

export class HtmlView extends View implements HtmlViewDefinition {
    private _ios: UITextView;

    constructor() {
        super();
        this._ios = UITextView.new();

        this._ios.scrollEnabled = false;
        this._ios.editable = false;
        this._ios.selectable = true;
        this._ios.userInteractionEnabled = true;
        this._ios.dataDetectorTypes = UIDataDetectorTypes.All;
    }

    public html: string;

    get ios(): UITextView {
        return this._ios;
    }

    get _nativeView(): UITextView {
        return this._ios;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var nativeView = this._nativeView;
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

            let nativeSize = nativeView.sizeThatFits(CGSizeMake(width, height));
            let labelWidth = nativeSize.width;

            labelWidth = Math.min(labelWidth, width);
            let style = this.style;
            let measureWidth = Math.max(labelWidth, style.effectiveMinWidth);
            let measureHeight = Math.max(nativeSize.height, style.effectiveMinHeight);

            let widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            let heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }

    get [htmlProperty.native](): string {
        return "";
    }
    set [htmlProperty.native](value: string) {
        const htmlString = NSString.stringWithString(value + "");
        const nsData = htmlString.dataUsingEncoding(NSUnicodeStringEncoding);
        this._ios.attributedText = NSAttributedString.alloc().initWithDataOptionsDocumentAttributesError(nsData, <any>{ [NSDocumentTypeDocumentAttribute]: NSHTMLTextDocumentType }, null);
    }
}

// TODO: Can we use Label.ios optimization for affectsLayout???
export const htmlProperty = new Property<HtmlView, string>({ name: "html", defaultValue: "", affectsLayout: true });
htmlProperty.register(HtmlView);