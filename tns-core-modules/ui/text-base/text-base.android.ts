import { Font } from "ui/styling/font";

import {
    TextBaseCommon, formattedTextProperty, textAlignmentProperty, textDecorationProperty, fontSizeProperty,
    textProperty, textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty,
    whiteSpaceProperty, FormattedString, TextDecoration, TextAlignment, TextTransform, WhiteSpace,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length,
    layout, Span, Color
} from "./text-base-common";

import { _isSet as isSet } from "ui/core/properties";
import { FontWeight, FontStyle } from "ui/styling/font";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {
    _nativeView: android.widget.TextView;

    //Text
    get [textProperty.native](): string {
        return this._nativeView.getText();
    }
    set [textProperty.native](value: string) {
        const text = (value === null || value === undefined) ? '' : value.toString();
        this._nativeView.setText(text);
    }

    //FormattedText
    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        let spannableStringBuilder = createSpannableStringBuilder(value);
        this._nativeView.setText(<any>spannableStringBuilder);
        textProperty.nativeValueChange(this, (value === null || value === undefined) ? '' : value.toString());

        if (spannableStringBuilder && this._nativeView instanceof android.widget.Button &&
            !(this._nativeView.getTransformationMethod() instanceof TextTransformation)) {
            // Replace Android Button's default transformation (in case the developer has not already specified a text-transform) method 
            // with our transformation method which can handle formatted text.
            // Otherwise, the default tranformation method of the Android Button will overwrite and ignore our spannableStringBuilder.
            // We can't set it to NONE since it is the default value. Set it to something else first.
            this.style[textTransformProperty.cssName] = TextTransform.UPPERCASE;
            this.style[textTransformProperty.cssName] = TextTransform.NONE;
        }
    }

    //TextTransform
    get [textTransformProperty.native](): android.text.method.TransformationMethod {
        return this._nativeView.getTransformationMethod();
    }
    set [textTransformProperty.native](value: TextTransform | android.text.method.TransformationMethod) {
        if (typeof value === "string") {
            this._nativeView.setTransformationMethod(new TextTransformation(this));
        } else {
            this._nativeView.setTransformationMethod(value);
        }
    }

    //Color
    get [colorProperty.native](): android.content.res.ColorStateList {
        return this._nativeView.getTextColors();
    }
    set [colorProperty.native](value: Color | android.content.res.ColorStateList) {
        if (value instanceof Color) {
            this._nativeView.setTextColor(value.android);
        } else {
            this._nativeView.setTextColor(value);
        }
    }

    //FontSize
    get [fontSizeProperty.native](): { nativeSize: number } {
        return { nativeSize: this._nativeView.getTextSize() };
    }
    set [fontSizeProperty.native](value: number | { nativeSize: number }) {
        if (typeof value === "number") {
            this._nativeView.setTextSize(value);
        } else {
            this._nativeView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    }

    //FontInternal
    get [fontInternalProperty.native](): android.graphics.Typeface {
        return this._nativeView.getTypeface();
    }
    set [fontInternalProperty.native](value: Font | android.graphics.Typeface) {
        this._nativeView.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    }

    //TextAlignment
    get [textAlignmentProperty.native](): TextAlignment {
        let textAlignmentGravity = this._nativeView.getGravity() & android.view.Gravity.HORIZONTAL_GRAVITY_MASK;
        switch (textAlignmentGravity) {
            case android.view.Gravity.LEFT:
                return TextAlignment.LEFT;
            case android.view.Gravity.CENTER_HORIZONTAL:
                return TextAlignment.CENTER;
            case android.view.Gravity.RIGHT:
                return TextAlignment.RIGHT;
            default:
                return TextAlignment.LEFT;
        }
    }
    set [textAlignmentProperty.native](value: TextAlignment) {
        let verticalGravity = this._nativeView.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (value) {
            case TextAlignment.LEFT:
                this._nativeView.setGravity(android.view.Gravity.LEFT | verticalGravity);
                break;
            case TextAlignment.CENTER:
                this._nativeView.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;
            case TextAlignment.RIGHT:
                this._nativeView.setGravity(android.view.Gravity.RIGHT | verticalGravity);
                break;
            default:
                throw new Error(`Invalid text alignment value: ${value}. Valid values are: "${TextAlignment.LEFT}", "${TextAlignment.CENTER}", "${TextAlignment.RIGHT}".`);
        }
    }

    //TextDecoration
    get [textDecorationProperty.native](): TextDecoration {
        return TextDecoration.NONE;
    }
    set [textDecorationProperty.native](value: TextDecoration) {
        let flags: number;

        switch (value) {
            case TextDecoration.NONE:
                flags = 0;
                break;
            case TextDecoration.UNDERLINE:
                flags = android.graphics.Paint.UNDERLINE_TEXT_FLAG;
                break;
            case TextDecoration.LINE_THROUGH:
                flags = android.graphics.Paint.STRIKE_THRU_TEXT_FLAG;
                break;
            case TextDecoration.UNDERLINE_LINE_THROUGH:
                flags = android.graphics.Paint.UNDERLINE_TEXT_FLAG | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG;
                break;
            default:
                throw new Error(`Invalid text decoration value: ${value}. Valid values are: "${TextDecoration.NONE}", "${TextDecoration.UNDERLINE}", "${TextDecoration.LINE_THROUGH}", "${TextDecoration.UNDERLINE_LINE_THROUGH}".`);
        }

        this._nativeView.setPaintFlags(flags);
    }

    //WhiteSpace
    get [whiteSpaceProperty.native](): WhiteSpace {
        return WhiteSpace.NORMAL;
    }
    set [whiteSpaceProperty.native](value: WhiteSpace) {
        let nativeView = this._nativeView;
        switch (value) {
            case WhiteSpace.NORMAL:
                nativeView.setSingleLine(false);
                nativeView.setEllipsize(null);
                break;
            case WhiteSpace.NO_WRAP:
                nativeView.setSingleLine(true);
                nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
                break;
            default:
                throw new Error(`Invalid whitespace value: ${value}. Valid values are: "${WhiteSpace.NORMAL}", "${WhiteSpace.NO_WRAP}".`);
        }
    }

    //LetterSpacing
    get [letterSpacingProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getLetterspacing(this._nativeView);
    }
    set [letterSpacingProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setLetterspacing(this._nativeView, value);
    }

    //PaddingTop
    get [paddingTopProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingTop(this.nativeView), unit: "px" };
    }
    set [paddingTopProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
    }

    //PaddingRight
    get [paddingRightProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingRight(this.nativeView), unit: "px" };
    }
    set [paddingRightProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
    }

    //PaddingBottom
    get [paddingBottomProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingBottom(this.nativeView), unit: "px" };
    }
    set [paddingBottomProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
    }

    //PaddingLeft
    get [paddingLeftProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingLeft(this.nativeView), unit: "px" };
    }
    set [paddingLeftProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeView, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
    }
}

