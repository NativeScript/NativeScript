import { View } from "ui/core/view";
import { TextFieldBase, secureProperty } from "./text-field-common";
import { hintProperty } from "ui/editable-text-base";

import { textProperty } from "ui/text-base";
import { UpdateTextTrigger } from "ui/enums";
import { colorProperty, placeholderColorProperty } from "ui/styling/style";

export * from "./text-field-common";

class UITextFieldDelegateImpl extends NSObject implements UITextFieldDelegate {
    public static ObjCProtocols = [UITextFieldDelegate];

    private _owner: WeakRef<TextField>;
    private firstEdit: boolean;

    public static initWithOwner(owner: WeakRef<TextField>): UITextFieldDelegateImpl {
        let delegate = <UITextFieldDelegateImpl>UITextFieldDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public textFieldShouldBeginEditing(textField: UITextField): boolean {
        this.firstEdit = true;
        let owner = this._owner.get();
        if (owner) {
            return owner.editable;
        }

        return true;
    }

    public textFieldDidEndEditing(textField: UITextField) {
        let owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === UpdateTextTrigger.focusLost) {
                owner.nativePropertyChanged(textProperty, textField.text);
            }

            owner.dismissSoftInput();

            if (owner.formattedText) {
                owner.formattedText.createFormattedStringCore();
            }
        }
    }

    public textFieldShouldClear(textField: UITextField) {
        this.firstEdit = false;
        let owner = this._owner.get();
        if (owner) {
            owner.nativePropertyChanged(textProperty, "");
        }

        return true;
    }

    public textFieldShouldReturn(textField: UITextField): boolean {
        // Called when the user presses the return button.
        let owner = this._owner.get();
        if (owner) {
            owner.dismissSoftInput();
            owner.notify({ eventName: TextField.returnPressEvent, object: owner });
        }
        return true;
    }

    public textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
        let owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === UpdateTextTrigger.textChanged) {
                if (textField.secureTextEntry && this.firstEdit) {
                    owner.nativePropertyChanged(textProperty, replacementString);
                }
                else {
                    if (range.location <= textField.text.length) {
                        let newText = NSString.stringWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
                        owner.nativePropertyChanged(textProperty, newText);
                    }
                }
            }

            if (owner.formattedText) {
                owner.formattedText._updateCharactersInRangeReplacementString(range.location, range.length, replacementString);
            }
        }

        this.firstEdit = false;
        return true;
    }
}

class UITextFieldImpl extends UITextField {

    private _owner: WeakRef<TextField>;

    public static initWithOwner(owner: WeakRef<TextField>): UITextFieldImpl {
        let handler = <UITextFieldImpl>UITextFieldImpl.new();
        handler._owner = owner;
        return handler;
    }

    private _getTextRectForBounds(bounds: CGRect): CGRect {
        let owner = this._owner ? this._owner.get() : null;

        if (!owner) {
            return bounds;
        }

        let size = bounds.size;
        return CGRectMake(owner.borderLeftWidth + owner.style.paddingLeft, owner.borderTopWidth + owner.style.paddingTop,
            size.width - (owner.borderLeftWidth + owner.style.paddingLeft + owner.style.paddingRight + owner.borderRightWidth),
            size.height - (owner.borderTopWidth + owner.style.paddingTop + owner.style.paddingBottom + owner.borderBottomWidth)
        );
    }

    public textRectForBounds(bounds: CGRect): CGRect {
        return this._getTextRectForBounds(bounds);
    }

    public editingRectForBounds(bounds: CGRect): CGRect {
        return this._getTextRectForBounds(bounds);
    }
}

export class TextField extends TextFieldBase {
    private _ios: UITextField;
    private _delegate: UITextFieldDelegateImpl;
    nativeView: UITextField;

    constructor() {
        super();
        let weakRef = new WeakRef(this);
        this._ios = UITextFieldImpl.initWithOwner(weakRef);
        this._delegate = UITextFieldDelegateImpl.initWithOwner(weakRef);
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITextField {
        return this._ios;
    }

    get [hintProperty.native](): string {
        return this.nativeView.placeholder;
    }
    set [hintProperty.native](value: string) {
        this.nativeView.placeholder = value + '';
    }

    get [secureProperty.native](): boolean {
        return this.nativeView.secureTextEntry;
    }
    set [secureProperty.native](value: boolean) {
        this.nativeView.secureTextEntry = value;
    }

    get [colorProperty.native](): UIColor {
        // return this.nativeView.tintColor;
        return this.nativeView.textColor;
    }
    set [colorProperty.native](value: UIColor) {
        // NOTE: Do we need this code? We have placeholderColor.
        // let nativeValue = this.nativeView;
        // if (this.isShowingHint && value) {
        //     nativeValue.textColor = value.colorWithAlphaComponent(0.22);
        // } else {
        //     nativeValue.textColor = value;
        //     nativeValue.tintColor = value;
        // }
        this.nativeView.textColor = value;
    }

    get [placeholderColorProperty.native](): UIColor {
        return <UIColor>this.nativeView.attributedPlaceholder.attributeAtIndexEffectiveRange(NSForegroundColorAttributeName, 0, null);
    }
    set [placeholderColorProperty.native](value: UIColor) {
        let nativeView = this.nativeView;
        let colorAttibutes = NSMutableDictionary.alloc().init();
        colorAttibutes.setValueForKey(value, NSForegroundColorAttributeName);
        nativeView.attributedPlaceholder = NSAttributedString.alloc().initWithStringAttributes(nativeView.placeholder, colorAttibutes.copy());
    }
}
