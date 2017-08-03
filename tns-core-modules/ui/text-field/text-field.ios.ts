import {
    TextFieldBase, secureProperty, textProperty, hintProperty, colorProperty, placeholderColorProperty,
    Length, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, _updateCharactersInRangeReplacementString, Color, layout
} from "./text-field-common";
import { profile } from "../../profiling";

export * from "./text-field-common";

const zeroLength: Length = {
    value: 0,
    unit: "px"
};

class UITextFieldDelegateImpl extends NSObject implements UITextFieldDelegate {
    public static ObjCProtocols = [UITextFieldDelegate];

    private _owner: WeakRef<TextField>;
    private firstEdit: boolean;

    public static initWithOwner(owner: WeakRef<TextField>): UITextFieldDelegateImpl {
        const delegate = <UITextFieldDelegateImpl>UITextFieldDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public textFieldShouldBeginEditing(textField: UITextField): boolean {
        this.firstEdit = true;
        const owner = this._owner.get();
        if (owner) {
            return owner.editable;
        }

        return true;
    }

    public textFieldDidEndEditing(textField: UITextField) {
        const owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === "focusLost") {
                textProperty.nativeValueChange(owner, textField.text);
            }

            owner.dismissSoftInput();
        }
    }

    public textFieldShouldClear(textField: UITextField) {
        this.firstEdit = false;
        const owner = this._owner.get();
        if (owner) {
            textProperty.nativeValueChange(owner, '');
        }

        return true;
    }

    public textFieldShouldReturn(textField: UITextField): boolean {
        // Called when the user presses the return button.
        const owner = this._owner.get();
        if (owner) {
            owner.dismissSoftInput();
            owner.notify({ eventName: TextField.returnPressEvent, object: owner });
        }

        return true;
    }

    public textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
        const owner = this._owner.get();
        if (owner) {
            const delta = replacementString.length - range.length;
            if (delta > 0) {
                if (textField.text.length + delta > owner.maxLength) {
                    return false;
                }
            }

            if (owner.updateTextTrigger === "textChanged") {
                if (textField.secureTextEntry && this.firstEdit) {
                    textProperty.nativeValueChange(owner, replacementString);
                }
                else {
                    if (range.location <= textField.text.length) {
                        const newText = NSString.stringWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
                        textProperty.nativeValueChange(owner, newText);
                    }
                }
            }

            if (owner.formattedText) {
                _updateCharactersInRangeReplacementString(owner.formattedText, range.location, range.length, replacementString);
            }
        }

        this.firstEdit = false;
        return true;
    }
}

class UITextFieldImpl extends UITextField {

    private _owner: WeakRef<TextField>;

    public static initWithOwner(owner: WeakRef<TextField>): UITextFieldImpl {
        const handler = <UITextFieldImpl>UITextFieldImpl.new();
        handler._owner = owner;
        return handler;
    }

    private _getTextRectForBounds(bounds: CGRect): CGRect {
        const owner = this._owner ? this._owner.get() : null;

        if (!owner) {
            return bounds;
        }

        const size = bounds.size;

        const x = layout.toDeviceIndependentPixels(owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft);
        const y = layout.toDeviceIndependentPixels(owner.effectiveBorderTopWidth + owner.effectivePaddingTop);
        const width = layout.toDeviceIndependentPixels(layout.toDevicePixels(size.width) - (owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft + owner.effectivePaddingRight + owner.effectiveBorderRightWidth));
        const height = layout.toDeviceIndependentPixels(layout.toDevicePixels(size.height) - (owner.effectiveBorderTopWidth + owner.effectivePaddingTop + owner.effectivePaddingBottom + owner.effectiveBorderBottomWidth));

        return CGRectMake(x, y, width, height);
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
    nativeViewProtected: UITextField;

    constructor() {
        super();
        let weakRef = new WeakRef(this);
        this._ios = UITextFieldImpl.initWithOwner(weakRef);
        this._delegate = UITextFieldDelegateImpl.initWithOwner(weakRef);
        this.nativeViewProtected = this._ios;
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

    get ios(): UITextField {
        return this._ios;
    }

    [hintProperty.getDefault](): string {
        return this.nativeViewProtected.placeholder;
    }
    [hintProperty.setNative](value: string) {
        let stringValue;
        if (value === null || value === void 0) {
            stringValue = "";
        } else {
            stringValue = value + "";
        }
        this.nativeViewProtected.placeholder = stringValue;
    }

    [secureProperty.getDefault](): boolean {
        return this.nativeViewProtected.secureTextEntry;
    }
    [secureProperty.setNative](value: boolean) {
        this.nativeViewProtected.secureTextEntry = value;
    }

    [colorProperty.getDefault](): { textColor: UIColor, tintColor: UIColor } {
        return {
            textColor: this.nativeViewProtected.textColor,
            tintColor: this.nativeViewProtected.tintColor
        };
    }
    [colorProperty.setNative](value: Color | { textColor: UIColor, tintColor: UIColor }) {
        if (value instanceof Color) {
            let color = value instanceof Color ? value.ios : value;
            this.nativeViewProtected.textColor = color;
            this.nativeViewProtected.tintColor = color;
        } else {
            this.nativeViewProtected.textColor = value.textColor;
            this.nativeViewProtected.tintColor = value.tintColor;
        }
    }

    [placeholderColorProperty.getDefault](): UIColor {
        return null;
    }
    [placeholderColorProperty.setNative](value: UIColor | Color) {
        let nativeView = this.nativeViewProtected;
        let colorAttibutes = NSMutableDictionary.new<string, any>();
        colorAttibutes.setValueForKey(value instanceof Color ? value.ios : value, NSForegroundColorAttributeName);
        let stringValue;
        if (nativeView.placeholder === null || nativeView.placeholder === void 0) {
            // we do not use empty string since initWithStringAttributes does not return proper value and
            // nativeView.attributedPlaceholder will be null
            stringValue = " ";
        } else {
            stringValue = nativeView.placeholder + "";
        }
        nativeView.attributedPlaceholder = NSAttributedString.alloc().initWithStringAttributes(stringValue, colorAttibutes);
    }

    [paddingTopProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingTopProperty.setNative](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }

    [paddingRightProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingRightProperty.setNative](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }

    [paddingBottomProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingBottomProperty.setNative](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }

    [paddingLeftProperty.getDefault](): Length {
        return zeroLength;
    }
    [paddingLeftProperty.setNative](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }
}