@Interfaces([android.text.method.TransformationMethod])
class TextTransformation extends android.text.method.ReplacementTransformationMethod {
    constructor(public textBase: TextBase) {
        super();
        return global.__native(this);
    }

    protected getOriginal(): native.Array<string> {
        return convertStringToNativeCharArray(this.textBase.formattedText ? this.textBase.formattedText.toString() : this.textBase.text);
    }

    protected getReplacement(): native.Array<string> {
        let replacementString: string = "";
        const formattedText = this.textBase.formattedText;
        const textTransform = this.textBase.textTransform;
        if (formattedText) {
            for (let i = 0, length = formattedText.spans.length; i < length; i++) {
                let span = formattedText.spans.getItem(i);
                replacementString += getTransformedText(span.text, textTransform);
            }
        }
        else {
            replacementString = getTransformedText(this.textBase.text, textTransform);
        }

        return convertStringToNativeCharArray(replacementString);
    }

    public getTransformation(charSeq: any, view: android.view.View): any {
        const formattedText = this.textBase.formattedText;
        if (formattedText) {
            return createSpannableStringBuilder(formattedText);
        }
        else {
            return getTransformedText(this.textBase.text, this.textBase.textTransform);
        }
    }
}

function getCapitalizedString(str: string): string {
    let words = str.split(" ");
    let newWords = [];
    for (let i = 0, length = words.length; i < length; i++) {
        let word = words[i].toLowerCase();
        newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
    }

    return newWords.join(" ");
}

