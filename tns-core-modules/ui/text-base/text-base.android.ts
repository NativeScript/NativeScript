import {TextBase as TextBaseCommon, textProperty, formattedTextProperty} from "./text-base-common";
import {colorProperty, fontInternalProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, whiteSpaceProperty, letterSpacingProperty} from "ui/styling/style";
import {TextAlignment} from "ui/enums";

export class TextBase extends TextBaseCommon {
    nativeView: android.widget.TextView
    // public _onTextPropertyChanged(value: string) {
    //     if (this.android) {
    //         var newValue = types.toUIString(value);
    //         this.android.setText(newValue);
    //     }
    // }

    // public _setFormattedTextPropertyToNative(value) {
    //     var newText = value ? value._formattedText : null;
    //     if (this.android) {
    //         this.android.setText(newText);
    //     }
    // }

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
        return this.nativeView.getGravity() & android.view.View.TEXT_ALIGNMENT_GRAVITY;
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
    }
}

     public static registerHandlers() {
    //         style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
    //             TextBaseStyler.setColorProperty,
    //             TextBaseStyler.resetColorProperty,
    //             TextBaseStyler.getNativeColorValue), "TextBase");

    //         style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
    //             TextBaseStyler.setFontInternalProperty,
    //             TextBaseStyler.resetFontInternalProperty,
    //             TextBaseStyler.getNativeFontInternalValue), "TextBase");

    //         style.registerHandler(style.textAlignmentProperty, new style.StylePropertyChangedHandler(
    //             TextBaseStyler.setTextAlignmentProperty,
    //             TextBaseStyler.resetTextAlignmentProperty,
    //             TextBaseStyler.getNativeTextAlignmentValue), "TextBase");

    //         style.registerHandler(style.textDecorationProperty, new style.StylePropertyChangedHandler(
    //             TextBaseStyler.setTextDecorationProperty,
    //             TextBaseStyler.resetTextDecorationProperty), "TextBase");

    //         style.registerHandler(style.textTransformProperty, new style.StylePropertyChangedHandler(
    //             TextBaseStyler.setTextTransformProperty,
    //             TextBaseStyler.resetTextTransformProperty), "TextBase");

    //         style.registerHandler(style.whiteSpaceProperty, new style.StylePropertyChangedHandler(
    //             TextBaseStyler.setWhiteSpaceProperty,
    //             TextBaseStyler.resetWhiteSpaceProperty), "TextBase");

    //         if (parseInt(device.sdkVersion, 10) >= 21) {
    //             style.registerHandler(style.letterSpacingProperty, new style.StylePropertyChangedHandler(
    //                 TextBaseStyler.setLetterSpacingProperty,
    //                 TextBaseStyler.resetLetterSpacingProperty,
    //                 TextBaseStyler.getLetterSpacingProperty), "TextBase");
    //         }
}