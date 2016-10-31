import { TextBaseCommon, textProperty, formattedTextProperty } from "./text-base-common";
import { FormattedString } from "text/formatted-string";
import {
    colorProperty, fontInternalProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, whiteSpaceProperty, letterSpacingProperty
} from "ui/styling/style";
import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from "ui/enums";
import { toUIString } from "utils/types";

export * from "./text-base-common";

function getCapitalizedString(str: string): string {
    let words = str.split(" ");
    let newWords = [];
    for (let i = 0, length = words.length; i < length; i++) {
        let word = words[i].toLowerCase();
        newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
    }

    return newWords.join(" ");
}

function formatString(text: string, textTransform: string): string {
    switch (textTransform) {
        case TextTransform.uppercase:
            return text.toUpperCase();

        case TextTransform.lowercase:
            return text.toLowerCase();

        case TextTransform.capitalize:
            return getCapitalizedString(text);

        default:
            return text;
    }
}

@Interfaces([android.text.method.TransformationMethod])
class TextTransformation extends android.text.method.ReplacementTransformationMethod {
    constructor(public originalText: string, public formattedText: FormattedString, public textTransform: string) {
        super();
    }

    protected getOriginal(): native.Array<string> {
        return this.formattedText ? this.formattedText._formattedText : this.originalText;
    }

    protected getReplacement(): native.Array<string> {
        let result: string = "";
        if (this.formattedText) {
            for (let i = 0, length = this.formattedText.spans.length; i < length; i++) {
                let span = this.formattedText.spans.getItem(i);
                result += formatString(span.text, this.textTransform);
                // span.text = formatString(span.text, this.textTransform);
            }
        } else {
            result = formatString(this.originalText, this.textTransform);
        }

        return result;
    }
}

export class TextBase extends TextBaseCommon {
    _transformationMethod: any;
    nativeView: android.widget.TextView;

    public _setFormattedTextPropertyToNative(value: FormattedString) {
        // TODO: Check if there is an option to force call the transformation method without
        // creating new native instance.
        if (this.nativeView) {
            this.nativeView.setTransformationMethod(new TextTransformation(this.text, value, this.style.textTransform));
        }

        let newText = value ? value._formattedText : null;
        if (this.nativeView) {
            this.nativeView.setText(newText);
        }
    }

    get [textProperty.native](): string {
        return this.nativeView.getText();
    }
    set [textProperty.native](value: string) {
        let newValue = toUIString(value);
        this.nativeView.setText(newValue);
    }

    get [formattedTextProperty.native](): FormattedString {
        return null;
    }
    set [formattedTextProperty.native](value: FormattedString) {
        this._setFormattedTextPropertyToNative(value);
    }

    get [colorProperty.native](): number {
        // .getTextColors().getDefaultColor();
        return this.nativeView.getCurrentTextColor();
    }
    set [colorProperty.native](value: number) {
        this.nativeView.setTextColor(value);
    }

    get [fontIntenal.native](): number {
        return this.nativeView.getCurrentTextColor();
    }
    set [fontIntenal.native](value: number) {
        this.nativeView.setTextColor(value);
    }

    get [textAlignmentProperty.native](): string {
        let textGravity = this.nativeView.getGravity() & android.view.View.TEXT_ALIGNMENT_GRAVITY;
        switch (textGravity) {
            case android.view.Gravity.LEFT:
                return TextAlignment.left;

            case android.view.Gravity.CENTER_HORIZONTAL:
                return TextAlignment.center;

            case android.view.Gravity.RIGHT:
                return TextAlignment.right;

            default:
                throw new Error("Invalid textGravity: " + textGravity);
        }
    }
    set [textAlignmentProperty.native](value: string) {
        let verticalGravity = this.nativeView.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (value) {
            case TextAlignment.left:
                this.nativeView.setGravity(android.view.Gravity.LEFT | verticalGravity);
                break;
            case TextAlignment.center:
                this.nativeView.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;
            case TextAlignment.right:
                this.nativeView.setGravity(android.view.Gravity.RIGHT | verticalGravity);
                break;
            default:
                break;
        }
    }

    get [textDecorationProperty.native](): string {
        return TextDecoration.none;
    }
    set [textDecorationProperty.native](value: string) {
        let flags = 0;
        let values = (value + "").split(" ");

        if (values.indexOf(TextDecoration.underline) !== -1) {
            flags = flags | android.graphics.Paint.UNDERLINE_TEXT_FLAG;
        }

        if (values.indexOf(TextDecoration.lineThrough) !== -1) {
            flags = flags | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG;
        }

        if (values.indexOf(TextDecoration.none) === -1) {
            this.nativeView.setPaintFlags(flags);
        } else {
            this.nativeView.setPaintFlags(0);
        }
    }

    get [textTransformProperty.native](): string {
        return TextTransform.none;
    }
    set [textTransformProperty.native](value: string) {
        this._setFormattedTextPropertyToNative(this.formattedText);
    }

    get [whiteSpaceProperty.native](): string {
        return WhiteSpace.normal;
    }
    set [whiteSpaceProperty.native](value: string) {
        let nativeView = this.nativeView;
        nativeView.setSingleLine(value === WhiteSpace.nowrap);
        nativeView.setEllipsize(value === WhiteSpace.nowrap ? android.text.TextUtils.TruncateAt.END : null);
    }

    get [letterSpacingProperty.native](): number {
        return org.nativescript.widgets.ViewHelper.getLetterspacing(this.nativeView);
    }
    set [letterSpacingProperty.native](value: number) {
        org.nativescript.widgets.ViewHelper.setLetterspacing(this.nativeView, value);
    }
}