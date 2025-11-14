import { getClosestPropertyValue, maxLinesProperty, textOverflowProperty } from './text-base-common';
import { ShadowCSSValues } from '../styling/css-shadow';
import { Font } from '../styling/font';
import { TextBaseCommon, formattedTextProperty, textAlignmentProperty, textDecorationProperty, textProperty, textTransformProperty, textShadowProperty, textStrokeProperty, letterSpacingProperty, whiteSpaceProperty, lineHeightProperty, resetSymbol } from './text-base-common';
import { Color } from '../../color';
import { colorProperty, fontSizeProperty, fontInternalProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, directionProperty } from '../styling/style-properties';
import { Length } from '../styling/length-shared';
import { StrokeCSSValues } from '../styling/css-stroke';
import { FormattedString } from './formatted-string';
import { Span } from './span';
import { CoreTypes } from '../../core-types';
import { layout } from '../../utils';
import { SDK_VERSION } from '../../utils/constants';
import { _getStoredClassDefaultPropertyValue } from '../core/properties';
import { isString, isNullOrUndefined } from '../../utils/types';
import { accessibilityIdentifierProperty } from '../../accessibility/accessibility-properties';
import { testIDProperty } from '../core/view';
import { isCssWideKeyword } from '../core/properties/property-shared';

export * from './text-base-common';

interface ClickableSpan {
	new (owner: Span): android.text.style.ClickableSpan;
}

let ClickableSpan: ClickableSpan;

function initializeClickableSpan(): void {
	if (ClickableSpan) {
		return;
	}

	@NativeClass
	class ClickableSpanImpl extends android.text.style.ClickableSpan {
		owner: WeakRef<Span>;

		constructor(owner: Span) {
			super();
			this.owner = new WeakRef(owner);

			return global.__native(this);
		}
		onClick(view: android.view.View): void {
			const owner = this.owner?.get();
			if (owner) {
				owner._emit(Span.linkTapEvent);
			}
			view.clearFocus();
			view.invalidate();
		}
		updateDrawState(tp: android.text.TextPaint): void {
			// don't style as link
		}
	}

	ClickableSpan = ClickableSpanImpl;
}

interface BaselineAdjustedSpan {
	new (fontSize: number, align?: CoreTypes.VerticalAlignmentTextType): android.text.style.MetricAffectingSpan;
}

let BaselineAdjustedSpan: BaselineAdjustedSpan;

function initializeBaselineAdjustedSpan(): void {
	if (BaselineAdjustedSpan) {
		return;
	}
	@NativeClass
	class BaselineAdjustedSpanImpl extends android.text.style.MetricAffectingSpan {
		fontSize: number;
		align: CoreTypes.VerticalAlignmentTextType = 'baseline';

		constructor(fontSize: number, align?: CoreTypes.VerticalAlignmentTextType) {
			super();

			this.align = align;
			this.fontSize = fontSize;
		}

		updateDrawState(paint: android.text.TextPaint) {
			this.updateState(paint);
		}

		updateMeasureState(paint: android.text.TextPaint) {
			this.updateState(paint);
		}

		updateState(paint: android.text.TextPaint) {
			const metrics = paint.getFontMetrics();

			if (!this.align || ['baseline', 'stretch'].includes(this.align)) {
				return;
			}

			if (this.align === 'top') {
				return (paint.baselineShift = -this.fontSize - metrics.bottom - metrics.top);
			}

			if (this.align === 'bottom') {
				return (paint.baselineShift = metrics.bottom);
			}

			if (this.align === 'text-top') {
				return (paint.baselineShift = -this.fontSize - metrics.descent - metrics.ascent);
			}

			if (this.align === 'text-bottom') {
				return (paint.baselineShift = metrics.bottom - metrics.descent);
			}

			if (this.align === 'middle') {
				return (paint.baselineShift = (metrics.descent - metrics.ascent) / 2 - metrics.descent);
			}

			if (this.align === 'sup') {
				return (paint.baselineShift = -this.fontSize * 0.4);
			}

			if (this.align === 'sub') {
				return (paint.baselineShift = (metrics.descent - metrics.ascent) * 0.4);
			}
		}
	}

	BaselineAdjustedSpan = BaselineAdjustedSpanImpl;
}

