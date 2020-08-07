import { WrapLayoutBase, orientationProperty, itemWidthProperty, itemHeightProperty } from './wrap-layout-common';
import { Length } from '../../styling/style-properties';

export * from './wrap-layout-common';

export class WrapLayout extends WrapLayoutBase {
	nativeViewProtected: org.nativescript.widgets.WrapLayout;

	public createNativeView() {
		return new org.nativescript.widgets.WrapLayout(this._context);
	}

	[orientationProperty.setNative](value: 'horizontal' | 'vertical') {
		this.nativeViewProtected.setOrientation(value === 'vertical' ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal);
	}

	[itemWidthProperty.setNative](value: Length) {
		this.nativeViewProtected.setItemWidth(Length.toDevicePixels(value, -1));
	}

	[itemHeightProperty.setNative](value: Length) {
		this.nativeViewProtected.setItemHeight(Length.toDevicePixels(value, -1));
	}
}
