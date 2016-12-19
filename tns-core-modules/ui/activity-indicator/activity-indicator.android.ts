import { ActivityIndicatorBase, busyProperty, colorProperty, visibilityProperty, Visibility } from "./activity-indicator-common";

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
        return false;
    }
    set [busyProperty.native](value: boolean) {
        if (this.visibility === Visibility.VISIBLE) {
            this._progressBar.setVisibility(value ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
        }
    }

    get [visibilityProperty.native](): Visibility {
        return Visibility.HIDDEN;       
    }
    set [visibilityProperty.native](value: Visibility) {
        switch (value) {
            case Visibility.VISIBLE:
                this._progressBar.setVisibility(this.busy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
                break;
            case Visibility.HIDDEN:
                this._progressBar.setVisibility(android.view.View.INVISIBLE);
                break;
            case Visibility.COLLAPSE:
                this._progressBar.setVisibility(android.view.View.GONE);
                break;
            default: 
                throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
        }
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