import { ProgressBase, valueProperty, maxValueProperty } from "./progress-common";
import { View, colorProperty, backgroundColorProperty, backgroundInternalProperty } from "ui/core/view";
import { Color } from "color";

export * from "./progress-common";

const R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL = 0x01010078;

export class Progress extends ProgressBase {
    private _android: android.widget.ProgressBar;

    public _createUI() {
        this._android = new android.widget.ProgressBar(this._context, null, R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL);
    }

    get android(): android.widget.ProgressBar {
        return this._android;
    }

    get [valueProperty.native](): number {
        return 0;
    }
    set [valueProperty.native](value: number) {
        this._android.setProgress(value);
    }

    get [maxValueProperty.native](): number {
        return 100;
    }
    set [maxValueProperty.native](value: number) {
        this._android.setMax(value);
    }

    get [colorProperty.native](): android.graphics.drawable.Drawable {
        return null;
    }
    set [colorProperty.native](value: Color) {
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

    get [backgroundColorProperty.native](): UIColor {
        return null;
    }
    set [backgroundColorProperty.native](value: Color) {
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

    get [backgroundInternalProperty.native](): UIColor {
        return null;
    }
    set [backgroundInternalProperty.native](value: Color) {
        //
    }
}