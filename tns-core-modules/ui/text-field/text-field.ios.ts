import { 
    TextFieldBase, secureProperty, textProperty, hintProperty, colorProperty, placeholderColorProperty, 
    Length, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, _updateCharactersInRangeReplacementString, Color
} from "./text-field-common";

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
            textProperty.nativeValueChange(owner,  '');
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
            if (owner.updateTextTrigger === "textChanged") {
                if (textField.secureTextEntry && this.firstEdit) {
                    textProperty.nativeValueChange(owner, replacementString);
                }
                else {
                    if (range.location <= textField.text.length) {
                        const newText = NSString.stringWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
                        textProperty.nativeValueChange(owner,  newText);
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
        return CGRectMake(owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft, owner.effectiveBorderTopWidth + owner.effectivePaddingTop,
            size.width - (owner.effectiveBorderLeftWidth + owner.effectivePaddingLeft + owner.effectivePaddingRight + owner.effectiveBorderRightWidth),
            size.height - (owner.effectiveBorderTopWidth + owner.effectivePaddingTop + owner.effectivePaddingBottom + owner.effectiveBorderBottomWidth)
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
        this.nativeView = this._ios;
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
        let stringValue;
        if (value === null || value === void 0) {
            stringValue = "";
        } else {
            stringValue = value + "";
        }
        this.nativeView.placeholder = stringValue;
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
    set [colorProperty.native](value: UIColor | Color) {
        // NOTE: Do we need this code? We have placeholderColor.
        // let nativeValue = this.nativeView;
        // if (this.isShowingHint && value) {
        //     nativeValue.textColor = value.colorWithAlphaComponent(0.22);
        // } else {
        //     nativeValue.textColor = value;
        //     nativeValue.tintColor = value;
        // }
        let color = value instanceof Color ? value.ios : value;
        this.nativeView.textColor = color;
    }

    get [placeholderColorProperty.native](): UIColor {
        return null;
    }
    set [placeholderColorProperty.native](value: UIColor | Color) {
        let nativeView = this.nativeView;
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

    get [paddingTopProperty.native](): Length {
        return zeroLength;
    }
    set [paddingTopProperty.native](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }

    get [paddingRightProperty.native](): Length {
        return zeroLength;
    }
    set [paddingRightProperty.native](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }

    get [paddingBottomProperty.native](): Length {
        return zeroLength;
    }
    set [paddingBottomProperty.native](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }

    get [paddingLeftProperty.native](): Length {
        return zeroLength;
    }
    set [paddingLeftProperty.native](value: Length) {
        // Padding is realized via UITextFieldImpl.textRectForBounds method
    }
}