import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, whiteSpaceProperty,
    Font, Color, FormattedString, TextDecoration, TextAlignment, TextTransform, WhiteSpace,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length, layout
} from "./text-base-common";

export * from "./text-base-common";
export class TextBase extends TextBaseCommon {
    _transformationMethod: any;
    _nativeView: android.widget.TextView;

    //Text
    get [textProperty.native](): string {
        return this._nativeView.getText();
    }
    set [textProperty.native](value: string) {
        if (value === null || value === undefined) {
            value = "";
        }

        this._nativeView.setText(value);
    }

    //FormattedText
    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        this._setFormattedTextPropertyToNative(value);
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

    //FontInternal
    get [fontInternalProperty.native](): { typeface: android.graphics.Typeface, fontSize: number } {
        let textView = this._nativeView;
        return {
            typeface: textView.getTypeface(),
            fontSize: textView.getTextSize()
        };
    }
    set [fontInternalProperty.native](value: Font | { typeface: android.graphics.Typeface, fontSize: number }) {
        let textView = this._nativeView;

        let typeface: android.graphics.Typeface;
        let fontSize: number;
        if (value instanceof Font) {
            typeface = value.getAndroidTypeface();
            textView.setTextSize(value.fontSize);
        } else {
            typeface = value.typeface;
            textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.fontSize);
        }

        textView.setTypeface(typeface);
    }

    //TextAlignment
    get [textAlignmentProperty.native](): TextAlignment {
        let textAlignmentGravity = this._nativeView.getGravity() & android.view.View.TEXT_ALIGNMENT_GRAVITY;
        switch (textAlignmentGravity) {
            case android.view.Gravity.LEFT:
                return TextAlignment.LEFT;
            case android.view.Gravity.CENTER_HORIZONTAL:
                return TextAlignment.CENTER;
            case android.view.Gravity.RIGHT:
                return TextAlignment.RIGHT;
            default:
                throw new Error(`Unsupported android.view.View.TEXT_ALIGNMENT_GRAVITY: ${textAlignmentGravity}. Currently supported values are android.view.Gravity.LEFT, android.view.Gravity.CENTER_HORIZONTAL, and android.view.Gravity.RIGHT.`);
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
        
        switch(value){
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

    //TextTransform
    get [textTransformProperty.native](): TextTransform {
        return TextTransform.NONE;
    }
    set [textTransformProperty.native](value: TextTransform) {
        this._setFormattedTextPropertyToNative(this.formattedText);
    }

    private _originalTransformationMethod: android.text.method.TransformationMethod;
    public _setFormattedTextPropertyToNative(value: FormattedString) {
        // TODO: Check if there is an option to force call the transformation method without
        // creating new native instance.
        if (!this._nativeView) {
            return;
        }
        
        if (!this._originalTransformationMethod) {
            this._originalTransformationMethod = this.android.getTransformationMethod();
        }

        let newText = value ? value._formattedText : null;//newText is of type android.text.SpannableStringBuilder
        if (newText) {
            this._nativeView.setTransformationMethod(new TextTransformation(this.text, value, this.style.textTransform));
        } 
        else {
            if (this._originalTransformationMethod) {
                this.android.setTransformationMethod(this._originalTransformationMethod);
                this._originalTransformationMethod = null;
            }
        }

        this._nativeView.setText(newText);
    }

    //WhiteSpace
    get [whiteSpaceProperty.native](): WhiteSpace {
        return WhiteSpace.NORMAL;
    }
    set [whiteSpaceProperty.native](value: WhiteSpace) {
        let nativeView = this._nativeView;
        switch(value){
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

        let nowrap = value === WhiteSpace.NO_WRAP;
        nativeView.setSingleLine(nowrap);
        nativeView.setEllipsize(nowrap ? android.text.TextUtils.TruncateAt.END : null);
    }

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
        org.nativescript.widgets.ViewHelper.setPaddingTop(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderTopWidth);
    }

    //PaddingRight
    get [paddingRightProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingRight(this.nativeView), unit: "px" };
    }
    set [paddingRightProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingRight(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderRightWidth);
    }

    //PaddingBottom
    get [paddingBottomProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingBottom(this.nativeView), unit: "px" };
    }
    set [paddingBottomProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingBottom(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderBottomWidth);
    }

    //PaddingLeft
    get [paddingLeftProperty.native](): Length {
        return { value: org.nativescript.widgets.ViewHelper.getPaddingLeft(this.nativeView), unit: "px" };
    }
    set [paddingLeftProperty.native](value: Length) {
        org.nativescript.widgets.ViewHelper.setPaddingLeft(this.nativeView, Length.toDevicePixels(value, 0) + this.style.effectiveBorderLeftWidth);
    }
}

@Interfaces([android.text.method.TransformationMethod])
class TextTransformation extends android.text.method.ReplacementTransformationMethod {
    constructor(public originalText: string, public formattedText: FormattedString, public textTransform: TextTransform) {
        super();
        return global.__native(this);
    }

    protected getOriginal(): native.Array<string> {
        return this.formattedText ? this.formattedText._formattedText : this.originalText;
    }

    protected getReplacement(): native.Array<string> {
        let result: string = "";
        let textTransform = this.textTransform
        if (this.formattedText) {
            for (let i = 0, length = this.formattedText.spans.length; i < length; i++) {
                let span = this.formattedText.spans.getItem(i);
                result += getTransformedText(span.text, textTransform);
                // span.text = formatString(span.text, this.textTransform);
            }
        } 
        else {
            result = getTransformedText(this.originalText, textTransform);
        }

        return result;
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
        case TextTransform.NONE:
            return text;
        case TextTransform.UPPERCASE:
            return text.toUpperCase();
        case TextTransform.LOWERCASE:
            return text.toLowerCase();
        case TextTransform.CAPITALIZE:
            return getCapitalizedString(text);
        default:
            throw new Error(`Invalid text transform value: ${textTransform}. Valid values are: "${TextTransform.NONE}", "${TextTransform.CAPITALIZE}", "${TextTransform.UPPERCASE}, "${TextTransform.LOWERCASE}".`);                
    }
}