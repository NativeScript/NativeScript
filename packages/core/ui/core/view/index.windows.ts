export * from './view-common';
export * from './view-helper';
export * from '../properties';

import { ViewCommon } from './view-common';
import type { CoreTypes } from '../../../core-types';
import { visibilityProperty, opacityProperty, backgroundInternalProperty } from '../../styling/style-properties';
import { LinearGradient } from '../../styling/linear-gradient';
import { widthProperty, heightProperty, minWidthProperty, minHeightProperty, marginLeftProperty, marginTopProperty, marginRightProperty, marginBottomProperty } from '../../styling/style-properties';
import { layout } from '../../../utils';
import { Background } from '../../styling/background';
import { Color } from '../../../color';

declare function __nsCreateCompositionBorder(nativeElement: any): any;

type WindowsColor = Color & { windows: Windows.UI.Color, windowsArgb: number };

let _defaultBackground: Windows.UI.Color;
export function getDefaultBackground() {
	if (!_defaultBackground) {
		_defaultBackground = Windows.UI.ColorHelper.FromArgb(0, 0, 0, 0);
	}
	return _defaultBackground;
}

// NOTE: `_nativeBackgroundState` will be initialized on the prototype after the class definition

function toXamlLength(value: CoreTypes.PercentLengthType | CoreTypes.LengthType): number {
	if (!value || value === 'auto') return NaN;
	if (typeof value === 'number') return value;
	if (typeof value === 'object' && 'value' in value) {
		if ((value as any).unit === '%') return NaN; // percent not directly settable
		return (value as any).value ?? NaN;
	}
	return NaN;
}

export class View extends ViewCommon {
	nativeViewProtected: Windows.UI.Xaml.FrameworkElement;

	_nativeBackgroundState: 'invalid' | 'drawn' = 'invalid';

	// initialized below for downlevel compatibility

	// XAML handles layout natively — these are no-ops on Windows
	public onMeasure(_widthMeasureSpec: number, _heightMeasureSpec: number): void { }
	public onLayout(_left: number, _top: number, _right: number, _bottom: number): void { }
	public layoutNativeView(_left: number, _top: number, _right: number, _bottom: number): void { }

	_redrawNativeBackground(value: any): void {
		const native = this.nativeViewProtected as any;
		if (!native) return;

		try {
			// Clear existing composition visual (if any)
			if (native._ns_box_shadow_visual) {
				try {
					Windows.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(native, null);
				} catch (_e) { }
				native._ns_box_shadow_visual = null;
			}

			// If we received a Background-like object with boxShadows, apply the first shadow via Composition
			const background = value as any;
			if (background && typeof background.hasBoxShadows === 'function' && background.hasBoxShadows()) {
				const boxShadows = typeof background.getBoxShadows === 'function' ? background.getBoxShadows() : background.boxShadows;
				if (boxShadows && boxShadows.length) {
					try {
						const visual = Windows.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(native);
						const compositor = visual.Compositor;
						const sprite = compositor.CreateSpriteVisual();
						const drop = compositor.CreateDropShadow();
						// Use first shadow as primary
						const s = boxShadows[0];
						if (s && s.color && s.color.windows) {
							drop.Color = s.color.windows;
						}
						if (typeof s.blurRadius === 'number') {
							drop.BlurRadius = s.blurRadius;
						}
						// Offset is a Vector3
						try {
							drop.Offset = new Windows.Foundation.Numerics.Vector3(s.offsetX || 0, s.offsetY || 0, 0);
						} catch (_e) {
							// fallback: ignore if Vector3 constructor not available
						}
						sprite.Shadow = drop;
						// Match size to element visual
						sprite.Size = visual.Size;
						Windows.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(native, sprite);
						native._ns_box_shadow_visual = sprite;
					} catch (_e) {
						// best-effort: composition APIs may not be available on all hosts
					}
				}
			}
		} catch (_e) {
			// swallow to avoid breaking the app if composition APIs fail
		}

	}

