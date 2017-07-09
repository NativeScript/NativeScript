import { TextView as TextViewDefinition } from ".";
import {
    EditableTextBase, editableProperty, hintProperty, textProperty, colorProperty, placeholderColorProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty,
    Length, _updateCharactersInRangeReplacementString, Color, layout
} from "../editable-text-base";
import { profile } from "../../profiling";

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

    public textViewDidBeginEditing(textView: UITextView) {
        var owner = this._owner.get();
        if (owner) {
            owner._isEditing = true;
        }
    }

    public textViewDidEndEditing(textView: UITextView) {
        const owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "focusLost") {
                textProperty.nativeValueChange(owner, textView.text);
            }

            owner._isEditing = false;
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
        if (owner) {
            const delta = replacementString.length - range.length;
            if (delta > 0) {
                if (textView.text.length + delta > owner.maxLength) {
                    return false;
                }
            }

            if (owner.formattedText) {
                _updateCharactersInRangeReplacementString(owner.formattedText, range.location, range.length, replacementString);
            }
        }

        return true;
    }
}

export class TextView extends EditableTextBase implements TextViewDefinition {
    private _ios: UITextView;
    private _delegate: UITextViewDelegateImpl;
    private _isShowingHint: boolean;
    public _isEditing: boolean;

    constructor() {
        super();

        this.nativeView = this._ios = UITextView.new();
        if (!this._ios.font) {
            this._ios.font = UIFont.systemFontOfSize(12);
        }
        this._delegate = UITextViewDelegateImpl.initWithOwner(new WeakRef(this));
    }

    @profile
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

    // get nativeView(): UITextView {
    //     return this._ios;
    // }

    public _refreshHintState(hint: string, text: string) {
        if (this.formattedText) {
            return;
        }

        if (text !== null && text !== undefined && text !== '') {
            this.showText();
        } else if (!this._isEditing && hint !== null && hint !== undefined && hint !== '') {
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

    [textProperty.getDefault](): string {
        return "";
    }
    [textProperty.setNative](value: string) {
        this._refreshHintState(this.hint, value);
    }

    [hintProperty.getDefault](): string {
        return "";
    }
    [hintProperty.setNative](value: string) {
        this._refreshHintState(value, this.text);
    }

    [editableProperty.getDefault](): boolean {
        return this.nativeView.editable;
    }
    [editableProperty.setNative](value: boolean) {
        this.nativeView.editable = value;
    }

    [colorProperty.setNative](color: Color) {
        this._refreshColor();
    }
    [placeholderColorProperty.setNative](value: Color) {
        this._refreshColor();
    }

    [borderTopWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.top,
            unit: "px"
        };
    }
    [borderTopWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeView.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    [borderRightWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.right,
            unit: "px"
        };
    }
    [borderRightWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    [borderBottomWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.bottom,
            unit: "px"
        };
    }
    [borderBottomWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }

    [borderLeftWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.left,
            unit: "px"
        };
    }
    [borderLeftWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }

    [paddingTopProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.top,
            unit: "px"
        };
    }
    [paddingTopProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeView.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    [paddingRightProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.right,
            unit: "px"
        };
    }
    [paddingRightProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    [paddingBottomProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.bottom,
            unit: "px"
        };
    }
    [paddingBottomProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }
    [paddingLeftProperty.getDefault](): Length {
        return {
            value: this.nativeView.textContainerInset.left,
            unit: "px"
        };
    }
    [paddingLeftProperty.setNative](value: Length) {
        let inset = this.nativeView.textContainerInset;
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeView.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }
}

TextView.prototype.recycleNativeView = true;