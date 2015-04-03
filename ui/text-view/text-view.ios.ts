import common = require("ui/text-view/text-view-common");
import dependencyObservable = require("ui/core/dependency-observable");
import textBase = require("ui/text-base");
import enums = require("ui/enums");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

class UITextViewDelegateImpl extends NSObject implements UITextViewDelegate {
    public static ObjCProtocols = [UITextViewDelegate];

    static new(): UITextViewDelegateImpl {
        return <UITextViewDelegateImpl>super.new();
    }

    private _owner: TextView;

    public initWithOwner(owner: TextView): UITextViewDelegateImpl {
        this._owner = owner;
        return this;
    }

    public textViewDidEndEditing(textView: UITextView) {
        if (this._owner.updateTextTrigger === enums.UpdateTextTrigger.focusLost) {
            this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textView.text);
        }

        this._owner.dismissSoftInput();
    }

    public textViewDidChange(textView: UITextView) {
        if (this._owner.updateTextTrigger === enums.UpdateTextTrigger.textChanged) {
            this._owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textView.text);
        }
    }
}

export class TextView extends common.TextView {
    private _ios: UITextView;
    private _delegate: any;

    constructor() {
        super();

        this._ios = UITextView.new();
        if (!this._ios.font) {
            // For some reason font is null, not like stated in the docs.
            this._ios.font = UIFont.systemFontOfSize(12);
        }

        this._delegate = UITextViewDelegateImpl.new().initWithOwner(this);
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

    public _onEditablePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        this._ios.editable = data.newValue;
    }
} 