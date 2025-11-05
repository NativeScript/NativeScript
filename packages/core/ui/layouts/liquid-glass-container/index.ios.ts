import type { NativeScriptUIView } from '../../utils';
import { GlassEffectType, iosGlassEffectProperty, View } from '../../core/view';
import { LiquidGlassContainerCommon } from './liquid-glass-container-common';
import { toUIGlassStyle } from '../liquid-glass';

export class LiquidGlassContainer extends LiquidGlassContainerCommon {
	public nativeViewProtected: UIVisualEffectView;
	private _contentHost: UIView;
	private _normalizing = false;

	createNativeView() {
		// Keep UIVisualEffectView as the root to preserve interactive container effect
		const effect = UIGlassContainerEffect.alloc().init();
		effect.spacing = 8;
		const effectView = UIVisualEffectView.alloc().initWithEffect(effect);
		effectView.overrideUserInterfaceStyle = UIUserInterfaceStyle.Dark;
		effectView.clipsToBounds = true;
		effectView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;

		// Add a host view for children so parent can lay them out normally
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

			// Normalize in case the child comes in with a residual translate from a previous state
			this._scheduleNormalize();

			return true;
		}

		return false;
	}

	// When children animate with translate (layer transform), UIVisualEffectView-based
	// container effects may recompute based on the underlying frames (not transforms),
	// which can cause jumps. Normalize any residual translation into the
	// child's frame so the effect uses the final visual positions.
	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);

		// Try to fold any pending translates into frames on each layout pass
		this._normalizeChildrenTransforms();
	}

	// Allow callers to stabilize layout after custom animations
	public stabilizeLayout() {
		this._normalizeChildrenTransforms(true);
	}

	private _scheduleNormalize() {
		if (this._normalizing) return;
		this._normalizing = true;
		// Next tick to allow any pending frame/transform updates to settle
		setTimeout(() => {
			try {
				this._normalizeChildrenTransforms();
			} finally {
				this._normalizing = false;
			}
		});
	}

	private _normalizeChildrenTransforms(force = false) {
		let changed = false;
		const count = this.getChildrenCount?.() ?? 0;
		for (let i = 0; i < count; i++) {
			const child = this.getChildAt(i) as View | undefined;
			if (!child) continue;
			const tx = child.translateX || 0;
			const ty = child.translateY || 0;
			if (!tx && !ty) continue;

			const native = child.nativeViewProtected as UIView;
			if (!native) continue;

			// Skip if the child is still animating (unless forced)
			if (!force) {
				const keys = native.layer.animationKeys ? native.layer.animationKeys() : null;
				const hasAnimations = !!(keys && keys.count > 0);
				if (hasAnimations) continue;
			}

			const frame = native.frame;
			native.transform = CGAffineTransformIdentity;
			native.frame = CGRectMake(frame.origin.x + tx, frame.origin.y + ty, frame.size.width, frame.size.height);

			child.translateX = 0;
			child.translateY = 0;
			changed = true;
		}

		if (changed) {
			// Ask the effect view to re-evaluate its internal state using updated frames
			const nv = this.nativeViewProtected;
			if (nv) {
				nv.setNeedsLayout();
				nv.layoutIfNeeded();
				// Also request layout on contentView in case the effect inspects it directly
				nv.contentView?.setNeedsLayout?.();
				nv.contentView?.layoutIfNeeded?.();
			}
		}
	}

	[iosGlassEffectProperty.setNative](value: GlassEffectType) {
		this._applyGlassEffect(value, {
			effectType: 'container',
			targetView: this.nativeViewProtected,
			toGlassStyleFn: toUIGlassStyle,
		});
	}
}
