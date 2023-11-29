import { Trace } from '../../../../trace';
import { SDK_VERSION } from '../../../../utils/constants';

export * from './view-helper-common';

const androidxGraphics = androidx.core.graphics;

export class AndroidHelper {
	static setDrawableColor(color: number, drawable: android.graphics.drawable.Drawable, blendMode?: androidx.core.graphics.BlendModeCompat): void {
		// ColorDrawable is an old layer that had support for setColorFilter on API 21
		if (SDK_VERSION < 21 && drawable instanceof android.graphics.drawable.ColorDrawable) {
			drawable.setColor(color);
		} else {
			drawable.setColorFilter(androidxGraphics.BlendModeColorFilterCompat.createBlendModeColorFilterCompat(color, blendMode ?? androidxGraphics.BlendModeCompat.SRC_IN));
		}
	}

	static clearDrawableColor(drawable: android.graphics.drawable.Drawable): void {
		// ColorDrawable is an old layer that had support for setColorFilter on API 21
		if (SDK_VERSION < 21 && drawable instanceof android.graphics.drawable.ColorDrawable) {
			drawable.setColor(-1);
		} else {
			drawable.clearColorFilter();
		}
	}

	static getCopyOrDrawable(drawable: android.graphics.drawable.Drawable, resources?: android.content.res.Resources): android.graphics.drawable.Drawable {
		if (drawable) {
			const constantState = drawable.getConstantState();
			if (constantState) {
				return resources ? constantState.newDrawable(resources) : constantState.newDrawable();
			}
		}

		return drawable;
	}
}
