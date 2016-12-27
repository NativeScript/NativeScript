import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, Font, Color, FormattedString,
    TextDecoration, TextAlignment, TextTransform
} from "./text-base-common";

export * from "./text-base-common";
export class TextBase extends TextBaseCommon {

    public nativeView: UITextField | UITextView | UILabel | UIButton;

    //Text
    get [textProperty.native](): string {
        console.log("Set textProperty.native...");
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            return nativeView.titleForState(UIControlState.Normal);
        } else {
            return nativeView.text;
        }
    }
    set [textProperty.native](value: string) {
        let newValue = value + "";
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            nativeView.setTitleForState(newValue, UIControlState.Normal);

            //https://github.com/NativeScript/NativeScript/issues/2615
            let attributedTitle = nativeView.attributedTitleForState(UIControlState.Normal);
            if (attributedTitle !== null) {
                let style = this.style;
                setTextDecorationAndTransform(newValue, this.nativeView, style.textDecoration, style.textTransform, style.letterSpacing, style.color);
            }
        } else {
            nativeView.text = value;
        }
        this._requestLayoutOnTextChanged();
    }

    //FormattedText
    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        this._setFormattedTextPropertyToNative(value);
    }

    public _setFormattedTextPropertyToNative(value: FormattedString) {
        let newText = value ? value._formattedText : null;
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            nativeView.setAttributedTitleForState(newText, UIControlState.Normal);
        } else {
            nativeView.attributedText = newText;
        }
    }

    //Color
    get [colorProperty.native](): UIColor {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            return nativeView.titleColorForState(UIControlState.Normal);
        } else {
            return nativeView.textColor;
        }
    }
    set [colorProperty.native](value: UIColor) {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            nativeView.setTitleColorForState(value, UIControlState.Normal);
        } else {
            nativeView.textColor = value;
        }
    }

    //FontInternal
    get [fontInternalProperty.native](): UIFont {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        return nativeView.font;
    }
    set [fontInternalProperty.native](value: Font) {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        let font = value instanceof Font ? value.getUIFont(nativeView.font) : value;
        nativeView.font = font;
    }

    //TextAlignment
    get [textAlignmentProperty.native](): TextAlignment {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        switch (nativeView.textAlignment) {
            case NSTextAlignment.Left:
                return TextAlignment.LEFT;
            case NSTextAlignment.Center:
                return TextAlignment.CENTER;
            case NSTextAlignment.Right:
                return TextAlignment.RIGHT;
            default:
                throw new Error(`Unsupported NSTextAlignment: ${nativeView.textAlignment}. Currently supported values are NSTextAlignment.Left, NSTextAlignment.Center, and NSTextAlignment.Right.`);
        }
    }
    set [textAlignmentProperty.native](value: TextAlignment) {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        // NOTE: if Button textAlignment is not enough - set also btn.contentHorizontalAlignment
        switch (value) {
            case TextAlignment.LEFT:
                nativeView.textAlignment = NSTextAlignment.Left;
                break;
            case TextAlignment.CENTER:
                nativeView.textAlignment = NSTextAlignment.Center;
                break;
            case TextAlignment.RIGHT:
                nativeView.textAlignment = NSTextAlignment.Right;
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
        if (this.formattedText) {
            setFormattedTextDecorationAndTransform(this.formattedText, this.nativeView, value, this.style.textTransform, this.style.letterSpacing);
        } else {
            setTextDecorationAndTransform(this.text, this.nativeView, value, this.style.textTransform, this.style.letterSpacing, this.style.color);
        }
    }

    //TextTransform
    get [textTransformProperty.native](): TextTransform {
        return TextTransform.NONE;
    }
    set [textTransformProperty.native](value: TextTransform) {
        if (this.formattedText) {
            setFormattedTextDecorationAndTransform(this.formattedText, this.nativeView, this.style.textDecoration, value, this.style.letterSpacing);
        } else {
            setTextDecorationAndTransform(this.text, this.nativeView, this.style.textDecoration, value, this.style.letterSpacing, this.style.color);
        }
    }

    // LetterSpacing
    get [letterSpacingProperty.native](): number {
        return Number.NaN;
    }
    set [letterSpacingProperty.native](value: number) {
        if (this.formattedText) {
            setFormattedTextDecorationAndTransform(this.formattedText, this.nativeView, this.style.textDecoration, this.style.textTransform, value);
        } else {
            setTextDecorationAndTransform(this.text, this.nativeView, this.style.textDecoration, this.style.textTransform, value, this.style.color);
        }
    }
}

export function getTransformedText(text: string, textTransform: TextTransform): string {
    switch (textTransform) {
        case TextTransform.NONE:
            return text;
        case TextTransform.UPPERCASE:
            return NSStringFromNSAttributedString(text).uppercaseString;
        case TextTransform.LOWERCASE:
            return NSStringFromNSAttributedString(text).lowercaseString;
        case TextTransform.CAPITALIZE:
            return NSStringFromNSAttributedString(text).capitalizedString;
        default:
            throw new Error(`Invalid text transform value: ${textTransform}. Valid values are: "${TextTransform.NONE}", "${TextTransform.CAPITALIZE}", "${TextTransform.UPPERCASE}, "${TextTransform.LOWERCASE}".`);                
    }
}

