import { TextDecoration, TextAlignment, TextTransform, WhiteSpace } from "./text-base";
import { Font } from "../styling/font";
import { backgroundColorProperty } from "../styling/style-properties";
import {
    TextBaseCommon, formattedTextProperty, textAlignmentProperty, textDecorationProperty, fontSizeProperty,
    textProperty, textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length,
    whiteSpaceProperty, lineHeightProperty, FormattedString, layout, Span, Color, isBold
} from "./text-base-common";

export * from "./text-base-common";

interface TextTransformation {
    new (owner: TextBase): android.text.method.TransformationMethod;
}

let TextTransformation: TextTransformation;

function initializeTextTransformation(): void {
    if (TextTransformation) {
        return;
    }

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
                return createSpannableStringBuilder(formattedText);
            }
            else {
                return getTransformedText(this.textBase.text, this.textBase.textTransform);
            }
        }

        public onFocusChanged(view: android.view.View, sourceText: string, focused: boolean, direction: number, previouslyFocusedRect: android.graphics.Rect): void {
            // Do nothing for now.
        }
    }

    TextTransformation = TextTransformationImpl;
}

export class TextBase extends TextBaseCommon {
    nativeViewProtected: android.widget.TextView;
    private _defaultTransformationMethod: android.text.method.TransformationMethod;
    private _paintFlags: number;
    private _minHeight: number;
    private _maxHeight: number;
    private _minLines: number;
    private _maxLines: number;

    public initNativeView(): void {
        initializeTextTransformation();
        const nativeView = this.nativeViewProtected;
        this._defaultTransformationMethod = nativeView.getTransformationMethod();
        this._minHeight = nativeView.getMinHeight();
        this._maxHeight = nativeView.getMaxHeight();
        this._minLines = nativeView.getMinLines();
        this._maxLines = nativeView.getMaxLines();
        super.initNativeView();
    }

    public resetNativeView(): void {
        super.resetNativeView();
        const nativeView = this.nativeViewProtected;
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

    [textProperty.getDefault](): number {
        return -1;
    }

    [textProperty.setNative](value: string | number) {
        const reset = value === -1;
        if (!reset && this.formattedText) {
            return;
        }

        this._setNativeText(reset);
    }

    [formattedTextProperty.setNative](value: FormattedString) {
        const nativeView = this.nativeViewProtected;
        if (!value) {
            if (nativeView instanceof android.widget.Button &&
                nativeView.getTransformationMethod() instanceof TextTransformation) {
                nativeView.setTransformationMethod(this._defaultTransformationMethod);
            }
        }

        // Don't change the transformation method if this is secure TextField or we'll lose the hiding characters.
        if ((<any>this).secure) {
            return;
        }

        const spannableStringBuilder = createSpannableStringBuilder(value);
        nativeView.setText(<any>spannableStringBuilder);

        textProperty.nativeValueChange(this, (value === null || value === undefined) ? '' : value.toString());

        if (spannableStringBuilder && nativeView instanceof android.widget.Button &&
            !(nativeView.getTransformationMethod() instanceof TextTransformation)) {
            // Replace Android Button's default transformation (in case the developer has not already specified a text-transform) method 
            // with our transformation method which can handle formatted text.
            // Otherwise, the default tranformation method of the Android Button will overwrite and ignore our spannableStringBuilder.
            nativeView.setTransformationMethod(new TextTransformation(this));
        }
    }

    [textTransformProperty.setNative](value: TextTransform) {
        if (value === "initial") {
            this.nativeViewProtected.setTransformationMethod(this._defaultTransformationMethod);
            return;
        }

        // Don't change the transformation method if this is secure TextField or we'll lose the hiding characters.
        if ((<any>this).secure) {
            return;
        }

        this.nativeViewProtected.setTransformationMethod(new TextTransformation(this));
    }

    [textAlignmentProperty.getDefault](): TextAlignment {
        return "initial";
    }
    [textAlignmentProperty.setNative](value: TextAlignment) {
        let verticalGravity = this.nativeViewProtected.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (value) {
            case "initial":
            case "left":
                this.nativeViewProtected.setGravity(android.view.Gravity.START | verticalGravity);
                break;

            case "center":
                this.nativeViewProtected.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;

            case "right":
                this.nativeViewProtected.setGravity(android.view.Gravity.END | verticalGravity);
                break;
        }
    }

    // Overridden in TextField because setSingleLine(false) will remove methodTransformation.
    // and we don't want to allow TextField to be multiline
    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        const nativeView = this.nativeViewProtected;
        switch (value) {
            case "initial":
            case "normal":
                nativeView.setSingleLine(false);
                nativeView.setEllipsize(null);
                break;
            case "nowrap":
                nativeView.setSingleLine(true);
                nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
                break;
        }
    }

