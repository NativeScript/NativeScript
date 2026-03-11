import type { NativeScriptUIView } from '../../utils';
import { supportsGlass } from '../../../utils/constants';
import { GlassEffectType, iosGlassEffectProperty, View } from '../../core/view';
import { LiquidGlassContainerCommon } from './liquid-glass-container-common';
import { toUIGlassStyle } from '../liquid-glass';

export class LiquidGlassContainer extends LiquidGlassContainerCommon {
	public nativeViewProtected: UIVisualEffectView;
	private _contentHost: UIView;
	private _normalizing = false;

	createNativeView() {
		const glassSupported = supportsGlass();
		// Keep UIVisualEffectView as the root to preserve interactive container effect
		const effect = glassSupported ? UIGlassContainerEffect.alloc().init() : UIVisualEffect.new();
		if (glassSupported) {
			(effect as UIGlassContainerEffect).spacing = 8;
		}
		const effectView = UIVisualEffectView.alloc().initWithEffect(effect);
		if (glassSupported) {
			effectView.overrideUserInterfaceStyle = UIUserInterfaceStyle.Dark;
		}
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

	// When LiquidGlassContainer is a child of FlexboxLayout (or any layout that passes
	// a measure spec already reduced by the child's padding), AbsoluteLayout.onMeasure
	// would subtract our padding a second time. To prevent this double-deduction we
	// temporarily zero the effective padding/border values before delegating to the
	// AbsoluteLayout measurement, then restore them immediately after.
	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const pl = this.effectivePaddingLeft;
		const pr = this.effectivePaddingRight;
		const pt = this.effectivePaddingTop;
		const pb = this.effectivePaddingBottom;
		const bl = this.effectiveBorderLeftWidth;
		const br = this.effectiveBorderRightWidth;
		const bt = this.effectiveBorderTopWidth;
		const bb = this.effectiveBorderBottomWidth;

		this.effectivePaddingLeft = 0;
		this.effectivePaddingRight = 0;
		this.effectivePaddingTop = 0;
		this.effectivePaddingBottom = 0;
		this.effectiveBorderLeftWidth = 0;
		this.effectiveBorderRightWidth = 0;
		this.effectiveBorderTopWidth = 0;
		this.effectiveBorderBottomWidth = 0;

		super.onMeasure(widthMeasureSpec, heightMeasureSpec);

		this.effectivePaddingLeft = pl;
		this.effectivePaddingRight = pr;
		this.effectivePaddingTop = pt;
		this.effectivePaddingBottom = pb;
		this.effectiveBorderLeftWidth = bl;
		this.effectiveBorderRightWidth = br;
		this.effectiveBorderTopWidth = bt;
		this.effectiveBorderBottomWidth = bb;
	}

	// When children animate with translate (layer transform), UIVisualEffectView-based
	// container effects may recompute based on the underlying frames (not transforms),
	// which can cause jumps. Normalize any residual translation into the
	// child's frame so the effect uses the final visual positions.
	public onLayout(left: number, top: number, right: number, bottom: number): void {
		// AbsoluteLayout.onLayout positions children using our padding as an offset.
		// Since the FlexboxLayout (or parent) already placed our UIVisualEffectView at
		// (left, top), we normalise to local coordinates so that AbsoluteLayout places
		// children in (0, 0, width, height) space — the coordinate space of _contentHost.
		super.onLayout(0, 0, right - left, bottom - top);

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
