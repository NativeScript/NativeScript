import pageCommon = require("ui/page/page-common");
import definition = require("ui/page");
import trace = require("trace");
import color = require("color");

declare var exports;
require("utils/module-merge").merge(pageCommon, exports);

class DialogFragmentClass extends android.app.DialogFragment {
    private _owner: Page;

    constructor(owner: Page) {
        super();

        this._owner = owner;
        return global.__native(this);
    }

    public onCreateDialog(savedInstanceState: android.os.Bundle): android.app.Dialog {
        var dialog = new android.app.Dialog(this._owner._context);
        dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
        dialog.setContentView(this._owner._nativeView);
        var window = dialog.getWindow();
        window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
        window.setLayout(android.view.ViewGroup.LayoutParams.FILL_PARENT, android.view.ViewGroup.LayoutParams.FILL_PARENT);
        
        return dialog;
    }
};

export class Page extends pageCommon.Page {
    private _isBackNavigation = false;

    constructor(options?: definition.Options) {
        super(options);
    }

    public _onDetached(force?: boolean) {
        var skipDetached = !force && this.frame.android.cachePagesOnNavigate && !this._isBackNavigation;

        if (skipDetached) {
            // Do not detach the context and android reference.
            trace.write("Caching Page " + this._domId, trace.categories.NativeLifecycle);
        }
        else {
            super._onDetached();
        }
    }

    public onNavigatedFrom(isBackNavigation: boolean) {
        this._isBackNavigation = isBackNavigation;
        super.onNavigatedFrom(isBackNavigation);
    }

    public _invalidateOptionsMenu() {
        if (this.frame && this.frame.android && this.frame.android.activity) {
            this.frame.android.activity.invalidateOptionsMenu();
        }
    }

    /* tslint:disable */
    private _dialogFragment: DialogFragmentClass;
    /* tslint:enable */
    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function) {
        if (!this.backgroundColor) {
            this.backgroundColor = new color.Color("White");
        }

        this._onAttached(parent._context);
        this._isAddedToNativeVisualTree = true;
        this.onLoaded();

        this._dialogFragment = new DialogFragmentClass(this);
        this._dialogFragment.show(parent.frame.android.activity.getFragmentManager(), "dialog");        
        
        super._raiseShownModallyEvent(parent, context, closeCallback);
    }

    protected _hideNativeModalView(parent: Page) {
        this._dialogFragment.dismissAllowingStateLoss();
        this._dialogFragment = null;
        
        this.onUnloaded();
        this._isAddedToNativeVisualTree = false;
        this._onDetached(true);
    }
}