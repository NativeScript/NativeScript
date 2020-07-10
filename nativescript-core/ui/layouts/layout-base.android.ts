import { LayoutBaseCommon, clipToBoundsProperty, isPassThroughParentEnabledProperty } from './layout-base-common';
import { Length, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty } from '../styling/style-properties';

export * from './layout-base-common';

export class LayoutBase extends LayoutBaseCommon {
	[clipToBoundsProperty.getDefault](): boolean {
		return true;
	}
	[clipToBoundsProperty.setNative](value: boolean) {
		// TODO: Use ClipRectangle if API > 16!

		// We can't implement this without calling setClipChildren(false) on every ancestor up in the visual tree,
		// which will kill performance. It will also lead to unwanted side effects such as other totally unrelated
		// views being affected by setting the parents' setClipChildren to false.
		// The problem in Android is that a ViewGroup either clips ALL of its children or it does not. Unlike iOS, the clipping
		// cannot be controlled on a per view basis. So clipToBounds=false will have to be somehow achieved with stacking different
		// views on top of one another in an AbsoluteLayout or GridLayout. There is always a workaround when playing with layouts.
		//
		// The following article explains this in detail:
		// http://stackoverflow.com/questions/25044085/when-drawing-outside-the-view-clip-bounds-with-android-how-do-i-prevent-underli
		console.warn(`clipToBounds with value false is not supported on Android. You can use this.android.getParent().setClipChildren(false) as an alternative`);
	}

	[isPassThroughParentEnabledProperty.setNative](value: boolean) {
		(<any>this.nativeViewProtected).setPassThroughParent(value);
	}

	[paddingTopProperty.getDefault](): Length {
		return { value: this._defaultPaddingTop, unit: 'px' };
	}
	[paddingTopProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
	}

	[paddingRightProperty.getDefault](): Length {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}
	[paddingRightProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
	}

	[paddingBottomProperty.getDefault](): Length {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}
	[paddingBottomProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
	}

	[paddingLeftProperty.getDefault](): Length {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}
	[paddingLeftProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
	}
}
