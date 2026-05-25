export * from './text-base-common';

import { TextBaseCommon, textProperty, formattedTextProperty, textTransformProperty, resetSymbol } from './text-base-common';
import { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { colorProperty, fontInternalProperty, fontSizeProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, fontWeightProperty, fontStyleProperty } from '../styling/style-properties';
import { Length } from '../styling/length-shared';
import { FontWeightType } from '../styling/font-interfaces';

function makeThickness(options: { Left?: number; Top?: number; Right?: number; Bottom?: number }, def: Windows.UI.Xaml.Thickness): Windows.UI.Xaml.Thickness {
	const { Left, Top, Right, Bottom } = options;
	return Windows.UI.Xaml.ThicknessHelper.FromLengths(Left ?? def.Left, Top ?? def.Top, Right ?? def.Right, Bottom ?? def.Bottom);
}

function toFontWeight(value: FontWeightType): Windows.UI.Text.FontWeight | null {
	switch (value) {
		case '700':
		case 'bold':
			return Windows.UI.Text.FontWeights.Bold;
		case '400':
		case 'normal':
			return Windows.UI.Text.FontWeights.Normal;
		case '100': return Windows.UI.Text.FontWeights.Thin;
		case '200': return Windows.UI.Text.FontWeights.ExtraLight;
		case '300': return Windows.UI.Text.FontWeights.Light;
		case '500': return Windows.UI.Text.FontWeights.Medium;
		case '600': return Windows.UI.Text.FontWeights.SemiBold;
		case '800': return Windows.UI.Text.FontWeights.ExtraBold;
		case '900': return Windows.UI.Text.FontWeights.Black;
		default:
			return null;
	}
}

function fromFontWeight(value: Windows.UI.Text.FontWeight): FontWeightType {
	switch (value) {
		case Windows.UI.Text.FontWeights.Bold:
			return '700';
		case Windows.UI.Text.FontWeights.Normal:
			return '400';
		case Windows.UI.Text.FontWeights.Thin:
			return '100';
		case Windows.UI.Text.FontWeights.ExtraLight:
			return '200';
		case Windows.UI.Text.FontWeights.Light:
			return '300';
		case Windows.UI.Text.FontWeights.Medium:
			return '500';
		case Windows.UI.Text.FontWeights.SemiBold:
			return '600';
		case Windows.UI.Text.FontWeights.ExtraBold:
			return '800';
		case Windows.UI.Text.FontWeights.Black:
			return '900';
		default:
			return '400';
	}
}

function toFontStyle(value: 'normal' | 'italic' | 'oblique'): Windows.UI.Text.FontStyle | null {
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
}

function fromFontStyle(value: Windows.UI.Text.FontStyle): 'normal' | 'italic' | 'oblique' | null {
	if (value === Windows.UI.Text.FontStyle.Italic) {
		return 'italic';
	} else if (value === Windows.UI.Text.FontStyle.Oblique) {
		return 'oblique';
	} else if (value === Windows.UI.Text.FontStyle.Normal) {
		return 'normal';
	} else {
		return 'normal';
	}
}


export class TextBase extends TextBaseCommon {
	nativeViewProtected: Windows.UI.Xaml.Controls.TextBox | Windows.UI.Xaml.Controls.TextBlock | Windows.UI.Xaml.Controls.PasswordBox | Windows.UI.Xaml.Controls.Button;

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

	[colorProperty.getDefault](): Windows.UI.Xaml.Media.Brush | null {
		const nativeView = this.nativeTextViewProtected;
		return nativeView?.Foreground ?? null;
	}

	[colorProperty.setNative](value: Color | Windows.UI.Color | null | undefined) {
		if (!this.formattedText || !(value instanceof Color)) {
			try {
				if (value instanceof Color) {
					this.nativeTextViewProtected.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(value.windows);
				} else if (value != null) {
					//@ts-ignore
					if (value instanceof Windows.UI.Color) {
						this.nativeTextViewProtected.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(value as any);
					} else {
						this.nativeTextViewProtected.Foreground = new Windows.UI.Xaml.Media.SolidColorBrush(new Color(value as never).windows);
					}
				}
			} catch (_e) { }
		}
	}

	[fontSizeProperty.getDefault](): { nativeSize: number } {
		return { nativeSize: this.nativeTextViewProtected.FontSize ?? 0 };
	}

	[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (!this.formattedText || typeof value !== 'number') {
			const size = typeof value === 'number' ? value : value.nativeSize;
			this.nativeTextViewProtected.FontSize = size;
		}
	}

	[fontStyleProperty.getDefault]() {
		return fromFontStyle(this.nativeTextViewProtected.FontStyle ?? Windows.UI.Text.FontStyle.Normal);
	}

	[fontStyleProperty.setNative](value: 'normal' | 'italic' | 'oblique') {
		if (!this.formattedText) {
			const style = toFontStyle(value);
			if (!style) return;
			this.nativeTextViewProtected.FontStyle = style;
		}
	}

	[fontWeightProperty.getDefault](): FontWeightType {
		return fromFontWeight(this.nativeTextViewProtected.FontWeight ?? Windows.UI.Text.FontWeights.Normal) as FontWeightType;
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
		if (!padding) {
			return;
		}
		this.nativeTextViewProtected.Padding = makeThickness({
			Top: Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0),
		}, padding);
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}
	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) {
			return;
		}
		this.nativeTextViewProtected.Padding = makeThickness({
			Right: Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0),
		}, padding);
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}

	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) {
			return;
		}
		this.nativeTextViewProtected.Padding = makeThickness({
			Bottom: Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0),
		}, padding);
	}

	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}

	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		const padding = this.nativeTextViewProtected.Padding;
		if (!padding) {
			return;
		}
		this.nativeTextViewProtected.Padding = makeThickness({
			Left: Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0),
		}, padding);
	}


	_setNativeText(reset = false): void {
		const nativeView = this.nativeTextViewProtected as any;
		if (!nativeView) return;

		const text = reset ? '' : getTransformedText(this.text ?? '', this.textTransform);

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
