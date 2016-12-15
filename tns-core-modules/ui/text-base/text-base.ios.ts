import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, Font, Color, FormattedString,
    TextDecoration
} from "./text-base-common";

export * from "./text-base-common";

function NSStringFromNSAttributedString(source: NSAttributedString | string): NSString {
    return NSString.stringWithString(source instanceof NSAttributedString && source.string || <string>source);
}

export function getTransformedText(text: string, transform: "none" | "capitalize" | "uppercase" | "lowercase"): string {
    switch (transform) {
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

function updateFormattedStringTextDecoration(formattedText: FormattedString, decoration: string, ): void {

    // TODO: Refactor this method so it doesn't modify FormattedString properties.
    // Instead it should create NSAttributedString and apply it to the nativeView.
    let textDecoration = decoration + "";
    if (textDecoration.indexOf("none") !== -1) {
        formattedText.underline = NSUnderlineStyle.StyleNone;
        formattedText.strikethrough = NSUnderlineStyle.StyleNone;
    }
    else {
        if (textDecoration.indexOf("underline") !== -1) {
            formattedText.underline = NSUnderlineStyle.StyleSingle;
        } else {
            formattedText.underline = NSUnderlineStyle.StyleNone;
        }

        if (textDecoration.indexOf("line-through") !== -1) {
            formattedText.strikethrough = NSUnderlineStyle.StyleSingle;
        } else {
            formattedText.strikethrough = NSUnderlineStyle.StyleNone;
        }
    }
}

function updateFormattedStringTextTransformation(formattedText: FormattedString, transform: "none" | "capitalize" | "uppercase" | "lowercase"): void {
    // TODO: Refactor this method so it doesn't modify Span properties.
    // Instead it should create NSAttributedString and apply it to the nativeView.
    for (let i = 0, length = formattedText.spans.length; i < length; i++) {
        let span = formattedText.spans.getItem(i);
        span.text = getTransformedText(span.text, transform);
    }
}

function setFormattedTextDecorationAndTransform(formattedText: FormattedString, nativeView: UITextField | UITextView | UILabel | UIButton, decoration: string, transform: "none" | "capitalize" | "uppercase" | "lowercase", letterSpacing: number) {
    updateFormattedStringTextDecoration(formattedText, decoration);
    updateFormattedStringTextTransformation(formattedText, transform);

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

function setTextDecorationAndTransform(text: string, nativeView: UITextField | UITextView | UILabel | UIButton, decoration: string, transform: "none" | "capitalize" | "uppercase" | "lowercase", letterSpacing: number, color: Color) {
    let hasLetterSpacing = typeof letterSpacing === "number" && !isNaN(letterSpacing);

    let decorationValues = decoration + "";
    let dict = new Map<string, number>();
    if (decorationValues.indexOf("none") === -1) {
        if (decorationValues.indexOf("underline") !== -1) {
            dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
        }

        if (decorationValues.indexOf("line-through") !== -1) {
            dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
        }
    }

    if (hasLetterSpacing) {
        dict.set(NSKernAttributeName, letterSpacing * nativeView.font.pointSize);
    }

    if (color) {
        dict.set(NSForegroundColorAttributeName, color.ios);
    }

    let source = getTransformedText(text, transform);
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

export class TextBase extends TextBaseCommon {

    public nativeView: UITextField | UITextView | UILabel | UIButton;

    // public _onTextPropertyChanged(value: string) {
    //     var newValue = toUIString(value);
    //     this.ios.text = newValue;

    //     //RemoveThisDoubleCall
    //     // this.style._updateTextDecoration();
    //     // this.style._updateTextTransform();

    //     this._requestLayoutOnTextChanged();
    // }

    public _setFormattedTextPropertyToNative(value: FormattedString) {
        let newText = value ? value._formattedText : null;
        let nativeView = this.nativeView;
        if (nativeView instanceof UIButton) {
            nativeView.setAttributedTitleForState(newText, UIControlState.Normal);
        } else {
            nativeView.attributedText = newText;
        }
        //RemoveThisDoubleCall
        // this.style._updateTextDecoration();
        // this.style._updateTextTransform();
    }

    get [textProperty.native](): string {
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

    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        this._setFormattedTextPropertyToNative(value);
    }

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

    get [textAlignmentProperty.native](): string {
        let nativeView = this.nativeView;
        nativeView = nativeView instanceof UIButton ? nativeView.titleLabel : nativeView;
        switch (nativeView.textAlignment) {
            case NSTextAlignment.Left:
                return "left";

            case NSTextAlignment.Center:
                return "center";

            case NSTextAlignment.Right:
                return "right";
        }
    }
    set [textAlignmentProperty.native](value: string) {
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
                break;
        }
    }

    get [textDecorationProperty.native](): TextDecoration {
        return "none";
    }
    set [textDecorationProperty.native](value: TextDecoration) {
        if (this.formattedText) {
            setFormattedTextDecorationAndTransform(this.formattedText, this.nativeView, value, this.style.textTransform, this.style.letterSpacing);
        } else {
            setTextDecorationAndTransform(this.text, this.nativeView, value, this.style.textTransform, this.style.letterSpacing, this.style.color);
        }
    }

    get [textTransformProperty.native](): string {
        return "none";
    }
    set [textTransformProperty.native](value: "none" | "capitalize" | "uppercase" | "lowercase") {
        if (this.formattedText) {
            setFormattedTextDecorationAndTransform(this.formattedText, this.nativeView, this.style.textDecoration, value, this.style.letterSpacing);
        } else {
            setTextDecorationAndTransform(this.text, this.nativeView, this.style.textDecoration, value, this.style.letterSpacing, this.style.color);
        }
    }

    // get [whiteSpaceProperty.native](): string {
    //     return WhiteSpace.normal;
    // }
    // set [whiteSpaceProperty.native](value: string) {
    //     let nativeView = this.nativeView;
    //     if (value === WhiteSpace.normal) {
    //         nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
    //         nativeView.numberOfLines = 0;
    //     }
    //     else {
    //         nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
    //         nativeView.numberOfLines = 1;
    //     }
    // }

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

    // private _settingFormattedTextPropertyToNative = false;
    // public _onStylePropertyChanged(property: dependencyObservable.Property): void {
    //     if (this._settingFormattedTextPropertyToNative) {
    //         // Guard against stack-overflow.
    //         return;
    //     }

    //     if (this.formattedText) {
    //         // Re-apply the formatted text to override style changes if needed.
    //         // https://github.com/NativeScript/NativeScript/issues/1078
    //         this._settingFormattedTextPropertyToNative = true;
    //         this._setFormattedTextPropertyToNative(this.formattedText);
    //         this._settingFormattedTextPropertyToNative = false;
    //     }
    // }
}