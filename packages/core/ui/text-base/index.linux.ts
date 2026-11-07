import { Font } from '../styling/font';
import { TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty, textTransformProperty, textShadowProperty, letterSpacingProperty, lineHeightProperty, maxLinesProperty, whiteSpaceProperty, textOverflowProperty, resetSymbol } from './text-base-common';
import { Color } from '../../color';
import { FormattedString } from './formatted-string';
import { Span } from './span';
import { colorProperty, fontInternalProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty } from '../styling/style-properties';
import { ShadowCSSValues } from '../styling/css-shadow';
import { Length } from '../styling/length-shared';
import { isString, isNullOrUndefined } from '../../utils/types';
import { CoreTypes } from '../../core-types';
import { px, setWidgetCss } from '../styling/gtk-style.linux';

export * from './text-base-common';

function escapeMarkup(text: string): string {
	return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function hex(color: Color): string {
	const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
	return `#${h(color.r)}${h(color.g)}${h(color.b)}${h(color.a)}`;
}

/** Pango markup span for a FormattedString span. */
function spanMarkup(span: Span, text: string): string {
	const style = span.style;
	const attrs: string[] = [];
	if (style.color) attrs.push(`foreground="${hex(style.color)}"`);
	if (style.backgroundColor) attrs.push(`background="${hex(style.backgroundColor)}"`);
	if (style.fontFamily) attrs.push(`font_family="${escapeMarkup(style.fontFamily)}"`);
	// Pango sizes are in 1024ths of a point (96 dpi: 0.75 pt per px)
	if (style.fontSize) attrs.push(`size="${Math.round(style.fontSize * 0.75 * 1024)}"`);
	if (style.fontWeight && style.fontWeight !== 'normal') attrs.push(`weight="${style.fontWeight === 'bold' ? 700 : style.fontWeight}"`);
	if (style.fontStyle === 'italic') attrs.push('style="italic"');
	const decoration = style.textDecoration || '';
	if (decoration.includes('underline')) attrs.push('underline="single"');
	if (decoration.includes('line-through')) attrs.push('strikethrough="true"');
	const body = escapeMarkup(text);
	return attrs.length ? `<span ${attrs.join(' ')}>${body}</span>` : body;
}

export class TextBase extends TextBaseCommon {
	// @ts-ignore
	nativeViewProtected: any;

	/** The GtkLabel showing the text (the native view, or a child of it). */
	get nativeTextViewProtected(): any {
		return this.nativeViewProtected;
	}

	/** Shows `text` (Pango markup when `markup`). */
	_setLinuxText(text: string, markup: boolean): void {
		const label = this.nativeTextViewProtected;
		if (!label) {
			return;
		}
		if (markup) {
			gtk_label_set_markup(label, text);
		} else {
			gtk_label_set_text(label, text);
		}
	}

	[textProperty.getDefault](): number | symbol {
		return resetSymbol;
	}

	[textProperty.setNative](value: string | number | symbol) {
		const reset = value === resetSymbol;
		if (!reset && this.formattedText) {
			return;
		}
		this._setNativeText(reset);
		this._requestLayoutOnTextChanged();
	}

	[formattedTextProperty.setNative](value: FormattedString) {
		this._setNativeText();
		this._requestLayoutOnTextChanged();
	}

	_setNativeText(reset = false): void {
		if (reset) {
			this._setLinuxText('', false);
			return;
		}
		if (this.formattedText) {
			this._setLinuxText(this.getFormattedMarkup(this.formattedText), true);
		} else {
			this._setLinuxText(getTransformedText(isNullOrUndefined(this.text) ? '' : `${this.text}`, this.textTransform), false);
		}
	}

	getFormattedMarkup(formattedString: FormattedString): string {
		let markup = '';
		const textTransform = this.textTransform;
		for (let i = 0; i < formattedString.spans.length; i++) {
			const span = formattedString.spans.getItem(i);
			const text = isNullOrUndefined(span.text) ? '' : `${span.text}`;
			markup += spanMarkup(span, textTransform !== 'none' && textTransform !== 'initial' ? getTransformedText(text, textTransform) : text);
		}
		return markup;
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}

	[fontInternalProperty.setNative](value: Font) {
		setWidgetCss(this.nativeViewProtected, 'font', value instanceof Font ? (value as any).linuxCss : '');
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		const label = this.nativeTextViewProtected;
		if (!label || !g_type_check_instance_is_a(label, gtk_label_get_type())) {
			return;
		}
		const xalign = value === 'center' ? 0.5 : value === 'right' ? 1 : 0;
		gtk_label_set_xalign(label, xalign);
		gtk_label_set_justify(label, value === 'center' ? GtkJustification.CENTER : value === 'right' ? GtkJustification.RIGHT : value === 'justify' ? GtkJustification.FILL : GtkJustification.LEFT);
	}

	[textDecorationProperty.setNative](value: CoreTypes.TextDecorationType) {
		const lines = `${value || ''}`.split(' ').filter((v) => v === 'underline' || v === 'line-through');
		setWidgetCss(this.nativeViewProtected, 'decoration', lines.length ? `text-decoration-line:${lines.join(' ')};` : '');
	}

	[textTransformProperty.setNative](value: CoreTypes.TextTransformType) {
		this._setNativeText();
	}

	[letterSpacingProperty.setNative](value: number) {
		// letter-spacing is in em
		const size = this.style.fontSize || 14;
		setWidgetCss(this.nativeViewProtected, 'letterSpacing', value ? `letter-spacing:${px(value * size)};` : '');
	}

	[lineHeightProperty.setNative](value: number) {
		setWidgetCss(this.nativeViewProtected, 'lineHeight', value ? `line-height:${px(value)};` : '');
	}

	[textShadowProperty.setNative](value: ShadowCSSValues) {
		if (!value) {
			setWidgetCss(this.nativeViewProtected, 'textShadow', '');
			return;
		}
		const x = Length.toDevicePixels(value.offsetX, 0);
		const y = Length.toDevicePixels(value.offsetY, 0);
		const blur = Length.toDevicePixels(value.blurRadius, 0);
		setWidgetCss(this.nativeViewProtected, 'textShadow', `text-shadow:${px(x)} ${px(y)} ${px(blur)} ${value.color ? value.color.linux : 'black'};`);
	}

	[maxLinesProperty.setNative](value: CoreTypes.MaxLinesType) {
		const label = this.nativeTextViewProtected;
		if (!label || !g_type_check_instance_is_a(label, gtk_label_get_type())) {
			return;
		}
		const lines = typeof value === 'number' && value > 0 ? value : -1;
		gtk_label_set_lines(label, lines);
		if (lines > 0) {
			gtk_label_set_wrap(label, 1);
			gtk_label_set_ellipsize(label, PangoEllipsizeMode.END);
		}
	}

	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		this._applyWrapping();
	}

	[textOverflowProperty.setNative](value: CoreTypes.TextOverflowType) {
		this._applyWrapping();
	}

	_applyWrapping(): void {
		const label = this.nativeTextViewProtected;
		if (!label || !g_type_check_instance_is_a(label, gtk_label_get_type())) {
			return;
		}
		const wrap = this.whiteSpace !== 'nowrap';
		gtk_label_set_wrap(label, wrap ? 1 : 0);
		gtk_label_set_wrap_mode(label, PangoWrapMode.WORD_CHAR);
		gtk_label_set_ellipsize(label, !wrap && this.textOverflow !== 'clip' ? PangoEllipsizeMode.END : PangoEllipsizeMode.NONE);
		this.requestLayout();
	}

	private _padding(): void {
		const values = [this.effectivePaddingTop, this.effectivePaddingRight, this.effectivePaddingBottom, this.effectivePaddingLeft];
		setWidgetCss(this.nativeViewProtected, 'padding', values.some((v) => v) ? `padding:${values.map((v) => px(v || 0)).join(' ')};` : '');
	}

	// @ts-ignore
	[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
		this._padding();
	}

	// @ts-ignore
	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		this._padding();
	}

	// @ts-ignore
	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		this._padding();
	}

	// @ts-ignore
	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		this._padding();
	}
}

export function getTransformedText(text: string, textTransform: CoreTypes.TextTransformType): string {
	if (!text || !isString(text)) {
		return '';
	}
	switch (textTransform) {
		case 'uppercase':
			return text.toLocaleUpperCase();
		case 'lowercase':
			return text.toLocaleLowerCase();
		case 'capitalize':
			return text.replace(/(^|\s)(\S)/g, (_, space, c) => space + c.toLocaleUpperCase());
		default:
			return text;
	}
}
