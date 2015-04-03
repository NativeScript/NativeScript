import common = require("ui/text-field/text-field-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import textBase = require("ui/text-base");
import enums = require("ui/enums");

function onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textField = <TextField>data.object;
    textField.ios.placeholder = data.newValue;
}

(<proxy.PropertyMetadata>common.hintProperty.metadata).onSetNativeValue = onHintPropertyChanged;

function onSecurePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textField = <TextField>data.object;
    textField.ios.secureTextEntry = data.newValue;
}

(<proxy.PropertyMetadata>common.secureProperty.metadata).onSetNativeValue = onSecurePropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

class UITextFieldDelegateImpl extends NSObject implements UITextFieldDelegate {
    public static ObjCProtocols = [UITextFieldDelegate];

    static new(): UITextFieldDelegateImpl {
        return <UITextFieldDelegateImpl>super.new();
    }

    private _owner: TextField;

    public initWithOwner(owner: TextField): UITextFieldDelegateImpl {
        this._owner = owner;
        return this;
    }
    
    public textFieldShouldBeginEditing(textField: UITextField): boolean {
        return this._owner.editable;
    }

    public textFieldDidEndEditing(textField: UITextField) {
        if (this._owner.updateTextTrigger === enums.UpdateTextTrigger.focusLost) {
            this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textField.text);
        }

        this._owner.dismissSoftInput();
    }

    public textFieldShouldReturn(textField: UITextField): boolean {
        // Called when the user presses the return button.
        this._owner.dismissSoftInput();
        return true;
    }

    public textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
        if (this._owner.updateTextTrigger === enums.UpdateTextTrigger.textChanged) {
            var newText = NSString.alloc().initWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
            this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, newText);
        }

        return true;
    }
}

export class TextField extends common.TextField {
    private _ios: UITextField;
    private _delegate: any;

    constructor() {
        super();

        this._ios = new UITextField();

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
} 