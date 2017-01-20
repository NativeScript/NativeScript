import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, Font, Color, FormattedString,
    TextDecoration, TextAlignment, TextTransform, Span
} from "./text-base-common";

import { FontWeight, FontStyle } from "ui/styling/font";
import * as utils from "utils/utils";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {

    private textDecorationSet: boolean;
    private textTransformSet: boolean;
    private letterSpacingSet: boolean;

    public nativeView: UITextField | UITextView | UILabel | UIButton;

    //Text
    get [textProperty.native](): string {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            return nativeView.titleForState(UIControlState.Normal);
        } else {
            return nativeView.text;
        }
    }
    set [textProperty.native](value: string) {
        const newValue = (value === undefined || value === null) ? '' : value.toString();
        const nativeView = this.nativeView;
        if (this.textDecorationSet || this.textTransformSet || this.letterSpacingSet) {
            const style = this.style;
            setTextDecorationAndTransform(newValue, nativeView, style.textDecoration, style.textTransform, style.letterSpacing, style.color);
        } else if (nativeView instanceof UIButton) {
            nativeView.setTitleForState(newValue, UIControlState.Normal);
        } else {
            nativeView.text = newValue;
        }

        this._requestLayoutOnTextChanged();
    }

    //FormattedText
    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        const style = this.style;
        setFormattedTextDecorationAndTransform(value, this.nativeView, style.textDecoration, style.textTransform, style.letterSpacing);
        textProperty.nativeValueChange(this, !value ? '' : value.toString());
    }

    //Color
    get [colorProperty.native](): Color {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            return utils.ios.getColor(nativeView.titleColorForState(UIControlState.Normal));
        } else {
            return utils.ios.getColor(nativeView.textColor);
        }
    }
    set [colorProperty.native](value: Color) {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            nativeView.setTitleColorForState(value.ios, UIControlState.Normal);
        } else {
            nativeView.textColor = value.ios;
        }
    }

    //FontInternal
    get [fontInternalProperty.native](): UIFont {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        return nativeView.font;
    }
    set [fontInternalProperty.native](value: Font | UIFont) {
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
            case NSTextAlignment.Natural:
            case NSTextAlignment.Left:
                return "left";
            case NSTextAlignment.Center:
                return "center";
            case NSTextAlignment.Right:
                return "right";
            default:
                throw new Error(`Unsupported NSTextAlignment: ${nativeView.textAlignment}. Currently supported values are NSTextAlignment.Left, NSTextAlignment.Center, and NSTextAlignment.Right.`);
        }
    }
    set [textAlignmentProperty.native](value: TextAlignment) {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        // NOTE: if Button textAlignment is not enough - set also btn.contentHorizontalAlignment
        switch (value) {
            case "left":
                nativeView.textAlignment = NSTextAlignment.Left;
                break;
            case "center":
                nativeView.textAlignment = NSTextAlignment.Center;
                break;
            case "right":
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
        this.textDecorationSet = value !== TextDecoration.NONE;
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
        this.textTransformSet = value !== TextTransform.NONE;
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
        this.letterSpacingSet = value !== 0;
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

function setFormattedTextDecorationAndTransform(formattedText: FormattedString, nativeView: UITextField | UITextView | UILabel | UIButton, textDecoration: TextDecoration, textTransform: TextTransform, letterSpacing: number) {
    const attrText = createNSMutableAttributedString(formattedText);
    const hasLetterSpacing = typeof letterSpacing === "number" && !isNaN(letterSpacing) && letterSpacing !== 0;
    if (hasLetterSpacing) {
        attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * nativeView.font.pointSize, { location: 0, length: attrText.length });
    }

    if (nativeView instanceof UIButton) {
        nativeView.setAttributedTitleForState(attrText, UIControlState.Normal);
    }
    else {
        nativeView.attributedText = attrText;
    }
}

function setTextDecorationAndTransform(text: string, nativeView: UITextField | UITextView | UILabel | UIButton, textDecoration: TextDecoration, textTransform: TextTransform, letterSpacing: number, color: Color) {
    const hasLetterSpacing = typeof letterSpacing === "number" && !isNaN(letterSpacing) && letterSpacing !== 0;

    let dict = new Map<string, number>();
    switch (textDecoration) {
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

function createNSMutableAttributedString(formattedString: FormattedString): NSMutableAttributedString {
    let mas = NSMutableAttributedString.alloc().init();
    if (formattedString) {
        for (let i = 0, spanStart = 0, spanLength = 0, length = formattedString.spans.length; i < length; i++) {
            const span = formattedString.spans.getItem(i);
            const text = span.text;
            const textTransform = (<TextBase>formattedString.parent).textTransform;
            let spanText = (text === null || text === undefined) ? '' : text.toString();
            if (textTransform) {
                spanText = getTransformedText(spanText, textTransform);
            }

            spanLength = spanText.length;
            const nsAttributedString = createMutableStringForSpan(span, spanText);
            mas.insertAttributedStringAtIndex(nsAttributedString, spanStart);
            spanStart += spanLength;
        }
    }
    return mas;
}

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === FontWeight.BOLD
        || fontWeight === "700"
        || fontWeight === FontWeight.EXTRA_BOLD
        || fontWeight === FontWeight.BLACK;
}

function createMutableStringForSpan(span: Span, text: string): NSMutableAttributedString {
    let attrDict = <{ key: string, value: any }>{};
    const style = span.style;
    const bold = isBold(style.fontWeight);
    const italic = style.fontStyle === FontStyle.ITALIC;

    let fontFamily = span.fontFamily;
    let fontSize = span.fontSize;

    if (bold || italic || fontFamily || fontSize) {
        let font;
        if (fontFamily) {
            if (!fontSize) {
                fontSize = utils.ios.getter(UIFont, UIFont.systemFontSize);
            }

            font = UIFont.fontWithNameSize(fontFamily, fontSize);
        }

        if (!font) {
            const fontDescriptor = UIFontDescriptor.new();
            let symbolicTraits;
            if (bold) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitBold;
            }

            if (italic) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitItalic;
            }

            font = UIFont.fontWithDescriptorSize(fontDescriptor.fontDescriptorWithSymbolicTraits(symbolicTraits), fontSize);
        }

        attrDict[NSFontAttributeName] = font;
    }

    const color = span.color;
    if (color) {
        attrDict[NSForegroundColorAttributeName] = color.ios;
    }

    const backgroundColor = style.backgroundColor
        || (<FormattedString>span.parent).backgroundColor
        || (<TextBase>(<FormattedString>span.parent).parent).backgroundColor;
    if (backgroundColor) {
        attrDict[NSBackgroundColorAttributeName] = backgroundColor.ios;
    }

    const textDecorations = style.textDecoration
        || (<FormattedString>span.parent).textDecoration
        || (<TextBase>(<FormattedString>span.parent).parent).textDecoration;
    const underline = textDecorations.indexOf(TextDecoration.UNDERLINE) !== -1;
    if (underline) {
        attrDict[NSUnderlineStyleAttributeName] = underline;
    }

    const strikethrough = textDecorations.indexOf(TextDecoration.LINE_THROUGH) !== -1;
    if (strikethrough) {
        attrDict[NSStrikethroughStyleAttributeName] = strikethrough;
    }

    return NSMutableAttributedString.alloc().initWithStringAttributes(text, <any>attrDict);
}