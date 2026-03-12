import type { NativeScriptUIView } from '../../utils';
import { supportsGlass } from '../../../utils/constants';
import { type GlassEffectType, type GlassEffectVariant, iosGlassEffectProperty, View } from '../../core/view';
import { LiquidGlassCommon } from './liquid-glass-common';

export class LiquidGlass extends LiquidGlassCommon {
	public nativeViewProtected: UIVisualEffectView;
	private _contentHost: UIView;

	createNativeView() {
		// Use UIVisualEffectView as the root so interactive effects can track touches
		const effect = UIGlassEffect.effectWithStyle(UIGlassEffectStyle.Clear);
		effect.interactive = true;
		const effectView = UIVisualEffectView.alloc().initWithEffect(effect);
		effectView.frame = CGRectMake(0, 0, 0, 0);
		effectView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
		effectView.clipsToBounds = true;

		// Host for all children so parent layout works as usual
		const host = UIView.new();
		host.frame = effectView.bounds;
		host.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
		host.userInteractionEnabled = true;
		effectView.contentView.addSubview(host);
		this._contentHost = host;

		return effectView;
	}

	public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
		const parentNativeView = this._contentHost;
		const childNativeView: NativeScriptUIView = <NativeScriptUIView>child.nativeViewProtected;

		if (parentNativeView && childNativeView) {
			if (typeof atIndex !== 'number' || atIndex >= parentNativeView.subviews.count) {
				parentNativeView.addSubview(childNativeView);
			} else {
				parentNativeView.insertSubviewAtIndex(childNativeView, atIndex);
			}

			// If the child has an outer shadow layer, ensure it is attached under the child's layer
			if (childNativeView.outerShadowContainerLayer && !childNativeView.outerShadowContainerLayer.superlayer) {
				this.nativeViewProtected.layer.insertSublayerBelow(childNativeView.outerShadowContainerLayer, childNativeView.layer);
			}

			return true;
		}

		return false;
	}

	[iosGlassEffectProperty.setNative](value: GlassEffectType) {
		this._applyGlassEffect(value, {
			effectType: 'glass',
			targetView: this.nativeViewProtected,
			toGlassStyleFn: toUIGlassStyle,
		});
	}
}

export function toUIGlassStyle(value?: GlassEffectVariant) {
	if (supportsGlass()) {
		switch (value) {
			case 'regular':
				return UIGlassEffectStyle?.Regular ?? 0;
			case 'clear':
				return UIGlassEffectStyle?.Clear ?? 1;
		}
	}
	return 1;
}
