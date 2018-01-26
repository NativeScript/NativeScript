import { View, PageBase, Color, actionBarHiddenProperty, statusBarStyleProperty, androidStatusBarBackgroundProperty, EventData } from "./page-common";
import { ActionBar } from "../action-bar";
import { GridLayout } from "../layouts/grid-layout";
import { device } from "../../platform";
import { profile } from "../../profiling";

export * from "./page-common";

const SYSTEM_UI_FLAG_LIGHT_STATUS_BAR = 0x00002000;
const STATUS_BAR_LIGHT_BCKG = -657931;
const STATUS_BAR_DARK_BCKG = 1711276032;

export class Page extends PageBase {
    nativeViewProtected: org.nativescript.widgets.GridLayout;

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

    private updateActionBar() {
        this.actionBar.update();
    }

    [actionBarHiddenProperty.setNative](value: boolean) {
        this.updateActionBar();
    }

    [statusBarStyleProperty.getDefault](): { color: number, systemUiVisibility: number } {
        if (device.sdkVersion >= "21") {
            const window = (<android.app.Activity>this._context).getWindow();
            const decorView = window.getDecorView();

            return {
                color: (<any>window).getStatusBarColor(),
                systemUiVisibility: decorView.getSystemUiVisibility()
            };
        }

        return null;
    }
    [statusBarStyleProperty.setNative](value: "dark" | "light" | { color: number, systemUiVisibility: number }) {
        if (device.sdkVersion >= "21") {
            const window = (<android.app.Activity>this._context).getWindow();
            const decorView = window.getDecorView();

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
            const window = (<android.app.Activity>this._context).getWindow();
            return (<any>window).getStatusBarColor();
        }

        return null;
    }
    [androidStatusBarBackgroundProperty.setNative](value: number | Color) {
        if (device.sdkVersion >= "21") {
            const window = (<android.app.Activity>this._context).getWindow();
            const color = value instanceof Color ? value.android : value;
            (<any>window).setStatusBarColor(color);
        }
    }
}