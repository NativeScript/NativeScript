import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { colorProperty, visibilityProperty, Visibility } from '../styling/style-properties';
import { Color } from '../../color';

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
		if (this.visibility === Visibility.VISIBLE) {
			this.nativeViewProtected.setVisibility(value ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
		}
	}

	[visibilityProperty.getDefault](): Visibility {
		return Visibility.HIDDEN;
	}
	[visibilityProperty.setNative](value: Visibility) {
		switch (value) {
			case Visibility.VISIBLE:
				this.nativeViewProtected.setVisibility(this.busy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
				break;
			case Visibility.HIDDEN:
				this.nativeViewProtected.setVisibility(android.view.View.INVISIBLE);
				break;
			case Visibility.COLLAPSE:
				this.nativeViewProtected.setVisibility(android.view.View.GONE);
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
		}
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		const color = value instanceof Color ? value.android : value;
		const drawable = this.nativeViewProtected.getIndeterminateDrawable().mutate();
		if (color) {
			drawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_IN);
		} else {
			drawable.clearColorFilter();
		}
	}
}
