import type { NativeScriptUIView } from '../../utils';
import { View } from '../../core/view';
import { LiquidGlassCommon } from './liquid-glass-common';

export class LiquidGlass extends LiquidGlassCommon {
	public nativeViewProtected: UIVisualEffectView;

	createNativeView() {
		const effect = UIGlassEffect.effectWithStyle(UIGlassEffectStyle.Clear);
		effect.interactive = true;
		const glassEffectView = UIVisualEffectView.alloc().initWithEffect(effect);
		glassEffectView.overrideUserInterfaceStyle = UIUserInterfaceStyle.Dark;
		glassEffectView.clipsToBounds = true;

		return glassEffectView;
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
		const parentNativeView = this.nativeViewProtected;
		const childNativeView: NativeScriptUIView = <NativeScriptUIView>child.nativeViewProtected;

		if (parentNativeView && childNativeView) {
			if (typeof atIndex !== 'number' || atIndex >= parentNativeView.subviews.count) {
				// parentNativeView.addSubview(childNativeView);
				this.nativeViewProtected.contentView.addSubview(childNativeView);
			} else {
				// parentNativeView.insertSubviewAtIndex(childNativeView, atIndex);
				this.nativeViewProtected.contentView.insertSubviewAtIndex(childNativeView, atIndex);
			}

			// Add outer shadow layer manually as it belongs to parent layer tree (this is needed for reusable views)
			if (childNativeView.outerShadowContainerLayer && !childNativeView.outerShadowContainerLayer.superlayer) {
				parentNativeView.layer.insertSublayerBelow(childNativeView.outerShadowContainerLayer, childNativeView.layer);
			}

			return true;
		}

		return false;
	}
}