	_onSizeChanged(): void {
		const nativeView = this.nativeViewProtected as any;
		if (!nativeView) {
			return;
		}

		const background = this.style.backgroundInternal;
		const backgroundDependsOnSize = (background && background.image && background.image !== 'none') || (background && background.clipPath) || (background && !background.hasUniformBorder()) || (background && background.hasBorderRadius && background.hasBorderRadius()) || (background && background.hasBoxShadows && background.hasBoxShadows());

		if (this._nativeBackgroundState === 'invalid' || (this._nativeBackgroundState === 'drawn' && backgroundDependsOnSize)) {
			this._redrawNativeBackground(background);
		}

		// Update clip geometry and composition visuals size if needed
		try {
			if (nativeView.Clip && nativeView.Clip instanceof Windows.UI.Xaml.Media.RectangleGeometry) {
				const rectGeom = nativeView.Clip as Windows.UI.Xaml.Media.RectangleGeometry;
				const w = nativeView.ActualWidth || nativeView.Width || 0;
				const h = nativeView.ActualHeight || nativeView.Height || 0;

				const location = Windows.UI.Xaml.PointHelper.FromCoordinates(0, 0);
				const size = Windows.UI.Xaml.SizeHelper.FromDimensions(w, h);
				rectGeom.Rect = Windows.UI.Xaml.RectHelper.FromLocationAndSize(location, size);

			}

			if (nativeView._ns_box_shadow_visual) {
				try {
					const visual = Windows.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(nativeView);
					nativeView._ns_box_shadow_visual.Size = visual.Size;
				} catch (_e) { }
			}
		} catch (_e) { }
	}

	[backgroundInternalProperty.getDefault](): any {
		const native = this.nativeViewProtected as any;
		if (!native) return null;
		try {
			return native.Background ?? null;
		} catch (_e) {
			return null;
		}
	}

	private _viewCompositionHandler: any;

