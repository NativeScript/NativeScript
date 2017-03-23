import { Font } from "../styling/font";
import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, FormattedString,
    TextDecoration, TextAlignment, TextTransform, Span, Color, isBold
} from "./text-base-common";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {

    public nativeView: UITextField | UITextView | UILabel | UIButton;

    [textProperty.getDefault](): string {
        return '';
    }
    [textProperty.setNative](value: string) {
        if (this.formattedText) {
            return;
        }

        this._setNativeText();
        this._requestLayoutOnTextChanged();
    }

    [formattedTextProperty.getDefault](): FormattedString {
        return null;
    }
    [formattedTextProperty.setNative](value: FormattedString) {
        this._setNativeText();
        textProperty.nativeValueChange(this, !value ? '' : value.toString());
        this._requestLayoutOnTextChanged();
    }

    [colorProperty.getDefault](): UIColor {
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            return nativeView.titleColorForState(UIControlState.Normal);
        } else {
            return nativeView.textColor;
        }
    }
    [colorProperty.setNative](value: Color | UIColor) {
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

    [fontInternalProperty.getDefault](): UIFont {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        return nativeView.font;
    }
    [fontInternalProperty.setNative](value: Font | UIFont) {
        if (!this.formattedText) {
            let nativeView = this.nativeView;
            nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
            let font = value instanceof Font ? value.getUIFont(nativeView.font) : value;
            nativeView.font = font;
        }
    }

    [textAlignmentProperty.getDefault](): TextAlignment {
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
    [textAlignmentProperty.setNative](value: TextAlignment) {
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
                throw new Error(`Invalid text alignment value: ${value}. Valid values are: 'left', 'center', 'right'.`);
        }
    }

    [textDecorationProperty.getDefault](): TextDecoration {
        return "none";
    }
    [textDecorationProperty.setNative](value: TextDecoration) {
        this._setNativeText();
    }

    [textTransformProperty.getDefault](): TextTransform {
        return "none";
    }
    [textTransformProperty.setNative](value: TextTransform) {
        this._setNativeText();
    }

    [letterSpacingProperty.getDefault](): number {
        return 0;
    }
    [letterSpacingProperty.setNative](value: number) {
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
        // TODO: letterSpacing should be applied per Span.
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
            case "none":
                break;
            case "underline":
                dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
                break;
            case "line-through":
                dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
                break;
            case "underline line-through":
                dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
                dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
                break;
            default:
                throw new Error(`Invalid text decoration value: ${style.textDecoration}. Valid values are: 'none', 'underline', 'line-through', 'underline line-through'.`);
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
        const italic = style.fontStyle === "italic";

        let fontFamily = span.fontFamily;
        let fontSize = span.fontSize;

        if (bold || italic || fontFamily || fontSize) {
            let font = new Font(style.fontFamily, style.fontSize, style.fontStyle, style.fontWeight);
            let iosFont = font.getUIFont(viewFont);
            attrDict[NSFontAttributeName] = iosFont;
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
        if (textDecorationProperty.isSet(style)) {
            valueSource = style;
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
                attrDict[NSUnderlineStyleAttributeName] = underline;
            }

            const strikethrough = textDecorations.indexOf('line-through') !== -1;
            if (strikethrough) {
                attrDict[NSStrikethroughStyleAttributeName] = strikethrough;
            }
        }

        return NSMutableAttributedString.alloc().initWithStringAttributes(text, <any>attrDict);
    }
}

export function getTransformedText(text: string, textTransform: TextTransform): string {
    switch (textTransform) {
        case "uppercase":
            return NSStringFromNSAttributedString(text).uppercaseString;
        case "lowercase":
            return NSStringFromNSAttributedString(text).lowercaseString;
        case "capitalize":
            return NSStringFromNSAttributedString(text).capitalizedString;
        case "none":
        default:
            return text;
    }
}

function NSStringFromNSAttributedString(source: NSAttributedString | string): NSString {
    return NSString.stringWithString(source instanceof NSAttributedString && source.string || <string>source);
}
