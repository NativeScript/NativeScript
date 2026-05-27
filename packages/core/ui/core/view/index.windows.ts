export * from './view-common';
export * from './view-helper';
export * from '../properties';

import { ViewCommon, originXProperty, originYProperty } from './view-common';
import type { CoreTypes } from '../../../core-types';
import { visibilityProperty, opacityProperty, backgroundInternalProperty, translateXProperty, translateYProperty, scaleXProperty, scaleYProperty, rotateProperty, rotateXProperty, rotateYProperty, perspectiveProperty } from '../../styling/style-properties';
import { LinearGradient } from '../../styling/linear-gradient';
import { widthProperty, heightProperty, minWidthProperty, minHeightProperty, marginLeftProperty, marginTopProperty, marginRightProperty, marginBottomProperty } from '../../styling/style-properties';
import { layout } from '../../../utils';
import { unsetValue } from '../properties/property-shared';
import { Background } from '../../styling/background';
import { Color } from '../../../color';
import { hiddenProperty } from '../view-base';
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

function _argbToWinColor(argb: number): Windows.UI.Color {
	return Windows.UI.ColorHelper.FromArgb((argb >>> 24) & 0xFF, (argb >> 16) & 0xFF, (argb >> 8) & 0xFF, argb & 0xFF);
}


function _resolveToWinColor(color: any): Windows.UI.Color | null {
	if (!color) return null;
	
	if (typeof color.windows !== 'undefined') {
		try { return color.windows; } catch (_e) {}
	}
	
	if (typeof color.A === 'number' && typeof color.R === 'number') {
		return color as Windows.UI.Color;
	}
	
	if (typeof color === 'number') {
		return _argbToWinColor(color >>> 0);
	}
	
	if (typeof color === 'string') {
		try {
			return new Color(color).windows;
		} catch (_e) {}
	}
	return null;
}


export function _ensureNativeTransforms(native: any): { scale: any; rotate: any; translate: any } | null {
	try {
		if (native.__ns_transforms) return native.__ns_transforms;

		const tg = new Windows.UI.Xaml.Media.TransformGroup();
		const scale = new Windows.UI.Xaml.Media.ScaleTransform();
		const rotate = new Windows.UI.Xaml.Media.RotateTransform();
		const translate = new Windows.UI.Xaml.Media.TranslateTransform();
		tg.Children.Append(scale);
		tg.Children.Append(rotate);
		tg.Children.Append(translate);
		native.RenderTransform = tg;

		const result = { scale, rotate, translate };
		native.__ns_transforms = result;
		return result;
	} catch (_e) {
		return null;
	}
}

const hidden = Symbol('[[hidden]]');
function setVisibility(nativeView: Windows.UI.Xaml.UIElement & { [hidden]?: boolean }, value: CoreTypes.VisibilityType) {
	switch (value) {
		case "collapse":
		case "collapsed":
			nativeView[hidden] = true;
			nativeView.Visibility = Windows.UI.Xaml.Visibility.Collapsed;
			break;
		case "hidden":
			nativeView[hidden] = true;
			nativeView.Opacity = 0;
			nativeView.Visibility = Windows.UI.Xaml.Visibility.Visible;
			break;
		case "visible":
			nativeView[hidden] = false;
			nativeView.Opacity = 1;
			nativeView.Visibility = Windows.UI.Xaml.Visibility.Visible;
			break;
		default:
	}
}

function getVisibility(nativeView: Windows.UI.Xaml.UIElement & { [hidden]?: boolean }): CoreTypes.VisibilityType {
	if (nativeView[hidden]) {
		if (nativeView.Opacity === 0) {
			return "hidden";
		} else {
			if (nativeView.Visibility === Windows.UI.Xaml.Visibility.Collapsed) {
				return "collapse";
			}
		}
	}
	return "visible";
}

class CompositionBorderHandler {
	private _element: any;
	private _rootVisual: any;
	private _container: any;
	private _top: any; private _bottom: any; private _left: any; private _right: any;
	private _topBrush: any; private _bottomBrush: any; private _leftBrush: any; private _rightBrush: any;
	private _clipGeometry: any = null;

