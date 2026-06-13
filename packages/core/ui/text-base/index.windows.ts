export * from './text-base-common';

import { TextBaseCommon, textProperty, formattedTextProperty, textTransformProperty, textAlignmentProperty, whiteSpaceProperty, resetSymbol, textShadowProperty, letterSpacingProperty, lineHeightProperty, textDecorationProperty } from './text-base-common';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { colorProperty, fontInternalProperty, fontSizeProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, fontWeightProperty, fontStyleProperty } from '../styling/style-properties';
import { getFontFamilyCached } from '../styling/font.windows';
import { FontWeightType } from '../styling/font-interfaces';
import type { ShadowCSSValues } from '../styling/css-shadow';
import { layout } from '../../utils';

// WinUI uses DIPs — do not multiply by density. Convert px→dip for 'px' unit values.
function toDip(value: CoreTypes.LengthType, auto = 0): number {
	if (typeof value === 'number') return value;
	if (!value || typeof value === 'string') return auto;
	const v = value as { value: number; unit: string };
	if (v.unit === 'dip') return v.value;
	if (v.unit === 'px') return v.value / (layout.getDisplayDensity?.() ?? 1);
	return auto;
}

function makeThickness(options: { Left?: number; Top?: number; Right?: number; Bottom?: number }, def: Microsoft.UI.Xaml.Thickness): Microsoft.UI.Xaml.Thickness {
	const { Left, Top, Right, Bottom } = options;
	return Microsoft.UI.Xaml.ThicknessHelper.FromLengths(Left ?? def.Left, Top ?? def.Top, Right ?? def.Right, Bottom ?? def.Bottom);
}

// Microsoft.UI.Text.FontWeights resolves in WinUI3; guarded so a future projection gap degrades gracefully.
function toFontWeight(value: FontWeightType): Microsoft.UI.Text.FontWeight | null {
	try {
		switch (value) {
			case '700':
			case 'bold':
				return Microsoft.UI.Text.FontWeights.Bold;
			case '400':
			case 'normal':
				return Microsoft.UI.Text.FontWeights.Normal;
			case '100': return Microsoft.UI.Text.FontWeights.Thin;
			case '200': return Microsoft.UI.Text.FontWeights.ExtraLight;
			case '300': return Microsoft.UI.Text.FontWeights.Light;
			case '500': return Microsoft.UI.Text.FontWeights.Medium;
			case '600': return Microsoft.UI.Text.FontWeights.SemiBold;
			case '800': return Microsoft.UI.Text.FontWeights.ExtraBold;
			case '900': return Microsoft.UI.Text.FontWeights.Black;
			default:
				return null;
		}
	} catch {
		return null;
	}
}

function fromFontWeight(value: Microsoft.UI.Text.FontWeight): FontWeightType {
	switch (value) {
		case Microsoft.UI.Text.FontWeights.Bold:
			return '700';
		case Microsoft.UI.Text.FontWeights.Normal:
			return '400';
		case Microsoft.UI.Text.FontWeights.Thin:
			return '100';
		case Microsoft.UI.Text.FontWeights.ExtraLight:
			return '200';
		case Microsoft.UI.Text.FontWeights.Light:
			return '300';
		case Microsoft.UI.Text.FontWeights.Medium:
			return '500';
		case Microsoft.UI.Text.FontWeights.SemiBold:
			return '600';
		case Microsoft.UI.Text.FontWeights.ExtraBold:
			return '800';
		case Microsoft.UI.Text.FontWeights.Black:
			return '900';
		default:
			return '400';
	}
}

// FontStyle is `Windows.UI.Text.FontStyle` — NOT `Microsoft.UI.Text` (which was NOT migrated from
// WinUI3; only FontWeights was). `Microsoft.UI.Text.FontStyle` is undefined, so `.Normal` throws.
// Guard: a throw inside applyAllNativeSetters aborts loading every following sibling, blanking the page.
function toFontStyle(value: 'normal' | 'italic' | 'oblique'): Windows.UI.Text.FontStyle | null {
	try {
		switch (value) {
			case 'italic':
				return Windows.UI.Text.FontStyle.Italic;
			case 'normal':
				return Windows.UI.Text.FontStyle.Normal;
			case 'oblique':
				return Windows.UI.Text.FontStyle.Oblique;
			default:
				return null;
		}
	} catch {
		return null;
	}
}

