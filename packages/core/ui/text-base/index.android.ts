// Types
import { TextDecoration, TextAlignment, TextTransform, WhiteSpace, getClosestPropertyValue } from './text-base-common';

// Requires
import { Font } from '../styling/font';
import { backgroundColorProperty, VerticalAlignment } from '../styling/style-properties';
import { TextBaseCommon, formattedTextProperty, textAlignmentProperty, textDecorationProperty, textProperty, textTransformProperty, letterSpacingProperty, whiteSpaceProperty, lineHeightProperty, isBold, resetSymbol } from './text-base-common';
import { Color } from '../../color';
import { colorProperty, fontSizeProperty, fontInternalProperty, paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length } from '../styling/style-properties';
import { FormattedString } from './formatted-string';
import { Span } from './span';
import { layout } from '../../utils';
import { isString, isNullOrUndefined } from '../../utils/types';

export * from './text-base-common';

let TextTransformation: TextTransformation;

export interface TextTransformation {
	new (owner: TextBase): any /* android.text.method.TransformationMethod */;
}

function initializeTextTransformation(): void {
	if (TextTransformation) {
		return;
	}

	@NativeClass
	@Interfaces([android.text.method.TransformationMethod])
	class TextTransformationImpl extends java.lang.Object implements android.text.method.TransformationMethod {
		constructor(public textBase: TextBase) {
			super();

			return global.__native(this);
		}

		public getTransformation(charSeq: any, view: android.view.View): any {
			// NOTE: Do we need to transform the new text here?
			const formattedText = this.textBase.formattedText;
			if (formattedText) {
				return createSpannableStringBuilder(formattedText, (<android.widget.TextView>view).getTextSize());
			} else {
				const text = this.textBase.text;
				const stringValue = isNullOrUndefined(text) ? '' : text.toString();

				return getTransformedText(stringValue, this.textBase.textTransform);
			}
		}

		public onFocusChanged(view: android.view.View, sourceText: string, focused: boolean, direction: number, previouslyFocusedRect: android.graphics.Rect): void {
			// Do nothing for now.
		}
	}

	TextTransformation = TextTransformationImpl;
}

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
			const owner = this.owner.get();
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
	new (fontSize: number, align?: VerticalAlignment): android.text.style.MetricAffectingSpan;
}

let BaselineAdjustedSpan: BaselineAdjustedSpan;

