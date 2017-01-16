import { View, PageBase, Color, actionBarHiddenProperty, statusBarStyleProperty, androidStatusBarBackgroundProperty, HorizontalAlignment, VerticalAlignment } from "./page-common";
import { ActionBar } from "ui/action-bar";
import { GridLayout } from "ui/layouts/grid-layout";
import { DIALOG_FRAGMENT_TAG } from "./constants";
import { device } from "platform";

export * from "./page-common";

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const STATUS_BAR_LIGHT_BCKG = -657931;
const STATUS_BAR_DARK_BCKG = 1711276032;

interface DialogFragmentClass {
    new (owner: Page, fullscreen: boolean, shownCallback: () => void, dismissCallback: () => void): android.app.DialogFragment;
}
let DialogFragmentClass: DialogFragmentClass;

function ensureDialogFragmentClass() {
    if (DialogFragmentClass) {
        return;
    }

    class DialogFragmentClassInner extends android.app.DialogFragment {
        constructor(
            private _owner: Page,
            private _fullscreen: boolean,
            private _shownCallback: () => void,
            private _dismissCallback: () => void) {
            super();
            return global.__native(this);
        }

        public onCreateDialog(savedInstanceState: android.os.Bundle): android.app.Dialog {
            const dialog = new android.app.Dialog(this._owner._context);
            dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);

            // Hide actionBar and adjust alignment based on _fullscreen value.
            this._owner.horizontalAlignment = this._fullscreen ? HorizontalAlignment.STRETCH : HorizontalAlignment.CENTER;
            this._owner.verticalAlignment = this._fullscreen ? VerticalAlignment.STRETCH : VerticalAlignment.MIDDLE;
            this._owner.actionBarHidden = true;

            dialog.setContentView(this._owner._nativeView, this._owner._nativeView.getLayoutParams());

            const window = dialog.getWindow();
            window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));

            if (this._fullscreen) {
                window.setLayout(android.view.ViewGroup.LayoutParams.FILL_PARENT, android.view.ViewGroup.LayoutParams.FILL_PARENT);
            }

            return dialog;
        }

        public onStart() {
            super.onStart();
            if (!this._owner.isLoaded) {
                this._owner.onLoaded();
            }
            this._shownCallback();
        }

        public onDestroyView() {
            super.onDestroyView();

            if (this._owner.isLoaded) {
                this._owner.onUnloaded();
            }

            this._owner._isAddedToNativeVisualTree = false;
            this._owner._tearDownUI(true);
        }

        public onDismiss(dialog: android.content.IDialogInterface) {
            super.onDismiss(dialog);
            this._dismissCallback();
        }

    };

    DialogFragmentClass = DialogFragmentClassInner;
}

export class Page extends PageBase {
    private _isBackNavigation = false;
    private _grid: org.nativescript.widgets.GridLayout;

    get android(): android.view.ViewGroup {
        return this._grid;
    }

    get _nativeView(): android.view.ViewGroup {
        return this._grid;
    }

    get nativeView(): android.view.ViewGroup {
        return this._grid;
    }

    public _createNativeView() {
        this._grid = new org.nativescript.widgets.GridLayout(this._context);
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        this._grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        this.nativeView.setBackgroundColor(new Color("white").android);
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        // Set the row property for the child 
        if (this._nativeView && child._nativeView) {
            if (child instanceof ActionBar) {
                GridLayout.setRow(child, 0);
                child.horizontalAlignment = "stretch";
                child.verticalAlignment = "top";
            }
            else {
                GridLayout.setRow(child, 1);
            }
        }

        return super._addViewToNativeVisualTree(child, atIndex);
    }

    public onLoaded() {
        super.onLoaded();
        if (this.actionBarHidden !== undefined) {
            this.updateActionBar(this.actionBarHidden);
        }
    }

    public _tearDownUI(force?: boolean) {
        const skipDetached = !force && this.frame.android.cachePagesOnNavigate && !this._isBackNavigation;

        if (!skipDetached) {
            super._tearDownUI();
            this._isAddedToNativeVisualTree = false;
        }
    }

    public onNavigatedFrom(isBackNavigation: boolean) {
        this._isBackNavigation = isBackNavigation;
        super.onNavigatedFrom(isBackNavigation);
    }

    /* tslint:disable */
    private _dialogFragment: android.app.DialogFragment;
    /* tslint:enable */
    protected _showNativeModalView(parent: Page, context: any, closeCallback: Function, fullscreen?: boolean) {
        super._showNativeModalView(parent, context, closeCallback, fullscreen);
        if (!this.backgroundColor) {
            this.backgroundColor = new Color("White");
        }

        this._setupUI(parent._context);
        this._isAddedToNativeVisualTree = true;

        ensureDialogFragmentClass();

        this._dialogFragment = new DialogFragmentClass(this, !!fullscreen, () => this._raiseShownModallyEvent(), () => this.closeModal());

        super._raiseShowingModallyEvent();

        this._dialogFragment.show(parent.frame.android.activity.getFragmentManager(), DIALOG_FRAGMENT_TAG);
    }

    protected _hideNativeModalView(parent: Page) {
        this._dialogFragment.dismissAllowingStateLoss();
        this._dialogFragment = null;

        parent._modal = undefined;

        super._hideNativeModalView(parent);
    }

    private updateActionBar(hidden: boolean) {
        this.actionBar.update();
    }

    get [actionBarHiddenProperty.native](): boolean {
        return undefined;
    }
    set [actionBarHiddenProperty.native](value: boolean) {
        this.updateActionBar(value);
    }

    get [statusBarStyleProperty.native](): { color: number, systemUiVisibility: number } {
        if (device.sdkVersion >= "21") {
            let window = (<android.app.Activity>this._context).getWindow();
            let decorView = window.getDecorView();

            return {
                color: (<any>window).getStatusBarColor(),
                systemUiVisibility: decorView.getSystemUiVisibility()
            };
        }

        return null;
    }
    set [statusBarStyleProperty.native](value: "dark" | "light" | { color: number, systemUiVisibility: number }) {
        if (device.sdkVersion >= "21") {
            let window = (<android.app.Activity>this._context).getWindow();
            let decorView = window.getDecorView();

            if (value === "light") {
                (<any>window).setStatusBarColor(STATUS_BAR_LIGHT_BCKG);
                decorView.setSystemUiVisibility(SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

            } else if (value === "dark") {
                (<any>window).setStatusBarColor(STATUS_BAR_DARK_BCKG);
                decorView.setSystemUiVisibility(0);
            } else {
                (<any>window).setStatusBarColor(value.color);
                decorView.setSystemUiVisibility(value.systemUiVisibility);
            }
        }
    }

    get [androidStatusBarBackgroundProperty.native](): number {
        if (device.sdkVersion >= "21") {
            let window = (<android.app.Activity>this._context).getWindow();
            return (<any>window).getStatusBarColor();
        }

        return null;
    }
    set [androidStatusBarBackgroundProperty.native](value: number | Color) {
        if (device.sdkVersion >= "21") {
            let window = (<android.app.Activity>this._context).getWindow();
            let color = value instanceof Color ? value.android : value;
            (<any>window).setStatusBarColor(color);
        }
    }
}