	[backgroundInternalProperty.setNative](value: any) {
		const native = this.nativeViewProtected as any;
		const background = value as Background;

		if (!native) {
			// ensure background visuals are updated even if there's no native view
			this._redrawNativeBackground(value);
			try { this._nativeBackgroundState = 'drawn'; } catch (_e) { }
			return;
		}


		// Gradient handling
		if (background && background.image && typeof background.image === 'object' && (background.image as any).colorStops) {
			try {
				const lg: LinearGradient = background.image as any;
				const stops = new Windows.UI.Xaml.Media.GradientStopCollection();
				const cs = lg.colorStops || [];
				for (let i = 0; i < cs.length; i++) {
					const entry = cs[i];
					const stop = new Windows.UI.Xaml.Media.GradientStop();
					try { stop.Color = entry.color && (entry.color as any).windows ? (entry.color as any).windows : Windows.UI.Colors.Transparent; } catch (_e) { stop.Color = Windows.UI.Colors.Transparent; }
					if (entry.offset && typeof (entry.offset as any).value === 'number') {
						stop.Offset = (entry.offset as any).value;
					} else {
						stop.Offset = cs.length > 1 ? i / (cs.length - 1) : 0;
					}
					stops.Append(stop);
				}

				const brush = new Windows.UI.Xaml.Media.LinearGradientBrush();
				brush.GradientStops = stops;
				const angleRad = typeof lg.angle === 'number' ? lg.angle : 0;
				const rad = angleRad - Math.PI / 2;
				const x = Math.cos(rad);
				const y = Math.sin(rad);
				const startX = 0.5 - x / 2;
				const startY = 0.5 - y / 2;
				const endX = 0.5 + x / 2;
				const endY = 0.5 + y / 2;
				brush.StartPoint = Windows.UI.Xaml.PointHelper.FromCoordinates(startX, startY);
				brush.EndPoint = Windows.UI.Xaml.PointHelper.FromCoordinates(endX, endY);
				native.Background = brush;
			} catch (_e) { /* fallback below */ }
		} else if (background && background.color) {
			try {
				const c = background.color as any;
				if (c && c.windows) {
					native.Background = new Windows.UI.Xaml.Media.SolidColorBrush(c.windows);
				} else {
					native.Background = new Windows.UI.Xaml.Media.SolidColorBrush(Windows.UI.Colors.Transparent);
				}
			} catch (_e) { }
		} else {
			try { native.ClearValue && native.ClearValue(Windows.UI.Xaml.FrameworkElement.BackgroundProperty); } catch (_e) { }
		}



		if (background) {
			let radius = 0;
			if (typeof background.getUniformBorderRadius === 'function') {
				radius = background.getUniformBorderRadius();
			}

			if (!this._viewCompositionHandler) {
				try {
					//per-side border helper
					this._viewCompositionHandler = __nsCreateCompositionBorder(native);
				} catch { }
			}


			if (radius > 0) {
				const radiusDp = layout.toDeviceIndependentPixels(radius || 0);
				if (this._viewCompositionHandler) {
					this._viewCompositionHandler.UpdateBorderRadius(
						radiusDp, radiusDp, radiusDp, radiusDp,
					);
				} else {
					native.CornerRadius = Windows.UI.Xaml.CornerRadiusHelper.FromUniformRadius(radiusDp);
				}

			} else {
				if (this._viewCompositionHandler) {
					this._viewCompositionHandler.UpdateBorderRadius(
						layout.toDeviceIndependentPixels(background.borderTopLeftRadius || 0),
						layout.toDeviceIndependentPixels(background.borderTopRightRadius || 0),
						layout.toDeviceIndependentPixels(background.borderBottomRightRadius || 0),
						layout.toDeviceIndependentPixels(background.borderBottomLeftRadius || 0)
					);
				} else {

					native.CornerRadius = Windows.UI.Xaml.CornerRadiusHelper.FromRadii(
						layout.toDeviceIndependentPixels(background.borderTopLeftRadius || 0),
						layout.toDeviceIndependentPixels(background.borderTopRightRadius || 0),
						layout.toDeviceIndependentPixels(background.borderBottomRightRadius || 0),
						layout.toDeviceIndependentPixels(background.borderBottomLeftRadius || 0)
					)
				}
			}


			const borderWidth = typeof background.getUniformBorderWidth === 'function' ? background.getUniformBorderWidth() : 0;
			const borderColor = (typeof background.getUniformBorderColor === 'function' ? background.getUniformBorderColor() as WindowsColor : undefined);
			if (borderWidth && borderWidth > 0 && borderColor) {
				const borderWidthDp = layout.toDeviceIndependentPixels(borderWidth);
				if (this._viewCompositionHandler) {
					this._viewCompositionHandler.UpdateBorderWidth(
						borderWidthDp, borderWidthDp, borderWidthDp, borderWidthDp,
					);
					
					const uniformColor = borderColor?.windowsArgb ?? 0;

					console.log('Applying uniform border color via composition:', borderColor, uniformColor);

					this._viewCompositionHandler.UpdateBorderColor(
						uniformColor, uniformColor, uniformColor, uniformColor,
					);
				} else {
					native.BorderThickness = Windows.UI.Xaml.ThicknessHelper.FromUniformLength(
						layout.toDeviceIndependentPixels(borderWidth)
					);
					native.BorderBrush = new Windows.UI.Xaml.Media.SolidColorBrush(borderColor?.windows ?? Windows.UI.Colors.Transparent);
				}

			} else {

				const leftWidth = layout.toDeviceIndependentPixels(background.borderLeftWidth || 0);
				const topWidth = layout.toDeviceIndependentPixels(background.borderTopWidth || 0);
				const rightWidth = layout.toDeviceIndependentPixels(background.borderRightWidth || 0);
				const bottomWidth = layout.toDeviceIndependentPixels(background.borderBottomWidth || 0);

				if (this._viewCompositionHandler) {

					this._viewCompositionHandler.UpdateBorderWidth(
						leftWidth, topWidth, rightWidth, bottomWidth,
					);

					const leftColor = (background.borderLeftColor || borderColor) as WindowsColor;
					const topColor = (background.borderTopColor || borderColor) as WindowsColor;
					const rightColor = (background.borderRightColor || borderColor) as WindowsColor;
					const bottomColor = (background.borderBottomColor || borderColor) as WindowsColor;


					this._viewCompositionHandler.UpdateBorderColor(
						leftColor?.windowsArgb ?? 0, topColor?.windowsArgb ?? 0, rightColor?.windowsArgb ?? 0, bottomColor?.windowsArgb ?? 0,
					);

				} else {
					// per-side border thickness is not directly supported in XAML
					native.BorderThickness = Windows.UI.Xaml.ThicknessHelper.FromLengths(leftWidth, topWidth, rightWidth, bottomWidth);
				}

			}



		} else {

		}



		this._redrawNativeBackground(value);

		try { this._nativeBackgroundState = 'drawn'; } catch (_e) { }

	}

