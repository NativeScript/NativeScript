import { ActivityIndicatorBase, busyProperty, colorProperty, visibilityProperty, Visibility, Color } from "./activity-indicator-common";

export * from "./activity-indicator-common";

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeView: android.widget.ProgressBar;

    public _createNativeView() {
        const progressBar =  new android.widget.ProgressBar(this._context);
        progressBar.setVisibility(android.view.View.INVISIBLE);
        progressBar.setIndeterminate(true);
        return progressBar;
    }

    [busyProperty.getDefault](): boolean {
        return false;
    }
    [busyProperty.setNative](value: boolean) {
        if (this.visibility === Visibility.VISIBLE) {
            this.nativeView.setVisibility(value ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
        }
    }

    [visibilityProperty.getDefault](): Visibility {
        return Visibility.HIDDEN;       
    }
    [visibilityProperty.setNative](value: Visibility) {
        switch (value) {
            case Visibility.VISIBLE:
                this.nativeView.setVisibility(this.busy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
                break;
            case Visibility.HIDDEN:
                this.nativeView.setVisibility(android.view.View.INVISIBLE);
                break;
            case Visibility.COLLAPSE:
                this.nativeView.setVisibility(android.view.View.GONE);
                break;
            default: 
                throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
        }
    }

    [colorProperty.getDefault](): number {
        return -1;
    }
    [colorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this.nativeView.getIndeterminateDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this.nativeView.getIndeterminateDrawable().clearColorFilter();
        }
    }
}