function initializeBaselineAdjustedSpan(): void {
	if (BaselineAdjustedSpan) {
		return;
	}
	@NativeClass
	class BaselineAdjustedSpanImpl extends android.text.style.MetricAffectingSpan {
		fontSize: number;
		align: VerticalAlignment = 'baseline';

		constructor(fontSize: number, align?: VerticalAlignment) {
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

			if (this.align === 'super') {
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
	nativeViewProtected: android.widget.TextView;
	nativeTextViewProtected: android.widget.TextView;
	private _defaultTransformationMethod: android.text.method.TransformationMethod;
	private _paintFlags: number;
	private _minHeight: number;
	private _maxHeight: number;
	private _minLines: number;
	private _maxLines: number;
	private _tappable: boolean = false;
	private _defaultMovementMethod: android.text.method.MovementMethod;

	public initNativeView(): void {
		super.initNativeView();
		initializeTextTransformation();
		const nativeView = this.nativeTextViewProtected;
		this._defaultTransformationMethod = nativeView.getTransformationMethod();
		this._defaultMovementMethod = nativeView.getMovementMethod();
		this._minHeight = nativeView.getMinHeight();
		this._maxHeight = nativeView.getMaxHeight();
		this._minLines = nativeView.getMinLines();
		this._maxLines = nativeView.getMaxLines();
	}

	public resetNativeView(): void {
		super.resetNativeView();
		const nativeView = this.nativeTextViewProtected;
		// We reset it here too because this could be changed by multiple properties - whiteSpace, secure, textTransform
		nativeView.setSingleLine(this._isSingleLine);
		nativeView.setTransformationMethod(this._defaultTransformationMethod);
		this._defaultTransformationMethod = null;

		if (this._paintFlags !== undefined) {
			nativeView.setPaintFlags(this._paintFlags);
			this._paintFlags = undefined;
		}

		if (this._minLines !== -1) {
			nativeView.setMinLines(this._minLines);
		} else {
			nativeView.setMinHeight(this._minHeight);
		}

		this._minHeight = this._minLines = undefined;

		if (this._maxLines !== -1) {
			nativeView.setMaxLines(this._maxLines);
		} else {
			nativeView.setMaxHeight(this._maxHeight);
		}

		this._maxHeight = this._maxLines = undefined;
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

	[formattedTextProperty.setNative](value: FormattedString) {
		const nativeView = this.nativeTextViewProtected;
		if (!value) {
			if (nativeView instanceof android.widget.Button && nativeView.getTransformationMethod() instanceof TextTransformation) {
				nativeView.setTransformationMethod(this._defaultTransformationMethod);
			}
		}

		// Don't change the transformation method if this is secure TextField or we'll lose the hiding characters.
		if ((<any>this).secure) {
			return;
		}

		const spannableStringBuilder = createSpannableStringBuilder(value, this.style.fontSize);
		nativeView.setText(<any>spannableStringBuilder);
		this._setTappableState(isStringTappable(value));

		textProperty.nativeValueChange(this, value === null || value === undefined ? '' : value.toString());

		if (spannableStringBuilder && nativeView instanceof android.widget.Button && !(nativeView.getTransformationMethod() instanceof TextTransformation)) {
			// Replace Android Button's default transformation (in case the developer has not already specified a text-transform) method
			// with our transformation method which can handle formatted text.
			// Otherwise, the default tranformation method of the Android Button will overwrite and ignore our spannableStringBuilder.
			nativeView.setTransformationMethod(new TextTransformation(this));
		}
	}

	[textTransformProperty.setNative](value: TextTransform) {
		if (value === 'initial') {
			this.nativeTextViewProtected.setTransformationMethod(this._defaultTransformationMethod);

			return;
		}

		// Don't change the transformation method if this is secure TextField or we'll lose the hiding characters.
		if ((<any>this).secure) {
			return;
		}

		this.nativeTextViewProtected.setTransformationMethod(new TextTransformation(this));
	}

	[textAlignmentProperty.getDefault](): TextAlignment {
		return 'initial';
	}
	[textAlignmentProperty.setNative](value: TextAlignment) {
		let verticalGravity = this.nativeTextViewProtected.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
		switch (value) {
			case 'initial':
			case 'left':
				this.nativeTextViewProtected.setGravity(android.view.Gravity.START | verticalGravity);
				break;

			case 'center':
				this.nativeTextViewProtected.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
				break;

			case 'right':
				this.nativeTextViewProtected.setGravity(android.view.Gravity.END | verticalGravity);
				break;
		}
	}

	// Overridden in TextField because setSingleLine(false) will remove methodTransformation.
	// and we don't want to allow TextField to be multiline
	[whiteSpaceProperty.setNative](value: WhiteSpace) {
		const nativeView = this.nativeTextViewProtected;
		switch (value) {
			case 'initial':
			case 'normal':
				nativeView.setSingleLine(false);
				nativeView.setEllipsize(null);
				break;
			case 'nowrap':
				nativeView.setSingleLine(true);
				nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
				break;
		}
	}

	[colorProperty.getDefault](): android.content.res.ColorStateList {
		return this.nativeTextViewProtected.getTextColors();
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

	[lineHeightProperty.getDefault](): number {
		return this.nativeView.getLineSpacingExtra() / layout.getDisplayDensity();
	}
	[lineHeightProperty.setNative](value: number) {
		this.nativeView.setLineSpacing(value * layout.getDisplayDensity(), 1);
	}

	[fontInternalProperty.getDefault](): android.graphics.Typeface {
		return this.nativeTextViewProtected.getTypeface();
	}
	[fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
		if (!this.formattedText || !(value instanceof Font)) {
			this.nativeTextViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
		}
	}

	[textDecorationProperty.getDefault](value: number) {
		return (this._paintFlags = this.nativeTextViewProtected.getPaintFlags());
	}

	[textDecorationProperty.setNative](value: number | TextDecoration) {
		switch (value) {
			case 'none':
				this.nativeTextViewProtected.setPaintFlags(0);
				break;
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
				this.nativeTextViewProtected.setPaintFlags(value);
				break;
		}
	}

	[letterSpacingProperty.getDefault](): number {
		return org.nativescript.widgets.ViewHelper.getLetterspacing(this.nativeTextViewProtected);
	}
	[letterSpacingProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setLetterspacing(this.nativeTextViewProtected, value);
	}

	[paddingTopProperty.getDefault](): Length {
		return { value: this._defaultPaddingTop, unit: 'px' };
	}
	[paddingTopProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
	}

	[paddingRightProperty.getDefault](): Length {
		return { value: this._defaultPaddingRight, unit: 'px' };
	}
	[paddingRightProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
	}

	[paddingBottomProperty.getDefault](): Length {
		return { value: this._defaultPaddingBottom, unit: 'px' };
	}
	[paddingBottomProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
	}

	[paddingLeftProperty.getDefault](): Length {
		return { value: this._defaultPaddingLeft, unit: 'px' };
	}
	[paddingLeftProperty.setNative](value: Length) {
		org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeTextViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
	}

	_setNativeText(reset: boolean = false): void {
		if (reset) {
			this.nativeTextViewProtected.setText(null);

			return;
		}

		let transformedText: any;
		if (this.formattedText) {
			transformedText = createSpannableStringBuilder(this.formattedText, this.style.fontSize);
		} else {
			const text = this.text;
			const stringValue = text === null || text === undefined ? '' : text.toString();
			transformedText = getTransformedText(stringValue, this.textTransform);
		}

		this.nativeTextViewProtected.setText(<any>transformedText);
	}

	_setTappableState(tappable: boolean) {
		if (this._tappable !== tappable) {
			this._tappable = tappable;
			if (this._tappable) {
				this.nativeViewProtected.setMovementMethod(android.text.method.LinkMovementMethod.getInstance());
				this.nativeViewProtected.setHighlightColor(null);
			} else {
				this.nativeViewProtected.setMovementMethod(this._defaultMovementMethod);
			}
		}
	}
}

function getCapitalizedString(str: string): string {
	let words = str.split(' ');
	let newWords = [];
	for (let i = 0, length = words.length; i < length; i++) {
		let word = words[i].toLowerCase();
		newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
	}

	return newWords.join(' ');
}

export function getTransformedText(text: string, textTransform: TextTransform): string {
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
	const bold = isBold(spanStyle.fontWeight);
	const italic = spanStyle.fontStyle === 'italic';
	const align = spanStyle.verticalAlignment;

	if (bold && italic) {
		ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD_ITALIC), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	} else if (bold) {
		ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	} else if (italic) {
		ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.ITALIC), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const fontFamily = span.fontFamily;
	if (fontFamily) {
		const font = new Font(fontFamily, 0, italic ? 'italic' : 'normal', bold ? 'bold' : 'normal');
		const typeface = font.getAndroidTypeface() || android.graphics.Typeface.create(fontFamily, 0);
		const typefaceSpan: android.text.style.TypefaceSpan = new org.nativescript.widgets.CustomTypefaceSpan(fontFamily, typeface);
		ssb.setSpan(typefaceSpan, start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const realFontSize = span.fontSize;
	if (realFontSize) {
		ssb.setSpan(new android.text.style.AbsoluteSizeSpan(realFontSize * layout.getDisplayDensity()), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const color = span.color;
	if (color) {
		ssb.setSpan(new android.text.style.ForegroundColorSpan(color.android), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const backgroundColor: Color = getClosestPropertyValue(<any>backgroundColorProperty, span);

	if (backgroundColor) {
		ssb.setSpan(new android.text.style.BackgroundColorSpan(backgroundColor.android), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
	}

	const textDecoration: TextDecoration = getClosestPropertyValue(textDecorationProperty, span);

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
		ssb.setSpan(new BaselineAdjustedSpan(defaultFontSize * layout.getDisplayDensity(), align), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
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
