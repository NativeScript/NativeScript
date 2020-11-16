import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { colorProperty, visibilityProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Enums } from '../enums';

export * from './activity-indicator-common';

export class ActivityIndicator extends ActivityIndicatorBase {
	nativeViewProtected: android.widget.ProgressBar;

	public createNativeView() {
		const progressBar = new android.widget.ProgressBar(this._context);
		progressBar.setVisibility(android.view.View.INVISIBLE);
		progressBar.setIndeterminate(true);

		return progressBar;
	}

	[busyProperty.getDefault](): boolean {
		return false;
	}
	[busyProperty.setNative](value: boolean) {
		if (this.visibility === Enums.Visibility.visible) {
			this.nativeViewProtected.setVisibility(value ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
		}
	}

	[visibilityProperty.getDefault](): Enums.VisibilityType {
		return Enums.Visibility.hidden;
	}
	[visibilityProperty.setNative](value: Enums.VisibilityType) {
		switch (value) {
			case Enums.Visibility.visible:
				this.nativeViewProtected.setVisibility(this.busy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
				break;
			case Enums.Visibility.hidden:
				this.nativeViewProtected.setVisibility(android.view.View.INVISIBLE);
				break;
			case Enums.Visibility.collapse:
				this.nativeViewProtected.setVisibility(android.view.View.GONE);
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Enums.Visibility.visible}", "${Enums.Visibility.hidden}", "${Enums.Visibility.collapse}".`);
		}
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		if (value instanceof Color) {
			this.nativeViewProtected.getIndeterminateDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
		} else {
			this.nativeViewProtected.getIndeterminateDrawable().clearColorFilter();
		}
	}
}