    [colorProperty.getDefault](): android.content.res.ColorStateList {
        return this.nativeViewProtected.getTextColors();
    }
    [colorProperty.setNative](value: Color | android.content.res.ColorStateList) {
        if (!this.formattedText || !(value instanceof Color)) {
            if (value instanceof Color) {
                this.nativeViewProtected.setTextColor(value.android);
            } else {
                this.nativeViewProtected.setTextColor(value);
            }
        }
    }

    [fontSizeProperty.getDefault](): { nativeSize: number } {
        return { nativeSize: this.nativeViewProtected.getTextSize() };
    }
    [fontSizeProperty.setNative](value: number | { nativeSize: number }) {
        if (!this.formattedText || (typeof value !== "number")) {
            if (typeof value === "number") {
                this.nativeViewProtected.setTextSize(value);
            } else {
                this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
            }
        }
    }

    [lineHeightProperty.getDefault](): number {
        return this.nativeViewProtected.getLineSpacingExtra() / layout.getDisplayDensity();
    }
    [lineHeightProperty.setNative](value: number) {
        this.nativeViewProtected.setLineSpacing(value * layout.getDisplayDensity(), 1);
    }

    [fontInternalProperty.getDefault](): android.graphics.Typeface {
        return this.nativeViewProtected.getTypeface();
    }
    [fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
        if (!this.formattedText || !(value instanceof Font)) {
            this.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
        }
    }

    [textDecorationProperty.getDefault](value: number) {
        return this._paintFlags = this.nativeViewProtected.getPaintFlags();
    }

    [textDecorationProperty.setNative](value: number | TextDecoration) {
        switch (value) {
            case "none":
                this.nativeViewProtected.setPaintFlags(0);
                break;
            case "underline":
                this.nativeViewProtected.setPaintFlags(android.graphics.Paint.UNDERLINE_TEXT_FLAG);
                break;
            case "line-through":
                this.nativeViewProtected.setPaintFlags(android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
                break;
            case "underline line-through":
                this.nativeViewProtected.setPaintFlags(android.graphics.Paint.UNDERLINE_TEXT_FLAG | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
                break;
            default:
                this.nativeViewProtected.setPaintFlags(value);
                break;
        }
    }

    [letterSpacingProperty.getDefault](): number {
        return org.nativescript.widgets.ViewHelper.getLetterspacing(this.nativeViewProtected);
    }
    [letterSpacingProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setLetterspacing(this.nativeViewProtected, value);
    }

    [paddingTopProperty.getDefault](): Length {
        return { value: this._defaultPaddingTop, unit: "px" }
    }
    [paddingTopProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderTopWidth, 0));
    }

