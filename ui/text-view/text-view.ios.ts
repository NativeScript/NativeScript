import common = require("./text-view-common");
import dependencyObservable = require("ui/core/dependency-observable");
import textBase = require("ui/text-base");
import enums = require("ui/enums");

global.moduleMerge(common, exports);

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

    public textViewDidBeginEditing(textView: UITextView) {
        let owner = this._owner.get();
        if (owner) {
            owner.style._updateTextDecoration();
        }
    }

    public textViewDidEndEditing(textView: UITextView) {
        let owner = this._owner.get();
        if (owner) {
            if (owner.updateTextTrigger === enums.UpdateTextTrigger.focusLost) {
                owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textView.text);
            }

            owner.dismissSoftInput();
            owner._refreshHintState(owner.hint, textView.text);
        }
    }

    public textViewDidChange(textView: UITextView) {
        let owner = this._owner.get();
        if (owner) {
            var range = textView.selectedRange;
            owner.style._updateTextDecoration();
            textView.selectedRange = range;

            if (owner.updateTextTrigger === enums.UpdateTextTrigger.textChanged) {
                owner._onPropertyChangedFromNative(textBase.TextBase.textProperty, textView.text);
            }
        }        
    }
}

export class TextView extends common.TextView {
    private _ios: UITextView;
    private _delegate: UITextViewDelegateImpl;

    constructor() {
        super();

        this._ios = new UITextView();
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

    public _onEditablePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        this._ios.editable = data.newValue;
    }

    public _onHintPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        this._refreshHintState(data.newValue, this.text);
    }

    public _onTextPropertyChanged(data: dependencyObservable.PropertyChangeData) {
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
        this.ios.textColor = this.ios.textColor ? this.ios.textColor.colorWithAlphaComponent(0.22) : UIColor.blackColor().colorWithAlphaComponent(0.22);
        this.ios.text = hint + "";
        (<any>this.ios).isShowingHint = true;
    }

    public _hideHint() {
        this.ios.textColor = this.color ? this.color.ios : null;
        this.ios.text = this.text + "";
        (<any>this.ios).isShowingHint = false;
    }
} 
