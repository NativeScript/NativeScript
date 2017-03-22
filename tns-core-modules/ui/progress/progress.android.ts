import {
    Color, ProgressBase, valueProperty, maxValueProperty,
    colorProperty, backgroundColorProperty, backgroundInternalProperty
} from "./progress-common";

export * from "./progress-common";

const R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL = 0x01010078;

export class Progress extends ProgressBase {
    private _android: android.widget.ProgressBar;

    public _createNativeView() {
        const progressBar = this._android = new android.widget.ProgressBar(this._context, null, R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL);
        return progressBar;
    }

    get android(): android.widget.ProgressBar {
        return this._android;
    }

    get nativeView(): android.widget.ProgressBar {
        return this._android;
    }

    [valueProperty.getDefault](): number {
        return 0;
    }
    [valueProperty.setNative](value: number) {
        this._android.setProgress(value);
    }

    [maxValueProperty.getDefault](): number {
        return 100;
    }
    [maxValueProperty.setNative](value: number) {
        this._android.setMax(value);
    }

    [colorProperty.getDefault](): android.graphics.drawable.Drawable {
        return null;
    }
    [colorProperty.setNative](value: Color) {
        let progressDrawable = this._android.getProgressDrawable();
        if (!progressDrawable) {
            return;
        }

        if (value instanceof Color) {
            progressDrawable.setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            progressDrawable.clearColorFilter();
        }
    }

    [backgroundColorProperty.getDefault](): number {
        return null;
    }
    [backgroundColorProperty.setNative](value: Color) {
        let progressDrawable = this._android.getProgressDrawable();
        if (!progressDrawable) {
            return;
        }

        if (progressDrawable instanceof android.graphics.drawable.LayerDrawable && progressDrawable.getNumberOfLayers() > 0) {
            let backgroundDrawable = progressDrawable.getDrawable(0);
            if (backgroundDrawable) {
                if (value instanceof Color) {
                    backgroundDrawable.setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
                } else {
                    backgroundDrawable.clearColorFilter();
                }
            }
        }
    }

    [backgroundInternalProperty.getDefault](): number {
        return null;
    }
    [backgroundInternalProperty.setNative](value: Color) {
        //
    }
}