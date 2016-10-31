import { TextView as TextViewDefinition } from "ui/text-view";
import { EditableTextBase } from "ui/editable-text-base";
import { textProperty } from "ui/text-base";
import { UpdateTextTrigger } from "ui/enums";
import {
    colorProperty, borderTopWidthProperty, borderRightWidthProperty,
    borderBottomWidthProperty, borderLeftWidthProperty, nativePaddingsProperty
} from "ui/styling/style";
import { isNullOrUndefined } from "utils/types";
import * as utils from "utils/utils";

export * from "ui/text-base";

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
            if (owner.updateTextTrigger === UpdateTextTrigger.focusLost) {
                owner.nativePropertyChangeded(textProperty, textView.text);
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
            if (owner.updateTextTrigger === UpdateTextTrigger.textChanged) {
                owner.nativePropertyChangeded(textProperty, textView.text);
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

    public nativeView: UITextView;

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

    public _onEditablePropertyChanged(data: PropertyChangeData) {
        this._ios.editable = data.newValue;
    }

    public _onHintPropertyChanged(data: PropertyChangeData) {
        this._refreshHintState(data.newValue, this.text);
    }

    public _onTextPropertyChanged(data: PropertyChangeData) {
        super._onTextPropertyChanged(data);
        this._refreshHintState(this.hint, data.newValue);
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
        this.ios.textColor = this.ios.textColor ? this.ios.textColor.colorWithAlphaComponent(0.22) : utils.ios.getter(UIColor, UIColor.blackColor).colorWithAlphaComponent(0.22);
        this.ios.text = isNullOrUndefined(hint) ? "" : hint + "";
        this._isShowingHint = true;
    }

    public _hideHint() {
        this.ios.textColor = this.color ? this.color.ios : null;
        this.ios.text = isNullOrUndefined(this.text) ? "" : this.text + "";
        this._isShowingHint = false;
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
    set [colorProperty.native](color: UIColor) {
        let textView = this.nativeView;
        if (this._isShowingHint && color) {
            textView.textColor = color.colorWithAlphaComponent(0.22);
        }
        else {
            textView.textColor = color;
            textView.tintColor = color;
        }
    }

    get [borderTopWidthProperty.native](): number {
        return this.nativeView.textContainerInset.top;
    }
    set [borderTopWidthProperty.native](value: number) {
        let inset = this.nativeView.textContainerInset;
        let top = this.style.paddingTop + value;
        this.nativeView.textContainerInset = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }
    get [borderRightWidthProperty.native](): number {
        return this.nativeView.textContainerInset.right;
    }
    set [borderRightWidthProperty.native](value: number) {
        let inset = this.nativeView.textContainerInset;
        let right = this.style.paddingRight + value;
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }
    get [borderBottomWidthProperty.native](): number {
        return this.nativeView.textContainerInset.bottom;
    }
    set [borderBottomWidthProperty.native](value: number) {
        let inset = this.nativeView.textContainerInset;
        let bottom = this.style.paddingBottom + value;
        this.nativeView.textContainerInset = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }
    get [borderLeftWidthProperty.native](): number {
        return this.nativeView.textContainerInset.left;
    }
    set [borderLeftWidthProperty.native](value: number) {
        let inset = this.nativeView.textContainerInset;
        let left = this.style.paddingLeft + value;
        this.nativeView.textContainerInset = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }

    get [nativePaddingsProperty.native](): UIEdgeInsets {
        return this.nativeView.textContainerInset;
    }
    set [nativePaddingsProperty.native](value: UIEdgeInsets) {
        let inset: UIEdgeInsets;
        if (!value) {
            inset = {
                top: this.style.borderTopWidth,
                left: this.style.borderLeftWidth,
                bottom: this.style.borderBottomWidth,
                right: this.style.borderRightWidth
            };
        } else {
            inset = {
                top: this.style.borderTopWidth + value.top,
                left: this.style.borderLeftWidth + value.left,
                bottom: this.style.borderBottomWidth + value.bottom,
                right: this.style.borderRightWidth + value.right
            };
        }

        this.nativeView.textContainerInset = inset;
    }
}