import { colorProperty, visibilityProperty } from '../styling/style-properties';
import { CoreTypes } from '../../core-types';
import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { Color } from '../../color';
export * from './activity-indicator-common';

// ProgressRing may not be WinRT-activatable (ActivateInstance returns
// E_NOTIMPL); fall back to XamlReader and remember the outcome.
let _progressRingActivatable: boolean | undefined;
function createProgressRing(): Microsoft.UI.Xaml.Controls.ProgressRing {
	if (_progressRingActivatable !== false) {
		try {
			const ring = new Microsoft.UI.Xaml.Controls.ProgressRing();
			_progressRingActivatable = true;
			return ring;
		} catch (_e) {
			_progressRingActivatable = false;
		}
	}
	return Microsoft.UI.Xaml.Markup.XamlReader.Load('<ProgressRing xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" />') as Microsoft.UI.Xaml.Controls.ProgressRing;
}

export class ActivityIndicator extends ActivityIndicatorBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.ProgressRing;

	public createNativeView(): Microsoft.UI.Xaml.Controls.ProgressRing {
		const ring = createProgressRing();
		ring.IsActive = false;
		return ring;
	}

	[busyProperty.getDefault](): boolean {
		return false;
	}

	[busyProperty.setNative](value: boolean) {
		// Only spin while visible (matches the Android visibility gate).
		this.nativeViewProtected.IsActive = !!value && this.visibility === CoreTypes.Visibility.visible;
	}

	[visibilityProperty.getDefault](): CoreTypes.VisibilityType {
		return CoreTypes.Visibility.hidden;
	}

	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		switch (value) {
			case CoreTypes.Visibility.visible:
				this.nativeViewProtected.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
				this.nativeViewProtected.IsActive = this.busy;
				break;
			case CoreTypes.Visibility.hidden:
			case CoreTypes.Visibility.collapse:
				this.nativeViewProtected.IsActive = false;
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
