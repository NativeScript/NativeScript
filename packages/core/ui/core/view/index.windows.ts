export * from './view-common';
export * from './view-helper';
export * from '../properties';

import { ViewCommon, originXProperty, originYProperty } from './view-common';
import type { CoreTypes } from '../../../core-types';
import { visibilityProperty, opacityProperty, backgroundInternalProperty, translateXProperty, translateYProperty, scaleXProperty, scaleYProperty, rotateProperty, rotateXProperty, rotateYProperty, perspectiveProperty, horizontalAlignmentProperty, verticalAlignmentProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from '../../styling/style-properties';
import { LinearGradient } from '../../styling/linear-gradient';
import { widthProperty, heightProperty, minWidthProperty, minHeightProperty, marginLeftProperty, marginTopProperty, marginRightProperty, marginBottomProperty } from '../../styling/style-properties';
import { layout } from '../../../utils';
import { unsetValue } from '../properties/property-shared';
import { Background } from '../../styling/background';
import { BoxShadow } from '../../styling/box-shadow';
import { Color } from '../../../color';
import { hiddenProperty } from '../view-base';
import { getCurrentWindowBounds, getCurrentWindowContent } from '../../../application/window-helper.windows';
import { ImageSource } from '../../../image-source';
import { ClipPathFunction } from '../../styling/clip-path-function';
type WindowsColor = Color & { windows: Windows.UI.Color, windowsArgb: number };

// Windows.UI.Color is a plain {A,R,G,B} struct — bridge reads fields directly, no WinRT call needed.
const _defaultBackground: Windows.UI.Color = { A: 0, R: 0, G: 0, B: 0 } as unknown as Windows.UI.Color;
export function getDefaultBackground() {
	return _defaultBackground;
}

// `_nativeBackgroundState` is initialized on the prototype after the class definition

function toXamlLength(value: CoreTypes.PercentLengthType | CoreTypes.LengthType): number {
	if (!value || value === 'auto') return NaN;
	if (typeof value === 'number') return value;
	if (typeof value === 'object' && 'value' in value) {
		if ((value as any).unit === '%') return NaN; // percent not directly settable
		return (value as any).value ?? NaN;
	}
	return NaN;
}

// Color struct cache: Windows.UI.Color is {A,R,G,B} bytes — construct directly, no ColorHelper.FromArgb().
// Cache avoids allocating a new object for every border/shadow color update with the same color.
const _winColorCache = new Map<number, Windows.UI.Color>();
function _argbToWinColor(argb: number): Windows.UI.Color {
	const cached = _winColorCache.get(argb);
	if (cached !== undefined) return cached;
	const c = { A: (argb >>> 24) & 0xFF, R: (argb >> 16) & 0xFF, G: (argb >> 8) & 0xFF, B: argb & 0xFF } as unknown as Windows.UI.Color;
	if (_winColorCache.size >= 32) _winColorCache.delete(_winColorCache.keys().next().value);
	_winColorCache.set(argb, c);
	return c;
}


// Parse a CSS clip-path dimension value: "50%"→fraction of totalDip, "10px"→px/density, "10"→raw DIP.
function _parseClipDim(val: string, totalDip: number, density: number): number {
	const s = (val || '').trim();
	if (s.endsWith('%')) return (parseFloat(s) / 100) * totalDip;
	if (s.endsWith('px')) return parseFloat(s) / density;
	return parseFloat(s) || 0;
}

// True for CSS background-repeat values that tile along at least one axis (repeat / repeat-x /
// repeat-y, incl. the two-value 'repeat repeat'). WinUI's ImageBrush can't tile, so these go through
// TileHelper. 'space'/'round' aren't implemented and fall through to the plain (no-repeat) path.
function _isTilingRepeat(repeat: unknown): boolean {
	const r = String(repeat ?? '').toLowerCase().trim();
	return r === 'repeat' || r === 'repeat-x' || r === 'repeat-y' || r === 'repeat repeat';
}

function _resolveToWinColor(color: any): Windows.UI.Color | null {
	if (!color) return null;

	if (typeof color.windows !== 'undefined') {
		try { return color.windows; } catch (_e) { }
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
		} catch (_e) { }
	}
	return null;
}


