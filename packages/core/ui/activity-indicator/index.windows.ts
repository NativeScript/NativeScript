import { colorProperty, visibilityProperty } from '../styling/style-properties';
import { CoreTypes } from '../../core-types';
import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { Color } from '../../color';
export * from './activity-indicator-common';

// ProgressBar is not WinRT-activatable in this WinAppSDK build: ActivateInstance/RoActivateInstance return E_NOTIMPL,
// so `new ProgressBar()` throws. Create via XamlReader instead; attempt `new` only until first failure, then remember.
let _progressBarActivatable: boolean | undefined;
function createProgressBar(): Microsoft.UI.Xaml.Controls.ProgressBar {
	if (_progressBarActivatable !== false) {
		try {
			const pb = new Microsoft.UI.Xaml.Controls.ProgressBar();
			_progressBarActivatable = true;
			return pb;
		} catch (_e) {
			_progressBarActivatable = false;
		}
	}
	return Microsoft.UI.Xaml.Markup.XamlReader.Load('<ProgressBar xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" />') as Microsoft.UI.Xaml.Controls.ProgressBar;
}

export class ActivityIndicator extends ActivityIndicatorBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.ProgressBar;

	public createNativeView(): Microsoft.UI.Xaml.Controls.ProgressBar {
		const indicator = createProgressBar();
		indicator.IsIndeterminate = true;
		indicator.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
		return indicator;
	}

	[busyProperty.getDefault](): boolean {
		return false;
	}

	[busyProperty.setNative](value: boolean) {
		if (this.visibility === CoreTypes.Visibility.visible) {
			this.nativeViewProtected.Visibility = value ? Microsoft.UI.Xaml.Visibility.Visible : Microsoft.UI.Xaml.Visibility.Collapsed;
		}
	}

	[visibilityProperty.getDefault](): CoreTypes.VisibilityType {
		return CoreTypes.Visibility.hidden;
	}

	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		switch (value) {
			case CoreTypes.Visibility.visible:
				this.nativeViewProtected.Visibility = this.busy ? Microsoft.UI.Xaml.Visibility.Visible : Microsoft.UI.Xaml.Visibility.Collapsed;
				break;
			case CoreTypes.Visibility.hidden:
			case CoreTypes.Visibility.collapse:
				this.nativeViewProtected.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: "${CoreTypes.Visibility.visible}", "${CoreTypes.Visibility.hidden}", "${CoreTypes.Visibility.collapse}".`);
		}
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: Color | number) {
		if (value instanceof Color) {
			this.nativeViewProtected.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
		} else {
			this.nativeViewProtected.Foreground = null;
		}
	}
}
