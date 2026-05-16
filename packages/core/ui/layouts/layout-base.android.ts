import { LayoutBaseCommon, clipToBoundsProperty, isPassThroughParentEnabledProperty } from './layout-base-common';
import { paddingInternalProperty } from '../styling/style-properties';
import { Length } from '../styling/length-shared';

export * from './layout-base-common';

export class LayoutBase extends LayoutBaseCommon {
	declare nativeViewProtected: org.nativescript.widgets.LayoutBase;

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
		this.nativeViewProtected.setPassThroughParent(value);
	}

	[paddingInternalProperty.setNative](value: string) {
		if (typeof value === 'string') {
			this.nativeViewProtected.setPadding(this.effectivePaddingLeft + Length.toDevicePixels(this.style.borderLeftWidth, 0), this.effectivePaddingTop + Length.toDevicePixels(this.style.borderTopWidth, 0), this.effectivePaddingRight + Length.toDevicePixels(this.style.borderRightWidth, 0), this.effectivePaddingBottom + Length.toDevicePixels(this.style.borderBottomWidth, 0));
		} else {
			// Reset padding in case of null or any value other than string
			this.nativeViewProtected.setPadding(this._defaultPaddingLeft, this._defaultPaddingTop, this._defaultPaddingRight, this._defaultPaddingBottom);
		}
	}
}
