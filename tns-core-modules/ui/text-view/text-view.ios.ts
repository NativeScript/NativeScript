import { TextView as TextViewDefinition } from "ui/text-view";
import {
    EditableTextBase, editableProperty, hintProperty, textProperty, colorProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, Length

} from "ui/editable-text-base";
import { Color } from "color";
import { ios } from "utils/utils";

export * from "ui/editable-text-base";

class UITextViewDelegateImpl extends NSObject implements UITextViewDelegate {
    public static ObjCProtocols = [UITextViewDelegate];

    private _owner: WeakRef<TextView>;

    public static initWithOwner(owner: WeakRef<TextView>): UITextViewDelegateImpl {
        let impl = <UITextViewDelegateImpl>UITextViewDelegateImpl.new();
        impl._owner = owner;
        return impl;
    }

    public textViewShouldBeginEditing(textView: UITextView): boolean {
        let owner = this._owner.get();
        if (owner) {
            owner._hideHint();
        }

        return true;
    }

    public textViewDidEndEditing(textView: UITextView) {
        let owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "focusLost") {
                owner.nativePropertyChanged(textProperty, textView.text);
            }

            owner.dismissSoftInput();
            owner._refreshHintState(owner.hint, textView.text);

            if (owner.formattedText) {
                owner.formattedText.createFormattedStringCore();

            }

            // //RemoveThisDoubleCall
            // owner.style._updateTextDecoration();
            // owner.style._updateTextTransform();
        }
    }

    public textViewDidChange(textView: UITextView) {
        let owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "textChanged") {
                owner.nativePropertyChanged(textProperty, textView.text);
            }
        }
    }

    public textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, replacementString: string): boolean {
        let owner = this._owner.get();
        if (owner && owner.formattedText) {
            owner.formattedText._updateCharactersInRangeReplacementString(range.location, range.length, replacementString);
        }

        return true;
    }
}

export class TextView extends EditableTextBase implements TextViewDefinition {
    private _ios: UITextView;
    private _delegate: UITextViewDelegateImpl;
    private _isShowingHint: boolean;

    constructor() {
        super();

        this._ios = UITextView.new();
        if (!this._ios.font) {
            this._ios.font = UIFont.systemFontOfSize(12);
        }
        this._delegate = UITextViewDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITextView {
        return this._ios;
    }

    get nativeView(): UITextView {
        return this._ios;
    }

    public _refreshHintState(hint: string, text: string) {
        if (hint && !text) {
            this._showHint(hint);
        }
        else {
            this._hideHint();
        }
    }

    public _showHint(hint: string) {
        let nativeView = this.nativeView;
        nativeView.textColor = nativeView.textColor ? nativeView.textColor.colorWithAlphaComponent(0.22) : ios.getter(UIColor, UIColor.blackColor).colorWithAlphaComponent(0.22);
        let hintAsString = hint + "";
        if (hint === null || hint === void 0) {
            hintAsString = "";
        }
        nativeView.text = hintAsString;
        this._isShowingHint = true;
    }

    public _hideHint() {
        let nativeView = this.nativeView;
        nativeView.textColor = this.color ? this.color.ios : null;
        let textAsString = this.text + "";
        if (this.text === null || this.text === void 0) {
            textAsString = "";
        }
        nativeView.text = textAsString;
        this._isShowingHint = false;
    }

    get [textProperty.native](): string {
        return "";
    }
    set [textProperty.native](value: string) {
        this._refreshHintState(this.hint, value);
    }

    get [hintProperty.native](): string {
        return "";
    }
    set [hintProperty.native](value: string) {
        this._refreshHintState(value, this.text);
    }

    get [editableProperty.native](): boolean {
        return this.nativeView.editable;
    }
    set [editableProperty.native](value: boolean) {
        this.nativeView.editable = value;
    }

    get [colorProperty.native](): UIColor {
        let textView = this.nativeView;
        if (this._isShowingHint && textView.textColor) {
            return textView.textColor.colorWithAlphaComponent(1);
        }
        else {
            return textView.textColor;
        }
    }
    set [colorProperty.native](color: UIColor | Color) {
        let textView = this.nativeView;
        let uiColor = typeof color === "UIColor" ? color : (<Color>color).ios;
        if (this._isShowingHint && uiColor) {
            textView.textColor = uiColor.colorWithAlphaComponent(0.22);
        } else {
            textView.textColor = uiColor;
            textView.tintColor = uiColor;
        }
    }

    get [borderTopWidthProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.top,
            unit: "px"
        };
    }
    set [borderTopWidthProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let top = this.effectivePaddingTop + this.effectiveBorderTopWidth;
        this.nativeView.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    get [borderRightWidthProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.right,
            unit: "px"
        };
    }
    set [borderRightWidthProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let right = this.effectivePaddingRight + this.effectiveBorderRightWidth;
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    get [borderBottomWidthProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.bottom,
            unit: "px"
        };
    }
    set [borderBottomWidthProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let bottom = this.effectivePaddingBottom + this.effectiveBorderBottomWidth;
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }

    get [borderLeftWidthProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.left,
            unit: "px"
        };
    }
    set [borderLeftWidthProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let left = this.effectivePaddingLeft + this.effectiveBorderLeftWidth;
        this.nativeView.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }

    get [paddingTopProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.top,
            unit: "px"
        };
    }
    set [paddingTopProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let top = this.effectivePaddingTop + this.effectiveBorderTopWidth;
        this.nativeView.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    get [paddingRightProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.right,
            unit: "px"
        };
    }
    set [paddingRightProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let right = this.effectivePaddingRight + this.effectiveBorderRightWidth;
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    get [paddingBottomProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.bottom,
            unit: "px"
        };
    }
    set [paddingBottomProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let bottom = this.effectivePaddingBottom + this.effectiveBorderBottomWidth;
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }
    
    get [paddingLeftProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.left,
            unit: "px"
        };
    }
    set [paddingLeftProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let left = this.effectivePaddingLeft + this.effectiveBorderLeftWidth;
        this.nativeView.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }
}