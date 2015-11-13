import common = require("./text-field-common");
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
            if (owner.updateTextTrigger === enums.UpdateTextTrigger.focusLost) {
                owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textField.text);
            }

            owner.dismissSoftInput();
        }
    }

    public textFieldShouldClear(textField: UITextField) {
        this.firstEdit = false;
        let owner = this._owner.get();
        if (owner) {
            owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, "");
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

            if (owner.updateTextTrigger === enums.UpdateTextTrigger.textChanged) {
                if (textField.secureTextEntry && this.firstEdit) {
                    owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, replacementString);
                }
                else {
                    let newText = NSString.alloc().initWithString(textField.text).stringByReplacingCharactersInRangeWithString(range, replacementString);
                    owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, newText);
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
        textField.ios.placeholder = data.newValue + "";
    }
} 
