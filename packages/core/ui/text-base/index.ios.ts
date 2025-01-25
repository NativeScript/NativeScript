// Types
import { getClosestPropertyValue } from './text-base-common';
import { ShadowCSSValues } from '../styling/css-shadow';

// Requires
import { Font } from '../styling/font';
import { iosAccessibilityAdjustsFontSizeProperty, iosAccessibilityMaxFontScaleProperty, iosAccessibilityMinFontScaleProperty } from '../../accessibility/accessibility-properties';
import { TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty, textTransformProperty, textShadowProperty, textStrokeProperty, letterSpacingProperty, lineHeightProperty, maxLinesProperty, resetSymbol } from './text-base-common';
import { Color } from '../../color';
import { FormattedString } from './formatted-string';
import { Span } from './span';
import { colorProperty, fontInternalProperty, fontScaleInternalProperty, Length } from '../styling/style-properties';
import { StrokeCSSValues } from '../styling/css-stroke';
import { isString, isNullOrUndefined } from '../../utils/types';
import { iOSNativeHelper, layout } from '../../utils';
import { Trace } from '../../trace';
import { CoreTypes } from '../../core-types';

export * from './text-base-common';

const majorVersion = iOSNativeHelper.MajorVersion;

@NativeClass
class UILabelClickHandlerImpl extends NSObject {
	private _owner: WeakRef<TextBase>;

	public static initWithOwner(owner: WeakRef<TextBase>): UILabelClickHandlerImpl {
		const handler = <UILabelClickHandlerImpl>UILabelClickHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public linkTap(tapGesture: UITapGestureRecognizer) {
		const owner = this._owner?.deref();
		if (owner) {
			const label = <UILabel>owner.nativeTextViewProtected;

			// This offset along with setting paragraph style alignment will achieve perfect horizontal alignment for NSTextContainer
			let offsetXMultiplier: number;
			switch (owner.textAlignment) {
				case 'center':
					offsetXMultiplier = 0.5;
					break;
				case 'right':
					offsetXMultiplier = 1.0;
					break;
				default:
					offsetXMultiplier = 0.0;
					break;
			}
			const offsetYMultiplier: number = 0.5; // Text is vertically aligned to center

			const layoutManager = NSLayoutManager.alloc().init();
			const textContainer = NSTextContainer.alloc().initWithSize(CGSizeZero);
			const textStorage = NSTextStorage.alloc().initWithAttributedString(owner.nativeTextViewProtected['attributedText']);

			layoutManager.addTextContainer(textContainer);
			textStorage.addLayoutManager(layoutManager);

			textContainer.lineFragmentPadding = 0;
			textContainer.lineBreakMode = label.lineBreakMode;
			textContainer.maximumNumberOfLines = label.numberOfLines;
			const labelSize = label.bounds.size;
			textContainer.size = labelSize;

			const locationOfTouchInLabel = tapGesture.locationInView(label);
			const textBoundingBox = layoutManager.usedRectForTextContainer(textContainer);

			const textContainerOffset = CGPointMake((labelSize.width - textBoundingBox.size.width) * offsetXMultiplier - textBoundingBox.origin.x, (labelSize.height - textBoundingBox.size.height) * offsetYMultiplier - textBoundingBox.origin.y);
			const locationOfTouchInTextContainer = CGPointMake(locationOfTouchInLabel.x - textContainerOffset.x, locationOfTouchInLabel.y - textContainerOffset.y);

			// Check if tap was inside text bounding rect
			if (CGRectContainsPoint(textBoundingBox, locationOfTouchInTextContainer)) {
				// According to Apple docs, if no glyph is under point, the nearest glyph is returned
				const glyphIndex = layoutManager.glyphIndexForPointInTextContainerFractionOfDistanceThroughGlyph(locationOfTouchInTextContainer, textContainer, null);
				// In order to determine whether the tap point actually lies within the bounds
				// of the glyph returned, we call the method below and test
				// whether the point falls in the rectangle returned by that method
				const glyphRect = layoutManager.boundingRectForGlyphRangeInTextContainer(
					{
						location: glyphIndex,
						length: 1,
					},
					textContainer,
				);

				// Ensure that an actual glyph was tapped
				if (CGRectContainsPoint(glyphRect, locationOfTouchInTextContainer)) {
					const indexOfCharacter = layoutManager.characterIndexForGlyphAtIndex(glyphIndex);

					let span: Span = null;
					// Try to find the corresponding span using the spanRanges
					for (let i = 0; i < owner._spanRanges.length; i++) {
						const range = owner._spanRanges[i];
						if (range.location <= indexOfCharacter && range.location + range.length > indexOfCharacter) {
							if (owner.formattedText && owner.formattedText.spans.length > i) {
								span = owner.formattedText.spans.getItem(i);
							}
							break;
						}
					}

					if (span && span.tappable) {
						// if the span is found and tappable emit the linkTap event
						span._emit(Span.linkTapEvent);
					}
				}
			}
		}
	}

	public static ObjCExposedMethods = {
		linkTap: { returns: interop.types.void, params: [interop.types.id] },
	};
}

export class TextBase extends TextBaseCommon {
	public nativeViewProtected: UITextField | UITextView | UILabel | UIButton;
	// @ts-ignore
	public nativeTextViewProtected: UITextField | UITextView | UILabel | UIButton;
	private _tappable = false;
	private _tapGestureRecognizer: UITapGestureRecognizer;
	public _spanRanges: NSRange[];