	constructor(element: any, rootVisual: any) {
		this._element = element;
		this._rootVisual = rootVisual;
		const c = rootVisual.Compositor;

		this._container = c.CreateContainerVisual();
		const sizeAnim = c.CreateExpressionAnimation('host.Size');
		sizeAnim.SetReferenceParameter('host', rootVisual);
		this._container.StartAnimation('Size', sizeAnim);

		this._topBrush = c.CreateColorBrush(); this._bottomBrush = c.CreateColorBrush();
		this._leftBrush = c.CreateColorBrush(); this._rightBrush = c.CreateColorBrush();

		this._top = c.CreateSpriteVisual(); this._top.Brush = this._topBrush;
		this._bottom = c.CreateSpriteVisual(); this._bottom.Brush = this._bottomBrush;
		this._left = c.CreateSpriteVisual(); this._left.Brush = this._leftBrush;
		this._right = c.CreateSpriteVisual(); this._right.Brush = this._rightBrush;

		this._container.Children.InsertAtTop(this._top);
		this._container.Children.InsertAtTop(this._bottom);
		this._container.Children.InsertAtTop(this._left);
		this._container.Children.InsertAtTop(this._right);

		Windows.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(element, this._container);
	}

	static Create(element: any): CompositionBorderHandler | null {
		try {
			const rootVisual = Windows.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(element);
			return new CompositionBorderHandler(element, rootVisual);
		} catch (_e) {
			return null;
		}
	}

	private _animate(target: any, prop: string, expr: string): void {
		const anim = this._rootVisual.Compositor.CreateExpressionAnimation(expr);
		anim.SetReferenceParameter('host', this._rootVisual);
		target.StartAnimation(prop, anim);
	}

	UpdateBorderWidth(left: number, top: number, right: number, bottom: number): void {
		this._animate(this._top, 'Offset', 'Vector3(0, 0, 0)');
		this._animate(this._top, 'Size', `Vector2(host.Size.X, ${top})`);
		this._animate(this._bottom, 'Offset', `Vector3(0, host.Size.Y - ${bottom}, 0)`);
		this._animate(this._bottom, 'Size', `Vector2(host.Size.X, ${bottom})`);
		this._animate(this._left, 'Offset', `Vector3(0, ${top}, 0)`);
		this._animate(this._left, 'Size', `Vector2(${left}, host.Size.Y - ${top} - ${bottom})`);
		this._animate(this._right, 'Offset', `Vector3(host.Size.X - ${right}, ${top}, 0)`);
		this._animate(this._right, 'Size', `Vector2(${right}, host.Size.Y - ${top} - ${bottom})`);
	}

	UpdateBorderColor(left: number, top: number, right: number, bottom: number): void {
		this._topBrush.Color = _argbToWinColor(top);
		this._bottomBrush.Color = _argbToWinColor(bottom);
		this._leftBrush.Color = _argbToWinColor(left);
		this._rightBrush.Color = _argbToWinColor(right);
	}

	UpdateBorderRadius(tl: number, tr: number, br: number, bl: number): void {
		const r = Math.max(tl, tr, br, bl);
		if (r <= 0) {
			this._container.Clip = null;
			this._clipGeometry = null;
			return;
		}
		const c = this._rootVisual.Compositor;
		if (!this._clipGeometry) {
			this._clipGeometry = c.CreateRoundedRectangleGeometry();
			const sizeAnim = c.CreateExpressionAnimation('host.Size');
			sizeAnim.SetReferenceParameter('host', this._rootVisual);
			this._clipGeometry.StartAnimation('Size', sizeAnim);
			this._container.Clip = c.CreateGeometricClip(this._clipGeometry);
		}
		this._clipGeometry.CornerRadius = new (Windows.Foundation.Numerics as any).Vector2(r, r);
	}

	Free(): void {
		try { Windows.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(this._element, null); } catch (_e) { }
		this._element = null; this._rootVisual = null; this._container = null;
	}
}

export class View extends ViewCommon {
	nativeViewProtected: Windows.UI.Xaml.FrameworkElement;

	_nativeBackgroundState: 'invalid' | 'drawn' = 'invalid';

