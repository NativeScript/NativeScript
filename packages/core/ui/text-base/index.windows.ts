export * from './text-base-common';

import { TextBaseCommon, textProperty, formattedTextProperty, textTransformProperty, resetSymbol } from './text-base-common';
import type { CoreTypes } from '../../core-types';
import { Color } from '../../color';
import { colorProperty, fontSizeProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty } from '../styling/style-properties';
import { Length } from '../styling/length-shared';


function makeThickness(options: { Left?: number; Top?: number; Right?: number; Bottom?: number }, def: Windows.UI.Xaml.Thickness): Windows.UI.Xaml.Thickness {
	const { Left, Top, Right, Bottom } = options;
	return Windows.UI.Xaml.ThicknessHelper.FromLengths(Left ?? def.Left, Top ?? def.Top, Right ?? def.Right, Bottom ?? def.Bottom);
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
			Left: Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0),
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
