import { StackLayoutBase, orientationProperty } from './stack-layout-common';

export * from './stack-layout-common';

export class StackLayout extends StackLayoutBase {
	nativeViewProtected: org.nativescript.widgets.StackLayout;

	public createNativeView() {
		return new org.nativescript.widgets.StackLayout(this._context);
	}

	[orientationProperty.setNative](value: 'horizontal' | 'vertical') {
		this.nativeViewProtected.setOrientation(value === 'vertical' ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal);
	}
}