export class TextBase extends TextBaseCommon {
	public nativeViewProtected: org.nativescript.widgets.StyleableTextView;

	private _paintFlags: number;
	private _tappable = false;
	private _defaultMovementMethod: android.text.method.MovementMethod;
	// so that we dont set fontInternal when setting fontSize (useless)
	protected handleFontSize = true;

	get nativeTextViewProtected(): org.nativescript.widgets.StyleableTextView {
		return super.nativeTextViewProtected;
	}

	public initNativeView(): void {
		super.initNativeView();
		initializeTextTransformation();

		const nativeView = this.nativeTextViewProtected;

		// Fix for custom font over-height issue on Android
		// Disable font padding to prevent extra spacing around text
		nativeView.setIncludeFontPadding(false);

		if (layout.hasRtlSupport() && this._isManualRtlTextStyleNeeded) {
			// This is a default to match iOS layout direction behaviour
			nativeView.setTextAlignment(android.view.View.TEXT_ALIGNMENT_VIEW_START);
		}
	}

	public disposeNativeView(): void {
		super.disposeNativeView();

		this._tappable = false;
	}

	[textProperty.getDefault](): symbol | number {
		return resetSymbol;
	}

	[textProperty.setNative](value: string | number | symbol) {
		const reset = value === resetSymbol;
		if (!reset && this.formattedText) {
			return;
		}

		this._setTappableState(false);

		this._setNativeText(reset);
	}
	[textStrokeProperty.setNative](value: StrokeCSSValues) {
		this._setNativeText();
	}
	createFormattedTextNative(value: FormattedString) {
		return createSpannableStringBuilder(value, this.style.fontSize);
	}
	[formattedTextProperty.setNative](value: FormattedString) {
		const nativeView = this.nativeTextViewProtected;

		// Don't change the transformation method if this is secure TextField or we'll lose the hiding characters.
		if ((<any>this).secure) {
			return;
		}

		const spannableStringBuilder = this.createFormattedTextNative(value);
		nativeView.setText(<any>spannableStringBuilder);
		this._setTappableState(isStringTappable(value));
	}

	[textTransformProperty.getDefault](): CoreTypes.TextTransformType {
		return 'initial';
	}
	[textTransformProperty.setNative](value: CoreTypes.TextTransformType) {
	}

	[textAlignmentProperty.getDefault](): CoreTypes.TextAlignmentType {
		return 'initial';
	}
	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		// TextAlignment API has no effect unless app has rtl support defined in manifest
		const supportsRtlTextAlign = layout.hasRtlSupport() && this._isManualRtlTextStyleNeeded;
		const verticalGravity = this.nativeTextViewProtected.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;

