import { AbsoluteLayoutBase, leftProperty, topProperty } from './absolute-layout-common';
import { View } from '../../core/view';
import { Length } from '../../styling/style-properties';

export * from './absolute-layout-common';

function makeNativeSetter<T>(setter: (this: View, lp: org.nativescript.widgets.CommonLayoutParams, value: T) => void) {
	return function (this: View, value: T) {
		const nativeView: android.view.View = this.nativeViewProtected;
		const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
		if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
			setter.call(this, lp, value);
			nativeView.setLayoutParams(lp);
		}
	};
}

View.prototype[topProperty.setNative] = makeNativeSetter<number>(function (this: View, lp, value) {
	lp.top = Length.toDevicePixels(value, 0);
});
View.prototype[leftProperty.setNative] = makeNativeSetter<number>(function (this: View, lp, value) {
	lp.left = Length.toDevicePixels(value, 0);
});

export class AbsoluteLayout extends AbsoluteLayoutBase {
	nativeViewProtected: org.nativescript.widgets.AbsoluteLayout;

	public createNativeView() {
		return new org.nativescript.widgets.AbsoluteLayout(this._context);
	}
}
