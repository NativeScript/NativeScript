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
		// Android clips per parent, not per child: a ViewGroup either confines
		// every child to its own bounds or none of them. A view that must draw
		// outside itself (a box-shadow, a translated child) therefore needs its
		// parent layout's clipToBounds set to false, not its own.
		const nativeView = this.nativeViewProtected;
		nativeView.setClipChildren(value);
		nativeView.setClipToPadding(value);
	}

	[isPassThroughParentEnabledProperty.setNative](value: boolean) {
		this.nativeViewProtected.setPassThroughParent(value);
	}

	[paddingInternalProperty.setNative](_value: string) {
		const left = this.effectivePaddingLeft + Length.toDevicePixels(this.style.borderLeftWidth, 0);
		const top = this.effectivePaddingTop + Length.toDevicePixels(this.style.borderTopWidth, 0);
		const right = this.effectivePaddingRight + Length.toDevicePixels(this.style.borderRightWidth, 0);
		const bottom = this.effectivePaddingBottom + Length.toDevicePixels(this.style.borderBottomWidth, 0);
		this.nativeViewProtected.setPadding(left, top, right, bottom);
	}
}
