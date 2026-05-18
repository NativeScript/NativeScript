import { maxValueProperty, ProgressBase, valueProperty } from './progress-common';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';

export * from './progress-common';

export class Progress extends ProgressBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.ProgressBar;
	private _windows: Windows.UI.Xaml.Controls.ProgressBar;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.ProgressBar();
	}

	public createNativeView() {
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

	[colorProperty.getDefault](): android.graphics.drawable.Drawable {
		return null;
	}
	[colorProperty.setNative](value: Color) {
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

	[backgroundColorProperty.getDefault](): number {
		return null;
	}
	[backgroundColorProperty.setNative](value: Color) {
		const color = value instanceof Color ? value.windows : value
		if (color) {
			if (typeof color === 'number') {
				this.nativeViewProtected.Background = new Windows.UI.Xaml.Media.SolidColorBrush(
					new Color(color).windows
				);
			} else {
				this.nativeViewProtected.Background = new Windows.UI.Xaml.Media.SolidColorBrush(
					color
				);
			}
		} else {
			this.nativeViewProtected.Background = new Windows.UI.Xaml.Media.SolidColorBrush();
		}
	}

	[backgroundInternalProperty.getDefault](): number {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Color) {
		//
	}
}
