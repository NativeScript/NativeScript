import { View, PageBase, Color, actionBarHiddenProperty, statusBarStyleProperty, androidStatusBarBackgroundProperty } from "./page-common";
import { ActionBar } from "../action-bar";
import { GridLayout } from "../layouts/grid-layout";
import { DIALOG_FRAGMENT_TAG } from "./constants";
import { device } from "../../platform";
import { profile } from "../../profiling";

export * from "./page-common";

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const STATUS_BAR_LIGHT_BCKG = -657931;
const STATUS_BAR_DARK_BCKG = 1711276032;

interface DialogFragment {
    new (owner: Page, fullscreen: boolean, shownCallback: () => void, dismissCallback: () => void): android.app.DialogFragment;
}
let DialogFragment: DialogFragment;

function initializeDialogFragment() {
    if (DialogFragment) {
        return;
    }

    class DialogFragmentImpl extends android.app.DialogFragment {
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
            this._owner.horizontalAlignment = this._fullscreen ? "stretch" : "center";
            this._owner.verticalAlignment = this._fullscreen ? "stretch" : "middle";
            this._owner.actionBarHidden = true;

            const nativeView = <android.view.View>this._owner.nativeViewProtected;
            let layoutParams = nativeView.getLayoutParams();
            if (!layoutParams) {
                layoutParams = new org.nativescript.widgets.CommonLayoutParams();
                nativeView.setLayoutParams(layoutParams);
            }
            dialog.setContentView(this._owner.nativeViewProtected, layoutParams);

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

    DialogFragment = DialogFragmentImpl;
}

export class Page extends PageBase {
    nativeViewProtected: org.nativescript.widgets.GridLayout;
    private _isBackNavigation = false;

    public createNativeView() {
        const layout = new org.nativescript.widgets.GridLayout(this._context);
        layout.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        layout.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        return layout;
    }

    public initNativeView(): void {
        super.initNativeView();
        this.nativeViewProtected.setBackgroundColor(-1); // White color.
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        // Set the row property for the child 
        if (this.nativeViewProtected && child.nativeViewProtected) {
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

    @profile
    public onLoaded() {
        super.onLoaded();
        if (this.actionBarHidden !== undefined) {
            this.updateActionBar();
        }
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

        initializeDialogFragment();

        this._dialogFragment = new DialogFragment(this, !!fullscreen, () => this._raiseShownModallyEvent(), () => this.closeModal());

        super._raiseShowingModallyEvent();

        this._dialogFragment.show(parent.frame.android.activity.getFragmentManager(), DIALOG_FRAGMENT_TAG);
    }

    protected _hideNativeModalView(parent: Page) {
        this._dialogFragment.dismissAllowingStateLoss();
        this._dialogFragment = null;

        parent._modal = undefined;

        super._hideNativeModalView(parent);
    }

    private updateActionBar() {
        this.actionBar.update();
    }

    [actionBarHiddenProperty.getDefault](): boolean {
        return undefined;
    }
    [actionBarHiddenProperty.setNative](value: boolean) {
        this.updateActionBar();
    }

    [statusBarStyleProperty.getDefault](): { color: number, systemUiVisibility: number } {
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
    [statusBarStyleProperty.setNative](value: "dark" | "light" | { color: number, systemUiVisibility: number }) {
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

    [androidStatusBarBackgroundProperty.getDefault](): number {
        if (device.sdkVersion >= "21") {
            let window = (<android.app.Activity>this._context).getWindow();
            return (<any>window).getStatusBarColor();
        }

        return null;
    }
    [androidStatusBarBackgroundProperty.setNative](value: number | Color) {
        if (device.sdkVersion >= "21") {
            let window = (<android.app.Activity>this._context).getWindow();
            let color = value instanceof Color ? value.android : value;
            (<any>window).setStatusBarColor(color);
        }
    }
}