function getTransformedText(text: string, textTransform: TextTransform): string {
    switch (textTransform) {
        case TextTransform.NONE:
            return text;
        case TextTransform.UPPERCASE:
            return text.toUpperCase();
        case TextTransform.LOWERCASE:
            return text.toLowerCase();
        case TextTransform.CAPITALIZE:
            return getCapitalizedString(text);
        default:
            throw new Error(`Invalid text transform value: ${textTransform}. Valid values are: "${TextTransform.NONE}", "${TextTransform.CAPITALIZE}", "${TextTransform.UPPERCASE}", "${TextTransform.LOWERCASE}".`);
    }
}

function createSpannableStringBuilder(formattedString: FormattedString): android.text.SpannableStringBuilder {
    let ssb = new android.text.SpannableStringBuilder();

    if (formattedString === null || formattedString === undefined) {
        return ssb;
    }

    for (let i = 0, spanStart = 0, spanLength = 0, length = formattedString.spans.length; i < length; i++) {
        const span = formattedString.spans.getItem(i);
        const text = span.text;
        const textTransform = (<TextBase>formattedString.parent).textTransform;
        let spanText = (text === null || text === undefined) ? '' : text.toString();
        if (textTransform) {
            spanText = getTransformedText(spanText, textTransform);
        }

        spanLength = spanText.length;
        if (spanLength !== 0) {
            ssb.insert(spanStart, spanText);
            setSpanModifiers(ssb, span, spanStart, spanStart + spanLength);
            spanStart += spanLength;
        }
    }
    return ssb;
}

function convertStringToNativeCharArray(value: string): native.Array<string> {
    let nativeCharArray: native.Array<string> = [];

    for (let i = 0, length = value.length; i < length; i++) {
        nativeCharArray[i] = value.charAt(i);
    }
    return nativeCharArray;
}

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === FontWeight.BOLD
        || fontWeight === "700"
        || fontWeight === FontWeight.EXTRA_BOLD
        || fontWeight === FontWeight.BLACK;
}

function setSpanModifiers(ssb: android.text.SpannableStringBuilder, span: Span, start: number, end: number): void {
    const style = span.style;
    const bold = isBold(style.fontWeight);
    const italic = style.fontStyle === FontStyle.ITALIC;

    if (bold && italic) {
        ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD_ITALIC), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    else if (bold) {
        ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    else if (italic) {
        ssb.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.ITALIC), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    const fontFamily = span.fontFamily;
    if (fontFamily) {
        const font = new Font(fontFamily, 0, (italic) ? "italic" : "normal", (bold) ? "bold" : "normal");
        const typefaceSpan: android.text.style.TypefaceSpan = new org.nativescript.widgets.CustomTypefaceSpan(fontFamily, font.getAndroidTypeface());
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

    // We don't use isSet function here because defaultValue for backgroundColor is null.
    const backgroundColor = style.backgroundColor || (<FormattedString>span.parent).backgroundColor || (<TextBase>(<FormattedString>span.parent).parent).backgroundColor;
    if (backgroundColor) {
        ssb.setSpan(new android.text.style.BackgroundColorSpan(backgroundColor.android), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    let valueSource: typeof style;
    if (isSet(textDecorationProperty, style)) {
        valueSource = style;
    } else if (isSet(textDecorationProperty, span.parent.style)) {
        // span.parent is FormattedString
        valueSource = span.parent.style;
    } else if (isSet(textDecorationProperty, span.parent.parent.style)) {
        // span.parent.parent is TextBase
        valueSource = span.parent.parent.style;
    }

    if (valueSource) {
        const textDecorations = valueSource.textDecoration;
        const underline = textDecorations.indexOf(TextDecoration.UNDERLINE) !== -1;
        if (underline) {
            ssb.setSpan(new android.text.style.UnderlineSpan(), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }

        const strikethrough = textDecorations.indexOf(TextDecoration.LINE_THROUGH) !== -1;
        if (strikethrough) {
            ssb.setSpan(new android.text.style.StrikethroughSpan(), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }
}