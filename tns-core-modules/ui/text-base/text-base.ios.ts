import { TextBaseCommon, textProperty, formattedTextProperty } from "./text-base-common";
import { FormattedString } from "text/formatted-string";
import {
    colorProperty, fontInternalProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, whiteSpaceProperty, letterSpacingProperty
} from "ui/styling/style";
import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from "ui/enums";
import { toUIString, isNumber } from "utils/types";
import { Font } from "ui/styling/font";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {

    public nativeView: UITextField | UITextView;

    // public _onTextPropertyChanged(value: string) {
    //     var newValue = toUIString(value);
    //     this.ios.text = newValue;

    //     //RemoveThisDoubleCall
    //     // this.style._updateTextDecoration();
    //     // this.style._updateTextTransform();

    //     this._requestLayoutOnTextChanged();
    // }

    public _setFormattedTextPropertyToNative(value: FormattedString) {
        var newText = value ? value._formattedText : null;
        this.ios.attributedText = newText;

        //RemoveThisDoubleCall
        // this.style._updateTextDecoration();
        // this.style._updateTextTransform();
    }

    get [textProperty.native](): string {
        return this.nativeView.text;
    }
    set [textProperty.native](value: string) {
        let newValue = toUIString(value);
        this.nativeView.text = value;
        this._requestLayoutOnTextChanged();
    }

    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        this._setFormattedTextPropertyToNative(value);
    }

    get [colorProperty.native](): UIColor {
        return this.nativeView.textColor;
    }
    set [colorProperty.native](value: UIColor) {
        this.nativeView.textColor = value;
    }

    get [fontIntenal.native](): Font {
        return this.nativeView.font;
    }
    set [fontIntenal.native](value: Font) {
        this.nativeView.font = value.getUIFont(this.nativeView.font);
    }

    get [textAlignmentProperty.native](): string {

    }
    set [textAlignmentProperty.native](value: string) {

    }

    get [textDecorationProperty.native](): string {
        return TextDecoration.none;
    }
    set [textDecorationProperty.native](value: string) {

    }

    get [textTransformProperty.native](): string {
        return TextTransform.none;
    }
    set [textTransformProperty.native](value: string) {

    }

    get [whiteSpaceProperty.native](): string {
        return WhiteSpace.normal;
    }
    set [whiteSpaceProperty.native](value: string) {

    }

    get [letterSpacingProperty.native](): number {

    }
    set [letterSpacingProperty.native](value: number) {

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

function setTextBaseTextDecorationAndTransform(textBase: TextBase, decoration: string, transform: string, letterSpacing: number) {
    // if (!textBase["counter"]){
    //     textBase["counter"] = 0;
    // }
    // textBase["counter"]++;
    // console.log(`>>> ${textBase["counter"]} ${textBase} ${decoration}; ${transform}; ${letterSpacing}; text: ${textBase.text}; formattedText: ${textBase.formattedText}; isLoaded: ${textBase.isLoaded};`);

    let hasLetterSpacing = isNumber(letterSpacing) && !isNaN(letterSpacing);
    let nativeView = <utils.ios.TextUIView>textBase._nativeView;

    if (textBase.formattedText) {
        if (textBase.style.textDecoration.indexOf(TextDecoration.none) === -1) {

            if (textBase.style.textDecoration.indexOf(TextDecoration.underline) !== -1) {
                textBase.formattedText.underline = NSUnderlineStyle.StyleSingle;
            }

            if (textBase.style.textDecoration.indexOf(TextDecoration.lineThrough) !== -1) {
                textBase.formattedText.strikethrough = NSUnderlineStyle.StyleSingle;
            }
        }
        else {
            textBase.formattedText.underline = NSUnderlineStyle.StyleSingle;
        }

        for (let i = 0; i < textBase.formattedText.spans.length; i++) {
            let span = textBase.formattedText.spans.getItem(i);
            span.text = ios.getTransformedText(textBase, span.text, transform);
        }

        if (hasLetterSpacing) {
            let attrText = NSMutableAttributedString.alloc().initWithAttributedString(nativeView.attributedText);
            attrText.addAttributeValueRange(NSKernAttributeName, letterSpacing * (<UIFont>nativeView.font).pointSize, { location: 0, length: attrText.length });
            nativeView.attributedText = attrText;
        }
    }
    else {
        let source = textBase.text;
        let attributes = new Array();
        let range = { location: 0, length: source.length };

        var decorationValues = (decoration + "").split(" ");

        if (decorationValues.indexOf(TextDecoration.none) === -1 || hasLetterSpacing) {
            let dict = new Map<string, number>();

            if (decorationValues.indexOf(TextDecoration.underline) !== -1) {
                dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
            }

            if (decorationValues.indexOf(TextDecoration.lineThrough) !== -1) {
                dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
            }

            if (hasLetterSpacing) {
                dict.set(NSKernAttributeName, letterSpacing * (<UIFont>nativeView.font).pointSize);
            }

            attributes.push({ attrs: dict, range: NSValue.valueWithRange(range) });
        }

        source = ios.getTransformedText(textBase, source, transform);

        if (attributes.length > 0) {
            let result = NSMutableAttributedString.alloc().initWithString(<string>source);
            for (let i = 0; i < attributes.length; i++) {
                result.setAttributesRange(attributes[i]["attrs"], attributes[i]["range"].rangeValue);
            }
            nativeView.attributedText = result;
        }
        else {
            nativeView.text = source;
        }
    }
}