import type { NativeScriptUIView } from '../../utils';
import { GlassEffectConfig, GlassEffectType, GlassEffectVariant, iosGlassEffectProperty, View } from '../../core/view';
import { LiquidGlassContainerCommon } from './liquid-glass-container-common';

export class LiquidGlassContainer extends LiquidGlassContainerCommon {
	public nativeViewProtected: UIVisualEffectView;
	private _contentHost: UIView;

	createNativeView() {
		// Keep UIVisualEffectView as the root to preserve interactive container effect
		const effect = UIGlassContainerEffect.alloc().init();
		effect.spacing = 8;
		const effectView = UIVisualEffectView.alloc().initWithEffect(effect);
		effectView.overrideUserInterfaceStyle = UIUserInterfaceStyle.Dark;
		effectView.clipsToBounds = true;
		effectView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;

		// Add a host view for children so GridLayout can lay them out normally
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

			// Add outer shadow layer manually as it belongs to parent layer tree (this is needed for reusable views)
			if (childNativeView.outerShadowContainerLayer && !childNativeView.outerShadowContainerLayer.superlayer) {
				this.nativeViewProtected.layer.insertSublayerBelow(childNativeView.outerShadowContainerLayer, childNativeView.layer);
			}

			return true;
		}

		return false;
	}

	[iosGlassEffectProperty.setNative](value: GlassEffectType) {
		console.log('iosGlassEffectProperty:', value);
		let effect: UIGlassContainerEffect | UIVisualEffect;
		const config: GlassEffectConfig | null = typeof value !== 'string' ? value : null;
		const variant = config ? config.variant : (value as GlassEffectVariant);
		const defaultDuration = 0.3;
		const duration = config ? (config.animateChangeDuration ?? defaultDuration) : defaultDuration;
		if (!value || ['identity', 'none'].includes(variant)) {
			// empty effect
			effect = UIVisualEffect.new();
		} else {
			effect = UIGlassContainerEffect.alloc().init();
			(effect as UIGlassContainerEffect).spacing = config?.spacing ?? 8;
		}

		if (effect) {
			// animate effect changes
			UIView.animateWithDurationAnimations(duration, () => {
				this.nativeViewProtected.effect = effect;
			});
		}
	}
}
