import common = require("ui/text-field/text-field-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import textBase = require("ui/text-base");
import enums = require("ui/enums");

function onSecurePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textField = <TextField>data.object;
    textField.ios.secureTextEntry = data.newValue;
}

(<proxy.PropertyMetadata>common.secureProperty.metadata).onSetNativeValue = onSecurePropertyChanged;

global.moduleMerge(common, exports);

class UITextFieldDelegateImpl extends NSObject implements UITextFieldDelegate {
    public static ObjCProtocols = [UITextFieldDelegate];

    static new(): UITextFieldDelegateImpl {
        return <UITextFieldDelegateImpl>super.new();
    }

    private _owner: TextField;
    private firstEdit: boolean;
    
    public initWithOwner(owner: TextField): UITextFieldDelegateImpl {
        this._owner = owner;
        return this;
    }
    
    public textFieldShouldBeginEditing(textField: UITextField): boolean {
        this.firstEdit = true;
        return this._owner.editable;
    }

    public textFieldDidEndEditing(textField: UITextField) {
        if (this._owner.updateTextTrigger === enums.UpdateTextTrigger.focusLost) {
            this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textField.text);
        }

        this._owner.dismissSoftInput();
    }

    public textFieldShouldClear(textField: UITextField) {
        this.firstEdit = false;
        this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, "");
        return true;
    }

    public textFieldShouldReturn(textField: UITextField): boolean {
        // Called when the user presses the return button.
        this._owner.dismissSoftInput();
        return true;
    }

    public textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
        if (this._owner.updateTextTrigger === enums.UpdateTextTrigger.textChanged) {
            if (textField.secureTextEntry && this.firstEdit) {
                this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, replacementString);
            }
            else {
                var newText = NSString.alloc().initWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
                this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, newText);
            }
        }
        this.firstEdit = false;

        return true;
    }
}

class UITextFieldImpl extends UITextField {
    static new(): UITextFieldImpl {
        return <UITextFieldImpl>super.new();
    }

    private _owner: TextField;

    public initWithOwner(owner: TextField): UITextFieldImpl {
        this._owner = owner;
        return this;
    }

    private _getTextRectForBounds(bounds: CGRect): CGRect {
        if (!this._owner) {
            return bounds;
        }

        return CGRectMake(
            this._owner.borderWidth + this._owner.paddingLeft,
            this._owner.borderWidth + this._owner.paddingTop,
            bounds.size.width - (this._owner.borderWidth + this._owner.paddingLeft + this._owner.paddingRight + this._owner.borderWidth),
            bounds.size.height - (this._owner.borderWidth + this._owner.paddingTop + this._owner.paddingBottom + this._owner.borderWidth)
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

        this._ios = UITextFieldImpl.new().initWithOwner(this);
        this._delegate = UITextFieldDelegateImpl.new().initWithOwner(this);
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

    public _onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        var textField = <TextField>data.object;
        textField.ios.placeholder = data.newValue;
    }
} 