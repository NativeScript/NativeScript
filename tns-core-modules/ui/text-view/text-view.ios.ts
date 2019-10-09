import { ScrollEventData } from "../scroll-view";
import { TextView as TextViewDefinition } from ".";
import {
    EditableTextBase, editableProperty, hintProperty, textProperty, colorProperty, placeholderColorProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty,
    Length, _updateCharactersInRangeReplacementString, Color, layout,
    CSSType
} from "../editable-text-base";

export * from "../editable-text-base";

import { profile } from "../../profiling";
import { ios } from "../../utils/utils";

const majorVersion = ios.MajorVersion;

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

    public textViewDidBeginEditing(textView: UITextView): void {
        const owner = this._owner.get();
        if (owner) {
            owner._isEditing = true;
            owner.notify({ eventName: TextView.focusEvent, object: owner });
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
            owner.requestLayout();
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

    public scrollViewDidScroll(sv: UIScrollView): void {
        const owner = this._owner.get();
        if (owner) {
            const contentOffset = owner.nativeViewProtected.contentOffset;
            owner.notify(<ScrollEventData>{
                object: owner,
                eventName: "scroll",
                scrollX: contentOffset.x,
                scrollY: contentOffset.y
            });
        }
    }
}

class NoScrollAnimationUITextView extends UITextView {
    // see https://github.com/NativeScript/NativeScript/issues/6863
    // UITextView internally scrolls the text you are currently typing to visible when newline character
    // is typed but the scroll animation is not needed because at the same time we are expanding
    // the textview (setting its frame)
    public setContentOffsetAnimated(contentOffset: CGPoint, animated: boolean): void {
        super.setContentOffsetAnimated(contentOffset, false);
    }
}

@CSSType("TextView")
export class TextView extends EditableTextBase implements TextViewDefinition {
    nativeViewProtected: UITextView;
    private _delegate: UITextViewDelegateImpl;
    private _isShowingHint: boolean;
    public _isEditing: boolean;

    private _hintColor = majorVersion <= 12 ? UIColor.blackColor.colorWithAlphaComponent(0.22) : UIColor.placeholderTextColor;
    private _textColor = majorVersion <= 12 ? null : UIColor.labelColor;

    createNativeView() {
        const textView = NoScrollAnimationUITextView.new();
        if (!textView.font) {
            textView.font = UIFont.systemFontOfSize(12);
        }

        return textView;
    }

    initNativeView() {
        super.initNativeView();
        this._delegate = UITextViewDelegateImpl.initWithOwner(new WeakRef(this));
    }

    disposeNativeView() {
        this._delegate = null;
        super.disposeNativeView();
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        this.ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this.ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITextView {
        return this.nativeViewProtected;
    }

    public _refreshHintState(hint: string, text: string) {
        if (this.formattedText) {
            return;
        }

        if (text !== null && text !== undefined && text !== "") {
            this.showText();
        } else if (!this._isEditing && hint !== null && hint !== undefined && hint !== "") {
            this.showHint(hint);
        } else {
            this._isShowingHint = false;
            this.nativeTextViewProtected.text = "";
        }
    }

    private _refreshColor() {
        if (this._isShowingHint) {
            const placeholderColor = this.style.placeholderColor;
            const color = this.style.color;

            if (placeholderColor) {
                this.nativeTextViewProtected.textColor = placeholderColor.ios;
            } else if (color) {
                // Use semi-transparent version of color for back-compatibility
                this.nativeTextViewProtected.textColor = color.ios.colorWithAlphaComponent(0.22);
            } else {
                this.nativeTextViewProtected.textColor = this._hintColor;
            }
        } else {
            const color = this.style.color;

            if (color) {
                this.nativeTextViewProtected.textColor = color.ios;
                this.nativeTextViewProtected.tintColor = color.ios;
            } else {
                this.nativeTextViewProtected.textColor = this._textColor;
                this.nativeTextViewProtected.tintColor = this._textColor;
            }
        }
    }

    public showHint(hint: string) {
        const nativeView = this.nativeTextViewProtected;

        this._isShowingHint = true;
        this._refreshColor();

        const hintAsString: string = (hint === null || hint === undefined) ? "" : hint.toString();
        nativeView.text = hintAsString;
    }

    public showText() {
        this._isShowingHint = false;
        this._refreshColor();
        this._setNativeText();
        this.requestLayout();
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
        return this.nativeTextViewProtected.editable;
    }
    [editableProperty.setNative](value: boolean) {
        this.nativeTextViewProtected.editable = value;
    }

    [colorProperty.setNative](color: Color) {
        this._refreshColor();
    }
    [placeholderColorProperty.setNative](value: Color) {
        this._refreshColor();
    }

    [borderTopWidthProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.top,
            unit: "px"
        };
    }
    [borderTopWidthProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeTextViewProtected.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    [borderRightWidthProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.right,
            unit: "px"
        };
    }
    [borderRightWidthProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeTextViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    [borderBottomWidthProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.bottom,
            unit: "px"
        };
    }
    [borderBottomWidthProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeTextViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }

    [borderLeftWidthProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.left,
            unit: "px"
        };
    }
    [borderLeftWidthProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeTextViewProtected.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }

    [paddingTopProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.top,
            unit: "px"
        };
    }
    [paddingTopProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeTextViewProtected.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    [paddingRightProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.right,
            unit: "px"
        };
    }
    [paddingRightProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeTextViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    [paddingBottomProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.bottom,
            unit: "px"
        };
    }
    [paddingBottomProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeTextViewProtected.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }
    [paddingLeftProperty.getDefault](): Length {
        return {
            value: this.nativeTextViewProtected.textContainerInset.left,
            unit: "px"
        };
    }
    [paddingLeftProperty.setNative](value: Length) {
        let inset = this.nativeTextViewProtected.textContainerInset;
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeTextViewProtected.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }
}

TextView.prototype.recycleNativeView = "auto";
