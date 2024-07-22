import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { colorProperty, visibilityProperty } from '../styling/style-properties';
import { VIEW_GONE, VIEW_INVISIBLE, VIEW_VISIBLE } from '../core/view/index.android';
import { AndroidHelper } from '../core/view';

export * from './activity-indicator-common';

export class ActivityIndicator extends ActivityIndicatorBase {
	nativeViewProtected: android.widget.ProgressBar;

	public createNativeView() {
		const progressBar = new android.widget.ProgressBar(this._context);
		progressBar.setVisibility(VIEW_INVISIBLE);
		progressBar.setIndeterminate(true);

		return progressBar;
	}

	[busyProperty.getDefault](): boolean {
		return false;
	}
	[busyProperty.setNative](value: boolean) {
		if (this.visibility === CoreTypes.Visibility.visible) {
			this.nativeViewProtected.setVisibility(value ? VIEW_VISIBLE : VIEW_INVISIBLE);
		}
	}

	[visibilityProperty.getDefault](): CoreTypes.VisibilityType {
		return CoreTypes.Visibility.hidden;
	}
	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		switch (value) {
			case CoreTypes.Visibility.visible:
				this.nativeViewProtected.setVisibility(this.busy ? VIEW_VISIBLE : VIEW_INVISIBLE);
				break;
			case CoreTypes.Visibility.hidden:
				this.nativeViewProtected.setVisibility(VIEW_INVISIBLE);
				break;
			case CoreTypes.Visibility.collapse:
			case CoreTypes.Visibility.collapsed:
				this.nativeViewProtected.setVisibility(VIEW_GONE);
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: "${CoreTypes.Visibility.visible}", "${CoreTypes.Visibility.hidden}", "${CoreTypes.Visibility.collapse}", "${CoreTypes.Visibility.collapsed}".`);
		}
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		const color = value instanceof Color ? value.android : value;
		const drawable = this.nativeViewProtected.getIndeterminateDrawable().mutate();
		if (color) {
			AndroidHelper.setDrawableColor(color, drawable);
		} else {
			AndroidHelper.clearDrawableColor(drawable);
		}
	}
}