		// In the cases of left and right, use gravity alignment as TEXT_ALIGNMENT_TEXT_START
		// and TEXT_ALIGNMENT_TEXT_END are affected by text direction
		// Also, gravity start seem to affect text direction based on language, so use gravity left and right respectively
		switch (value) {
			case 'left':
			case 'justify':
				if (supportsRtlTextAlign) {
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_GRAVITY);
				}
				this.nativeTextViewProtected.setGravity(android.view.Gravity.LEFT | verticalGravity);
				break;
			case 'center':
				if (supportsRtlTextAlign) {
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_CENTER);
				}
				this.nativeTextViewProtected.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
				break;
			case 'right':
				if (supportsRtlTextAlign) {
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_GRAVITY);
				}
				this.nativeTextViewProtected.setGravity(android.view.Gravity.RIGHT | verticalGravity);
				break;
			default:
				// initial
				if (supportsRtlTextAlign) {
					this.nativeTextViewProtected.setTextAlignment(android.view.View.TEXT_ALIGNMENT_VIEW_START);
				}
				this.nativeTextViewProtected.setGravity(android.view.Gravity.START | verticalGravity);
				break;
		}

		if (SDK_VERSION >= 26) {
			if (value === 'justify') {
				this.nativeTextViewProtected.setJustificationMode(android.text.Layout.JUSTIFICATION_MODE_INTER_WORD);
			} else {
				this.nativeTextViewProtected.setJustificationMode(android.text.Layout.JUSTIFICATION_MODE_NONE);
			}
		}
	}

	// Overridden in TextField because setSingleLine(false) will remove methodTransformation.
	// and we don't want to allow TextField to be multiline
	[whiteSpaceProperty.setNative](value: CoreTypes.WhiteSpaceType) {
		this.adjustLineBreak();
	}

	[textOverflowProperty.setNative](value: CoreTypes.TextOverflowType) {
		this.adjustLineBreak();
	}

	[directionProperty.setNative](value: CoreTypes.LayoutDirectionType) {
		// Handle text ellipsis
		if (this.whiteSpace === 'nowrap' || this.maxLines > 0) {
			this.nativeTextViewProtected.setEllipsize(value === CoreTypes.LayoutDirection.rtl ? android.text.TextUtils.TruncateAt.START : android.text.TextUtils.TruncateAt.END);
		}
		super[directionProperty.setNative](value);
	}

	private adjustLineBreak() {
		const whiteSpace = this.whiteSpace;
		const textOverflow = this.textOverflow;
		const nativeView = this.nativeTextViewProtected;
		switch (whiteSpace) {
			case 'initial':
			case 'normal':
			case 'wrap':
				nativeView.setSingleLine(false);
				nativeView.setEllipsize(null);
				break;
			case 'nowrap': {
				const isRtl = this.direction === CoreTypes.LayoutDirection.rtl;

				switch (textOverflow) {
					case 'initial':
					case 'ellipsis':
						nativeView.setSingleLine(true);
						break;
					default:
						nativeView.setSingleLine(false);
						break;
				}
				nativeView.setEllipsize(isRtl ? android.text.TextUtils.TruncateAt.START : android.text.TextUtils.TruncateAt.END);
				break;
			}
		}
	}

	[colorProperty.getDefault](): android.content.res.ColorStateList {
		return _getStoredClassDefaultPropertyValue(colorProperty, this, () => this.nativeTextViewProtected.getTextColors());
	}
	[colorProperty.setNative](value: Color | android.content.res.ColorStateList) {
		if (!this.formattedText || !(value instanceof Color)) {
			if (value instanceof Color) {
				this.nativeTextViewProtected.setTextColor(value.android);
			} else {
				this.nativeTextViewProtected.setTextColor(value);
			}
		}
	}

	[fontSizeProperty.getDefault](): { nativeSize: number } {
		return { nativeSize: this.nativeTextViewProtected.getTextSize() };
	}
	[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
		if (!this.formattedText || typeof value !== 'number') {
			if (typeof value === 'number') {
				this.nativeTextViewProtected.setTextSize(value);
			} else {
				this.nativeTextViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
			}
		}
	}

	[fontInternalProperty.getDefault](): android.graphics.Typeface {
		return _getStoredClassDefaultPropertyValue(fontInternalProperty, this, () => this.nativeTextViewProtected.getTypeface());
	}
	[fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
		if (!this.formattedText || !(value instanceof Font)) {
			this.nativeTextViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
			if (SDK_VERSION < 28 && this.lineHeight !== undefined) {
				this[lineHeightProperty.setNative](this.lineHeight as any);
			}
		}
	}

	[textDecorationProperty.getDefault]() {
		return _getStoredClassDefaultPropertyValue(textDecorationProperty, this, () => this.nativeTextViewProtected.getPaintFlags());
	}

	[textDecorationProperty.setNative](value: number | CoreTypes.TextDecorationType) {
		switch (value) {
			case 'underline':
				this.nativeTextViewProtected.setPaintFlags(android.graphics.Paint.UNDERLINE_TEXT_FLAG);
				break;
			case 'line-through':
				this.nativeTextViewProtected.setPaintFlags(android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
				break;
			case 'underline line-through':
				this.nativeTextViewProtected.setPaintFlags(android.graphics.Paint.UNDERLINE_TEXT_FLAG | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
				break;
			default:
				if (value === 'none' || isCssWideKeyword(value)) {
					this.nativeTextViewProtected.setPaintFlags(0);
				} else {
					this.nativeTextViewProtected.setPaintFlags(value as number);
				}
				break;
		}
	}

	[textShadowProperty.getDefault]() {
		return _getStoredClassDefaultPropertyValue(textShadowProperty, this, () => ({
			radius: this.nativeTextViewProtected.getShadowRadius(),
			offsetX: this.nativeTextViewProtected.getShadowDx(),
			offsetY: this.nativeTextViewProtected.getShadowDy(),
			color: this.nativeTextViewProtected.getShadowColor(),
		}));
	}

	[textShadowProperty.setNative](value: ShadowCSSValues) {
		// prettier-ignore
		this.nativeTextViewProtected.setShadowLayer(
			Length.toDevicePixels(value.blurRadius, java.lang.Float.MIN_VALUE),
			Length.toDevicePixels(value.offsetX, 0),
			Length.toDevicePixels(value.offsetY, 0),
			value.color.android
		);
	}

	[paddingTopProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingTop, unit: 'px' };
	}
	[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
		org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
	}

	[paddingRightProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}
	[paddingRightProperty.setNative](value: CoreTypes.LengthType) {
		org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
	}

	[paddingBottomProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}
	[paddingBottomProperty.setNative](value: CoreTypes.LengthType) {
		org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
	}

	[paddingLeftProperty.getDefault](): CoreTypes.LengthType {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}
	[paddingLeftProperty.setNative](value: CoreTypes.LengthType) {
		org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
	}

	[lineHeightProperty.getDefault](): number {
		return _getStoredClassDefaultPropertyValue(lineHeightProperty, this, () => this.nativeTextViewProtected.getLineSpacingExtra() / layout.getDisplayDensity());
	}
	[lineHeightProperty.setNative](value: number) {
		this.nativeTextViewProtected.setLineSpacing(value * layout.getDisplayDensity(), 1);
	}

	[letterSpacingProperty.getDefault](): number {
		return _getStoredClassDefaultPropertyValue(letterSpacingProperty, this, () => org.nativescript.widgets.ViewHelper.getLetterspacing(this.nativeTextViewProtected));
	}
	[letterSpacingProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setLetterspacing(this.nativeTextViewProtected, value);
	}

	[testIDProperty.setNative](value: string): void {
		this.setAccessibilityIdentifier(this.nativeTextViewProtected, value);
	}

	[accessibilityIdentifierProperty.setNative](value: string): void {
		this.setAccessibilityIdentifier(this.nativeTextViewProtected, value);
	}

	[maxLinesProperty.setNative](value: CoreTypes.MaxLinesType) {
		const nativeTextViewProtected = this.nativeTextViewProtected;
		if (value <= 0) {
			nativeTextViewProtected.setMaxLines(Number.MAX_SAFE_INTEGER);
		} else {
			const isRtl = this.direction === CoreTypes.LayoutDirection.rtl;

			nativeTextViewProtected.setMaxLines(typeof value === 'string' ? parseInt(value, 10) : value);
			nativeTextViewProtected.setEllipsize(isRtl ? android.text.TextUtils.TruncateAt.START : android.text.TextUtils.TruncateAt.END);
		}
	}

	_setNativeText(reset = false): void {
		if (reset) {
			this.nativeTextViewProtected.setText(null);
			return;
		}

		let transformedText: any;
		if (this.formattedText) {
			transformedText = this.createFormattedTextNative(this.formattedText);
		} else if ((this.text as any) instanceof android.text.Spanned) {
			transformedText = this.text;
		} else {
			const text = this.text;
			const stringValue = text === null || text === undefined ? '' : text.toString();
			transformedText = getTransformedText(stringValue, this.textTransform);
		}

		if (this.style?.textStroke) {
			this.nativeTextViewProtected.setTextStroke(Length.toDevicePixels(this.style.textStroke.width), this.style.textStroke.color.android, this.style.color.android);
		} else if (this.nativeTextViewProtected.setTextStroke) {
			// reset
			this.nativeTextViewProtected.setTextStroke(0, 0, 0);
		}

		this.nativeTextViewProtected.setText(transformedText);
	}

	_setTappableState(tappable: boolean) {
		if (this._tappable !== tappable) {
			this._tappable = tappable;
			const nativeView = this.nativeViewProtected;
			if (this._tappable) {
				// Setting singleLine to true results in conflicts with LinkMovementMethod
				// See https://stackoverflow.com/a/34407901
				nativeView.setSingleLine(false);
				if (!this._defaultMovementMethod) {
					this._defaultMovementMethod = nativeView.getMovementMethod();
				}
				nativeView.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
				nativeView.setHighlightColor(null);
			} else if (this._defaultMovementMethod) {
				nativeView.setMovementMethod(this._defaultMovementMethod);
			}
		}
	}
}

