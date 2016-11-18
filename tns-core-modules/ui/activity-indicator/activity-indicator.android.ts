import { ActivityIndicatorBase, busyProperty } from "./activity-indicator-common";
import { Visibility } from "ui/enums";
import { colorProperty, visibilityProperty } from "ui/styling/style";

export * from "./activity-indicator-common";

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeView: android.widget.ProgressBar;

    public _createUI() {
        this.nativeView = new android.widget.ProgressBar(this._context);
        this.nativeView.setVisibility(android.view.View.INVISIBLE);
        this.nativeView.setIndeterminate(true);
    }

    get android(): android.widget.ProgressBar {
        return this.nativeView;
    }

    get [busyProperty.native](): boolean {
        return this.nativeView.getVisibility() === android.view.View.VISIBLE;
    }
    set [busyProperty.native](value: boolean) {
        this.nativeView.setVisibility(value ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
    }

    get [visibilityProperty.native](): number {
        return this.nativeView.getVisibility();
    }
    set [visibilityProperty.native](value: number) {
        this.busy = value === android.view.View.VISIBLE;
        this.nativeView.setVisibility(value);
    }

    get [colorProperty.native](): number {
        return -1;
    }
    set [colorProperty.native](value: number) {
        if (value < 0) {
            this.nativeView.getIndeterminateDrawable().clearColorFilter();
        }
        else {
            this.nativeView.getIndeterminateDrawable().setColorFilter(value, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    }
}