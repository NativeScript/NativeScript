import { TextView as TextViewDefinition } from ".";
import {
    EditableTextBase, editableProperty, hintProperty, textProperty, colorProperty, placeholderColorProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, 
    Length, _updateCharactersInRangeReplacementString, Color, layout
} from "../editable-text-base";

export * from "../editable-text-base";

class UITextViewDelegateImpl extends NSObject implements UITextViewDelegate {
    public static ObjCProtocols = [UITextViewDelegate];

    private _owner: WeakRef<TextView>;

    public static initWithOwner(owner: WeakRef<TextView>): UITextViewDelegateImpl {
        const impl = <UITextViewDelegateImpl>UITextViewDelegateImpl.new();
        impl._owner = owner;
        return impl;
    }

    public textViewShouldBeginEditing(textView: UITextView): boolean {
        const owner = this._owner.get();
        if (owner) {
            owner.showText();
        }

        return true;
    }

    public textViewDidEndEditing(textView: UITextView) {
        const owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "focusLost") {
                textProperty.nativeValueChange(owner, textView.text);
            }

            owner.dismissSoftInput();
            owner._refreshHintState(owner.hint, textView.text);
        }
    }

    public textViewDidChange(textView: UITextView) {
        const owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "textChanged") {
                textProperty.nativeValueChange(owner, textView.text);
            }
        }
    }

    public textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, replacementString: string): boolean {
        const owner = this._owner.get();
        if (owner && owner.formattedText) {
            _updateCharactersInRangeReplacementString(owner.formattedText, range.location, range.length, replacementString);
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
        if (this.formattedText) {
            return;
        }
        if (text !== null && text !== undefined && text !== '') {
            this.showText();
        } else if (hint !== null && hint !== undefined && hint !== '') {
            this.showHint(hint);
        } else {
            this._isShowingHint = false;
            this.nativeView.text = '';
        }
    }

    private _refreshColor() {
        if (this._isShowingHint) {
            const placeholderColor = this.style.placeholderColor;
            const color = this.style.color;

            if (placeholderColor) {
                this.nativeView.textColor = placeholderColor.ios;
            } else if (color) {
                // Use semi-transparent vesion of color for back-compatibility 
                this.nativeView.textColor = color.ios.colorWithAlphaComponent(0.22);
            } else {
                this.nativeView.textColor = UIColor.blackColor.colorWithAlphaComponent(0.22);
            }
        } else {
            const color = this.style.color;

            if (color) {
                this.nativeView.textColor = color.ios;
            } else {
                this.nativeView.textColor = UIColor.blackColor;
            }
        }
    }

    public showHint(hint: string) {
        const nativeView = this.nativeView;

        this._isShowingHint = true;
        this._refreshColor();

        const hintAsString: string = (hint === null || hint === undefined) ? '' : hint.toString();
        nativeView.text = hintAsString;
    }

    public showText() {
        this._isShowingHint = false;
        this._refreshColor();
        this._setNativeText();
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
        return null;
    }
    set [colorProperty.native](color: Color) {
        this._refreshColor();

    }

    get [placeholderColorProperty.native](): Color {
        return null;
    }
    set [placeholderColorProperty.native](value: Color) {
        this._refreshColor();
    }

    get [borderTopWidthProperty.native](): Length {
        return {
            value: this.nativeView.textContainerInset.top,
            unit: "px"
        };
    }
    set [borderTopWidthProperty.native](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
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
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
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
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
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
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
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
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
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
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
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
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
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
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }
}
