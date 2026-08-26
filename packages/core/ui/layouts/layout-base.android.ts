import { LayoutBaseCommon, clipToBoundsProperty, isPassThroughParentEnabledProperty } from './layout-base-common';
import { paddingInternalProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from '../styling/style-properties';
import { Length } from '../styling/length-shared';
import { CoreTypes } from '../../core-types';

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

	// The per-side handlers stage into _pendingPadding, which only exists while
	// [paddingInternalProperty.setNative] runs - it drives them so subclass
	// overrides participate, then commits all sides in one native write. A side
	// whose override does not chain to super keeps its current native value.
	private _pendingPadding: { top: number; right: number; bottom: number; left: number };

	[paddingTopProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingTop, unit: 'px' };
	}

	[paddingTopProperty.setNative](_value: CoreTypes.LengthType) {
		if (this._pendingPadding) {
			this._pendingPadding.top = this.effectivePaddingTop + Length.toDevicePixels(this.style.borderTopWidth, 0);
		}
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}

	[paddingRightProperty.setNative](_value: CoreTypes.LengthType) {
		if (this._pendingPadding) {
			this._pendingPadding.right = this.effectivePaddingRight + Length.toDevicePixels(this.style.borderRightWidth, 0);
		}
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}

	[paddingBottomProperty.setNative](_value: CoreTypes.LengthType) {
		if (this._pendingPadding) {
			this._pendingPadding.bottom = this.effectivePaddingBottom + Length.toDevicePixels(this.style.borderBottomWidth, 0);
		}
	}

	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}

	[paddingLeftProperty.setNative](_value: CoreTypes.LengthType) {
		if (this._pendingPadding) {
			this._pendingPadding.left = this.effectivePaddingLeft + Length.toDevicePixels(this.style.borderLeftWidth, 0);
		}
	}

	[paddingInternalProperty.setNative](_value: string) {
		const nativeView = this.nativeViewProtected;
		this._pendingPadding = { top: nativeView.getPaddingTop(), right: nativeView.getPaddingRight(), bottom: nativeView.getPaddingBottom(), left: nativeView.getPaddingLeft() };
		(<any>this)[paddingTopProperty.setNative](this.style.paddingTop);
		(<any>this)[paddingRightProperty.setNative](this.style.paddingRight);
		(<any>this)[paddingBottomProperty.setNative](this.style.paddingBottom);
		(<any>this)[paddingLeftProperty.setNative](this.style.paddingLeft);
		nativeView.setPadding(this._pendingPadding.left, this._pendingPadding.top, this._pendingPadding.right, this._pendingPadding.bottom);
		this._pendingPadding = null;
	}
}