    [paddingRightProperty.getDefault](): Length {
        return { value: this._defaultPaddingRight, unit: "px" }
    }
    [paddingRightProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderRightWidth, 0));
    }

    [paddingBottomProperty.getDefault](): Length {
        return { value: this._defaultPaddingBottom, unit: "px" }
    }
    [paddingBottomProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderBottomWidth, 0));
    }

    [paddingLeftProperty.getDefault](): Length {
        return { value: this._defaultPaddingLeft, unit: "px" }
    }
    [paddingLeftProperty.setNative](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeViewProtected, Length.toDevicePixels(value, 0) + Length.toDevicePixels(this.style.borderLeftWidth, 0));
    }

    _setNativeText(reset: boolean = false): void {
        if (reset) {
            this.nativeViewProtected.setText(null);
            return;
        }

        let transformedText: any;
        if (this.formattedText) {
            transformedText = createSpannableStringBuilder(this.formattedText);
        } else {
            const text = this.text;
            const stringValue = (text === null || text === undefined) ? '' : text.toString();
            transformedText = getTransformedText(stringValue, this.textTransform);
        }

        this.nativeViewProtected.setText(<any>transformedText);
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

export function getTransformedText(text: string, textTransform: TextTransform): string {
    switch (textTransform) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "capitalize":
            return getCapitalizedString(text);
        case "none":
        default:
            return text;
    }
}

function createSpannableStringBuilder(formattedString: FormattedString): android.text.SpannableStringBuilder {
    if (!formattedString) {
        return null;
    }

    const ssb = new android.text.SpannableStringBuilder();
    for (let i = 0, spanStart = 0, spanLength = 0, length = formattedString.spans.length; i < length; i++) {
        const span = formattedString.spans.getItem(i);
        const text = span.text;
        const textTransform = (<TextBase>formattedString.parent).textTransform;
        let spanText = (text === null || text === undefined) ? '' : text.toString();
        if (textTransform && textTransform !== "none") {
            spanText = getTransformedText(spanText, textTransform);
        }

        spanLength = spanText.length;
        if (spanLength > 0) {
            ssb.insert(spanStart, spanText);
            setSpanModifiers(ssb, span, spanStart, spanStart + spanLength);
            spanStart += spanLength;
        }
    }

    return ssb;
}

function setSpanModifiers(ssb: android.text.SpannableStringBuilder, span: Span, start: number, end: number): void {
    const spanStyle = span.style;
    const bold = isBold(spanStyle.fontWeight);
    const italic = spanStyle.fontStyle === "italic";

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

    let backgroundColor: Color;
    if (backgroundColorProperty.isSet(spanStyle)) {
        backgroundColor = spanStyle.backgroundColor;
    } else if (backgroundColorProperty.isSet(span.parent.style)) {
        // parent is FormattedString
        backgroundColor = span.parent.style.backgroundColor;
    } else if (backgroundColorProperty.isSet(span.parent.parent.style)) {
        // parent.parent is TextBase
        backgroundColor = span.parent.parent.style.backgroundColor;
    }

    if (backgroundColor) {
        ssb.setSpan(new android.text.style.BackgroundColorSpan(backgroundColor.android), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    let valueSource: typeof spanStyle;
    if (textDecorationProperty.isSet(spanStyle)) {
        valueSource = spanStyle;
    } else if (textDecorationProperty.isSet(span.parent.style)) {
        // span.parent is FormattedString
        valueSource = span.parent.style;
    } else if (textDecorationProperty.isSet(span.parent.parent.style)) {
        // span.parent.parent is TextBase
        valueSource = span.parent.parent.style;
    }

    if (valueSource) {
        const textDecorations = valueSource.textDecoration;
        const underline = textDecorations.indexOf('underline') !== -1;
        if (underline) {
            ssb.setSpan(new android.text.style.UnderlineSpan(), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }

        const strikethrough = textDecorations.indexOf('line-through') !== -1;
        if (strikethrough) {
            ssb.setSpan(new android.text.style.StrikethroughSpan(), start, end, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }

    // TODO: Implement letterSpacing for Span here.
    // const letterSpacing = formattedString.parent.style.letterSpacing;
    // if (letterSpacing > 0) {
    //     ssb.setSpan(new android.text.style.ScaleXSpan((letterSpacing + 1) / 10), start, end, android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
    // }
}