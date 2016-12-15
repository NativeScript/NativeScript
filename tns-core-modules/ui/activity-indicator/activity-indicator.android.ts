import { ActivityIndicatorBase, busyProperty, colorProperty, visibilityProperty } from "./activity-indicator-common";

export * from "./activity-indicator-common";

export class ActivityIndicator extends ActivityIndicatorBase {
    _progressBar: android.widget.ProgressBar;

    public _createUI() {
        this._progressBar = new android.widget.ProgressBar(this._context);
        this._progressBar.setVisibility(android.view.View.INVISIBLE);
        this._progressBar.setIndeterminate(true);
    }

    get android(): android.widget.ProgressBar {
        return this._progressBar;
    }

    get [busyProperty.native](): boolean {
        return this._progressBar.getVisibility() === android.view.View.VISIBLE;
    }
    set [busyProperty.native](value: boolean) {
        this._progressBar.setVisibility(value ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
    }

    get [visibilityProperty.native](): number {
        return this._progressBar.getVisibility();
    }
    set [visibilityProperty.native](value: number) {
        this.busy = value === android.view.View.VISIBLE;
        this._progressBar.setVisibility(value);
    }

    get [colorProperty.native](): number {
        return -1;
    }
    set [colorProperty.native](value: number) {
        if (value < 0) {
            this._progressBar.getIndeterminateDrawable().clearColorFilter();
        }
        else {
            this._progressBar.getIndeterminateDrawable().setColorFilter(value, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    }
}