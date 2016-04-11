import common = require("./text-field-common");
import {PropertyChangeData} from "ui/core/dependency-observable";
import {PropertyMetadata} from "ui/core/proxy";
import {TextBase} from "ui/text-base";
import {UpdateTextTrigger} from "ui/enums";
import * as style from "ui/styling/style";
import {View} from "ui/core/view";

function onSecurePropertyChanged(data: PropertyChangeData) {
    var textField = <TextField>data.object;
    textField.ios.secureTextEntry = data.newValue;
}

(<PropertyMetadata>common.secureProperty.metadata).onSetNativeValue = onSecurePropertyChanged;

global.moduleMerge(common, exports);

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
                owner._onPropertyChangedFromNative(TextBase.textProperty, textField.text);
            }

            owner.dismissSoftInput();
        }
    }

    public textFieldShouldClear(textField: UITextField) {
        this.firstEdit = false;
        let owner = this._owner.get();
        if (owner) {
            owner._onPropertyChangedFromNative(TextBase.textProperty, "");
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

            var r = textField.selectedTextRange;
            owner.style._updateTextDecoration();
            owner.style._updateTextTransform();
            textField.selectedTextRange = r;

            if (owner.updateTextTrigger === UpdateTextTrigger.textChanged) {
                if (textField.secureTextEntry && this.firstEdit) {
                    owner._onPropertyChangedFromNative(TextBase.textProperty, replacementString);
                }
                else {
                    if (range.location <= textField.text.length) {
                        let newText = NSString.alloc().initWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
                        owner._onPropertyChangedFromNative(TextBase.textProperty, newText);
                    }
                }
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
        return CGRectMake(owner.borderWidth + owner.style.paddingLeft, owner.borderWidth + owner.style.paddingTop,
            size.width - (owner.borderWidth + owner.style.paddingLeft + owner.style.paddingRight + owner.borderWidth),
            size.height - (owner.borderWidth + owner.style.paddingTop + owner.style.paddingBottom + owner.borderWidth)
        );
    }

    public textRectForBounds(bounds: CGRect): CGRect {
        return this._getTextRectForBounds(bounds);
    }

    public editingRectForBounds(bounds: CGRect): CGRect {
        return this._getTextRectForBounds(bounds);
    }
}

export class TextField extends common.TextField {
    private _ios: UITextField;
    private _delegate: UITextFieldDelegateImpl;

    constructor() {
        super();

        this._ios = UITextFieldImpl.initWithOwner(new WeakRef(this));
        this._delegate = UITextFieldDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
        
        this.style._updateTextDecoration();
        this.style._updateTextTransform();
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITextField {
        return this._ios;
    }

    public _onHintPropertyChanged(data: PropertyChangeData) {
        var textField = <TextField>data.object;
        textField.ios.placeholder = data.newValue + "";
    }
} 

export class TextFieldStyler implements style.Styler {
    private static setColorProperty(view: View, newValue: any) {
        var tf: UITextField = <UITextField>view._nativeView;
        TextFieldStyler._setTextFieldColor(tf, newValue);
    }

    private static resetColorProperty(view: View, nativeValue: any) {
        var tf: UITextField = <UITextField>view._nativeView;
        TextFieldStyler._setTextFieldColor(tf, nativeValue);
    }

    private static _setTextFieldColor(tf: UITextField, newValue: any) {
        var color: UIColor = <UIColor>newValue;
        if ((<any>tf).isShowingHint && color) {
            tf.textColor = (<UIColor>color).colorWithAlphaComponent(0.22);
        }
        else {
            tf.textColor = color;
            tf.tintColor = color;
        }
    }

    private static getNativeColorValue(view: View): any {
        var tf: UITextField = <UITextField>view._nativeView;
        return tf.tintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            TextFieldStyler.setColorProperty,
            TextFieldStyler.resetColorProperty,
            TextFieldStyler.getNativeColorValue), "TextField");
    }
}

TextFieldStyler.registerHandlers();