export function _ensureNativeTransforms(native: any): { scale: any; rotate: any; translate: any } | null {
	try {
		if (native.__ns_transforms) return native.__ns_transforms;

		const tg = new Microsoft.UI.Xaml.Media.TransformGroup();
		const scale = new Microsoft.UI.Xaml.Media.ScaleTransform();
		const rotate = new Microsoft.UI.Xaml.Media.RotateTransform();
		const translate = new Microsoft.UI.Xaml.Media.TranslateTransform();
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
function setVisibility(nativeView: Microsoft.UI.Xaml.UIElement & { [hidden]?: boolean }, value: CoreTypes.VisibilityType) {
	switch (value) {
		case "collapse":
		case "collapsed":
			nativeView[hidden] = true;
			nativeView.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
			try { (nativeView as any).IsHitTestVisible = true; } catch (_e) { } // moot while collapsed; correct once shown
			break;
		case "hidden":
			// 'hidden' = invisible but STILL TAKES LAYOUT SPACE — must stay Visibility=Visible (not
			// Collapsed). An invisible element that still captures pointer input blocks taps on whatever
			// it overlaps, so also disable hit-testing.
			nativeView[hidden] = true;
			nativeView.Opacity = 0;
			nativeView.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
			try { (nativeView as any).IsHitTestVisible = false; } catch (_e) { }
			break;
		case "visible":
			if (!nativeView[hidden]) return; // symbol unset = native default (Visible/Opacity=1/HitTest=true) — skip 4 WinRT calls
			nativeView[hidden] = false;
			nativeView.Opacity = 1;
			nativeView.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
			try { (nativeView as any).IsHitTestVisible = true; } catch (_e) { } // restore (in case it was 'hidden' before)
			break;
		default:
	}
}

function getVisibility(nativeView: Microsoft.UI.Xaml.UIElement & { [hidden]?: boolean }): CoreTypes.VisibilityType {
	if (nativeView[hidden]) {
		if (nativeView.Opacity === 0) {
			return "hidden";
		} else {
			if (nativeView.Visibility === Microsoft.UI.Xaml.Visibility.Collapsed) {
				return "collapse";
			}
		}
	}
	return "visible";
}

// Box-shadow uses native Microsoft.UI.Composition DropShadow (GPU, per element). Shadow hosts are
// inserted as siblings behind the target in its parent panel. NativeScript.Widgets.ShadowHelper
// handles the CPU blur fallback path on a thread-pool thread (never touches JS/UI thread).

class CompositionBorderHandler {
	private _element: Microsoft.UI.Xaml.UIElement;
	private _rootVisual: Microsoft.UI.Composition.Visual;
	private _container: Microsoft.UI.Composition.ContainerVisual;
	// Border SpriteVisuals are created lazily in _ensureBorderSprites() — only when UpdateBorder()
	// is first called with a non-zero width. Shadow-only handlers never allocate these (~18 WinRT
	// objects saved per shadow-only view, eliminating most of the launch/nav freeze).
	private _top: Microsoft.UI.Composition.SpriteVisual | null = null;
	private _bottom: Microsoft.UI.Composition.SpriteVisual | null = null;
	private _left: Microsoft.UI.Composition.SpriteVisual | null = null;
	private _right: Microsoft.UI.Composition.SpriteVisual | null = null;
	private _topBrush: Microsoft.UI.Composition.CompositionColorBrush | null = null;
	private _bottomBrush: Microsoft.UI.Composition.CompositionColorBrush | null = null;
	private _leftBrush: Microsoft.UI.Composition.CompositionColorBrush | null = null;
	private _rightBrush: Microsoft.UI.Composition.CompositionColorBrush | null = null;
	private _clipGeometry: Microsoft.UI.Composition.CompositionRoundedRectangleGeometry | null = null;
	// Sig of last applied border geometry (w×h + all widths/colors/radius). UpdateBorder is called
	// on every SizeChanged; this guard short-circuits the 12 WinRT property sets when nothing changed.
	private _lastBorderUpdateSig: string | null = null;
	// One host per CSS shadow, stacked behind element (first-listed shadow nearest/highest z).
	private _shadowImages: Microsoft.UI.Xaml.FrameworkElement[] = [];
	// Compositor objects kept alive alongside each host for fast-path size-only updates.
	// Parallel array to _shadowImages (same length, same index correspondence).
	private _shadowEntries: Array<{ layer: any; shapeVisual: any; geo: any }> = [];
	// Children collection captured at insert time — re-reading el.Parent at removal returns undefined
	// on this host, causing old shadows to accumulate.
	private _shadowKids: unknown = null;
	// Signature of last applied shadow render. UpdateBoxShadow runs on SizeChanged; re-inserting
	// hosts re-invalidates layout → LayoutCycleException. Only mutate the tree when sig changes.
	private _lastShadowSig: string | null = null;
	// Config-only sig (no size). When only w×h changes the host Border and all Compositor objects
	// are updated in-place — no XAML tree mutation, no new WinRT allocations.
	private _lastShadowConfigSig: string | null = null;
	// Per-side colored border drawn as a bitmap overlay ON TOP of the element (native XAML BorderBrush
	// is one color, so 4-color borders need a separate bitmap). Inserted right after the element (higher z).
	private _borderOverlayActive = false;
	private _borderKids: unknown = null;
	private _lastBorderSig: string | null = null;

	constructor(element: Microsoft.UI.Xaml.UIElement, rootVisual: Microsoft.UI.Composition.Visual) {
		this._element = element;
		this._rootVisual = rootVisual;
		const c = rootVisual.Compositor;

		this._container = c.CreateContainerVisual();
		// Expression animations on `Size` throw E_INVALIDARG in this V8/UWP composition projection;
		// RelativeSizeAdjustment(1,1) tracks the parent size natively without an animation.
		this._container.RelativeSizeAdjustment = new Windows.Foundation.Numerics.Vector2(1, 1);

		// Border SpriteVisuals NOT created here — see _ensureBorderSprites().
		Microsoft.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(element, this._container);
	}

	// Lazily allocate the 4 border SpriteVisuals. Only called by UpdateBorder when a real border
	// width is present. Returns false if allocation fails (handler unusable for borders).
	private _ensureBorderSprites(): boolean {
		if (this._top) return true;
		try {
			const c = this._rootVisual.Compositor;
			this._topBrush = c.CreateColorBrush();
			this._bottomBrush = c.CreateColorBrush();
			this._leftBrush = c.CreateColorBrush();
			this._rightBrush = c.CreateColorBrush();
			this._top = c.CreateSpriteVisual(); this._top.Brush = this._topBrush;
			this._bottom = c.CreateSpriteVisual(); this._bottom.Brush = this._bottomBrush;
			this._left = c.CreateSpriteVisual(); this._left.Brush = this._leftBrush;
			this._right = c.CreateSpriteVisual(); this._right.Brush = this._rightBrush;
			this._container.Children.InsertAtTop(this._top);
			this._container.Children.InsertAtTop(this._bottom);
			this._container.Children.InsertAtTop(this._left);
			this._container.Children.InsertAtTop(this._right);
			return true;
		} catch (_e) {
			return false;
		}
	}

	static Create(element: any): CompositionBorderHandler | null {
		try {
			const rootVisual = Microsoft.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(element);
			return new CompositionBorderHandler(element, rootVisual);
		} catch (_e) {
			return null;
		}
	}

	private _animate(target: Microsoft.UI.Composition.Visual, prop: string, expr: string): void {
		// Expression animations throw E_INVALIDARG in this V8/UWP composition projection; guard so a
		// failure can't abort background setup (which would blank the page).
		try {
			const anim = this._rootVisual.Compositor.CreateExpressionAnimation(expr);
			anim.SetReferenceParameter('host', this._rootVisual);
			target.StartAnimation(prop, anim);
		} catch (_e) { }
	}

	// Four explicitly-sized SpriteVisuals (one per side) for per-side widths/colors; rounded geometric
	// clip for corner radius. Explicit sizing avoids E_INVALIDARG from expression animations. Works on
	// plain panels (no native BorderThickness/BorderBrush) and renders above the element edge.
	UpdateBorder(w: number, h: number, tW: number, rW: number, bW: number, lW: number, tC: number, rC: number, bC: number, lC: number, radius: number): void {
		if (w <= 0 || h <= 0) {
			return; // not laid out yet — _redrawNativeBackground re-runs on SizeChanged
		}
		// Sig guards the 12 WinRT property sets below. UpdateBorder is called on every SizeChanged;
		// skipping when nothing changed eliminates the dominant per-frame bridge cost for bordered views.
		const sig = `${Math.round(w)}x${Math.round(h)}|${tW},${rW},${bW},${lW},${tC},${rC},${bC},${lC},${radius}`;
		if (sig === this._lastBorderUpdateSig) return;
		this._lastBorderUpdateSig = sig;
		if (!this._ensureBorderSprites()) return;
		try {
			const N = Windows.Foundation.Numerics;
			const tWc = Math.max(0, tW), rWc = Math.max(0, rW), bWc = Math.max(0, bW), lWc = Math.max(0, lW);
			const midH = Math.max(0, h - tWc - bWc);

			this._top.Offset = new N.Vector3(0, 0, 0);
			this._top.Size = new N.Vector2(w, tWc);
			this._topBrush.Color = _argbToWinColor(tC);

			this._bottom.Offset = new N.Vector3(0, Math.max(0, h - bWc), 0);
			this._bottom.Size = new N.Vector2(w, bWc);
			this._bottomBrush.Color = _argbToWinColor(bC);

			this._left.Offset = new N.Vector3(0, tWc, 0);
			this._left.Size = new N.Vector2(lWc, midH);
			this._leftBrush.Color = _argbToWinColor(lC);

			this._right.Offset = new N.Vector3(Math.max(0, w - rWc), tWc, 0);
			this._right.Size = new N.Vector2(rWc, midH);
			this._rightBrush.Color = _argbToWinColor(rC);

			const c = this._rootVisual.Compositor;
			if (radius > 0) {
				if (!this._clipGeometry) {
					this._clipGeometry = c.CreateRoundedRectangleGeometry();
					this._container.Clip = c.CreateGeometricClip(this._clipGeometry);
				}
				this._clipGeometry.Size = new N.Vector2(w, h);
				this._clipGeometry.CornerRadius = new N.Vector2(radius, radius);
			} else if (this._clipGeometry) {
				try { this._container.Clip = null as never; } catch (_e) { }
				this._clipGeometry = null;
			}
		} catch (_e) { }
	}

	ClearBorder(): void {
		// No sprites ever created (shadow-only handler) or already cleared — nothing to do.
		if (!this._top || this._lastBorderUpdateSig === 'none') return;
		this._lastBorderUpdateSig = 'none';
		try {
			const z = new Windows.Foundation.Numerics.Vector2(0, 0);
			this._top.Size = z; this._bottom.Size = z; this._left.Size = z; this._right.Size = z;
			if (this._clipGeometry) {
				try { this._container.Clip = null as never; } catch (_e) { }
				this._clipGeometry = null;
			}
		} catch (_e) { }
	}

	UpdateBoxShadow(shadows: BoxShadow[] | BoxShadow | null, cornerRadius = 0): void {
		// One element-sized DropShadow host per CSS shadow, inserted as a sibling behind the target.
		// Overlap-capable parents only — StackPanel would stack the host as a new row (skipped below).
		const el = this._element as Microsoft.UI.Xaml.FrameworkElement;
		if (!el) {
			return;
		}
		try {
			const list = shadows == null ? [] : (Array.isArray(shadows) ? shadows : [shadows]);

			// No shadows → clear (only mutate tree if we currently have images).
			if (!list.length) {
				if (this._lastShadowSig === 'none') {
					return;
				}
				this._lastShadowSig = 'none';
				this._lastShadowConfigSig = null;
				this._removeShadowImages();
				return;
			}

			const w = el.ActualWidth || 0;
			const h = el.ActualHeight || 0;
			if (w <= 0 || h <= 0) {
				return; // not laid out yet — re-applied on the next SizeChanged redraw (sig not cached)
			}

			// Signature guards against LayoutCycleException: inserting/removing hosts re-invalidates
			// layout. Only mutate the XAML tree when the shadow config changes. When only w×h changes
			// (size-only path) update Compositor objects in-place — no tree mutation, no new WinRT allocs.
			// Use pure-JS `.argb` for the sig — `.windows` would call ColorHelper.FromArgb() + 4 struct
			// reads per shadow color on every call, even when the sig matches and work is skipped.
			const configSig = `${cornerRadius}|` + list.map((s) => {
				const a = (s.color as any)?.argb ?? 0;
				return `${a}:${s.offsetX || 0},${s.offsetY || 0},${s.blurRadius || 0},${s.spreadRadius || 0}`;
			}).join(';');
			const sig = `${Math.round(w)}x${Math.round(h)}|${configSig}`;
			if (sig === this._lastShadowSig && this._shadowImages.length > 0) {
				return;
			}

			// Fast path: only w×h changed, same shadow config, same count → update sizes in-place.
			const configUnchanged = configSig === this._lastShadowConfigSig
				&& this._shadowImages.length === list.length
				&& this._shadowEntries.length === list.length
				&& this._shadowImages.length > 0;
			this._lastShadowSig = sig;
			// _lastShadowConfigSig is set AFTER _removeShadowImages() in the full-rebuild path so that
			// a mid-rebuild exception can't leave a stale configSig that fools the fast path.

			if (configUnchanged) {
				try {
					const N = Windows.Foundation.Numerics;
					const cssOrder = list.slice().reverse();
					for (let i = 0; i < this._shadowEntries.length; i++) {
						const entry = this._shadowEntries[i];
						const s = cssOrder[i];
						const spread = Math.max(0, layout.toDeviceIndependentPixels(s.spreadRadius || 0));
						const cw = Math.max(0, w + 2 * spread);
						const chh = Math.max(0, h + 2 * spread);
						(this._shadowImages[i] as any).Width = w;
						(this._shadowImages[i] as any).Height = h;
						entry.layer.Size = new N.Vector2(cw, chh);
						entry.shapeVisual.Size = new N.Vector2(cw, chh);
						entry.geo.Size = new N.Vector2(cw, chh);
					}
					return; // no tree mutation needed
				} catch (_e) { /* fall through to full rebuild on error */ }
			}

			this._removeShadowImages();
			// Now safe to record the new configSig — hosts have been removed, rebuild is starting.
			this._lastShadowConfigSig = configSig;

			const parent = el.Parent as unknown as Microsoft.UI.Xaml.Controls.Panel;
			const kids = parent?.Children;
			if (!kids || typeof kids.Size !== 'number') {
				return;
			}
			if (typeof (parent as unknown as Microsoft.UI.Xaml.Controls.StackPanel).Orientation !== 'undefined') {
				return; // StackPanel — sibling overlap not possible
			}

			const G = Microsoft.UI.Xaml.Controls.Grid;

			// style-properties stores shadows in reverse CSS order; restore so built[0] is first-listed
			// (nearest the element after insertion).
			const cssOrder = list.slice().reverse();

			// CRITICAL: ActualWidth/Height and cornerRadius are in DIPs, but blurRadius/spreadRadius/
			// offsetX/offsetY are in device pixels (style system converts via Length.toDevicePixels).
			// Convert back to DIPs — mixing units over-blurs and swamps the offset (flat halo artifact).
			const built: Array<{ host: Microsoft.UI.Xaml.FrameworkElement; layer: any; shapeVisual: any; geo: any }> = [];
			for (const s of cssOrder) {
				const entry = this._buildShadowHost(s, w, h, cornerRadius);
				if (!entry) {
					continue;
				}
				const host = entry.host;
				// Match grid cell + alignment of the element. Composition shadow overflows host bounds
				// (XAML doesn't clip child visuals), so element-sized host is sufficient.
				try {
					host.HorizontalAlignment = el.HorizontalAlignment;
					host.VerticalAlignment = el.VerticalAlignment;
					G.SetRow(host, G.GetRow(el));
					G.SetColumn(host, G.GetColumn(el));
					G.SetRowSpan(host, G.GetRowSpan(el));
					G.SetColumnSpan(host, G.GetColumnSpan(el));
				} catch (_e) { }

				built.push(entry);
			}
			if (!built.length) {
				return;
			}

			// Insert behind the element (lower index = lower z). Always inserting at the element's index
			// pushes earlier-inserted images up, so the first-listed shadow ends up nearest (per CSS).
			let idx = -1;
			for (let i = 0; i < kids.Size; i++) {
				if (kids.GetAt(i) === el) {
					idx = i;
					break;
				}
			}
			for (const entry of built) {
				if (idx < 0) {
					kids.Append(entry.host);
				} else {
					kids.InsertAt(idx, entry.host);
				}
			}
			this._shadowImages = built.map(e => e.host);
			this._shadowEntries = built.map(e => ({ layer: e.layer, shapeVisual: e.shapeVisual, geo: e.geo }));
			this._shadowKids = kids; // remember the exact collection for removal (el.Parent is unreliable later)
		} catch (_e) { }
	}

	// Element-sized host carrying one DropShadow per CSS box-shadow entry. The opaque shadow caster is
	// covered by the (opaque) element, so only the blurred shadow shows. Spread inflates the caster and
	// its corner radius. Uses LayerVisual + ShapeVisual (a GeometricClip would clip the shadow away).
	private _buildShadowHost(s: BoxShadow, w: number, h: number, cornerRadius: number): { host: Microsoft.UI.Xaml.FrameworkElement; layer: any; shapeVisual: any; geo: any } | null {
		try {
			const winColor = (s.color as Color & { windows?: Windows.UI.Color })?.windows;
			if (!winColor) {
				return null;
			}
			const N = Windows.Foundation.Numerics;
			const CH = Windows.UI.ColorHelper;
			const blur = Math.max(0, layout.toDeviceIndependentPixels(s.blurRadius || 0));
			const spread = Math.max(0, layout.toDeviceIndependentPixels(s.spreadRadius || 0));
			const offX = layout.toDeviceIndependentPixels(s.offsetX || 0);
			const offY = layout.toDeviceIndependentPixels(s.offsetY || 0);
			const cr = Math.max(0, cornerRadius);
			const cw = Math.max(0, w + 2 * spread);
			const chh = Math.max(0, h + 2 * spread);

			// DropShadow.Color carries the alpha for CSS opacity; caster fill is opaque for full-strength shadow.
			const shadowColor = CH.FromArgb(winColor.A ?? 255, winColor.R ?? 0, winColor.G ?? 0, winColor.B ?? 0);
			const casterColor = CH.FromArgb(255, winColor.R ?? 0, winColor.G ?? 0, winColor.B ?? 0);

			const host = new Microsoft.UI.Xaml.Controls.Border();
			host.Width = w;
			host.Height = h;
			try { (host as Microsoft.UI.Xaml.UIElement).IsHitTestVisible = false; } catch (_e) { }

			const ECP = Microsoft.UI.Xaml.Hosting.ElementCompositionPreview;
			const c = ECP.GetElementVisual(host).Compositor;

			const drop = c.CreateDropShadow();
			drop.BlurRadius = blur;
			drop.Color = shadowColor;
			drop.Offset = new N.Vector3(offX, offY, 0);

			// LayerVisual content isn't painted — only its DropShadow is — giving a pure soft shadow
			// with no visible opaque caster edge (the old SpriteVisual caster painted a hard edge at spread).
			const cornerR = cr > 0 ? cr + spread : 0;
			const layer = c.CreateLayerVisual();
			layer.Size = new N.Vector2(cw, chh);
			layer.Offset = new N.Vector3(-spread, -spread, 0);
			const shapeVisual = c.CreateShapeVisual();
			shapeVisual.Size = new N.Vector2(cw, chh);
			const geo = c.CreateRoundedRectangleGeometry();
			geo.Size = new N.Vector2(cw, chh);
			geo.CornerRadius = new N.Vector2(cornerR, cornerR);
			const shape = c.CreateSpriteShape(geo);
			const fb = c.CreateColorBrush();
			fb.Color = casterColor;
			shape.FillBrush = fb;
			shapeVisual.Shapes.Append(shape);
			layer.Children.InsertAtTop(shapeVisual);
			layer.Shadow = drop;

			ECP.SetElementChildVisual(host, layer);
			return { host, layer, shapeVisual, geo };
		} catch (_e) {
			return null;
		}
	}

	private _removeShadowImages(): void {
		const count = this._shadowImages.length;
		this._shadowImages = [];
		this._shadowEntries = [];
		if (count <= 0) {
			return;
		}
		// Remove by position, not identity: collection has no Remove()/IndexOf; GetAt returns a fresh
		// JS wrapper per call so `=== img` is false. Only `GetAt(i) === el` is stable. Shadow images
		// are the `count` siblings immediately before the element — find el, RemoveAt the slots before it.
		const kids = this._shadowKids as { Size: number; GetAt: (i: number) => unknown; RemoveAt: (i: number) => void } | null;
		const el = this._element;
		if (!kids || typeof kids.Size !== 'number' || !el) {
			return;
		}
		try {
			let elIdx = -1;
			for (let i = 0; i < kids.Size; i++) {
				if (kids.GetAt(i) === el) { elIdx = i; break; }
			}
			if (elIdx < 0) {
				return;
			}
			for (let k = 1; k <= count; k++) {
				const idx = elIdx - k;
				if (idx >= 0) {
					try { kids.RemoveAt(idx); } catch (_e) { }
				}
			}
		} catch (_e) { }
	}

	// Per-side ("colorful") border drawn as a bitmap overlay on top of the element. Pass null to clear.
	UpdateColorfulBorder(b: { w: number; h: number; tW: number; rW: number; bW: number; lW: number; tC: number; rC: number; bC: number; lC: number; radius: number } | null): void {
		const el = this._element as Microsoft.UI.Xaml.FrameworkElement;
		if (!el) {
			return;
		}
		try {
			if (!b || (b.tW <= 0 && b.rW <= 0 && b.bW <= 0 && b.lW <= 0)) {
				if (this._lastBorderSig === 'none') {
					return;
				}
				this._lastBorderSig = 'none';
				this._removeBorderOverlay();
				return;
			}
			// Not laid out yet — do NOT touch the existing overlay; a transient w=0 pass must not
			// tear down a valid overlay (would flicker/vanish).
			if (b.w <= 0 || b.h <= 0) {
				return;
			}
			const sig = `${Math.round(b.w)}x${Math.round(b.h)}|${b.radius}|${b.tW},${b.rW},${b.bW},${b.lW}|${b.tC},${b.rC},${b.bC},${b.lC}`;
			if (sig === this._lastBorderSig && this._borderOverlayActive) {
				return;
			}
			this._lastBorderSig = sig;
			this._removeBorderOverlay();
			const parent = el.Parent as unknown as Microsoft.UI.Xaml.Controls.Panel;
			const kids = parent?.Children;
			if (!kids || typeof kids.Size !== 'number') {
				return;
			}
			if (typeof (parent as unknown as Microsoft.UI.Xaml.Controls.StackPanel).Orientation !== 'undefined') {
				return; // StackPanel — overlay positioning not supported
			}
			const result = NativeScript.Widgets.ShadowHelper.CreateBorder(b.w, b.h, b.tW, b.rW, b.bW, b.lW, b.tC as never, b.rC as never, b.bC as never, b.lC as never, b.radius);
			const img = result?.Image;
			if (!img) {
				return;
			}
			try {
				img.HorizontalAlignment = el.HorizontalAlignment;
				img.VerticalAlignment = el.VerticalAlignment;
				const G = Microsoft.UI.Xaml.Controls.Grid;
				G.SetRow(img, G.GetRow(el));
				G.SetColumn(img, G.GetColumn(el));
				G.SetRowSpan(img, G.GetRowSpan(el));
				G.SetColumnSpan(img, G.GetColumnSpan(el));
			} catch (_e) { }
			// Insert immediately AFTER the element (just above it in z-order).
			let elIdx = -1;
			for (let i = 0; i < kids.Size; i++) {
				if (kids.GetAt(i) === el) { elIdx = i; break; }
			}
			if (elIdx < 0 || elIdx + 1 >= kids.Size) {
				kids.Append(img);
			} else {
				kids.InsertAt(elIdx + 1, img);
			}
			this._borderKids = kids;
			this._borderOverlayActive = true;
		} catch (_e) { }
	}

	private _removeBorderOverlay(): void {
		if (!this._borderOverlayActive) {
			return;
		}
		this._borderOverlayActive = false;
		const kids = this._borderKids as { Size: number; GetAt: (i: number) => unknown; RemoveAt: (i: number) => void } | null;
		const el = this._element;
		if (!kids || typeof kids.Size !== 'number' || !el) {
			return;
		}
		try {
			// Overlay sits immediately after the element (or last if appended). Position-based removal
			// since wrapper identity for our Image is unreliable (fresh wrapper per GetAt).
			let elIdx = -1;
			for (let i = 0; i < kids.Size; i++) {
				if (kids.GetAt(i) === el) { elIdx = i; break; }
			}
			if (elIdx >= 0 && elIdx + 1 < kids.Size) {
				kids.RemoveAt(elIdx + 1);
			} else if (kids.Size > 0) {
				kids.RemoveAt(kids.Size - 1); // was appended as last
			}
		} catch (_e) { }
	}

	Free(): void {
		this._removeShadowImages();
		this._removeBorderOverlay();
		if (this._element) {
			try { Microsoft.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(this._element, null as never); } catch (_e) { }
		}
		this._element = null;
		this._rootVisual = null;
		this._container = null;
		this._top = null; this._bottom = null; this._left = null; this._right = null;
		this._topBrush = null; this._bottomBrush = null; this._leftBrush = null; this._rightBrush = null;
	}
}

export class View extends ViewCommon {
	nativeViewProtected: Microsoft.UI.Xaml.FrameworkElement;

	_nativeBackgroundState: 'invalid' | 'drawn' = 'invalid';

	private _percentWidth: number | null = null; // null = not set
	private _percentHeight: number | null = null;
	// Held SizeChanged delegate (prevents GC — see _ensureSizeWatch).
	private _sizeChangedDelegate: any = null;
	private _sizeWatchWired = false;
	private _sizeRedrawPending = false;
	// Background-application caches — prevent redundant WinRT calls across repeated _redrawNativeBackground calls.
	// IMPORTANT: all sigs are value-based (not object-reference-based) because Background uses a clone pattern:
	// every withBorderWidth/withBorderRadius/withColor call creates a new object, so reference equality
	// is always false and would never skip anything.
	private _lastStaticSig: string | null = null;  // skip color/gradient rebuild when color+image unchanged
	private _lastRadiusSig: string | null = null;  // skip CornerRadius set when unchanged
	private _lastBorderSig: string | null = null;  // skip BorderThickness/UpdateBorder when unchanged
	private _isNativeButton: boolean | null = null; // cached once in initNativeView — avoids per-call 'in' check
	private _lastMarginSig: string | null = null;  // coalesce the 4 individual margin setNative calls into 1 WinRT set
	private _lastPaddingSig: string | null = null; // coalesce the 4 individual padding setNative calls into 1 WinRT set
	private _lastClipSig: string | null = null;    // skip clip-path rebuild when shape+dims unchanged
	private _lastTileSig: string | null = null;    // skip background-repeat tile rebuild when image+repeat+size unchanged
	private _tileBytesCache = new Map<string, Windows.Storage.Streams.IBuffer>(); // url → encoded source bytes (read once)
	_colorAnimBrush: any = null; // the current SolidColorBrush used as Background; lets animation reuse it without QI

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.measure(widthMeasureSpec, heightMeasureSpec);
		this.onMeasure(widthMeasureSpec, heightMeasureSpec);
	}

	public layout(left: number, top: number, right: number, bottom: number, setFrame = true): void {
		super.layout(left, top, right, bottom);
		if (setFrame) {
			this.layoutNativeView(left, top, right, bottom);
		}
		this.onLayout(left, top, right, bottom);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const view = this.nativeViewProtected;
		const width = layout.getMeasureSpecSize(widthMeasureSpec);
		const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
		const height = layout.getMeasureSpecSize(heightMeasureSpec);
		const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

		let nativeWidth = 0;
		let nativeHeight = 0;
		if (view) {
			const nativeSize = layout.measureNativeView(view, width, widthMode, height, heightMode);
			nativeWidth = nativeSize.width;
			nativeHeight = nativeSize.height;
		}

		const measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
		const measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);

		const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
		const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

		this.setMeasuredDimension(widthAndState, heightAndState);
	}

	public onLayout(_left: number, _top: number, _right: number, _bottom: number): void {
		// Native panels (StackPanel, Grid, etc.) position children; Canvas layouts set positions in their own handlers.
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
		const native = this.nativeViewProtected;
		if (!native) {
			return;
		}

		const w = layout.toDeviceIndependentPixels(right - left);
		const h = layout.toDeviceIndependentPixels(bottom - top);
		const l = layout.toDeviceIndependentPixels(left);
		const t = layout.toDeviceIndependentPixels(top);

		try {
			if (native.Parent) {
				Microsoft.UI.Xaml.Controls.Canvas.SetLeft(native, l);
				Microsoft.UI.Xaml.Controls.Canvas.SetTop(native, t);
			}
		} catch (_e) { }

		try {
			if (w > 0) {
				native.Width = w;
			}
			if (h > 0) {
				native.Height = h;
			}
		} catch (_e) { }
	}

	_redrawNativeBackground(value: any): void {
		const native = this.nativeViewProtected as any;
		if (!native) return;

		const background = value as Background;

		if (!(background && typeof background === 'object')) {
			return;
		}

		// Wire size watcher for size-dependent backgrounds (border/shadow/clip/radius/image). Not wired
		// on every view so plain views skip SizeChanged and fast scroll stays cheap.
		const depends = !!(
			(background.borderTopWidth || background.borderRightWidth || background.borderBottomWidth || background.borderLeftWidth) ||
			(background.clipPath) ||
			(background.image && background.image !== 'none') ||
			(typeof background.hasBorderRadius === 'function' && background.hasBorderRadius()) ||
			(typeof background.hasBoxShadows === 'function' && background.hasBoxShadows())
		);
		if (depends) {
			this._ensureSizeWatch();
		}

		// ── Phase 1: Static background (color / gradient / image) ────────────────────────────────
		// Guards via a value-based sig rather than object identity — Background uses a clone
		// pattern (each withBorderWidth/withRadius/withColor returns a new object), so reference
		// equality is always false and would never skip anything.
		// Sig encodes just color+image because those are the only static parts; border/radius/shadow
		// are size-dependent and handled in Phase 2 with their own per-value sigs.
		// Use pure-JS `color.argb` (returns the stored _argb integer) — NOT `color.windowsArgb`
		// which calls Windows.UI.ColorHelper.FromArgb() + 4 WinRT struct reads on every call.
		const _colorArgb = (background.color as any)?.argb ?? 0;
		let _imageKey = '';
		if (background.image) {
			if (typeof background.image === 'string') {
				_imageKey = background.image;
			} else {
				// Gradient: key on its actual content (angle + stops) so switching between gradients
				// invalidates the cache. A constant 'lg' here would skip the brush rebuild.
				const lg = background.image as any;
				const stops = (lg.colorStops || []).map((s: any) => `${(s.color as any)?.argb ?? ''}@${(s.offset as any)?.value ?? ''}`).join(',');
				_imageKey = `lg:${lg.angle ?? ''}:${stops}`;
			}
		}
		// Include position/repeat/size so changes to those (without color/image change) still trigger a redraw.
		const _staticSig = `${_colorArgb}|${_imageKey}|${background.repeat || ''}|${background.position || ''}|${background.size || ''}`;
		// Save prior sig BEFORE updating — used below to detect first call (fresh view).
		const _prevStaticSig = this._lastStaticSig;
		if (_staticSig !== this._lastStaticSig) {
			this._lastStaticSig = _staticSig;
			// When color/image changes, invalidate Phase-2 sigs — the composition handler may not
			// yet exist (element newly created), so stale radius/border sigs must not persist.
			this._lastRadiusSig = null;
			this._lastBorderSig = null;
			// Clear cached solid-color brush; re-set only if background is still a solid color.
			this._colorAnimBrush = null;

			if (background.image && typeof background.image === 'object' && 'colorStops' in background.image) {
				try {
					const lg: LinearGradient = background.image as any;
					const cs = lg.colorStops || [];
					// Create brush first to access its built-in GradientStops collection
					// (GradientStopCollection is not directly constructable in WinRT JS projection).
					const brush = new Microsoft.UI.Xaml.Media.LinearGradientBrush();
					const stopsCol = brush.GradientStops;
					for (let i = 0; i < cs.length; i++) {
						const entry = cs[i];
						const stop = new Microsoft.UI.Xaml.Media.GradientStop();
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
					brush.StartPoint = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0.5 - dx / 2, 0.5 - dy / 2);
					brush.EndPoint = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0.5 + dx / 2, 0.5 + dy / 2);
					brush.MappingMode = Microsoft.UI.Xaml.Media.BrushMappingMode.RelativeToBoundingBox;
					native.Background = brush;
				} catch (_e) { /* fallback to solid color below */ }
			} else if (background.image && typeof background.image === 'string' && background.image !== 'none') {
				// Raster background-image: url(...). A repeating background needs the element's pixel
				// size to build the tiled bitmap, so it's deferred to the size-dependent phase below;
				// here we only handle the non-repeating case via a plain ImageBrush.
				if (!_isTilingRepeat(background.repeat)) {
					this._applyBackgroundImage(native, background.image as string, background);
				}
			} else if (background && background.color) {
				const winColor = _resolveToWinColor(background.color);
				if (winColor) {
					try {
						const brush = new Microsoft.UI.Xaml.Media.SolidColorBrush(winColor);
						native.Background = brush;
						// Cache the brush so backgroundColor animations can reuse it without a WinRT QI.
						this._colorAnimBrush = brush;
						// For Button controls the default XAML template ignores Background via its VSM
						// Normal-state animation. Override the ButtonBackground theme resource on the
						// instance so the template binding picks up our colour.
						// IMPORTANT: only do this for actual Button-type controls — Resources.Insert on
						// a non-Button creates a useless ResourceDictionary (~15ms one-time overhead).
						if (this._isNativeButton) {
							try { native.Resources.Insert('ButtonBackground', brush); } catch (_re) { }
							try { native.Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_re) { }
							try { native.Resources.Insert('ButtonBackgroundPressed', brush); } catch (_re) { }
						}
					} catch (bgErr) {
						console.error('[Windows] Background SolidColorBrush failed:', bgErr);
					}
				} else {
					// Transparent color (winColor = null) — XAML default Background is null for non-buttons.
					// Skip the no-op setter on fresh views to save 1 WinRT call per transparent view.
					if (this._isNativeButton || _prevStaticSig !== null) {
						native.Background = null;
					}
				}
			} else {
				// No color, no image — same result as transparent.
				// Skip null-set on fresh non-button views (XAML default is already null).
				if (this._isNativeButton || _prevStaticSig !== null) {
					native.Background = null;
				}
			}
		}

		// ── Phase 2: Size-dependent work (composition, border, radius, shadow) ───────────────────
		this._applySizeDependentNativeBackground(native, background);
	}

	// Size-dependent half of background rendering — called from both _redrawNativeBackground
	// (full redraw) and _onSizeChanged (size-change-only redraw, skips Phase 1 above).
	private _applySizeDependentNativeBackground(native: any, background: Background): void {
		let radius = 0;
		if (typeof background.getUniformBorderRadius === 'function') {
			radius = background.getUniformBorderRadius();
		}

		// Read border-color argb early (pure JS, no WinRT) — used for both needsComposition and
		// the border sig / native XAML path below.
		// Default an unset border-color to opaque black on any side that has a width — matches CSS
		// (initial border-color resolves to currentColor → black here) and iOS/Android, which both
		// fall back to black. Without this, a width-only border renders invisible on Windows.
		const tCArgb = (background.borderTopColor as any)?.argb ?? (background.borderTopWidth ? 0xff000000 : 0);
		const rCArgb = (background.borderRightColor as any)?.argb ?? (background.borderRightWidth ? 0xff000000 : 0);
		const bCArgb = (background.borderBottomColor as any)?.argb ?? (background.borderBottomWidth ? 0xff000000 : 0);
		const lCArgb = (background.borderLeftColor as any)?.argb ?? (background.borderLeftWidth ? 0xff000000 : 0);
		const _anyBorderWidth = !!(background.borderTopWidth || background.borderRightWidth || background.borderBottomWidth || background.borderLeftWidth);
		// Per-side different colors → XAML BorderBrush (single color) can't handle it.
		const _hasNonUniformBorderColor = _anyBorderWidth && (tCArgb !== rCArgb || tCArgb !== bCArgb || tCArgb !== lCArgb);
		const _hasBoxShadow = typeof background.hasBoxShadows === 'function' && background.hasBoxShadows();
		// Whether XAML has native BorderThickness + BorderBrush on this element.
		// Controls (Button, TextBox, etc.) and Border do; layout panels (Grid, StackPanel) do NOT.
		// `'BorderThickness' in native` is a free prototype check — no WinRT getter invoked.
		const _nativeHasBorderSupport = 'BorderThickness' in native;
		// Only create the Compositor handler for features XAML can't handle natively:
		//   • box-shadows (no XAML equivalent at the NativeScript level)
		//   • per-side different border colors (XAML BorderBrush is a single uniform color)
		//   • layout panels: Grid/StackPanel/etc. have no BorderThickness, so they need Compositor
		//     for any border regardless of uniformity
		// Controls with uniform-color borders are handled natively via BorderThickness + BorderBrush
		// + CornerRadius — no WinRT Compositor overhead (~20 WinRT calls per element) needed.
		const needsComposition = !!(_hasBoxShadow || _hasNonUniformBorderColor || (_anyBorderWidth && !_nativeHasBorderSupport));
		if (needsComposition && !this._viewCompositionHandler) {
			this._viewCompositionHandler = CompositionBorderHandler.Create(native);
		}

		// Borders/radius via native XAML CornerRadius. Use `'CornerRadius' in native` (JS prototype
		// chain check, no getter invocation) instead of `typeof native.CornerRadius !== 'undefined'`
		// (which would invoke the WinRT getter). Sig-guard skips the WinRT set when nothing changed.
		const tlr = background.borderTopLeftRadius || 0;
		const trr = background.borderTopRightRadius || 0;
		const brr = background.borderBottomRightRadius || 0;
		const blr = background.borderBottomLeftRadius || 0;
		const radiusSig = `${radius}|${tlr}|${trr}|${brr}|${blr}`;
		if (radiusSig !== this._lastRadiusSig) {
			this._lastRadiusSig = radiusSig;
			try {
				if ('CornerRadius' in native) {
					if (radius > 0) {
						const radiusDp = layout.toDeviceIndependentPixels(radius);
						native.CornerRadius = Microsoft.UI.Xaml.CornerRadiusHelper.FromUniformRadius(radiusDp);
					} else {
						native.CornerRadius = Microsoft.UI.Xaml.CornerRadiusHelper.FromRadii(
							layout.toDeviceIndependentPixels(tlr),
							layout.toDeviceIndependentPixels(trr),
							layout.toDeviceIndependentPixels(brr),
							layout.toDeviceIndependentPixels(blr)
						);
					}
				}
			} catch (_e) { }
		}

		// Border rendering: XAML-native path (BorderThickness + BorderBrush) or composition path.
		// Only access native.ActualWidth/Height when a composition handler actually exists —
		// those are WinRT getter calls and are wasted on elements with no handler.
		// (tCArgb / rCArgb / bCArgb / lCArgb computed above before needsComposition check.)
		try {
			const lW = layout.toDeviceIndependentPixels(background.borderLeftWidth || 0);
			const tW = layout.toDeviceIndependentPixels(background.borderTopWidth || 0);
			const rW = layout.toDeviceIndependentPixels(background.borderRightWidth || 0);
			const bW = layout.toDeviceIndependentPixels(background.borderBottomWidth || 0);
			const anyWidth = lW > 0 || tW > 0 || rW > 0 || bW > 0;
			const radiusDp = layout.toDeviceIndependentPixels(radius || 0);
			// Border config sig excludes size — size is only needed inside UpdateBorder (lazy).
			// Including size would force ActualWidth/Height reads even for elements with no handler.
			const borderConfigSig = `${tW},${rW},${bW},${lW},${tCArgb},${rCArgb},${bCArgb},${lCArgb},${radiusDp}`;
			if (borderConfigSig !== this._lastBorderSig) {
				this._lastBorderSig = borderConfigSig;
				if (!this._viewCompositionHandler) {
					// XAML-native path: uniform-color border via BorderThickness + BorderBrush.
					// CornerRadius already set above. No WinRT Compositor objects needed.
					// `'BorderThickness' in native` is a free prototype check (no WinRT getter).
					try {
						if ('BorderThickness' in native) {
							if (anyWidth) {
								native.BorderThickness = { Left: lW, Top: tW, Right: rW, Bottom: bW } as any;
								// All 4 colors are equal (enforced by needsComposition → use top as canonical).
								const borderBrush = tCArgb
									? new Microsoft.UI.Xaml.Media.SolidColorBrush(_argbToWinColor(tCArgb))
									: null;
								native.BorderBrush = borderBrush;
								// Button VSM overrides BorderBrush via {ThemeResource ButtonBorderBrush}.
								// Insert into the instance ResourceDictionary so the binding resolves our value.
								if (this._isNativeButton && borderBrush) {
									try { native.Resources.Insert('ButtonBorderBrush', borderBrush); } catch (_re) { }
									try { native.Resources.Insert('ButtonBorderBrushPointerOver', borderBrush); } catch (_re) { }
									try { native.Resources.Insert('ButtonBorderBrushPressed', borderBrush); } catch (_re) { }
								}
							} else {
								native.BorderThickness = { Left: 0, Top: 0, Right: 0, Bottom: 0 } as any;
								native.BorderBrush = null;
							}
						}
					} catch (_e) { }
				} else {
					// Composition path: clear native XAML border (composition draws its own).
					try {
						if ('BorderThickness' in native) {
							native.BorderThickness = { Left: 0, Top: 0, Right: 0, Bottom: 0 } as any;
						}
					} catch (_e) { }
					this._viewCompositionHandler?.UpdateColorfulBorder(null);
				}
			}
			// ActualWidth/Height reads gated inside the anyWidth branch — shadow-only handlers never
			// pay these 2 WinRT getter calls. _argbToWinColor uses the module-level cache.
			if (this._viewCompositionHandler) {
				if (anyWidth) {
					const aw = native.ActualWidth || 0;
					const ah = native.ActualHeight || 0;
					this._viewCompositionHandler.UpdateBorder(aw, ah, tW, rW, bW, lW, tCArgb, rCArgb, bCArgb, lCArgb, radiusDp);
				} else {
					this._viewCompositionHandler.ClearBorder();
				}
			}
		} catch (_e) { }

		this._nativeBackgroundState = 'drawn';

		if (this._viewCompositionHandler) {
			const hasShadow = background && typeof background.hasBoxShadows === 'function' && background.hasBoxShadows();
			if (hasShadow) {
				const boxShadows = typeof background.getBoxShadows === 'function' ? background.getBoxShadows() : (background as any).boxShadows;
				this._viewCompositionHandler.UpdateBoxShadow(boxShadows?.length ? boxShadows : null, layout.toDeviceIndependentPixels(radius || 0));
			} else {
				this._viewCompositionHandler.UpdateBoxShadow(null);
			}
		}

		// Clip-path via Composition Visual.Clip — rect, inset, circle, ellipse, polygon.
		const clipPath = background.clipPath;
		if (clipPath) {
			try {
				const aw = (native.ActualWidth as number) || 0;
				const ah = (native.ActualHeight as number) || 0;
				const sig = String(clipPath) + `|${aw}|${ah}`;
				if (sig !== this._lastClipSig) {
					this._lastClipSig = sig;
					this._applyClipGeometry(native, clipPath instanceof ClipPathFunction ? clipPath : null, aw, ah);
				}
			} catch (_e) { }
		} else if (this._lastClipSig !== null) {
			this._lastClipSig = null;
			try { NativeScript.Widgets.ClipHelper.ClearClip(native); } catch (_e) { }
		}

		// CSS background-repeat tiling. WinUI's ImageBrush can't tile, so the C++ TileHelper renders a
		// bitmap tiled to the element's pixel size and we use that as the brush. Size-dependent, so it
		// regenerates on resize; sig-guarded to skip when image/repeat/size are unchanged.
		const bgImage = background.image;
		if (typeof bgImage === 'string' && bgImage && bgImage !== 'none' && _isTilingRepeat(background.repeat)) {
			const aw = (native.ActualWidth as number) || 0;
			const ah = (native.ActualHeight as number) || 0;
			if (aw > 0 && ah > 0) {
				const density = layout.getDisplayDensity?.() || 1;
				const wPx = Math.max(1, Math.round(aw * density));
				const hPx = Math.max(1, Math.round(ah * density));
				const repeat = String(background.repeat).toLowerCase();
				const tileSig = `${bgImage}|${repeat}|${wPx}x${hPx}`;
				if (tileSig !== this._lastTileSig) {
					this._lastTileSig = tileSig;
					this._applyTiledBackgroundImage(native, bgImage, repeat, wPx, hPx);
				}
			}
		} else if (this._lastTileSig !== null) {
			this._lastTileSig = null;
		}
	}

	// Resolves a CSS background-image url to a path that ImageHelper.ReadFileAsync can read
	// (ms-appx:/// for ~/, res:// and bare; passthrough for ms-appx/file/http). Returns '' if unusable.
	private _resolveBackgroundImagePath(src: string): string {
		let url = (src || '').trim();
		const m = url.match(/^url\(\s*['"]?([^'")]+)['"]?\s*\)$/i);
		if (m) url = m[1];
		if (!url) return '';
		if (url.startsWith('~/')) return 'ms-appx:///app/' + url.slice(2);
		if (url.startsWith('res://')) return 'ms-appx:///Assets/' + url.slice('res://'.length);
		if (/^ms-appx/i.test(url) || /^https?:/i.test(url) || /^file:/i.test(url)) return url;
		return url; // bare filesystem path
	}

	// Builds the tiled bitmap via the C++ TileHelper and applies it as the native Background brush.
	private _applyTiledBackgroundImage(native: any, src: string, repeat: string, wPx: number, hPx: number): void {
		const repeatX = repeat === 'repeat' || repeat === 'repeat-x';
		const repeatY = repeat === 'repeat' || repeat === 'repeat-y';
		const path = this._resolveBackgroundImagePath(src);
		if (!path) return;

		const applyTiled = (sourceBytes: Windows.Storage.Streams.IBuffer) => {
			NSWinRT.toPromise(NativeScript.Widgets.TileHelper.CreateTiledImageAsync(sourceBytes, wPx, hPx, repeatX, repeatY))
				.then((tiled: Windows.Storage.Streams.IBuffer) => NSWinRT.toPromise(NativeScript.Widgets.ImageHelper.LoadFromBufferAsync(tiled)))
				.then((result: NativeScript.Widgets.ImageResult) => {
					const bmp = result?.Bitmap;
					if (!bmp || !native) return;
					// Guard against a later size/image change that superseded this async result.
					const repeatNow = String((this.style.backgroundInternal as any)?.repeat ?? '').toLowerCase();
					if (!_isTilingRepeat(repeatNow)) return;
					const Media: any = Microsoft.UI.Xaml.Media;
					const brush = new Media.ImageBrush();
					brush.ImageSource = bmp;
					// The tiled bitmap is exactly the element's pixel size, so Fill maps it 1:1.
					try { brush.Stretch = Media.Stretch.Fill; } catch (_e) { }
					native.Background = brush;
					try { native.Resources.Insert('ButtonBackground', brush); } catch (_e) { }
					try { native.Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_e) { }
					try { native.Resources.Insert('ButtonBackgroundPressed', brush); } catch (_e) { }
				})
				.catch(() => { });
		};

		const cached = this._tileBytesCache.get(path);
		if (cached) {
			applyTiled(cached);
			return;
		}
		// http(s) sources can't be read by ReadFileAsync; fetch via image-source bytes path instead.
		NSWinRT.toPromise(NativeScript.Widgets.ImageHelper.ReadFileAsync(path))
			.then((bytes: Windows.Storage.Streams.IBuffer) => {
				if (!bytes) return;
				this._tileBytesCache.set(path, bytes);
				applyTiled(bytes);
			})
			.catch(() => { });
	}

	// Last layout size we reacted to. LayoutUpdated fires on every layout pass (including scrolling);
	// tracking size avoids expensive _onSizeChanged (tree mutation via box-shadow/border Images) when unchanged.
	private _lastLayoutW = NaN;
	private _lastLayoutH = NaN;

	initNativeView(): void {
		super.initNativeView();
		// Size-dependent work (percent sizing, border/shadow/clip redraw) is wired ON DEMAND via
		// _ensureSizeWatch(). SizeChanged fires for every recycled cell + child during fast scroll;
		// wiring it unconditionally crossed the JS bridge per cell and blocked scrolling.
		//
		// Cache whether this native control is a Button-family control. The JS `in` operator checks
		// the prototype chain without invoking a getter — free. We use this to gate the
		// ButtonBackground ResourceDictionary inserts (button-template-only VSM resource).
		try {
			const nv = this.nativeViewProtected as any;
			// `in` is unreliable on COM proxy objects — use direct property access instead.
			// ClickMode is declared on ButtonBase (Button/AppBarButton/etc.) and returns 0 (Release)
			// by default; non-button controls return `undefined` for absent properties.
			this._isNativeButton = !!(nv && nv.ClickMode !== undefined);
		} catch (_e) {
			this._isNativeButton = false;
		}
	}

	// Applies CSS clip-path by calling the C++ NativeScript.Widgets.ClipHelper, which performs
	// strongly-typed WinRT calls that bypass V8-bridge interface-matching limitations.
	// rect/inset/circle/ellipse use a composition rounded-rect (radius=size/2 is a true ellipse);
	// polygon goes through a Direct2D path geometry wrapped in IGeometrySource2DInterop.
	private _applyClipGeometry(native: any, clipPath: ClipPathFunction | null, w: number, h: number): void {
		try {
			if (!clipPath) {
				NativeScript.Widgets.ClipHelper.ClearClip(native);
				return;
			}

			const density = layout.getDisplayDensity() || 1;
			const dim = (v: string, t: number) => _parseClipDim(v, t, density);
			const { shape, rule } = clipPath;

			if (shape === 'rect') {
				const parts = rule.trim().split(/\s+/);
				const top    = dim(parts[0] || '0', h);
				const right  = dim(parts[1] || String(w), w);
				const bottom = dim(parts[2] || String(h), h);
				const left   = dim(parts[3] || '0', w);
				NativeScript.Widgets.ClipHelper.ApplyRoundedRectClip(
					native, left, top,
					Math.max(0, right - left), Math.max(0, bottom - top),
					0, 0);
			} else if (shape === 'inset') {
				const parts = rule.trim().split(/\s+/);
				const t = dim(parts[0] || '0', h);
				const r = dim(parts.length >= 2 ? parts[1] : parts[0], w);
				const b = dim(parts.length >= 3 ? parts[2] : parts[0], h);
				const l = dim(parts.length >= 4 ? parts[3] : (parts.length >= 2 ? parts[1] : parts[0]), w);
				NativeScript.Widgets.ClipHelper.ApplyRoundedRectClip(
					native, l, t,
					Math.max(0, w - l - r), Math.max(0, h - t - b),
					0, 0);
			} else if (shape === 'circle') {
				const m = rule.trim().match(/^([^\s]+)\s+at\s+([^\s]+)\s+([^\s]+)$/i);
				// CSS circle() percentage radius resolves against min(width,height)/2 (matches iOS/Android).
				const radiusRef = Math.min(w, h) / 2;
				let radius: number, cx: number, cy: number;
				if (m) {
					radius = dim(m[1], radiusRef);
					cx = dim(m[2], w);
					cy = dim(m[3], h);
				} else {
					radius = dim(rule.trim(), radiusRef);
					cx = w / 2; cy = h / 2;
				}
				NativeScript.Widgets.ClipHelper.ApplyRoundedRectClip(
					native, cx - radius, cy - radius,
					radius * 2, radius * 2,
					radius, radius);
			} else if (shape === 'ellipse') {
				const m = rule.trim().match(/^([^\s]+)\s+([^\s]+)\s+at\s+([^\s]+)\s+([^\s]+)$/i);
				if (m) {
					const rx = dim(m[1], w);
					const ry = dim(m[2], h);
					const cx = dim(m[3], w);
					const cy = dim(m[4], h);
					NativeScript.Widgets.ClipHelper.ApplyRoundedRectClip(
						native, cx - rx, cy - ry,
						rx * 2, ry * 2,
						rx, ry);
				}
			} else if (shape === 'polygon') {
				// Direct2D path via C++ helper — no Win2D NuGet needed.
				NativeScript.Widgets.ClipHelper.ApplyPolygonClip(native, w, h, rule, density);
			}
		} catch (_e) { }
	}

	// Renders CSS background-image as a native ImageBrush. Resolves NS path forms (res://, ~/, data:,
	// http(s) async, ms-appx). background-size → Stretch, background-position → alignment. CSS tiling
	// (repeat) isn't expressible with ImageBrush; only single no-repeat is supported.
	private _applyBackgroundImage(native: any, src: string, background: Background): void {
		const Media: any = Microsoft.UI.Xaml.Media;
		const apply = (bmp: any) => {
			if (!bmp || !native) {
				// Image missing / failed to decode → fall back to the element's background-color so it
				// still shows (CSS + iOS/Android parity). Phase 1 skipped the color branch because an
				// image was specified, so without this the element would render with no background.
				try {
					const winColor = background && background.color ? _resolveToWinColor(background.color) : null;
					native.Background = winColor ? new Media.SolidColorBrush(winColor) : null;
				} catch (_e) { }
				return;
			}
			try {
				const brush = new Media.ImageBrush();
				brush.ImageSource = bmp;
				// Map background-size → Stretch (default no-repeat shows the image at natural size).
				const size = (background.size || '').toString().toLowerCase();
				try {
					if (size === 'cover') {
						brush.Stretch = Media.Stretch.UniformToFill;
					} else if (size === 'contain') {
						brush.Stretch = Media.Stretch.Uniform;
					} else if (size === '100% 100%' || size === 'fill') {
						brush.Stretch = Media.Stretch.Fill;
					} else {
						brush.Stretch = Media.Stretch.None;
					}
				} catch (_e) { }
				// Map background-position keywords → alignment (CSS default is top-left).
				const pos = (background.position || '').toString().toLowerCase();
				try {
					brush.AlignmentX = pos.includes('right') ? Media.AlignmentX.Right : pos.includes('center') ? Media.AlignmentX.Center : Media.AlignmentX.Left;
					brush.AlignmentY = pos.includes('bottom') ? Media.AlignmentY.Bottom : pos.includes('center') ? Media.AlignmentY.Center : Media.AlignmentY.Top;
				} catch (_e) { }
				native.Background = brush;
				// Buttons ignore Background in their default template (VSM); override the template brush too.
				try { (native as any).Resources.Insert('ButtonBackground', brush); } catch (_e) { }
				try { (native as any).Resources.Insert('ButtonBackgroundPointerOver', brush); } catch (_e) { }
				try { (native as any).Resources.Insert('ButtonBackgroundPressed', brush); } catch (_e) { }
			} catch (_e) { }
		};

		try {
			let url = (src || '').trim();
			const m = url.match(/^url\(\s*['"]?([^'")]+)['"]?\s*\)$/i);
			if (m) {
				url = m[1];
			}
			if (url.startsWith('~/')) {
				url = 'ms-appx:///app/' + url.slice(2);
			}

			if (/^data:/i.test(url)) {
				const is = ImageSource.fromBase64Sync(url.replace(/^data:[^,]*,/, ''));
				apply(is && (is as any).windows);
			} else if (/^https?:/i.test(url)) {
				ImageSource.fromUrl(url).then((is) => apply(is && (is as any).windows)).catch(() => { });
			} else if (url.startsWith('res://')) {
				const is = ImageSource.fromResourceSync(url);
				apply(is && (is as any).windows);
			} else {
				const is = ImageSource.fromFileSync(url);
				apply(is && (is as any).windows);
			}
		} catch (_e) { }
	}

	// Lazily wire SizeChanged via asDelegate (the only event that reliably subscribes in this host;
	// raw-fn LayoutUpdated does not). Idempotent. Only called for views that need it.
	private _ensureSizeWatch(): void {
		if (this._sizeWatchWired) return;
		const nv = this.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
		if (!nv) return;
		this._sizeWatchWired = true;
		const ref = new WeakRef(this);
		const onSize = () => {
			const owner = ref.deref();
			if (!owner) return;
			const n = owner.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
			if (!n) return;
			// NOTE: _applyPercentSizing() is intentionally NOT called here synchronously.
			// Setting Width/Height from within a SizeChanged handler mutates the layout tree
			// mid-pass and triggers XAML's LayoutCycleException (0x80000003 fail-fast).
			// The deferred _onSizeChanged() path calls it safely after the layout pass ends.
			let w = NaN, h = NaN;
			try { w = n.ActualWidth; h = n.ActualHeight; } catch (_e) { return; }
			if (Math.abs(w - owner._lastLayoutW) < 0.5 && Math.abs(h - owner._lastLayoutH) < 0.5) {
				return; // size unchanged (e.g. scrolling) — nothing to redraw
			}
			owner._lastLayoutW = w;
			owner._lastLayoutH = h;
			// Coalesce rapid size changes into one deferred redraw; defer out of the layout callback
			// (tree mutation inside it risks a 0xC000027B fail-fast).
			if (owner._sizeRedrawPending) return;
			owner._sizeRedrawPending = true;
			setTimeout(() => { const o = ref.deref(); if (o) { o._sizeRedrawPending = false; try { o._onSizeChanged(); } catch (_e) { } } }, 0);
		};
		try {
			this._sizeChangedDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.SizeChangedEventHandler', onSize);
			nv.SizeChanged = this._sizeChangedDelegate;
		} catch (_e) { }
		// LayoutUpdated intentionally NOT wired: it fires on every layout pass (scrolling, sibling
		// changes, etc.) causing bridge round-trips per element per frame. SizeChanged is sufficient —
		// it only fires when the element's actual pixel size changes.
		// Apply immediately + once on load (covers percent before SizeChanged fires).
		try { this._applyPercentSizing(); } catch (_e) { }
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
			nativeView.SizeChanged = null;
		}
		// Reset so a recycled view re-wires on the next size-dependent property set.
		this._sizeWatchWired = false;
		this._sizeChangedDelegate = null;
		// Reset background caches so recycled view re-applies on next use.
		this._lastStaticSig = null;
		this._lastRadiusSig = null;
		this._lastBorderSig = null;
		this._isNativeButton = null;
		this._lastMarginSig = null;
		this._lastPaddingSig = null;
		this._colorAnimBrush = null;
		super.disposeNativeView();
	}

	_onSizeChanged(): void {
		const nativeView = this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		try { this._applyPercentSizing(); } catch (_e) { }

		const background = this.style.backgroundInternal;
		// Any border width makes the background size-dependent (composition border needs measured size).
		const anyBorderWidth = !!(background && (background.borderTopWidth || background.borderRightWidth || background.borderBottomWidth || background.borderLeftWidth));
		const backgroundDependsOnSize = (background && background.image && background.image !== 'none') || (background && background.clipPath) || anyBorderWidth || (background && !background.hasUniformBorder()) || (background && background.hasBorderRadius && background.hasBorderRadius()) || (background && background.hasBoxShadows && background.hasBoxShadows());

		if (this._nativeBackgroundState === 'invalid') {
			// Full redraw needed (background property changed while view had no size yet).
			this._redrawNativeBackground(background);
		} else if (this._nativeBackgroundState === 'drawn' && backgroundDependsOnSize) {
			// Size changed — only re-run the size-dependent phase.  The static background
			// (brush creation, native.Background=, Resources.Insert) is unchanged and
			// skipping it saves ~15ms per element on every SizeChanged fire.
			const native = this.nativeViewProtected as any;
			if (native && background && typeof background === 'object') {
				this._applySizeDependentNativeBackground(native, background);
			}
		}

		try {
			if (nativeView.Clip && nativeView.Clip instanceof Microsoft.UI.Xaml.Media.RectangleGeometry) {
				const rectGeom = nativeView.Clip as Microsoft.UI.Xaml.Media.RectangleGeometry;
				const w = nativeView.ActualWidth || nativeView.Width || 0;
				const h = nativeView.ActualHeight || nativeView.Height || 0;

				const location = Microsoft.UI.Xaml.PointHelper.FromCoordinates(0, 0);
				const size = Microsoft.UI.Xaml.SizeHelper.FromDimensions(w, h);
				rectGeom.Rect = Microsoft.UI.Xaml.RectHelper.FromLocationAndSize(location, size);

			}

		} catch (_e) { }
	}

	private _applyPercentSizing(): void {
		const nativeView = this.nativeViewProtected as any;
		if (!nativeView) {
			return;
		}

		try {
			const parentNative = (this.parent as any)?.nativeViewProtected as any;
			const parentWidth = parentNative?.ActualWidth || 0;
			const parentHeight = parentNative?.ActualHeight || 0;

			// Only apply when parent has a real layout size. Using Window.Bounds as fallback when
			// parent is 0 causes nested height="100%" views to overflow the container and cover
			// sibling rows; LayoutUpdated fires again once the parent is properly sized.
			if (this._percentWidth != null && parentWidth > 0) {
				const w = parentWidth * (this._percentWidth);
				nativeView.Width = isFinite(w) ? w : NaN;
			}

			if (this._percentHeight != null && parentHeight > 0) {
				const h = parentHeight * (this._percentHeight);
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

	[backgroundInternalProperty.setNative](value: any) {
		this._nativeBackgroundState = 'invalid';
		this._redrawNativeBackground(value);
	}

	//@ts-ignore
	[widthProperty.setNative](value: CoreTypes.PercentLengthType) {
		if (!this.nativeViewProtected) {
			return;
		}

		if (value && typeof value === 'object' && (value as any).unit === '%') {
			const pct = (value as any).value;
			this._percentWidth = pct;
			this._ensureSizeWatch(); // re-apply percent when the parent resizes
			this.nativeViewProtected.Width = NaN;
			if (pct >= 1) {
				// 100% → let the container size it natively (NativeScript.Widgets.StackLayout gives
				// a Stretch child the remaining bounded extent; Grid Stretch fills the cell).
				(this.nativeViewProtected as any).HorizontalAlignment = 3; // Stretch
			} else {
				try { this._applyPercentSizing(); } catch (_e) { }
			}
			// Feed FlexBasisPercent so the C++ FlexboxLayout panel's MeasureOverride sets
			// item.MainSize = containerWidth * pct, which triggers a line break on flexWrap:wrap.
			// pct is stored as a 0..1 fraction; the C++ property expects 0..100.
			try {
				(NativeScript as any).Widgets.FlexboxLayout.SetFlexBasisPercent(
					this.nativeViewProtected as any, pct * 100
				);
			} catch (_e) {}
			return;
		}

		this._percentWidth = null;
		// Clear any previously set flex-basis so the C++ widget falls back to DesiredSize.
		try {
			(NativeScript as any).Widgets.FlexboxLayout.SetFlexBasisPercent(
				this.nativeViewProtected as any, -1
			);
		} catch (_e) {}
		this.nativeViewProtected.Width = toXamlLength(value);
	}

	//@ts-ignore
	[heightProperty.setNative](value: CoreTypes.PercentLengthType) {
		if (!this.nativeViewProtected) {
			return;
		}

		if (value && typeof value === 'object' && (value as any).unit === '%') {
			const pct = (value as any).value;
			this._percentHeight = pct;
			this._ensureSizeWatch(); // re-apply percent when the parent resizes
			this.nativeViewProtected.Height = NaN;
			if (pct >= 1) {
				// 100% → let the container size it natively (NativeScript.Widgets.StackLayout sizes a
				// Stretch child to remaining bounded extent; a Grid Stretch fills the cell).
				(this.nativeViewProtected as any).VerticalAlignment = 3; // Stretch
				// VerticalAlignment is ARRANGE-only; changing it doesn't re-run MeasureOverride.
				// Force a re-measure so the panel re-evaluates this child as a fill child.
				try { this.nativeViewProtected.InvalidateMeasure(); } catch (_e) { }
			} else {
				try { this._applyPercentSizing(); } catch (_e) { }
			}
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
			// All 4 margin properties share this helper — CSS `margin:` decomposes into 4 separate
			// setNative calls in the same synchronous applyAllNativeSetters loop. The sig check
			// coalesces them: the first call does the WinRT set; the remaining 3 are no-ops.
			const sig = `${l},${t},${r},${b}`;
			if (sig === this._lastMarginSig) return;
			const prev = this._lastMarginSig;
			this._lastMarginSig = sig;
			// Skip the WinRT call on the very first zero-margin assignment: XAML default Margin is
			// already {0,0,0,0}, so setting it is a no-op. Only safe when prev===null (native never
			// touched); if margin was previously non-zero and is now reset to 0, we still call WinRT.
			if (l === 0 && t === 0 && r === 0 && b === 0 && prev === null) return;
			// Thickness is a plain value struct {Left,Top,Right,Bottom: f64} — pass as a plain JS
			// object via the bridge's append_struct_object_bytes path (same as Windows.UI.Color).
			// Saves the ThicknessHelper.FromLengths WinRT static call on every margin change.
			(this.nativeViewProtected as any).Margin = { Left: l, Top: t, Right: r, Bottom: b } as any;
		} catch (_e) { }
	}

	//@ts-ignore
	[paddingTopProperty.setNative](_value: CoreTypes.LengthType) { this._applyPadding(); }
	//@ts-ignore
	[paddingRightProperty.setNative](_value: CoreTypes.LengthType) { this._applyPadding(); }
	//@ts-ignore
	[paddingBottomProperty.setNative](_value: CoreTypes.LengthType) { this._applyPadding(); }
	//@ts-ignore
	[paddingLeftProperty.setNative](_value: CoreTypes.LengthType) { this._applyPadding(); }

	private _applyPadding(): void {
		const native = this.nativeViewProtected as any;
		if (!native) return;
		try {
			const l = toXamlLength(this.style.paddingLeft) || 0;
			const t = toXamlLength(this.style.paddingTop) || 0;
			const r = toXamlLength(this.style.paddingRight) || 0;
			const b = toXamlLength(this.style.paddingBottom) || 0;
			const sig = `${l},${t},${r},${b}`;
			if (sig === this._lastPaddingSig) return;
			const prev = this._lastPaddingSig;
			this._lastPaddingSig = sig;
			// XAML default Padding is {0,0,0,0} — skip the WinRT call on the first zero-padding set.
			if (l === 0 && t === 0 && r === 0 && b === 0 && prev === null) return;
			native.Padding = { Left: l, Top: t, Right: r, Bottom: b } as any;
		} catch (_e) { }
	}

	//@ts-ignore
	[horizontalAlignmentProperty.setNative](value: CoreTypes.HorizontalAlignmentType) {
		const native = this.nativeViewProtected as any;
		if (!native) return;
		// WinUI HorizontalAlignment: Left=0, Center=1, Right=2, Stretch=3
		switch (value) {
			case 'left': native.HorizontalAlignment = 0; break;
			case 'center': native.HorizontalAlignment = 1; break;
			case 'right': native.HorizontalAlignment = 2; break;
			case 'stretch': native.HorizontalAlignment = 3; break;
		}
	}

	//@ts-ignore
	[verticalAlignmentProperty.setNative](value: CoreTypes.VerticalAlignmentTextType) {
		const native = this.nativeViewProtected as any;
		if (!native) return;
		// WinUI VerticalAlignment: Top=0, Center=1, Bottom=2, Stretch=3
		switch (value) {
			case 'top': native.VerticalAlignment = 0; break;
			case 'middle': native.VerticalAlignment = 1; break;
			case 'center': native.VerticalAlignment = 1; break;
			case 'bottom': native.VerticalAlignment = 2; break;
			case 'stretch': native.VerticalAlignment = 3; break;
		}
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
			if (native && typeof Windows !== 'undefined' && Windows.UI && Microsoft.UI.Xaml && Microsoft.UI.Xaml.PointHelper) {
				native.RenderTransformOrigin = Microsoft.UI.Xaml.PointHelper.FromCoordinates(value, y);
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
			if (native && typeof Windows !== 'undefined' && Windows.UI && Microsoft.UI.Xaml && Microsoft.UI.Xaml.PointHelper) {
				native.RenderTransformOrigin = Microsoft.UI.Xaml.PointHelper.FromCoordinates(x, value);
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

			// translateX/Y are in DIPs — WinUI TranslateTransform also uses DIPs. No conversion.
			transforms.translate.X = (this as any).translateX || 0;
			transforms.translate.Y = (this as any).translateY || 0;

			try {
				const ox = this.originX ?? 0.5;
				const oy = this.originY ?? 0.5;
				native.RenderTransformOrigin = Microsoft.UI.Xaml.PointHelper.FromCoordinates(ox, oy);
			} catch (_e) { }
		} catch (_e) { }
	}

	// Modal implemented as a Popup overlay (ContentDialog callbacks never reach V8).
	private _modalPopup: any;
	private _modalOverlay: any;
	private _modalAnimatedOptions: Array<boolean>;
	// Saved layout/size/alignment to restore after modal closes.
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
		this._setupAsRootView({});
		super._showNativeModalView(parent, options);

		this._raiseShowingModallyEvent();

		try {
			const popup = new Microsoft.UI.Xaml.Controls.Primitives.Popup();
			const overlay = new Microsoft.UI.Xaml.Controls.Grid();
			overlay.HorizontalAlignment = 3; // Stretch
			overlay.VerticalAlignment = 3; // Stretch
			overlay.Background = new Microsoft.UI.Xaml.Media.SolidColorBrush(Windows.UI.Colors.Transparent);

			try {
				const bounds = getCurrentWindowBounds(this.nativeViewProtected);
				if (bounds) {
					overlay.Width = bounds.Width;
					overlay.Height = bounds.Height;
				}
			} catch (_e) { }

			const showAnimated = options && options.animated === undefined ? true : !!options.animated;
			try { overlay.Opacity = showAnimated ? 0 : 1; } catch (_e) { }

			try {
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
						try {
							const bounds = getCurrentWindowBounds(this.nativeViewProtected);
							if (bounds) {
								this.width = bounds.Width;
								this.height = bounds.Height;
								(this.nativeViewProtected as any).Width = bounds.Width;
								(this.nativeViewProtected as any).Height = bounds.Height;
							}
						} catch (_e) { }
					} catch (_e) { }
				} else {
					this.horizontalAlignment = 'center';
					this.verticalAlignment = 'middle';
					try {
						(this.nativeViewProtected as any).HorizontalAlignment = 1; // Center
						(this.nativeViewProtected as any).VerticalAlignment = 1; // Center
					} catch (_e) { }

					try {
						const w = options && typeof options.width === 'number' ? options.width : options && options.ios && typeof options.ios.width === 'number' ? options.ios.width : undefined;
						const h = options && typeof options.height === 'number' ? options.height : options && options.ios && typeof options.ios.height === 'number' ? options.ios.height : undefined;
						if (typeof w === 'number' && w > 0) {
							this.width = w;
							try { (this.nativeViewProtected as any).Width = w; } catch (_e) { }
						} else {
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


			// Closed handler forwards light-dismiss to modal close logic.
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
				popup.AddHandler(Microsoft.UI.Xaml.Controls.Primitives.Popup.ClosedEvent, this._modalPopupClosedHandler, true);

			} catch (_e) { }

			// A Popup with no XamlRoot throws E_UNEXPECTED (0x8000FFFF) on open. Anchor to the XamlRoot
			// of an element already in the live tree (the modal element isn't attached yet).
			try {
				const xamlRoot = (parent as any)?.nativeViewProtected?.XamlRoot
					|| (getCurrentWindowContent() as any)?.XamlRoot
					|| (this.nativeViewProtected as any)?.XamlRoot;
				if (xamlRoot && typeof (popup as any).XamlRoot !== 'undefined') {
					(popup as any).XamlRoot = xamlRoot;
				}
			} catch (_e) { }

			popup.IsOpen = true;

			try {
				this.callLoaded();
			} catch (_e) { }

			const animated = showAnimated;
			if (!this._modalAnimatedOptions) {
				this._modalAnimatedOptions = [];
			}
			this._modalAnimatedOptions.push(animated);
			this._raiseShownModallyEvent();
			try {
				if (showAnimated && this._modalOverlay) {
					this._animateNativeOpacity(this._modalOverlay, 0, 1, 240);
				}
			} catch (_e) { }
		} catch (e) {
			console.error('[View._showNativeModalView] failed to open popup modal:', e);
		}
	}

	protected _hideNativeModalView(_parent: ViewCommon, whenClosedCallback: () => void) {
		if (this._isModalClosing) {
			whenClosedCallback();
			return;
		}
		this._isModalClosing = true;
		try {
			try {
				if (this._modalPopup && this._modalPopupClosedHandler && typeof this._modalPopup.removeEventListener === 'function') {
					try { this._modalPopup.removeEventListener('Closed', this._modalPopupClosedHandler); } catch (_e) { }
				}
			} catch (_e) { }

			const animated = this._modalAnimatedOptions && this._modalAnimatedOptions.length ? !!this._modalAnimatedOptions.pop() : true;

			const finalize = () => {
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

				try {
					if (this._modalPopup) {
						this._modalPopup.IsOpen = false;
						this._modalPopup.Child = null;
						this._modalPopup = null;
					}
					if (this._modalOverlay) {
						this._modalOverlay.Children.Clear();
						this._modalOverlay = null;
					}
				} catch (_e) { }

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

try {
	(View.prototype as any)._nativeBackgroundState = 'unset';
} catch (_e) { }

export class ContainerView extends View { }

export class CustomLayoutView extends ContainerView {

	createNativeView() {
		return new Microsoft.UI.Xaml.Controls.StackPanel();
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

				// Do NOT call UpdateLayout() / InvalidateMeasure() / InvalidateArrange() here.
				// XAML's Children.Append() / InsertAt() already marks both the new child and
				// the parent panel dirty for the next layout pass. Calling these explicitly:
				//   • nativeChild.UpdateLayout()  — forces a synchronous measure+arrange on the
				//     child's full template tree immediately after insertion (wasteful)
				//   • nativeParent.UpdateLayout() — forces a full synchronous layout of the
				//     entire panel after EACH child add, making construction O(n²): a page with
				//     50 children triggers 1+2+…+50 = 1275 forced layout passes.
				// XAML batches and defers layout to a single pass at frame time — trust it.

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