function NSStringFromNSAttributedString(source: NSAttributedString | string): NSString {
    return NSString.stringWithString(source instanceof NSAttributedString && source.string || <string>source);
}

function updateFormattedStringTextDecoration(formattedText: FormattedString, textDecoration: TextDecoration): void {
    // TODO: Refactor this method so it doesn't modify FormattedString properties.
    // Instead it should create NSAttributedString and apply it to the nativeView.
    switch(textDecoration) {
        case TextDecoration.NONE:
            formattedText.underline = NSUnderlineStyle.StyleNone;
            formattedText.strikethrough = NSUnderlineStyle.StyleNone;
            break;
        case TextDecoration.UNDERLINE:
            formattedText.underline = NSUnderlineStyle.StyleSingle;
            formattedText.strikethrough = NSUnderlineStyle.StyleNone;
            break;
        case TextDecoration.LINE_THROUGH:
            formattedText.underline = NSUnderlineStyle.StyleNone;
            formattedText.strikethrough = NSUnderlineStyle.StyleSingle;
            break;
        case TextDecoration.UNDERLINE_LINE_THROUGH:
            formattedText.underline = NSUnderlineStyle.StyleSingle;
            formattedText.strikethrough = NSUnderlineStyle.StyleSingle;
            break;
        default: 
            throw new Error(`Invalid text decoration value: ${textDecoration}. Valid values are: "${TextDecoration.NONE}", "${TextDecoration.UNDERLINE}", "${TextDecoration.LINE_THROUGH}", "${TextDecoration.UNDERLINE_LINE_THROUGH}".`);
    }
}

function updateFormattedStringTextTransformation(formattedText: FormattedString, textTransform: TextTransform): void {
    // TODO: Refactor this method so it doesn't modify Span properties.
    // Instead it should create NSAttributedString and apply it to the nativeView.
    for (let i = 0, length = formattedText.spans.length; i < length; i++) {
        let span = formattedText.spans.getItem(i);
        span.text = getTransformedText(span.text, textTransform);
    }
}

function setFormattedTextDecorationAndTransform(formattedText: FormattedString, nativeView: UITextField | UITextView | UILabel | UIButton, textDecoration: TextDecoration, textTransform: TextTransform, letterSpacing: number) {
    updateFormattedStringTextDecoration(formattedText, textDecoration);
    updateFormattedStringTextTransformation(formattedText, textTransform);

    if (typeof letterSpacing === "number" && !isNaN(letterSpacing)) {
        if (nativeView instanceof UIButton) {
            let attrText = NSMutableAttributedString.alloc().initWithAttributedString(nativeView.attributedTitleForState(UIControlState.Normal));
            attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * nativeView.font.pointSize, { location: 0, length: attrText.length });
            nativeView.setAttributedTitleForState(attrText, UIControlState.Normal);
        } else {
            let attrText = NSMutableAttributedString.alloc().initWithAttributedString(nativeView.attributedText);
            attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * nativeView.font.pointSize, { location: 0, length: attrText.length });
            nativeView.attributedText = attrText;
        }
    }
}

function setTextDecorationAndTransform(text: string, nativeView: UITextField | UITextView | UILabel | UIButton, textDecoration: TextDecoration, textTransform: TextTransform, letterSpacing: number, color: Color) {
    let hasLetterSpacing = typeof letterSpacing === "number" && !isNaN(letterSpacing);

    let dict = new Map<string, number>();
    switch(textDecoration) {
        case TextDecoration.NONE:
            break;
        case TextDecoration.UNDERLINE:
            dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
            break;
        case TextDecoration.LINE_THROUGH:
            dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
            break;
        case TextDecoration.UNDERLINE_LINE_THROUGH:
            dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
            dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
            break;
        default: 
            throw new Error(`Invalid text decoration value: ${textDecoration}. Valid values are: "${TextDecoration.NONE}", "${TextDecoration.UNDERLINE}", "${TextDecoration.LINE_THROUGH}", "${TextDecoration.UNDERLINE_LINE_THROUGH}".`);
    }
    
    if (hasLetterSpacing) {
        dict.set(NSKernAttributeName, letterSpacing * nativeView.font.pointSize);
    }

    if (color) {
        dict.set(NSForegroundColorAttributeName, color.ios);
    }

    let source = getTransformedText(text, textTransform);
    if (dict.size > 0) {
        let result = NSMutableAttributedString.alloc().initWithString(source);
        result.setAttributesRange(<any>dict, { location: 0, length: source.length });
        if (nativeView instanceof UIButton) {
            nativeView.setAttributedTitleForState(result, UIControlState.Normal);
        } else {
            nativeView.attributedText = result;
        }
    } else {
        if (nativeView instanceof UIButton) {
            // Clear attributedText or title won't be affected.
            nativeView.setAttributedTitleForState(null, UIControlState.Normal);
            nativeView.setTitleForState(source, UIControlState.Normal);
        } else {
            // Clear attributedText or text won't be affected.
            nativeView.attributedText = undefined;
            nativeView.text = source;
        }
    }
}