	public initNativeView(): void {
		super.initNativeView();
		this._setTappableState(false);
	}

	_setTappableState(tappable: boolean) {
		if (this._tappable !== tappable) {
			this._tappable = tappable;
			if (this._tappable) {
				const tapHandler = UILabelClickHandlerImpl.initWithOwner(new WeakRef(this));
				// associate handler with menuItem or it will get collected by JSC.
				(<any>this).handler = tapHandler;

				this._tapGestureRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(tapHandler, 'linkTap');
				this.nativeViewProtected.userInteractionEnabled = true;
				this.nativeViewProtected.addGestureRecognizer(this._tapGestureRecognizer);
			} else {
				this.nativeViewProtected.userInteractionEnabled = false;
				this.nativeViewProtected.removeGestureRecognizer(this._tapGestureRecognizer);
			}
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
		this._setTappableState(isStringTappable(value));
		textProperty.nativeValueChange(this, !value ? '' : value.toString());
		this._requestLayoutOnTextChanged();
	}

	[colorProperty.getDefault](): UIColor {
		const nativeView = this.nativeTextViewProtected;
		if (nativeView instanceof UIButton) {
			return nativeView.titleColorForState(UIControlState.Normal);
		} else {
			return nativeView.textColor;
		}
	}
	[colorProperty.setNative](value: Color | UIColor) {
		const color = value instanceof Color ? value.ios : value;
		this._setColor(color);
	}

	[fontInternalProperty.getDefault](): UIFont {
		let nativeView = this.nativeTextViewProtected;
		nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;

		return nativeView.font;
	}
	[fontInternalProperty.setNative](value: Font | UIFont) {
		if (!(value instanceof Font) || !this.formattedText) {
			let nativeView = this.nativeTextViewProtected;
			nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
			nativeView.font = value instanceof Font ? value.getUIFont(nativeView.font) : value;
		}
	}

	[fontScaleInternalProperty.setNative](value: number) {
		const nativeView = this.nativeTextViewProtected instanceof UIButton ? this.nativeTextViewProtected.titleLabel : this.nativeTextViewProtected;
		const font = this.style.fontInternal || Font.default.withFontSize(nativeView.font.pointSize);
		const finalValue = adjustMinMaxFontScale(value, this);

		// Request layout on font scale as it's not done automatically
		if (font.fontScale !== finalValue) {
			this.style.fontInternal = font.withFontScale(finalValue);
			this.requestLayout();
		} else {
			if (!this.style.fontInternal) {
				this.style.fontInternal = font;
			}
		}
	}

	[iosAccessibilityAdjustsFontSizeProperty.setNative](value: boolean) {
		this[fontScaleInternalProperty.setNative](this.style.fontScaleInternal);
	}

	[iosAccessibilityMinFontScaleProperty.setNative](value: number) {
		this[fontScaleInternalProperty.setNative](this.style.fontScaleInternal);
	}

	[iosAccessibilityMaxFontScaleProperty.setNative](value: number) {
		this[fontScaleInternalProperty.setNative](this.style.fontScaleInternal);
	}

	[textAlignmentProperty.setNative](value: CoreTypes.TextAlignmentType) {
		const nativeView = <UITextField | UITextView | UILabel>this.nativeTextViewProtected;
		switch (value) {
			case 'initial':
			case 'left':
				nativeView.textAlignment = NSTextAlignment.Left;
				break;
			case 'center':
				nativeView.textAlignment = NSTextAlignment.Center;
				break;
			case 'right':
				nativeView.textAlignment = NSTextAlignment.Right;
				break;
			case 'justify':
				nativeView.textAlignment = NSTextAlignment.Justified;
				break;
		}
	}

	[textDecorationProperty.setNative](value: CoreTypes.TextDecorationType) {
		this._setNativeText();
	}

	[textTransformProperty.setNative](value: CoreTypes.TextTransformType) {
		this._setNativeText();
	}

	[textStrokeProperty.setNative](value: StrokeCSSValues) {
		this._setNativeText();
	}

	[letterSpacingProperty.setNative](value: number) {
		this._setNativeText();
	}

	[lineHeightProperty.getDefault](): CoreTypes.PercentLengthType {
		const nativeTextView = this.nativeTextViewProtected;
		const nativeFont = nativeTextView instanceof UIButton ? nativeTextView.titleLabel.font : nativeTextView.font;
		return nativeFont?.lineHeight ?? 0;
	}

	[lineHeightProperty.setNative](value: CoreTypes.PercentLengthType) {
		this._setNativeText();
	}

	[textShadowProperty.setNative](value: ShadowCSSValues) {
		this._setShadow(value);
	}

	[maxLinesProperty.setNative](value: CoreTypes.MaxLinesType) {
		const nativeTextViewProtected = this.nativeTextViewProtected;
		const numberOfLines = this.whiteSpace !== CoreTypes.WhiteSpace.nowrap ? value : 1;
		if (nativeTextViewProtected instanceof UITextView) {
			nativeTextViewProtected.textContainer.maximumNumberOfLines = numberOfLines;

			if (value !== 0) {
				nativeTextViewProtected.textContainer.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
			} else {
				nativeTextViewProtected.textContainer.lineBreakMode = NSLineBreakMode.ByWordWrapping;
			}
		} else if (nativeTextViewProtected instanceof UILabel) {
			nativeTextViewProtected.numberOfLines = numberOfLines;
			nativeTextViewProtected.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
		} else if (nativeTextViewProtected instanceof UIButton) {
			nativeTextViewProtected.titleLabel.numberOfLines = numberOfLines;
		}
	}

	_setColor(color: UIColor): void {
		if (this.nativeTextViewProtected instanceof UIButton) {
			this.nativeTextViewProtected.setTitleColorForState(color, UIControlState.Normal);
			this.nativeTextViewProtected.titleLabel.textColor = color;
		} else {
			this.nativeTextViewProtected.textColor = color;
		}
	}
	_animationWrap(fn: () => void) {
		const shouldAnimate = this.iosTextAnimation === 'inherit' ? TextBase.iosTextAnimationFallback : this.iosTextAnimation;
		if (shouldAnimate) {
			fn();
		} else {
			UIView.performWithoutAnimation(fn);
		}
	}

	_setNativeText(reset = false): void {
		this._animationWrap(() => {
			if (reset) {
				const nativeView = this.nativeTextViewProtected;
				if (nativeView instanceof UIButton) {
					// Clear attributedText or title won't be affected.
					nativeView.setAttributedTitleForState(null, UIControlState.Normal);
					nativeView.setTitleForState(null, UIControlState.Normal);
				} else {
					// Clear attributedText or text won't be affected.
					nativeView.attributedText = null;
					nativeView.text = null;
				}

				return;
			}

			const letterSpacing = this.style.letterSpacing ? this.style.letterSpacing : 0;
			const lineHeight = this._calculateLineHeight();

			if (this.formattedText) {
				this.nativeTextViewProtected.nativeScriptSetFormattedTextDecorationAndTransformLetterSpacingLineHeight(this.getFormattedStringDetails(this.formattedText) as any, letterSpacing, lineHeight);
			} else {
				const text = getTransformedText(isNullOrUndefined(this.text) ? '' : `${this.text}`, this.textTransform);
				this.nativeTextViewProtected.nativeScriptSetTextDecorationAndTransformTextDecorationLetterSpacingLineHeight(text, this.style.textDecoration || '', letterSpacing, lineHeight);
			}

			// Apply this default to both regular and formatted text, otherwise UIButton will use its own default
			if (!this.style?.color && majorVersion >= 13 && UIColor.labelColor) {
				this._setColor(UIColor.labelColor);
			}

			if (this.style?.textStroke) {
				this.nativeTextViewProtected.nativeScriptSetFormattedTextStrokeColor(Length.toDevicePixels(this.style.textStroke.width, 0), this.style.textStroke.color.ios);
			}
		});
	}

	createFormattedTextNative(value: FormattedString) {
		return NativeScriptUtils.createMutableStringWithDetails(<any>this.getFormattedStringDetails(value));
	}

	getFormattedStringDetails(formattedString: FormattedString) {
		const details = {
			spans: [],
		};
		this._spanRanges = [];
		if (formattedString && formattedString.parent) {
			for (let i = 0, spanStart = 0, length = formattedString.spans.length; i < length; i++) {
				const span = formattedString.spans.getItem(i);
				const text = span.text;
				const textTransform = (<TextBase>formattedString.parent).textTransform;
				let spanText = isNullOrUndefined(text) ? '' : `${text}`;
				if (textTransform !== 'none' && textTransform !== 'initial') {
					spanText = getTransformedText(spanText, textTransform);
				}

				details.spans.push(this.createMutableStringDetails(span, spanText, spanStart));
				this._spanRanges.push({
					location: spanStart,
					length: spanText.length,
				});
				spanStart += spanText.length;
			}
		}
		return details;
	}

	createMutableStringDetails(span: Span, text: string, index?: number): any {
		const fontScale = adjustMinMaxFontScale(span.style.fontScaleInternal, span);
		const font = new Font(span.style.fontFamily, span.style.fontSize, span.style.fontStyle, span.style.fontWeight, fontScale, span.style.fontVariationSettings);
		const iosFont = font.getUIFont(this.nativeTextViewProtected.font);

		const backgroundColor = <Color>(span.style.backgroundColor || (<FormattedString>span.parent).backgroundColor || (<TextBase>span.parent.parent).backgroundColor);
		return {
			text,
			iosFont,
			color: span.color ? span.color.ios : null,
			backgroundColor: backgroundColor ? backgroundColor.ios : null,
			textDecoration: getClosestPropertyValue(textDecorationProperty, span),
			baselineOffset: this.getBaselineOffset(iosFont, span.style.verticalAlignment),
			index,
		};
	}

	createMutableStringForSpan(span: Span, text: string): NSMutableAttributedString {
		const details = this.createMutableStringDetails(span, text);
		return NativeScriptUtils.createMutableStringForSpanFontColorBackgroundColorTextDecorationBaselineOffset(details.text, details.iosFont, details.color, details.backgroundColor, details.textDecoration, details.baselineOffset);
	}

	getBaselineOffset(font: UIFont, align?: CoreTypes.VerticalAlignmentTextType): number {
		if (!align || ['stretch', 'baseline'].includes(align)) {
			return 0;
		}

		if (align === 'top') {
			return -this.fontSize - font.descender - font.ascender - font.leading / 2;
		}

		if (align === 'bottom') {
			return font.descender + font.leading / 2;
		}

		if (align === 'text-top') {
			return -this.fontSize - font.descender - font.ascender;
		}

		if (align === 'text-bottom') {
			return font.descender;
		}

		if (align === 'middle') {
			return (font.descender - font.ascender) / 2 - font.descender;
		}

		if (align === 'sup') {
			return -this.fontSize * 0.4;
		}

		if (align === 'sub') {
			return (font.descender - font.ascender) * 0.4;
		}
	}

	private _calculateLineHeight(): number {
		const lengthType = this.style.lineHeight;
		const nativeTextView = this.nativeTextViewProtected;
		const nativeFont = nativeTextView instanceof UIButton ? nativeTextView.titleLabel.font : nativeTextView.font;
		// Get font lineHeight value to simulate what android does with getFontMetricsInt
		const fontHeight = nativeFont?.lineHeight || 0;

		let lineHeight: number;

		if (lengthType == null || typeof lengthType === 'string') {
			lineHeight = -1; // This indicates that line-height is normal
		} else if (typeof lengthType === 'number') {
			lineHeight = lengthType;
		} else if (lengthType.unit === '%') {
			lineHeight = lengthType.value * fontHeight;
		} else {
			lineHeight = layout.toDeviceIndependentPixels(Length.toDevicePixels(lengthType, -1));
		}

		return lineHeight;
	}

	_setShadow(value: ShadowCSSValues): void {
		const layer: CALayer = this.nativeTextViewProtected.layer;

		if (isNullOrUndefined(value)) {
			// clear the text shadow
			layer.shadowOpacity = 0;
			layer.shadowRadius = 0;
			layer.shadowColor = UIColor.clearColor;
			layer.shadowOffset = CGSizeMake(0, 0);
			return;
		}

		// shadow opacity is handled on the shadow's color instance
		layer.shadowOpacity = value.color?.a ? value.color.a / 255 : 1;
		layer.shadowColor = value.color.ios.CGColor;
		layer.shadowRadius = layout.toDeviceIndependentPixels(Length.toDevicePixels(value.blurRadius, 0));

		// prettier-ignore
		layer.shadowOffset = CGSizeMake(
			layout.toDeviceIndependentPixels(Length.toDevicePixels(value.offsetX, 0)),
			layout.toDeviceIndependentPixels(Length.toDevicePixels(value.offsetY, 0))
		);

		layer.masksToBounds = false;

		// NOTE: generally should not need shouldRasterize
		// however for various detailed animation work which involves text-shadow applicable layers, we may want to give users the control of enabling this with text-shadow
		// if (!(this.nativeTextViewProtected instanceof UITextView)) {
		//   layer.shouldRasterize = true;
		// }
	}
}

export function getTransformedText(text: string, textTransform: CoreTypes.TextTransformType): string {
	if (!text || !isString(text)) {
		return '';
	}

	switch (textTransform) {
		case 'uppercase':
			return NSStringFromNSAttributedString(text).uppercaseString;
		case 'lowercase':
			return NSStringFromNSAttributedString(text).lowercaseString;
		case 'capitalize':
			return NSStringFromNSAttributedString(text).capitalizedString;
		default:
			return text;
	}
}

function NSStringFromNSAttributedString(source: NSAttributedString | string): NSString {
	return NSString.stringWithString((source instanceof NSAttributedString && source.string) || <string>source);
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

function adjustMinMaxFontScale(value: number, view: TextBase | Span) {
	let finalValue;
	if (view.iosAccessibilityAdjustsFontSize) {
		finalValue = value;

		if (view.iosAccessibilityMinFontScale && view.iosAccessibilityMinFontScale > value) {
			finalValue = view.iosAccessibilityMinFontScale;
		}
		if (view.iosAccessibilityMaxFontScale && view.iosAccessibilityMaxFontScale < value) {
			finalValue = view.iosAccessibilityMaxFontScale;
		}
	} else {
		finalValue = 1.0;
	}
	return finalValue;
}
