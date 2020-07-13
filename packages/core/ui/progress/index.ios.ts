import { ProgressBase, valueProperty, maxValueProperty } from './progress-common';
import { Color } from '../../color';
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from '../styling/style-properties';

export * from './progress-common';

export class Progress extends ProgressBase {
	nativeViewProtected: UIProgressView;

	createNativeView() {
		return UIProgressView.new();
	}

	get ios() {
		return this.nativeViewProtected;
	}

	[valueProperty.getDefault](): number {
		return 0;
	}
	[valueProperty.setNative](value: number) {
		this.ios.progress = value / this.maxValue;
	}

	[maxValueProperty.getDefault](): number {
		return 100;
	}
	[maxValueProperty.setNative](value: number) {
		this.ios.progress = this.value / value;
	}

	[colorProperty.getDefault](): UIColor {
		return this.ios.progressTintColor;
	}
	[colorProperty.setNative](value: Color | UIColor) {
		this.ios.progressTintColor = value instanceof Color ? value.ios : value;
	}

	[backgroundColorProperty.getDefault](): UIColor {
		return this.ios.trackTintColor;
	}
	[backgroundColorProperty.setNative](value: UIColor | Color) {
		let color = value instanceof Color ? value.ios : value;
		this.ios.trackTintColor = color;
	}

	[backgroundInternalProperty.getDefault](): UIColor {
		return null;
	}
	[backgroundInternalProperty.setNative](value: Color) {
		//
	}
}