function fromFontStyle(value: Windows.UI.Text.FontStyle): 'normal' | 'italic' | 'oblique' {
	try {
		if (value === Windows.UI.Text.FontStyle.Italic) {
			return 'italic';
		} else if (value === Windows.UI.Text.FontStyle.Oblique) {
			return 'oblique';
		}
	} catch {
	}
	return 'normal';
}


// TextAlignment enum: Center=0, Left=1, Right=2, Justify=3 (note: NOT Left=0). undefined leaves the default.
function toTextAlignment(value: CoreTypes.TextAlignmentType): number | undefined {
	switch (value) {
		case 'center': return 0;
		case 'left': return 1;
		case 'right': return 2;
		case 'justify': return 3;
		default: return undefined;
	}
}

// Windows.UI.Text.TextDecorations flags: None=0, Underline=1, Strikethrough=2.
function toTextDecorations(value: CoreTypes.TextDecorationType): number {
	const v = value || 'none';
	let flags = 0;
	if (v.includes('underline')) flags |= 1;
	if (v.includes('line-through')) flags |= 2;
	return flags;
}

const HYPERLINK_CLICK_TYPE = 'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Documents.Hyperlink,Microsoft.UI.Xaml.Documents.HyperlinkClickEventArgs>';

// Build TextBlock.Inlines from a NativeScript FormattedString, applying per-span font/color/
// decoration. Falls back to plain text for views without an Inlines property (TextBox, Button).
function _buildFormattedInlines(formattedText: any, inlines: any): void {
	inlines.Clear();
	const spans = formattedText?.spans;
	if (!spans) return;

	// text-transform on the host Label applies to every span's text (matches iOS/Android).
	const textTransform = formattedText?.parent?.textTransform;

	for (let i = 0; i < spans.length; i++) {
		const span = spans.getItem(i);
		const run = new Microsoft.UI.Xaml.Documents.Run();
		const spanText = span.text ?? '';
		run.Text = textTransform && textTransform !== 'none' ? getTransformedText(spanText, textTransform) : spanText;

		if (span.fontFamily) {
			const ff = getFontFamilyCached(span.fontFamily);
			if (ff) run.FontFamily = ff;
		}
		if (span.fontSize) run.FontSize = span.fontSize;
		if (span.fontStyle) {
			const fs = toFontStyle(span.fontStyle);
			if (fs !== null) run.FontStyle = fs;
		}
		if (span.fontWeight) {
			const fw = toFontWeight(span.fontWeight);
			if (fw !== null) run.FontWeight = fw;
		}
		if (span.color) {
			try { run.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush((span.color as any).windows); } catch (_e) {}
		}

		// Span-level decoration only — host-level decoration is set on the TextBlock itself and
		// renders block-wide without needing per-run flags.
		const flags = toTextDecorations(span.textDecoration);
		if (flags) {
			run.TextDecorations = flags;
		}

		// Tappable spans → wrap the Run in a Hyperlink (XAML hit-tests it and raises Click).
		// UnderlineStyle=None keeps the span's own styling; the delegate is parked on the span so
		// it isn't GC'd while only the native Click holds it.
		if (span.tappable) {
			try {
				const link = new Microsoft.UI.Xaml.Documents.Hyperlink();
				try { link.UnderlineStyle = 0 as never; } catch (_e) {}
				if (span.color) {
					try { link.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush((span.color as any).windows); } catch (_e) {}
				}
				const del = NSWinRT.asDelegate(HYPERLINK_CLICK_TYPE, () => span._emit('linkTap'));
				(span as any).__winLinkDelegate = del;
				link.Click = del as never;
				link.Inlines.Append(run);
				inlines.Append(link);
				continue;
			} catch (_e) { /* fall back to a plain, non-tappable run */ }
		}
		inlines.Append(run);
	}
}

// Module-level foreground brush cache. Avoids creating a new SolidColorBrush COM object for
// every text view that shares the same color. Foreground brushes are not mutated by animations
// (NativeScript's color animation calls setNative per frame, re-assigning Foreground rather than
// targeting the brush's Color property directly), so sharing is safe.
const _fgBrushCache = new Map<number, any>(); // argb → SolidColorBrush
const _FG_BRUSH_MAX = 32;