function getCapitalizedString(str: string): string {
	let newString = str.toLowerCase();
	newString = newString.replace(/(?:^|\s'*|[-"([{])+\S/g, (c) => c.toUpperCase());
	return newString;
}

export function getTransformedText(text: string, textTransform: CoreTypes.TextTransformType): string {
	if (!text || !isString(text)) {
		return '';
	}

	switch (textTransform) {
		case 'uppercase':
			return text.toUpperCase();
		case 'lowercase':
			return text.toLowerCase();
		case 'capitalize':
			return getCapitalizedString(text);
		case 'none':
		default:
			return text;
	}
}

function isStringTappable(formattedString: FormattedString) {
	if (!formattedString) {
		return false;
	}
	for (let i = 0, length = formattedString.spans.length; i < length; i++) {
		const span = formattedString.spans.getItem(i);
		if (span.tappable) {
			return true;
		}
	}

	return false;
}

function createSpannableStringBuilder(formattedString: FormattedString, defaultFontSize: number): android.text.SpannableStringBuilder {
	if (!formattedString || !formattedString.parent) {
		return null;
	}

	const ssb = new android.text.SpannableStringBuilder();
	for (let i = 0, spanStart = 0, spanLength = 0, length = formattedString.spans.length; i < length; i++) {
		const span = formattedString.spans.getItem(i);
		const text = span.text;
		const textTransform = (<TextBase>formattedString.parent).textTransform;
		let spanText = text === null || text === undefined ? '' : text.toString();
		if (textTransform && textTransform !== 'none') {
			spanText = getTransformedText(spanText, textTransform);
		}

		spanLength = spanText.length;
		if (spanLength > 0) {
			ssb.insert(spanStart, spanText);
			setSpanModifiers(ssb, span, spanStart, spanStart + spanLength, defaultFontSize);
			spanStart += spanLength;
		}
	}

	return ssb;
}

function setSpanModifiers(ssb: android.text.SpannableStringBuilder, span: Span, start: number, end: number, defaultFontSize: number): void {
	const spanStyle = span.style;
	const align = spanStyle.verticalAlignment;

	const font = new Font(spanStyle.fontFamily, spanStyle.fontSize, spanStyle.fontStyle, spanStyle.fontWeight, spanStyle.fontScaleInternal, spanStyle.fontVariationSettings);
	const typefaceSpan = new org.nativescript.widgets.CustomTypefaceSpan(font.getAndroidTypeface());
	ssb.setSpan(typefaceSpan, start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

	if (spanStyle.fontSize) {
		ssb.setSpan(new android.text.style.AbsoluteSizeSpan(layout.toDevicePixels(spanStyle.fontSize)), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const color = spanStyle.color;
	if (color) {
		ssb.setSpan(new android.text.style.ForegroundColorSpan(color.android), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	// Use span or formatted string color
	const backgroundColor = spanStyle.backgroundColor || span.parent.backgroundColor;
	if (backgroundColor) {
		ssb.setSpan(new android.text.style.BackgroundColorSpan(backgroundColor.android), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const textDecoration: CoreTypes.TextDecorationType = getClosestPropertyValue(textDecorationProperty, span);

	if (textDecoration) {
		const underline = textDecoration.indexOf('underline') !== -1;
		if (underline) {
			ssb.setSpan(new android.text.style.UnderlineSpan(), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
		}

		const strikethrough = textDecoration.indexOf('line-through') !== -1;
		if (strikethrough) {
			ssb.setSpan(new android.text.style.StrikethroughSpan(), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
		}
	}

	if (align) {
		initializeBaselineAdjustedSpan();
		ssb.setSpan(new BaselineAdjustedSpan(layout.toDevicePixels(defaultFontSize), align), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const tappable = span.tappable;
	if (tappable) {
		initializeClickableSpan();
		ssb.setSpan(new ClickableSpan(span), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	// TODO: Implement letterSpacing for Span here.
	// const letterSpacing = formattedString.parent.style.letterSpacing;
	// if (letterSpacing > 0) {
	//     ssb.setSpan(new android.text.style.ScaleXSpan((letterSpacing + 1) / 10), start, end, android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
	// }
}
TextBase.prototype._hasDefaultAccessibilityContentDescription = true;
