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

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		// When LiquidGlass is a child of FlexboxLayout (or any layout that passes a child
		// measure spec already reduced by the child's padding), GridLayout.onMeasure would
		// subtract our padding a second time. To prevent this double-deduction we temporarily
		// zero the effective padding/border values before delegating to the GridLayout
		// measurement, then restore them immediately after.
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

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		// GridLayout.onLayout computes column/row offsets relative to (left, top), then
		// adds its own padding on top. Since the FlexboxLayout (or parent) already placed
		// our UIVisualEffectView at (left, top), we normalise to local coordinates so that
		// GridLayout lays children out in (0, 0, width, height) space — which is exactly
		// the coordinate space of our _contentHost UIView that hosts the children.
		super.onLayout(0, 0, right - left, bottom - top);
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