export class TextBase extends TextBaseCommon {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.TextBox | Microsoft.UI.Xaml.Controls.TextBlock | Microsoft.UI.Xaml.Controls.PasswordBox | Microsoft.UI.Xaml.Controls.Button;

	[textProperty.getDefault](): symbol {
		return resetSymbol;
	}

	[textProperty.setNative](value: string | symbol): void {
		const reset = value === resetSymbol;
		if (!reset && this.formattedText) {
			return;
		}
		this._setNativeText(reset);
	}

	private _textShadowVisual: Microsoft.UI.Composition.SpriteVisual | null = null;
	private _wrapTextBlock: Microsoft.UI.Xaml.Controls.TextBlock | null = null;
	// Active text-shadow for a TextBox (TextField/TextView). The C++ glyph mask is a snapshot, so we
	// remember the value and rebuild it when the text changes. null when no shadow / not a TextBox.
	private _textBoxShadow: ShadowCSSValues | null = null;

	// Apply (or clear) a CSS text-shadow on a WinUI TextBox via the C++ TextShadowHelper, which draws
	// the glyph alpha mask on a GPU composition surface (no PNG) and attaches a DropShadow.
	private _applyTextBoxShadow(nv: any, value: ShadowCSSValues): void {
		try {
			if (!value || !value.color) {
				this._textBoxShadow = null;
				NativeScript.Widgets.TextShadowHelper.Clear(nv);
				return;
			}
			this._textBoxShadow = value;
			const argb = ((value.color as Color & { argb: number }).argb) >>> 0;
			NativeScript.Widgets.TextShadowHelper.Apply(nv, argb, toDip(value.blurRadius, 0), toDip(value.offsetX, 0), toDip(value.offsetY, 0));
		} catch (_e) { }
	}

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[textShadowProperty.setNative](value: ShadowCSSValues) {
		// Guarded: a throw here would abort page setup / navigation.
		try {
			const nv = this.nativeTextViewProtected as any;
			if (!nv) {
				return;
			}
			// Resolve the TextBlock whose text silhouette (GetAlphaMask) the shadow is cast from:
			//  • Label IS a TextBlock → use it directly.
			//  • Button has plain string Content (no alpha mask) → hoist it into a TextBlock (shared with
			//    the decoration / white-space hoist) and shadow that, matching iOS (shadow on all text).
			//  • TextField/TextView are a WinUI TextBox: no GetAlphaMask and no Content to hoist, so a
			//    composition text-shadow can't be produced there (WinUI capability gap).
			let tv: any = nv;
			if (typeof nv.GetAlphaMask !== 'function') {
				if (typeof nv.Content !== 'undefined' && typeof nv.TextWrapping === 'undefined') {
					if (!this._wrapTextBlock) {
						const tb = new Microsoft.UI.Xaml.Controls.TextBlock();
						tb.Text = getTransformedText(this.text ?? '', this.textTransform);
						nv.Content = tb;
						this._wrapTextBlock = tb;
					}
					tv = this._wrapTextBlock;
				} else {
					// TextField/TextView are a WinUI TextBox (no GetAlphaMask, no hoistable Content). The
					// C++ TextShadowHelper rasterizes the glyphs onto a GPU composition surface and applies
					// the same DropShadow mask — no PNG round-trip, so it's cheap to redraw. Remember the
					// value so the snapshot mask can be rebuilt when the text changes (see _setNativeText).
					this._applyTextBoxShadow(nv, value);
					return;
				}
			}
			const host = Microsoft.UI.Xaml.Hosting.ElementCompositionPreview.GetElementVisual(tv);
			const compositor = host.Compositor;

			if (this._textShadowVisual) {
				Microsoft.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(tv, null as never);
				this._textShadowVisual = null;
			}
			if (!value || !value.color || typeof tv.GetAlphaMask !== 'function') {
				return;
			}

			// GetAlphaMask gives the text's exact silhouette as a CompositionBrush — the correct
			// mask for a text DropShadow (WinUI's canonical text-shadow technique).
			const sprite = compositor.CreateSpriteVisual();
			// Track the host element's size natively. Expression animations on `Size` throw E_INVALIDARG
			// in this V8/UWP composition projection (same gotcha documented in CompositionBorderHandler),
			// which left the sprite at Size 0 → the DropShadow had no area to cast → text-shadow was
			// invisible. RelativeSizeAdjustment(1,1) tracks the parent (the text element) size natively.
			sprite.RelativeSizeAdjustment = new Windows.Foundation.Numerics.Vector2(1, 1);

			const drop = compositor.CreateDropShadow();
			drop.Mask = tv.GetAlphaMask();
			drop.Color = (value.color as Color & { windows: Windows.UI.Color }).windows;
			drop.BlurRadius = toDip(value.blurRadius, 0);
			drop.Offset = new Windows.Foundation.Numerics.Vector3(toDip(value.offsetX, 0), toDip(value.offsetY, 0), 0);
			// Sprite has no fill brush, so only the shadow paints (the crisp text still renders
			// from the TextBlock itself).
			sprite.Shadow = drop;

			Microsoft.UI.Xaml.Hosting.ElementCompositionPreview.SetElementChildVisual(tv, sprite);
			this._textShadowVisual = sprite;
		} catch (_e) {}
	}