	//@ts-ignore
	[widthProperty.setNative](value: CoreTypes.PercentLengthType) {
		if (this.nativeViewProtected) {
			(this.nativeViewProtected as any).Width = toXamlLength(value);
		}
	}

	//@ts-ignore
	[heightProperty.setNative](value: CoreTypes.PercentLengthType) {
		if (this.nativeViewProtected) {
			(this.nativeViewProtected as any).Height = toXamlLength(value);
		}
	}

	//@ts-ignore
	[minWidthProperty.setNative](value: CoreTypes.LengthType) {
		if (this.nativeViewProtected) {
			const v = toXamlLength(value);
			(this.nativeViewProtected as any).MinWidth = isNaN(v) ? 0 : v;
		}
	}

	//@ts-ignore
	[minHeightProperty.setNative](value: CoreTypes.LengthType) {
		if (this.nativeViewProtected) {
			const v = toXamlLength(value);
			(this.nativeViewProtected as any).MinHeight = isNaN(v) ? 0 : v;
		}
	}

	//@ts-ignore
	[opacityProperty.setNative](value: number) {
		if (this.nativeViewProtected) {
			(this.nativeViewProtected as any).Opacity = value;
		}
	}

	//@ts-ignore
	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		if (this.nativeViewProtected) {
			// Windows XAML Visibility: 0 = Visible, 1 = Collapsed
			// Core uses 'collapse' as the normalized value (parse maps 'collapsed' -> 'collapse')
			try {
				(this.nativeViewProtected as any).Visibility = value === CoreTypes.Visibility.collapse ? 1 : 0;
			} catch (_e) { }
		}
	}

	//@ts-ignore
	[marginLeftProperty.setNative](_value: CoreTypes.PercentLengthType) {
		this._applyMargin();
	}
	//@ts-ignore
	[marginTopProperty.setNative](_value: CoreTypes.PercentLengthType) {
		this._applyMargin();
	}
	//@ts-ignore
	[marginRightProperty.setNative](_value: CoreTypes.PercentLengthType) {
		this._applyMargin();
	}
	//@ts-ignore
	[marginBottomProperty.setNative](_value: CoreTypes.PercentLengthType) {
		this._applyMargin();
	}

	private _applyMargin(): void {
		if (!this.nativeViewProtected) return;
		try {
			const l = toXamlLength(this.style.marginLeft) || 0;
			const t = toXamlLength(this.style.marginTop) || 0;
			const r = toXamlLength(this.style.marginRight) || 0;
			const b = toXamlLength(this.style.marginBottom) || 0;
			// Thickness struct = 4 × Double (8 bytes each), little-endian
			const buf = new ArrayBuffer(32);
			const dv = new DataView(buf);
			dv.setFloat64(0, l, true);
			dv.setFloat64(8, t, true);
			dv.setFloat64(16, r, true);
			dv.setFloat64(24, b, true);
			(this.nativeViewProtected as any).Margin = buf;
		} catch (_e) { }
	}
}

// Default native background state set on prototype for downlevel emitters
try {
	(View.prototype as any)._nativeBackgroundState = 'unset';
} catch (_e) { }

export class ContainerView extends View { }

export class CustomLayoutView extends ContainerView {
	public _addViewToNativeVisualTree(child: ViewCommon, _atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		super._addViewToNativeVisualTree(child);

		const nativeParent = this.nativeViewProtected as any;
		const nativeChild = child.nativeViewProtected as any;

		if (nativeParent && nativeChild) {
			const children = nativeParent.Children;
			if (children) {
				children.Append(nativeChild);
			}
			return true;
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: ViewCommon): void {
		const nativeParent = this.nativeViewProtected as any;
		const nativeChild = child.nativeViewProtected as any;

		if (nativeParent && nativeChild) {
			const children = nativeParent.Children;
			if (children) {
				const count = children.Size;
				for (let i = 0; i < count; i++) {
					if (children.GetAt(i) === nativeChild) {
						children.RemoveAt(i);
						break;
					}
				}
			}
		}

		super._removeViewFromNativeVisualTree(child);
	}
}