	// Percent sizing state (null = not set)
	private _percentWidth: number | null = null;
	private _percentHeight: number | null = null;

	// initialized below for downlevel compatibility

	// XAML handles layout natively — these are no-ops on Windows
	public onMeasure(_widthMeasureSpec: number, _heightMeasureSpec: number): void { }
	public onLayout(_left: number, _top: number, _right: number, _bottom: number): void { }
	public layoutNativeView(_left: number, _top: number, _right: number, _bottom: number): void { }

	_redrawNativeBackground(value: any): void {
		const native = this.nativeViewProtected as any;
		if (!native) return;

		const background = value as Background;

		if (!(background && typeof background === 'object')) {
			return;
		}

		try { console.log('[BG]', (this as any).typeName ?? (this as any).constructor?.name, 'color=', background.color?.hex, 'hasImage=', !!background.image); } catch (_) {}

		// Gradient handling
		if (background.image && typeof background.image === 'object' && 'colorStops' in background.image) {
			try {
				const lg: LinearGradient = background.image as any;
				const cs = lg.colorStops || [];
				// Create brush first so we can use its built-in GradientStops collection
				// (GradientStopCollection is not directly constructable in WinRT JS projection)
				const brush = new Windows.UI.Xaml.Media.LinearGradientBrush();
				const stopsCol = brush.GradientStops;
				for (let i = 0; i < cs.length; i++) {
					const entry = cs[i];
					const stop = new Windows.UI.Xaml.Media.GradientStop();
					const resolvedColor = _resolveToWinColor(entry.color);
					stop.Color = resolvedColor ?? Windows.UI.Colors.Transparent;
					if (entry.offset && typeof (entry.offset as any).value === 'number') {
						stop.Offset = (entry.offset as any).value;
					} else {
						stop.Offset = cs.length > 1 ? i / (cs.length - 1) : 0;
					}
					stopsCol.Append(stop);
				}
				// angle: 0 = top-to-bottom, 90deg = left-to-right (NS convention matches CSS)
				const angleRad = typeof lg.angle === 'number' ? lg.angle : 0;
				const dx = Math.sin(angleRad);
				const dy = -Math.cos(angleRad);
				brush.StartPoint = Windows.UI.Xaml.PointHelper.FromCoordinates(0.5 - dx / 2, 0.5 - dy / 2);
				brush.EndPoint = Windows.UI.Xaml.PointHelper.FromCoordinates(0.5 + dx / 2, 0.5 + dy / 2);
				brush.MappingMode = Windows.UI.Xaml.Media.BrushMappingMode.RelativeToBoundingBox;
				native.Background = brush;
			} catch (_e) { /* fallback to solid color below */ }
		} else if (background && background.color) {
			const winColor = _resolveToWinColor(background.color);
			if (winColor) {
				try {
					const brush = new Windows.UI.Xaml.Media.SolidColorBrush(winColor);
					native.Background = brush;
					// For Button-like controls the default XAML template may ignore Background
					// via its Normal-state VSM animation. Override the ButtonBackground resource
					// so the template binding picks up our colour.
					try { (native as any).Resources.Insert('ButtonBackground', brush); } catch (_re) {}
					try { (native as any).Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_re) {}
					try { (native as any).Resources.Insert('ButtonBackgroundPressed', brush); } catch (_re) {}
				} catch (bgErr) {
					console.error('[Windows] Background SolidColorBrush failed:', bgErr);
				}
			} else {
				console.warn('[Windows] _resolveToWinColor returned null for:', background.color);
				native.Background = null;
			}
		} else {
			native.Background = null;
		}


		let radius = 0;
		if (typeof background.getUniformBorderRadius === 'function') {
			radius = background.getUniformBorderRadius();
		}

		if (!this._viewCompositionHandler) {
			this._viewCompositionHandler = CompositionBorderHandler.Create(native);
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



		this._nativeBackgroundState = 'drawn';

		try {
			// Clear existing composition visual (if any)
			if (native._ns_box_shadow_visual) {
				try {
					Windows.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(native, null);
				} catch (_e) { }
				native._ns_box_shadow_visual = null;
			}

			if (background && typeof background.hasBoxShadows === 'function' && background.hasBoxShadows()) {
				const boxShadows = typeof background.getBoxShadows === 'function' ? background.getBoxShadows() : background.boxShadows;
				if (boxShadows && boxShadows.length) {
					try {
						const visual = Windows.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(native);
						const compositor = visual.Compositor;
						const sprite = compositor.CreateSpriteVisual();
						const drop = compositor.CreateDropShadow();
						const s = boxShadows[0];
						if (s && s.color && s.color.windows) {
							drop.Color = s.color.windows;
						}
						if (typeof s.blurRadius === 'number') {
							drop.BlurRadius = s.blurRadius;
						}
						try {
							drop.Offset = new Windows.Foundation.Numerics.Vector3(s.offsetX || 0, s.offsetY || 0, 0);
						} catch (_e) {}
						sprite.Shadow = drop;
						sprite.Size = visual.Size;
						Windows.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(native, sprite);
						native._ns_box_shadow_visual = sprite;
					} catch (_e) {}
				}
			}
		} catch (_e) {}

	}

	initNativeView(): void {
		super.initNativeView();
		const ref = new WeakRef(this);
		this.nativeViewProtected.LayoutUpdated = () => {
			const owner = ref.deref();
			if (!owner) return;
			owner._onSizeChanged();
		}
	}

	private _easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3);
	}

	private _animateNativeOpacity(nativeElem: any, from: number, to: number, durationMs: number, done?: () => void) {
		try {
			nativeElem.Opacity = from;
		} catch (_e) { }

		const start = Date.now();
		const step = () => {
			const now = Date.now();
			const elapsed = now - start;
			const t = Math.min(1, elapsed / Math.max(1, durationMs));
			const val = from + (to - from) * this._easeOutCubic(t);
			try { nativeElem.Opacity = val; } catch (_e) { }
			if (t < 1) {
				if (typeof requestAnimationFrame === 'function') {
					requestAnimationFrame(step as any);
				} else {
					setTimeout(step, 16);
				}
			} else {
				done && done();
			}
		};
		step();
	}

	disposeNativeView(): void {
		const nativeView = this.nativeViewProtected as any;
		if (nativeView) {
			nativeView.LayoutUpdated = null;
		}
		super.disposeNativeView();
	}

	_onSizeChanged(): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		// Recompute any percent-based sizing when layout updates.
		try { this._applyPercentSizing(); } catch (_e) { }


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

	// Compute and apply percent-based width/height (percent values stored in _percentWidth/_percentHeight)
	private _applyPercentSizing(): void {
		const nativeView = this.nativeViewProtected as any;
		if (!nativeView) {
			return;
		}

		try {
			const parentNative = (this.parent as any)?.nativeViewProtected as any;
			let parentWidth = parentNative?.ActualWidth || 0;
			let parentHeight = parentNative?.ActualHeight || 0;

			try {
				if ((!parentWidth || parentWidth === 0) && Windows?.UI?.Xaml?.Window?.Current) {
					parentWidth = Windows.UI.Xaml.Window.Current.Bounds.Width || 0;
				}
				if ((!parentHeight || parentHeight === 0) && Windows?.UI?.Xaml?.Window?.Current) {
					parentHeight = Windows.UI.Xaml.Window.Current.Bounds.Height || 0;
				}
			} catch (_) { /* ignore */ }

			if (this._percentWidth != null) {
				const w = (parentWidth || 0) * (this._percentWidth);
				nativeView.Width = isFinite(w) ? w : NaN;
			}

			if (this._percentHeight != null) {
				const h = (parentHeight || 0) * (this._percentHeight);
				nativeView.Height = isFinite(h) ? h : NaN;
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

	private _modalAnimatedOptions: any[] | undefined;

	[backgroundInternalProperty.setNative](value: any) {
		this._nativeBackgroundState = 'invalid';
		this._redrawNativeBackground(value);
	}

	//@ts-ignore
	[widthProperty.setNative](value: CoreTypes.PercentLengthType) {
		if (!this.nativeViewProtected) {
			return;
		}

		// Handle percent-based widths specially: store percent and compute on layout updates.
		if (value && typeof value === 'object' && (value as any).unit === '%') {
			this._percentWidth = (value as any).value;
			this.nativeViewProtected.Width = NaN;
			try { this._applyPercentSizing(); } catch (_e) { }
			return;
		}

		this._percentWidth = null;
		this.nativeViewProtected.Width = toXamlLength(value);
	}

	//@ts-ignore
	[heightProperty.setNative](value: CoreTypes.PercentLengthType) {
		if (!this.nativeViewProtected) {
			return;
		}

		if (value && typeof value === 'object' && (value as any).unit === '%') {
			this._percentHeight = (value as any).value;
			this.nativeViewProtected.Height = NaN;
			try { this._applyPercentSizing(); } catch (_e) { }
			return;
		}

		this._percentHeight = null;
		this.nativeViewProtected.Height = toXamlLength(value);
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

	[opacityProperty.setNative](value: number) {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.Opacity = value;
		}
	}


	[hiddenProperty.getDefault](): boolean {
		return getVisibility(this.nativeViewProtected as any) !== 'visible';
	}

	[hiddenProperty.setNative](value: boolean) {
		setVisibility(this.nativeViewProtected as any, value ? 'hidden' : 'visible');
	}


	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		if (this.nativeViewProtected) {
			setVisibility(this.nativeViewProtected as any, value);
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
			(this.nativeViewProtected as any).Margin = Windows.UI.Xaml.ThicknessHelper.FromLengths(l, t, r, b);
		} catch (_e) { }
	}

	[originXProperty.getDefault](): number {
		const native = this.nativeViewProtected as any;
		if (!native) return 0.5;
		try {
			const origin = native.RenderTransformOrigin;
			return origin ? origin.X ?? 0.5 : 0.5;
		} catch (_e) {
			return 0.5;
		}
	}
	[originXProperty.setNative](value: number) {
		try {
			const native = this.nativeViewProtected as any;
			const y = this.originY ?? 0.5;
			if (native && typeof Windows !== 'undefined' && Windows.UI && Windows.UI.Xaml && Windows.UI.Xaml.PointHelper) {
				native.RenderTransformOrigin = Windows.UI.Xaml.PointHelper.FromCoordinates(value, y);
			}
		} catch (_e) { }
	}

	[originYProperty.getDefault](): number {
		const native = this.nativeViewProtected as any;
		if (!native) return 0.5;
		try {
			const origin = native.RenderTransformOrigin;
			return origin ? origin.Y ?? 0.5 : 0.5;
		} catch (_e) {
			return 0.5;
		}
	}
	[originYProperty.setNative](value: number) {
		try {
			const native = this.nativeViewProtected as any;
			const x = this.originX ?? 0.5;
			if (native && typeof Windows !== 'undefined' && Windows.UI && Windows.UI.Xaml && Windows.UI.Xaml.PointHelper) {
				native.RenderTransformOrigin = Windows.UI.Xaml.PointHelper.FromCoordinates(x, value);
			}
		} catch (_e) { }
	}

	[rotateProperty.getDefault](): number {
		return 0;
	}
	[rotateProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[rotateXProperty.getDefault](): number {
		return 0;
	}
	[rotateXProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[rotateYProperty.getDefault](): number {
		return 0;
	}
	[rotateYProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[perspectiveProperty.getDefault](): number {
		return 300;
	}
	[perspectiveProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[scaleXProperty.getDefault](): number {
		return 1;
	}
	[scaleXProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[scaleYProperty.getDefault](): number {
		return 1;
	}
	[scaleYProperty.setNative](value: number) {
		this.updateNativeTransform();
	}

	[translateXProperty.getDefault](): CoreTypes.dip {
		return 0;
	}
	[translateXProperty.setNative](value: CoreTypes.dip) {
		this.updateNativeTransform();
	}

	[translateYProperty.getDefault](): CoreTypes.dip {
		return 0;
	}
	[translateYProperty.setNative](value: CoreTypes.dip) {
		this.updateNativeTransform();
	}

	public updateNativeTransform(): void {
		const native = this.nativeViewProtected as any;
		if (!native) return;
		try {
			const transforms = _ensureNativeTransforms(native);
			if (!transforms) return;

			const sx = typeof (this as any).scaleX === 'number' ? (this as any).scaleX : typeof (this as any).scale === 'number' ? (this as any).scale : 1;
			const sy = typeof (this as any).scaleY === 'number' ? (this as any).scaleY : typeof (this as any).scale === 'number' ? (this as any).scale : 1;
			transforms.scale.ScaleX = sx;
			transforms.scale.ScaleY = sy;

			transforms.rotate.Angle = (this as any).rotate || 0;

			transforms.translate.X = layout.toDeviceIndependentPixels((this as any).translateX || 0);
			transforms.translate.Y = layout.toDeviceIndependentPixels((this as any).translateY || 0);

			try {
				const ox = this.originX ?? 0.5;
				const oy = this.originY ?? 0.5;
				native.RenderTransformOrigin = Windows.UI.Xaml.PointHelper.FromCoordinates(ox, oy);
			} catch (_e) { }
		} catch (_e) {
			// best-effort
		}
	}

	// Simple modal implementation using a Popup overlay
	private _modalPopup: any;
	private _modalOverlay: any;
	private _modalAnimatedOptions: Array<boolean>;
	// Saved previous layout/size/alignment for restoring after modal closes
	private _modalPrevHorizontalAlignment: any;
	private _modalPrevVerticalAlignment: any;
	private _modalPrevWidth: number;
	private _modalPrevHeight: number;
	private _modalPrevNativeHorizontalAlignment: any;
	private _modalPrevNativeVerticalAlignment: any;
	private _modalPrevNativeWidth: any;
	private _modalPrevNativeHeight: any;
	private _modalPopupClosedHandler: any;
	private _isModalClosing: boolean;

	protected _showNativeModalView(parent: ViewCommon, options: any) {
		// Prepare as root view and call base
		this._setupAsRootView({});
		super._showNativeModalView(parent, options);

		this._raiseShowingModallyEvent();

		try {
			const popup = new Windows.UI.Xaml.Controls.Primitives.Popup();
			const overlay = new Windows.UI.Xaml.Controls.Grid();
			overlay.HorizontalAlignment = 3; // Stretch
			overlay.VerticalAlignment = 3; // Stretch
			// Transparent background to capture clicks; caller can style the modal's background
			overlay.Background = new Windows.UI.Xaml.Media.SolidColorBrush(Windows.UI.Colors.Transparent);

			// Ensure overlay fills window (best-effort)
			try {
				const bounds = Windows.UI.Xaml.Window.Current.Bounds;
				overlay.Width = bounds.Width;
				overlay.Height = bounds.Height;
			} catch (_e) { }

			// Determine show animation preference early
			const showAnimated = options && options.animated === undefined ? true : !!options.animated;
			// Prepare overlay opacity for animation
			try { overlay.Opacity = showAnimated ? 0 : 1; } catch (_e) { }

			// Host the modal native element inside overlay
			try {
				// Save previous alignment/size to restore later
				try {
					this._modalPrevHorizontalAlignment = this.horizontalAlignment;
					this._modalPrevVerticalAlignment = this.verticalAlignment;
					this._modalPrevWidth = this.width;
					this._modalPrevHeight = this.height;
					try {
						this._modalPrevNativeHorizontalAlignment = (this.nativeViewProtected as any).HorizontalAlignment;
						this._modalPrevNativeVerticalAlignment = (this.nativeViewProtected as any).VerticalAlignment;
						this._modalPrevNativeWidth = (this.nativeViewProtected as any).Width;
						this._modalPrevNativeHeight = (this.nativeViewProtected as any).Height;
					} catch (_e) { }
				} catch (_e) { }

				const isStretch = options && (options.fullscreen || options.stretched);

				if (isStretch) {
					this.horizontalAlignment = 'stretch';
					this.verticalAlignment = 'stretch';
					try {
						(this.nativeViewProtected as any).HorizontalAlignment = 3; // Stretch
						(this.nativeViewProtected as any).VerticalAlignment = 3; // Stretch
						// If fullscreen, make it fill window bounds
						try {
							const bounds = Windows.UI.Xaml.Window.Current.Bounds;
							this.width = bounds.Width;
							this.height = bounds.Height;
							(this.nativeViewProtected as any).Width = bounds.Width;
							(this.nativeViewProtected as any).Height = bounds.Height;
						} catch (_e) { }
					} catch (_e) { }
				} else {
					this.horizontalAlignment = 'center';
					this.verticalAlignment = 'middle';
					try {
						(this.nativeViewProtected as any).HorizontalAlignment = 1; // Center
						(this.nativeViewProtected as any).VerticalAlignment = 1; // Center
					} catch (_e) { }

					// Honor width/height if provided (top-level or ios-specific)
					try {
						const w = options && typeof options.width === 'number' ? options.width : options && options.ios && typeof options.ios.width === 'number' ? options.ios.width : undefined;
						const h = options && typeof options.height === 'number' ? options.height : options && options.ios && typeof options.ios.height === 'number' ? options.ios.height : undefined;
						if (typeof w === 'number' && w > 0) {
							this.width = w;
							try { (this.nativeViewProtected as any).Width = w; } catch (_e) { }
						} else {
							// allow natural measurement when no explicit width provided
							this.width = unsetValue;
							try { (this.nativeViewProtected as any).Width = NaN; } catch (_e) { }
						}
						if (typeof h === 'number' && h > 0) {
							this.height = h;
							try { (this.nativeViewProtected as any).Height = h; } catch (_e) { }
						} else {
							this.height = unsetValue;
							try { (this.nativeViewProtected as any).Height = NaN; } catch (_e) { }
						}
					} catch (_e) { }
				}

				overlay.Children.Append(this.nativeViewProtected);
			} catch (_e) { }

			popup.Child = overlay;
			popup.IsLightDismissEnabled = options && options.cancelable !== undefined ? !!options.cancelable : true;
			this._modalPopup = popup;
			this._modalOverlay = overlay;
			

			// Attach Closed handler to forward light-dismiss to modal close logic
			try {
				this._modalPopupClosedHandler = () => {
					if (this._isModalClosing) {
						return;
					}
					if (this._closeModalCallback) {
						this._closeModalCallback();
					}
				};
				//@ts-ignore
				popup.AddHandler(Windows.UI.Xaml.Controls.Primitives.Popup.ClosedEvent, this._modalPopupClosedHandler, true);
				
			} catch (_e) { }

			popup.IsOpen = true;

			// Ensure the modal view lifecycle runs (loaded) so pages and child views initialize
			try {
				this.callLoaded();
			} catch (_e) { }

			const animated = showAnimated;
			if (!this._modalAnimatedOptions) {
				this._modalAnimatedOptions = [];
			}
			this._modalAnimatedOptions.push(animated);
			this._raiseShownModallyEvent();
			// Perform show animation (fade-in)
			try {
				if (showAnimated && this._modalOverlay) {
					this._animateNativeOpacity(this._modalOverlay, 0, 1, 240);
				}
			} catch (_e) { }
		} catch (e) {
			console.log('[View._showNativeModalView] failed to open popup modal:', e);
		}
	}

	protected _hideNativeModalView(_parent: ViewCommon, whenClosedCallback: () => void) {
		if (this._isModalClosing) {
			whenClosedCallback();
			return;
		}
		this._isModalClosing = true;
		try {
			// Remove Closed handler if attached
			try {
				if (this._modalPopup && this._modalPopupClosedHandler && typeof this._modalPopup.removeEventListener === 'function') {
					try { this._modalPopup.removeEventListener('Closed', this._modalPopupClosedHandler); } catch (_e) { }
				}
			} catch (_e) { }

			// Determine whether we should animate closing
			const animated = this._modalAnimatedOptions && this._modalAnimatedOptions.length ? !!this._modalAnimatedOptions.pop() : true;

			const finalize = () => {
				// Restore previous alignment/size
				try {
					if (this._modalPrevHorizontalAlignment !== undefined) {
						this.horizontalAlignment = this._modalPrevHorizontalAlignment;
					}
					if (this._modalPrevVerticalAlignment !== undefined) {
						this.verticalAlignment = this._modalPrevVerticalAlignment;
					}
					if (this._modalPrevWidth !== undefined) {
						this.width = this._modalPrevWidth;
					}
					if (this._modalPrevHeight !== undefined) {
						this.height = this._modalPrevHeight;
					}
					try {
						if (this._modalPrevNativeHorizontalAlignment !== undefined) {
							(this.nativeViewProtected as any).HorizontalAlignment = this._modalPrevNativeHorizontalAlignment;
						}
						if (this._modalPrevNativeVerticalAlignment !== undefined) {
							(this.nativeViewProtected as any).VerticalAlignment = this._modalPrevNativeVerticalAlignment;
						}
						if (this._modalPrevNativeWidth !== undefined) {
							(this.nativeViewProtected as any).Width = this._modalPrevNativeWidth;
						}
						if (this._modalPrevNativeHeight !== undefined) {
							(this.nativeViewProtected as any).Height = this._modalPrevNativeHeight;
						}
					} catch (_e) { }
				} catch (_e) { }

				// Close popup and clear overlay
				try {
					if (this._modalPopup) {
						try { this._modalPopup.IsOpen = false; } catch (_e) { }
						try { this._modalPopup.Child = null; } catch (_e) { }
						this._modalPopup = null;
					}
					if (this._modalOverlay) {
						try { this._modalOverlay.Children.Clear(); } catch (_e) { }
						this._modalOverlay = null;
					}
				} catch (_e) { }

				// Reset modal closing flag
				this._isModalClosing = false;

				whenClosedCallback();
			};

			if (animated && this._modalOverlay) {
				try {
					const from = typeof this._modalOverlay.Opacity === 'number' ? this._modalOverlay.Opacity : 1;
					this._animateNativeOpacity(this._modalOverlay, from, 0, 240, finalize);
				} catch (_e) {
					finalize();
				}
			} else {
				finalize();
			}

		} catch (_e) { }
	}
}

// Default native background state set on prototype for downlevel emitters
try {
	(View.prototype as any)._nativeBackgroundState = 'unset';
} catch (_e) { }

export class ContainerView extends View { }

export class CustomLayoutView extends ContainerView {

	createNativeView() {
		return new Windows.UI.Xaml.Controls.StackPanel();
	}

	public _addViewToNativeVisualTree(child: ViewCommon, _atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		super._addViewToNativeVisualTree(child);
		const nativeParent = this.nativeViewProtected as any;
		const nativeChild = child.nativeViewProtected as any;
		if (nativeParent && nativeChild) {
			const children = nativeParent.Children;
			if (children) {
				const size = children.Size;
				try {
					if (_atIndex >= 0 && _atIndex < size && _atIndex < Number.MAX_SAFE_INTEGER) {
						children.InsertAt(_atIndex, nativeChild);
					} else {
						children.Append(nativeChild);
					}
				} catch {
					return false;
				}

				try { if (!(nativeChild as any).__ns_view) (nativeChild as any).__ns_view = child; } catch (_e) { }

				// Force layout on the appended child in case the runtime deferred measure/arrange
				try { if (typeof (nativeChild as any).InvalidateMeasure === 'function') (nativeChild as any).InvalidateMeasure(); } catch (_e) { }
				try { if (typeof (nativeChild as any).InvalidateArrange === 'function') (nativeChild as any).InvalidateArrange(); } catch (_e) { }
				try { if (typeof (nativeChild as any).UpdateLayout === 'function') (nativeChild as any).UpdateLayout(); } catch (_e) { }

				try { if (typeof nativeParent.UpdateLayout === 'function') nativeParent.UpdateLayout(); } catch (_e) { }
				try { if (typeof (nativeParent as any).InvalidateMeasure === 'function') (nativeParent as any).InvalidateMeasure(); } catch (_e) { }
				try { if (typeof (nativeParent as any).InvalidateArrange === 'function') (nativeParent as any).InvalidateArrange(); } catch (_e) { }

				return true;
			}
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
