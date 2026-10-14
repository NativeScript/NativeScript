import { maxValueProperty, ProgressBase, valueProperty } from './progress-common';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';
import { Background } from '../styling/background';

export * from './progress-common';

// ProgressBar is not WinRT-activatable in this WinAppSDK build: `new ProgressBar()` throws E_NOTIMPL (0x80004001).
// Create via XamlReader instead; attempt `new` only until first failure, then go straight to XamlReader.
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

export class Progress extends ProgressBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.ProgressBar;
	private _windows: Microsoft.UI.Xaml.Controls.ProgressBar;

	public createNativeView(): Microsoft.UI.Xaml.Controls.ProgressBar {
		this._windows = createProgressBar();
		return this._windows;
	}

	[valueProperty.getDefault](): number {
		return 0;
	}
	[valueProperty.setNative](value: number) {
		this.nativeViewProtected.Value = value;
	}

	[maxValueProperty.getDefault](): number {
		return 100;
	}
	[maxValueProperty.setNative](value: number) {
		this.nativeViewProtected.Maximum = value;
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

	[backgroundColorProperty.getDefault](): number {
		return -1;
	}
	[backgroundColorProperty.setNative](value: Color | number) {
		if (value instanceof Color) {
			this.nativeViewProtected.Background = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
		} else {
			this.nativeViewProtected.Background = null;
		}
	}

	[backgroundInternalProperty.getDefault](): Background {
		return null;
	}
	[backgroundInternalProperty.setNative](_value: Background) {}
}
