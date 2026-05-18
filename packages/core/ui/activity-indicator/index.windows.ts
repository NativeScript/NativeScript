import { colorProperty, visibilityProperty } from '../styling/style-properties';
import { CoreTypes } from '../../core-types';
import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { Color } from '../../color';
export * from './activity-indicator-common';

export class ActivityIndicator extends ActivityIndicatorBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.ProgressBar;

	public createNativeView(): Object {
		const indicator = new Windows.UI.Xaml.Controls.ProgressBar();
		indicator.IsIndeterminate = true;
		indicator.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
		return indicator;
	}


	[busyProperty.getDefault](): boolean {
		return false;
	}
	[busyProperty.setNative](value: boolean) {
		if (this.visibility === CoreTypes.Visibility.visible) {
			this.nativeViewProtected.Visibility = value ? Windows.UI.Xaml.Visibility.Visible : Windows.UI.Xaml.Visibility.Collapsed;
		}
	}


	[visibilityProperty.getDefault](): CoreTypes.VisibilityType {
		return CoreTypes.Visibility.hidden;
	}

	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		switch (value) {
			case CoreTypes.Visibility.visible:
				this.nativeViewProtected.Visibility = this.busy ? Windows.UI.Xaml.Visibility.Visible : Windows.UI.Xaml.Visibility.Collapsed;
				break;
			case CoreTypes.Visibility.hidden:
				this.nativeViewProtected.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
				break;
			case CoreTypes.Visibility.collapse:
				this.nativeViewProtected.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: "${CoreTypes.Visibility.visible}", "${CoreTypes.Visibility.hidden}", "${CoreTypes.Visibility.collapse}".`);
		}
	}


	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: number | Color) {
		const color = value instanceof Color ? value.windows : value
		if (color) {
			if (typeof color === 'number') {
				this.nativeViewProtected.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(
					new Color(color).windows
				);
			} else {
				this.nativeViewProtected.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(
					color
				);
			}
		} else {
			this.nativeViewProtected.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush();
		}
	}
}
