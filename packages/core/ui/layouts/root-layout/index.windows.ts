export * from './root-layout-common';

import { Color } from '../../../color';
import { View } from '../../core/view';
import { RootLayoutBase, defaultShadeCoverOptions } from './root-layout-common';
import { TransitionAnimation, ShadeCoverOptions } from '.';
import { parseLinearGradient } from '../../../css/parser';
import { LinearGradient } from '../../styling/linear-gradient';
import { layout } from '../../../utils';

export class RootLayout extends RootLayoutBase {
	insertChild(view: View, atIndex: number): boolean {
		return super.insertChild(view, atIndex);
	}

	removeChild(view: View): void {
		super.removeChild(view);
	}

	protected _bringToFront(view: View) {
		try {
			const native = view.nativeViewProtected as any;
			const parentNative = this.nativeViewProtected as any;
			if (!native || !parentNative || !parentNative.Children) {
				return;
			}

			let maxZ = Number.MIN_SAFE_INTEGER;
			const children = parentNative.Children;
			for (let i = 0; i < children.Size; i++) {
				try {
					const child = children.GetAt(i);
					const z = Microsoft.UI.Xaml.Controls.Panel.GetZIndex(child) || 0;
					if (z > maxZ) maxZ = z;
				} catch (_e) { }
			}

			const newZ = (maxZ === Number.MIN_SAFE_INTEGER) ? 0 : (maxZ + 1);
			try {
				Microsoft.UI.Xaml.Controls.Panel.SetZIndex(native, newZ);
			} catch (_e) { }
		} catch (_e) { }
	}

	protected _initShadeCover(view: View, shadeOptions: ShadeCoverOptions): void {
		const options: TransitionAnimation = {
			...defaultShadeCoverOptions.animation.enterFrom,
			...(shadeOptions && shadeOptions.animation && shadeOptions.animation.enterFrom ? shadeOptions.animation.enterFrom : {}),
		} as TransitionAnimation;

		try {
			const native = view.nativeViewProtected as any;
			if (!native) return;

			// The shared base sets verticalAlignment='bottom', so on Windows the shade cover shrinks to
			// its (empty) content and the backdrop is invisible. Force Stretch so it actually covers the layout.
			try { view.horizontalAlignment = 'stretch'; } catch (_e) { }
			try { view.verticalAlignment = 'stretch'; } catch (_e) { }
			try { native.HorizontalAlignment = 3; native.VerticalAlignment = 3; } catch (_e) { } // Stretch

			try { native.Opacity = options.opacity; } catch (_e) { }

			try {
				const ct = new Microsoft.UI.Xaml.Media.CompositeTransform();
				ct.TranslateX = layout.toDeviceIndependentPixels(options.translateX);
				ct.TranslateY = layout.toDeviceIndependentPixels(options.translateY);
				ct.ScaleX = options.scaleX;
				ct.ScaleY = options.scaleY;
				ct.Rotation = options.rotate;
				native.RenderTransform = ct;
				native.RenderTransformOrigin = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0.5, 0.5);
			} catch (_e) { }
		} catch (_e) { }
	}

	protected _updateShadeCover(view: View, shadeOptions: ShadeCoverOptions = {}): Promise<void> {
		const options = {
			...defaultShadeCoverOptions,
			...(shadeOptions || {}),
		} as ShadeCoverOptions;

		const isBackgroundGradient = typeof options.color === 'string' && options.color.indexOf('linear-gradient') === 0;

		if (isBackgroundGradient) {
			try {
				if (view.backgroundColor) {
					view.backgroundColor = undefined;
				}
				const parsed = parseLinearGradient(options.color as string);
				view.backgroundImage = LinearGradient.parse(parsed.value);
			} catch (_e) { }
		} else {
			try {
				if (view.backgroundImage) {
					view.backgroundImage = undefined;
				}
				if (options.color) {
					view.backgroundColor = (options.color instanceof Color) ? (options.color as Color) : new Color(options.color as any);
				}
			} catch (_e) { }
		}

		// getEnterAnimation animates opacity to 1 (fully opaque), but the intended shade is semi-transparent
		// (e.g. 0.7) to let page content show through — match iOS by applying targetOpacity as the final state.
		// Pre-set before play() so a freshly-mounted element doesn't flash opaque.
		const targetOpacity = typeof options.opacity === 'number' ? options.opacity : 0.5;
		const enterFrom = options.animation && options.animation.enterFrom ? options.animation.enterFrom : defaultShadeCoverOptions.animation.enterFrom;
		try { view.opacity = targetOpacity; } catch (_e) { }
		return this.getEnterAnimation(view as View, enterFrom).play().then(() => {
			try { view.opacity = targetOpacity; } catch (_e) { }
		});
	}

	protected _closeShadeCover(view: View, shadeOptions: ShadeCoverOptions = {}): Promise<void> {
		const exitState: TransitionAnimation = {
			...defaultShadeCoverOptions.animation.exitTo,
			...(shadeOptions && shadeOptions.animation && shadeOptions.animation.exitTo ? shadeOptions.animation.exitTo : {}),
		} as TransitionAnimation;
		return this.getExitAnimation(view as View, exitState).play();
	}

	protected _cleanupPlatformShadeCover(): void {
		try {
			if (!this._shadeCover) return;
			const native = (this._shadeCover as any).nativeViewProtected as any;
			if (native) {
				try { native.RenderTransform = null; } catch (_e) { }
				try { native.Opacity = 1; } catch (_e) { }
			}
			try { this._shadeCover.backgroundImage = undefined; } catch (_e) { }
			try { this._shadeCover.backgroundColor = undefined as any; } catch (_e) { }
		} catch (_e) { }
	}
}
