import { LayoutBaseCommon, clipToBoundsProperty, isPassThroughParentEnabledProperty } from './layout-base-common';
import { View } from '../core/view';

export * from './layout-base-common';

export class LayoutBase extends LayoutBaseCommon {
	nativeViewProtected: UIView;

	public addChild(child: View): void {
		super.addChild(child);
		this.requestLayout();
	}

	public insertChild(child: View, atIndex: number): void {
		super.insertChild(child, atIndex);
		this.requestLayout();
	}

	public removeChild(child: View): void {
		super.removeChild(child);
		this.requestLayout();
	}

	_setNativeClipToBounds() {
		if (this.clipToBounds) {
			this.nativeViewProtected.clipsToBounds = true;
		} else {
			super._setNativeClipToBounds();
		}
	}

	[clipToBoundsProperty.getDefault](): boolean {
		return false;
	}
	[clipToBoundsProperty.setNative](value: boolean) {
		this._setNativeClipToBounds();
	}

	[isPassThroughParentEnabledProperty.setNative](value: boolean) {
		(<any>this.nativeViewProtected).setPassThroughParent(value);
	}
}
