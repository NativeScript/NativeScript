import { Font } from "ui/styling/font";
import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, FormattedString,
    TextDecoration, TextAlignment, TextTransform, Span, Color
} from "./text-base-common";

import { _isSet as isSet } from "ui/core/properties";
import { FontWeight, FontStyle } from "ui/styling/font";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {

    public nativeView: UITextField | UITextView | UILabel | UIButton;

    //Text
    get [textProperty.native](): string {
        return '';
    }
    set [textProperty.native](value: string) {
        if (this.formattedText) {
            return;
        }

        this._setNativeText();
        this._requestLayoutOnTextChanged();
    }

    //FormattedText
    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        this._setNativeText();
        textProperty.nativeValueChange(this, !value ? '' : value.toString());
        this._requestLayoutOnTextChanged();
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
    set [colorProperty.native](value: Color | UIColor) {
        const color = value instanceof Color ? value.ios : value;
        if (!this.formattedText) {
            let nativeView = this.nativeView;
            if (nativeView instanceof UIButton) {
                nativeView.setTitleColorForState(color, UIControlState.Normal);
            } else {
                nativeView.textColor = color;
            }
        }
    }

    //FontInternal
    get [fontInternalProperty.native](): UIFont {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        return nativeView.font;
    }
    set [fontInternalProperty.native](value: Font | UIFont) {
        if (!this.formattedText) {
            let nativeView = this.nativeView;
            nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
            let font = value instanceof Font ? value.getUIFont(nativeView.font) : value;
            nativeView.font = font;
        }
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
        let nativeView = <UITextField | UITextView | UILabel>this.nativeView;
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
        this._setNativeText();
    }

    //TextTransform
    get [textTransformProperty.native](): TextTransform {
        return TextTransform.NONE;
    }
    set [textTransformProperty.native](value: TextTransform) {
        this._setNativeText();
    }

    // LetterSpacing.
    get [letterSpacingProperty.native](): number {
        return 0;
    }
    set [letterSpacingProperty.native](value: number) {
        this._setNativeText();
    }

    _setNativeText() {
        if (this.formattedText) {
            this.setFormattedTextDecorationAndTransform();
        } else {
            this.setTextDecorationAndTransform();
        }
    }

    setFormattedTextDecorationAndTransform() {
        const attrText = this.createNSMutableAttributedString(this.formattedText);
        if (this.letterSpacing !== 0) {
            attrText.addAttributeValueRange(NSKernAttributeName, this.letterSpacing * this.nativeView.font.pointSize, { location: 0, length: attrText.length });
        }

        if (this.nativeView instanceof UIButton) {
            this.nativeView.setAttributedTitleForState(attrText, UIControlState.Normal);
        }
        else {
            this.nativeView.attributedText = attrText;
        }
    }

    setTextDecorationAndTransform() {
        const style = this.style;

        let dict = new Map<string, any>();
        switch (style.textDecoration) {
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
                throw new Error(`Invalid text decoration value: ${style.textDecoration}. Valid values are: "${TextDecoration.NONE}", "${TextDecoration.UNDERLINE}", "${TextDecoration.LINE_THROUGH}", "${TextDecoration.UNDERLINE_LINE_THROUGH}".`);
        }

        if (style.letterSpacing !== 0) {
            dict.set(NSKernAttributeName, style.letterSpacing * this.nativeView.font.pointSize);
        }

        if (style.color) {
            dict.set(NSForegroundColorAttributeName, style.color.ios);
        }

        const text = this.text;
        const string = (text === undefined || text === null) ? '' : text.toString();
        const source = getTransformedText(string, this.textTransform);
        const isTextView = this.nativeView instanceof UITextView;
        if (dict.size > 0 || isTextView) {
            if (isTextView) {
                // UITextView's font seems to change inside.
                dict.set(NSFontAttributeName, this.nativeView.font);
            }
            let result = NSMutableAttributedString.alloc().initWithString(source);
            result.setAttributesRange(<any>dict, { location: 0, length: source.length });
            if (this.nativeView instanceof UIButton) {
                this.nativeView.setAttributedTitleForState(result, UIControlState.Normal);
            } else {
                this.nativeView.attributedText = result;
            }
        } else {
            if (this.nativeView instanceof UIButton) {
                // Clear attributedText or title won't be affected.
                this.nativeView.setAttributedTitleForState(null, UIControlState.Normal);
                this.nativeView.setTitleForState(source, UIControlState.Normal);
            } else {
                // Clear attributedText or text won't be affected.
                this.nativeView.attributedText = undefined;
                this.nativeView.text = source;
            }
        }
    }

    createNSMutableAttributedString(formattedString: FormattedString): NSMutableAttributedString {
        let mas = NSMutableAttributedString.alloc().init();
        if (formattedString) {
            for (let i = 0, spanStart = 0, length = formattedString.spans.length; i < length; i++) {
                const span = formattedString.spans.getItem(i);
                const text = span.text;
                const textTransform = (<TextBase>formattedString.parent).textTransform;
                let spanText = (text === null || text === undefined) ? '' : text.toString();
                if (textTransform !== "none") {
                    spanText = getTransformedText(spanText, textTransform);
                }

                const nsAttributedString = this.createMutableStringForSpan(span, spanText);
                mas.insertAttributedStringAtIndex(nsAttributedString, spanStart);
                spanStart += spanText.length;
            }
        }
        return mas;
    }

    createMutableStringForSpan(span: Span, text: string): NSMutableAttributedString {
        const viewFont = this.nativeView.font;
        let attrDict = <{ key: string, value: any }>{};
        const style = span.style;
        const bold = isBold(style.fontWeight);
        const italic = style.fontStyle === FontStyle.ITALIC;

        let fontFamily = span.fontFamily;
        let fontSize = span.fontSize;

        if (bold || italic || fontFamily || fontSize) {
            if (!fontSize) {
                fontSize = viewFont.pointSize;
            }

            if (!fontFamily) {
                fontFamily = viewFont.fontName;
            }
            
            let font;

            let fontDescriptor: UIFontDescriptor = viewFont.fontDescriptor;
            if (fontFamily) {
                fontDescriptor = fontDescriptor.fontDescriptorWithFamily(fontFamily);
            }

            let symbolicTraits;
            if (bold) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitBold;
            }

            if (italic) {
                symbolicTraits |= UIFontDescriptorSymbolicTraits.TraitItalic;
            }

            if (symbolicTraits) {
                font = UIFont.fontWithDescriptorSize(fontDescriptor.fontDescriptorWithSymbolicTraits(symbolicTraits), fontSize);
            } else {
                font = UIFont.fontWithDescriptorSize(fontDescriptor, fontSize);
            }

            attrDict[NSFontAttributeName] = font;
        }

        const color = span.color;
        if (color) {
            attrDict[NSForegroundColorAttributeName] = color.ios;
        }

        // We don't use isSet function here because defaultValue for backgroundColor is null.
        const backgroundColor = style.backgroundColor
            || (<FormattedString>span.parent).backgroundColor
            || (<TextBase>(<FormattedString>span.parent).parent).backgroundColor;
        if (backgroundColor) {
            attrDict[NSBackgroundColorAttributeName] = backgroundColor.ios;
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
                attrDict[NSUnderlineStyleAttributeName] = underline;
            }

            const strikethrough = textDecorations.indexOf(TextDecoration.LINE_THROUGH) !== -1;
            if (strikethrough) {
                attrDict[NSStrikethroughStyleAttributeName] = strikethrough;
            }
        }

        return NSMutableAttributedString.alloc().initWithStringAttributes(text, <any>attrDict);
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

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === FontWeight.BOLD
        || fontWeight === "700"
        || fontWeight === FontWeight.EXTRA_BOLD
        || fontWeight === FontWeight.BLACK;
}