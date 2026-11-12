import { LayoutBaseCommon, clipToBoundsProperty, isPassThroughParentEnabledProperty } from './layout-base-common';
import { View } from '../core/view';

export * from './layout-base-common';

export class LayoutBase extends LayoutBaseCommon {
	nativeViewProtected: any;

	public addChild(child: View): void {
		super.addChild(child);
		this.requestLayout();
	}

	public insertChild(child: View, atIndex: number): boolean {
		if (super.insertChild(child, atIndex)) {
			this.requestLayout();
			return true;
		}
		return false;
	}

	public removeChild(child: View): void {
		super.removeChild(child);
		this.requestLayout();
	}

	_setNativeClipToBounds() {
		const view = this.nativeViewProtected;
		if (view) {
			gtk_widget_set_overflow(view, this.clipToBounds ? GtkOverflow.HIDDEN : GtkOverflow.VISIBLE);
		}
	}

	[clipToBoundsProperty.getDefault](): boolean {
		return true;
	}

	[clipToBoundsProperty.setNative](value: boolean) {
		this._setNativeClipToBounds();
	}

	// events fall through to the views behind when the layout itself isn't hit
	[isPassThroughParentEnabledProperty.setNative](value: boolean) {
		gtk_widget_set_can_target(this.nativeViewProtected, value ? 0 : 1);
	}
}