	[colorProperty.getDefault](): Microsoft.UI.Xaml.Media.Brush | null {
		const nativeView = this.nativeTextViewProtected;
		return nativeView?.Foreground ?? null;
	}

	[colorProperty.setNative](value: Color | Windows.UI.Color | null | undefined) {
		if (!this.formattedText || !(value instanceof Color)) {
			try {
				let brush: any = null;
				if (value instanceof Color) {
					// Reuse cached brush for the same ARGB — avoids a new SolidColorBrush COM object
					// per text view when multiple views share the same color (e.g. theme text color).
					const argb = (value as any).argb as number;
					brush = _fgBrushCache.get(argb) ?? null;
					if (!brush) {
						brush = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows);
						if (_fgBrushCache.size >= _FG_BRUSH_MAX) {
							_fgBrushCache.delete(_fgBrushCache.keys().next().value);
						}
						_fgBrushCache.set(argb, brush);
					}
				} else if (value != null) {
					//@ts-ignore
					if (value instanceof Windows.UI.Color) {
						brush = new Microsoft.UI.Xaml.Media.SolidColorBrush(value as any);
					} else {
						brush = new Microsoft.UI.Xaml.Media.SolidColorBrush(new Color(value as never).windows);
					}
				}
				if (brush) {
					this.nativeTextViewProtected.Foreground = brush;
					// Override ButtonForeground resource so the XAML template binding picks up
					// our colour even when the Normal-state VSM animation replaces it.
					try { (this.nativeTextViewProtected as any).Resources.Insert('ButtonForeground', brush); } catch (_re) {}
					try { (this.nativeTextViewProtected as any).Resources.Insert('ButtonForegroundPointerOver', brush); } catch (_re) {}
					try { (this.nativeTextViewProtected as any).Resources.Insert('ButtonForegroundPressed', brush); } catch (_re) {}
				}
			} catch (_e) { }
		}
	}

	[fontSizeProperty.getDefault](): { nativeSize: number } {
		// WinUI3 default FontSize = 14. Hardcoded to avoid a WinRT property read per text view
		// during applyAllNativeSetters — saves 1 WinRT call per Label/Button/TextField created.
		return { nativeSize: 14 };
	}

	[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (!this.formattedText || typeof value !== 'number') {
			const size = typeof value === 'number' ? value : value.nativeSize;
			this.nativeTextViewProtected.FontSize = size;
		}
	}

	[fontStyleProperty.getDefault]() {
		// WinUI3 default FontStyle = Normal for all standard text controls.
		// Hardcoded to avoid a WinRT read per text view.
		return 'normal';
	}

	[fontStyleProperty.setNative](value: 'normal' | 'italic' | 'oblique') {
		if (!this.formattedText) {
			const style = toFontStyle(value);
			if (!style) return;
			this.nativeTextViewProtected.FontStyle = style;
		}
	}

	[fontWeightProperty.getDefault](): FontWeightType {
		// WinUI3 default FontWeight = Normal (400) for TextBlock, Button, TextBox, etc.
		// Hardcoded to avoid a WinRT read per text view; saves 1 WinRT call during creation.
		return '400' as FontWeightType;
	}

	[fontWeightProperty.setNative](value: FontWeightType) {
		const weight = toFontWeight(value);
		if (!weight) return;
		this.nativeTextViewProtected.FontWeight = weight;
	}

	[fontInternalProperty.setNative](value: any) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;

		if (value) {
			value?.applyWindowsFont?.(nativeView);

			if (value?.fontStyle) {
				const style = toFontStyle(value.fontStyle);
				if (style) {
					nativeView.FontStyle = style;
				}
			}
			if (value?.fontWeight) {
				const weight = toFontWeight(value.fontWeight);
				if (weight) {
					nativeView.FontWeight = weight;
				}
			}

			if (value?.fontSize) {
				nativeView.FontSize = value.fontSize;
			}
			
		}
	}

	[formattedTextProperty.setNative](value: any): void {
		const nativeView = this.nativeTextViewProtected as any;
		// Sync the `text` mirror FIRST so the plain-text fallback below (TextBox/PasswordBox have no
		// rich Inlines) reads the current value, not the stale one.
		textProperty.nativeValueChange(this, !value ? '' : value.toString());
		if (value && nativeView) {
			let inlinesHost = nativeView;
			if (typeof nativeView.Inlines === 'undefined' && typeof nativeView.Content !== 'undefined') {
				// Button: no Inlines on the control itself — host the spans in a TextBlock Content.
				if (!this._wrapTextBlock) {
					this._wrapTextBlock = new Microsoft.UI.Xaml.Controls.TextBlock();
					nativeView.Content = this._wrapTextBlock;
					// The Button itself has no TextDecorations — carry the host-level value over
					// to the freshly created TextBlock.
					this._wrapTextBlock.TextDecorations = toTextDecorations(this.style.textDecoration);
				}
				inlinesHost = this._wrapTextBlock;
			}
			if (typeof inlinesHost.Inlines !== 'undefined') {
				_buildFormattedInlines(value, inlinesHost.Inlines);
			} else {
				// TextBox/PasswordBox: no rich text support — plain text fallback.
				this._setNativeText();
			}
		} else {
			this._setNativeText();
		}
	}

	[textTransformProperty.setNative](_value: CoreTypes.TextTransformType): void {
		if (this.formattedText) {
			// Rebuild the spans so the new transform applies to each span's text.
			this[formattedTextProperty.setNative](this.formattedText);
			return;
		}
		this._setNativeText();
	}

	[paddingTopProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingTop, unit: 'px' };
	}
	[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) return;
		this.nativeTextViewProtected.Padding = makeThickness({
			Top: toDip(value) + toDip(this.style.borderTopWidth),
		}, padding);
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}
	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) return;
		this.nativeTextViewProtected.Padding = makeThickness({
			Right: toDip(value) + toDip(this.style.borderRightWidth),
		}, padding);
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}
	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) return;
		this.nativeTextViewProtected.Padding = makeThickness({
			Bottom: toDip(value) + toDip(this.style.borderBottomWidth),
		}, padding);
	}

	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}
	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) return;
		this.nativeTextViewProtected.Padding = makeThickness({
			Left: toDip(value) + toDip(this.style.borderLeftWidth),
		}, padding);
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;
		const ta = toTextAlignment(value);
		if (ta === undefined) return;
		// A wrapping Button hoists its text into a TextBlock; the Button itself has no TextAlignment.
		if (this._wrapTextBlock) {
			(this._wrapTextBlock as any).TextAlignment = ta;
		}
		if (typeof nativeView.TextAlignment !== 'undefined') {
			nativeView.TextAlignment = ta;
		}
	}

	// TextWrapping: NoWrap=1, Wrap=2, WrapWholeWords=3
	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;

		// Button has no TextWrapping — use a TextBlock as its Content so word-wrap works.
		if (typeof nativeView.TextWrapping === 'undefined' && typeof nativeView.Content !== 'undefined') {
			if (value !== 'nowrap') {
				if (!this._wrapTextBlock) {
					const tb = new Microsoft.UI.Xaml.Controls.TextBlock();
					// Read the text from the model, not nativeView.Content: a Button's Content getter does
				// NOT return a JS string after boxing (it's an IInspectable wrapper), so the old
				// `=== 'string'` check failed and the TextBlock was created empty → blank Button.
				tb.Text = getTransformedText(this.text ?? '', this.textTransform);
					nativeView.Content = tb;
					nativeView.HorizontalContentAlignment = 3; // Stretch
					// Carry the host's text-align onto the new TextBlock (may have been applied earlier).
					const wrapTa = toTextAlignment(this.style.textAlignment);
					if (wrapTa !== undefined) tb.TextAlignment = wrapTa;
					this._wrapTextBlock = tb;
				}
				(this._wrapTextBlock as any).TextWrapping = 2; // Wrap
			} else {
				if (this._wrapTextBlock) {
					nativeView.Content = (this._wrapTextBlock as any).Text;
					nativeView.HorizontalContentAlignment = 1; // Center (default)
					this._wrapTextBlock = null;
				}
			}
			return;
		}

		nativeView.TextWrapping = (value === 'nowrap') ? 1 : 3; // NoWrap or WrapWholeWords
	}

	// CharacterSpacing is in 1/1000 em units; NativeScript letterSpacing is in em.
	// @ts-ignore — setNative is a symbol index
	[letterSpacingProperty.setNative](value: number) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;
		if (typeof nativeView.CharacterSpacing !== 'undefined') {
			nativeView.CharacterSpacing = Math.round((value || 0) * 1000);
		}
	}

	// @ts-ignore — setNative is a symbol index
	[lineHeightProperty.setNative](value: number) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;
		// TextBlock.LineHeight: 0 = auto (default), positive value = exact line height in DIPs.
		// TextBox/Button have no LineHeight property; the undefined-check makes this a no-op there.
		if (typeof nativeView.LineHeight !== 'undefined') {
			nativeView.LineHeight = value > 0 ? value : 0;
		}
	}

	// @ts-ignore — setNative is a symbol index
	[textDecorationProperty.setNative](value: CoreTypes.TextDecorationType) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;
		const flags = toTextDecorations(value);
		// Property existence on COM proxies must be checked via value access, not `in`.
		let host = (this._wrapTextBlock as any) ?? nativeView;
		if (host.TextDecorations === undefined && flags && typeof nativeView.Content !== 'undefined') {
			// Button: string Content can't render decorations — hoist it into a TextBlock.
			if (!this._wrapTextBlock) {
				const tb = new Microsoft.UI.Xaml.Controls.TextBlock();
				// Read the text from the model, not nativeView.Content: a Button's Content getter does
				// NOT return a JS string after boxing (it's an IInspectable wrapper), so the old
				// `=== 'string'` check failed and the TextBlock was created empty → blank Button.
				tb.Text = getTransformedText(this.text ?? '', this.textTransform);
				nativeView.Content = tb;
				this._wrapTextBlock = tb;
			}
			host = this._wrapTextBlock;
		}
		if (host.TextDecorations !== undefined) {
			host.TextDecorations = flags;
		}
		// TextBox/PasswordBox have no TextDecorations — no-op there (matches WinUI capability).
	}


	_setNativeText(reset = false): void {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;

		const transformed = reset ? '' : getTransformedText(this.text ?? '', this.textTransform);
		// Native Text/Content are HSTRING — a non-string value (e.g. a number bound straight from a
		// ListView item) fails to marshal with 0x80004005. Coerce so any bound value renders as text.
		const text = typeof transformed === 'string' ? transformed : String(transformed ?? '');

		if (typeof nativeView.Text !== 'undefined') {
			nativeView.Text = text;
			// The TextBox shadow mask is a glyph snapshot (no live GetAlphaMask) — rebuild it on text
			// change so the shadow tracks the new text. Only set for a TextBox.
			if (this._textBoxShadow) {
				this._applyTextBoxShadow(nativeView, this._textBoxShadow);
			}
		} else if (typeof nativeView.Password !== 'undefined') {
			// Secure TextField → PasswordBox, which has no Text property; its value is Password.
			nativeView.Password = text;
		} else if (this._wrapTextBlock) {
			// Button in wrap mode: update the inner TextBlock, not the Button.Content directly.
			(this._wrapTextBlock as any).Text = text;
		} else if (typeof nativeView.Content !== 'undefined') {
			nativeView.Content = text;
		}
	}
}

export function getTransformedText(text: string, textTransform: CoreTypes.TextTransformType): string {
	if (!text || !textTransform || textTransform === 'none') {
		return text;
	}
	switch (textTransform) {
		case 'uppercase':
			return text.toUpperCase();
		case 'lowercase':
			return text.toLowerCase();
		case 'capitalize':
			return text.replace(/\b\w/g, (c) => c.toUpperCase());
		default:
			return text;
	}
}
