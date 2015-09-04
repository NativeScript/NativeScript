import pageCommon = require("ui/page/page-common");
import definition = require("ui/page");
import view = require("ui/core/view");
import trace = require("trace");
import color = require("color");
import actionBarModule = require("ui/action-bar");
import gridModule = require("ui/layouts/grid-layout");
import enums = require("ui/enums");

global.moduleMerge(pageCommon, exports);

class DialogFragmentClass extends android.app.DialogFragment {
    private _owner: Page;
    private _fullscreen: boolean;

    constructor(owner: Page, fullscreen?: boolean) {
        super();

        this._owner = owner;
        this._fullscreen = fullscreen;
        return global.__native(this);
    }

    public onCreateDialog(savedInstanceState: android.os.Bundle): android.app.Dialog {
        var dialog = new android.app.Dialog(this._owner._context);
        dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
        dialog.setContentView(this._owner._nativeView);
        var window = dialog.getWindow();
        window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));

        if (this._fullscreen) {
        window.setLayout(android.view.ViewGroup.LayoutParams.FILL_PARENT, android.view.ViewGroup.LayoutParams.FILL_PARENT);
        }
        
        return dialog;
    }
};

export class Page extends pageCommon.Page {
    private _isBackNavigation = false;

    private _grid: org.nativescript.widgets.GridLayout;

    constructor(options?: definition.Options) {
        super(options);
    }

    get android(): android.view.ViewGroup {
        return this._grid;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._grid;
    }

    public _createUI() {
        this._grid = new org.nativescript.widgets.GridLayout(this._context);
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
    }

    public _addViewToNativeVisualTree(child: view.View, atIndex?: number): boolean {
        // Set the row property for the child 
        if (this._nativeView && child._nativeView) {
            if (child instanceof actionBarModule.ActionBar) {
                gridModule.GridLayout.setRow(child, 0);
                child.horizontalAlignment = enums.HorizontalAlignment.stretch;
                child.verticalAlignment = enums.VerticalAlignment.top;
            }
            else {
                gridModule.GridLayout.setRow(child, 1);
            }
        }

        return super._addViewToNativeVisualTree(child, atIndex);
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

    /* tslint:disable */
    private _dialogFragment: DialogFragmentClass;
    /* tslint:enable */
    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        if (!this.backgroundColor) {
            this.backgroundColor = new color.Color("White");
        }

        this._onAttached(parent._context);
        this._isAddedToNativeVisualTree = true;
        this.onLoaded();

        this._dialogFragment = new DialogFragmentClass(this, fullscreen);
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

    public _updateActionBar(hidden: boolean) {
        this.actionBar.update();
    }
}