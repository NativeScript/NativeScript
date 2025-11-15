import { ProgressBase, valueProperty, maxValueProperty } from './progress-common';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { AndroidHelper } from '../core/view';

export * from './progress-common';

const R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL = 0x01010078;

export class Progress extends ProgressBase {
	declare nativeViewProtected: android.widget.ProgressBar;

	public createNativeView() {
		return new android.widget.ProgressBar(this._context, null, R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL);
	}

	[valueProperty.getDefault](): number {
		return 0;
	}
	[valueProperty.setNative](value: number) {
		this.nativeViewProtected.setProgress(value);
	}

	[maxValueProperty.getDefault](): number {
		return 100;
	}
	[maxValueProperty.setNative](value: number) {
		this.nativeViewProtected.setMax(value);
	}

	[colorProperty.getDefault](): android.graphics.drawable.Drawable {
		return null;
	}
	[colorProperty.setNative](value: Color) {
		const progressDrawable = this.nativeViewProtected.getProgressDrawable();
		if (!progressDrawable) {
			return;
		}

		if (value instanceof Color) {
			AndroidHelper.setDrawableColor(value.android, progressDrawable);
		} else {
			AndroidHelper.clearDrawableColor(progressDrawable);
		}
	}

	[backgroundColorProperty.getDefault](): number {
		return null;
	}
	[backgroundColorProperty.setNative](value: Color) {
		const progressDrawable = this.nativeViewProtected.getProgressDrawable();
		if (!progressDrawable) {
			return;
		}

		if (progressDrawable instanceof android.graphics.drawable.LayerDrawable && progressDrawable.getNumberOfLayers() > 0) {
			const backgroundDrawable = progressDrawable.getDrawable(0);
			if (backgroundDrawable) {
				if (value instanceof Color) {
					AndroidHelper.setDrawableColor(value.android, backgroundDrawable);
				} else {
					AndroidHelper.clearDrawableColor(backgroundDrawable);
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
