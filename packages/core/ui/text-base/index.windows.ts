export * from './text-base-common';

import { TextBaseCommon, textProperty, formattedTextProperty, textTransformProperty, textAlignmentProperty, whiteSpaceProperty, resetSymbol, textShadowProperty } from './text-base-common';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { colorProperty, fontInternalProperty, fontSizeProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, fontWeightProperty, fontStyleProperty } from '../styling/style-properties';
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

	// @ts-ignore — setNative is a symbol index whose value type is widened across properties.
	[textShadowProperty.setNative](value: ShadowCSSValues) {
		// Guarded: a throw here would abort page setup / navigation.
		try {
			const tv = this.nativeTextViewProtected as Microsoft.UI.Xaml.Controls.TextBlock;
			if (!tv) {
				return;
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
			const sizeAnim = compositor.CreateExpressionAnimation('host.Size');
			sizeAnim.SetReferenceParameter('host', host);
			sprite.StartAnimation('Size', sizeAnim);

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
		this._setNativeText();
		textProperty.nativeValueChange(this, !value ? '' : value.toString());
	}

	[textTransformProperty.setNative](_value: CoreTypes.TextTransformType): void {
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

	// TextAlignment: Left=0, Center=1, Right=2, Justify=3
	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;
		switch (value) {
			case 'left': nativeView.TextAlignment = 0; break;
			case 'center': nativeView.TextAlignment = 1; break;
			case 'right': nativeView.TextAlignment = 2; break;
			case 'justify': nativeView.TextAlignment = 3; break;
		}
	}

	// TextWrapping: NoWrap=1, Wrap=2, WrapWholeWords=3
	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;
		nativeView.TextWrapping = (value === 'nowrap') ? 1 : 3; // NoWrap or WrapWholeWords
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
