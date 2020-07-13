import { ProgressBase, valueProperty, maxValueProperty } from './progress-common';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';

export * from './progress-common';

const R_ATTR_PROGRESS_BAR_STYLE_HORIZONTAL = 0x01010078;

export class Progress extends ProgressBase {
	nativeViewProtected: android.widget.ProgressBar;

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
		let progressDrawable = this.nativeViewProtected.getProgressDrawable();
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
		let progressDrawable = this.nativeViewProtected.getProgressDrawable();
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
