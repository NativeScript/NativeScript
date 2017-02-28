import { TextBase as TextBaseDefinition } from "ui/text-base";
import { View, ViewBase, Property, CssProperty, InheritedCssProperty, Style, isIOS, Observable, makeValidator, makeParser, Length } from "ui/core/view";
import { PropertyChangeData } from "data/observable";
import { FormattedString, Span } from "text/formatted-string";

export { FormattedString, Span };
export * from "ui/core/view";

const CHILD_SPAN = "Span";
const CHILD_FORMATTED_TEXT = "formattedText";
const CHILD_FORMATTED_STRING = "FormattedString";

export abstract class TextBaseCommon extends View implements TextBaseDefinition {

    // public abstract _setFormattedTextPropertyToNative(value: FormattedString): void;

    public text: string;
    public formattedText: FormattedString;

    get fontSize(): number {
        return this.style.fontSize;
    }
    set fontSize(value: number) {
        this.style.fontSize = value;
    }

    get letterSpacing(): number {
        return this.style.letterSpacing;
    }
    set letterSpacing(value: number) {
        this.style.letterSpacing = value;
    }

    get textAlignment(): TextAlignment {
        return this.style.textAlignment;
    }
    set textAlignment(value: TextAlignment) {
        this.style.textAlignment = value;
    }

    get textDecoration(): TextDecoration {
        return this.style.textDecoration;
    }
    set textDecoration(value: TextDecoration) {
        this.style.textDecoration = value;
    }

    get textTransform(): TextTransform {
        return this.style.textTransform;
    }
    set textTransform(value: TextTransform) {
        this.style.textTransform = value;
    }

    get whiteSpace(): WhiteSpace {
        return this.style.whiteSpace;
    }
    set whiteSpace(value: WhiteSpace) {
        this.style.whiteSpace = value;
    }

    get padding(): string | Length {
        return this.style.padding;
    }
    set padding(value: string | Length) {
        this.style.padding = value;
    }

    get paddingTop(): Length {
        return this.style.paddingTop;
    }
    set paddingTop(value: Length) {
        this.style.paddingTop = value;
    }

    get paddingRight(): Length {
        return this.style.paddingRight;
    }
    set paddingRight(value: Length) {
        this.style.paddingRight = value;
    }

    get paddingBottom(): Length {
        return this.style.paddingBottom;
    }
    set paddingBottom(value: Length) {
        this.style.paddingBottom = value;
    }

    get paddingLeft(): Length {
        return this.style.paddingLeft;
    }
    set paddingLeft(value: Length) {
        this.style.paddingLeft = value;
    }

    public _onFormattedTextContentsChanged(data: PropertyChangeData) {
        if (this._nativeView) {
            // Notifications from the FormattedString start arriving before the Android view is even created.
            this[formattedTextProperty.native] = data.value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === CHILD_SPAN) {
            if (!this.formattedText) {
                const formattedText = new FormattedString();
                formattedText.spans.push(value);
                this.formattedText = formattedText;
            } else {
                this.formattedText.spans.push(value);
            }
        }
        else if (name === CHILD_FORMATTED_TEXT || name === CHILD_FORMATTED_STRING) {
            this.formattedText = value;
        }
    }

    _requestLayoutOnTextChanged(): void {
        this.requestLayout();
    }

    eachChild(callback: (child: ViewBase) => boolean): void {
        let text = this.formattedText;
        if (text) {
            callback(text);
        }
    }

    _setNativeText(): void {
        //
    }
}

//Text
export const textProperty = new Property<TextBaseCommon, string>({ name: "text", defaultValue: "" });
textProperty.register(TextBaseCommon);

//FormattedText
export const formattedTextProperty = new Property<TextBaseCommon, FormattedString>({
    name: "formattedText",
    affectsLayout: isIOS,
    valueChanged: onFormattedTextPropertyChanged
});
formattedTextProperty.register(TextBaseCommon);

function onFormattedTextPropertyChanged(textBase: TextBaseCommon, oldValue: FormattedString, newValue: FormattedString) {
    if (oldValue) {
        oldValue.off(Observable.propertyChangeEvent, textBase._onFormattedTextContentsChanged, textBase);
        textBase._removeView(oldValue);
    }

    if (newValue) {
        textBase._addView(newValue);
        newValue.on(Observable.propertyChangeEvent, textBase._onFormattedTextContentsChanged, textBase);
    }
}

//TextAlignment
export type TextAlignment = "left" | "center" | "right";
export namespace TextAlignment {
    export const LEFT: "left" = "left";
    export const CENTER: "center" = "center";
    export const RIGHT: "right" = "right";
    export const isValid = makeValidator<TextAlignment>(LEFT, CENTER, RIGHT);
    export const parse = makeParser<TextAlignment>(isValid);
}

export const textAlignmentProperty = new InheritedCssProperty<Style, TextAlignment>({
    name: "textAlignment",
    cssName: "text-align",
    valueConverter: TextAlignment.parse
});
textAlignmentProperty.register(Style);

//TextDecoration
export type TextDecoration = "none" | "underline" | "line-through" | "underline line-through";
export namespace TextDecoration {
    export const NONE: "none" = "none";
    export const UNDERLINE: "underline" = "underline";
    export const LINE_THROUGH: "line-through" = "line-through";
    export const UNDERLINE_LINE_THROUGH: "underline line-through" = "underline line-through";

    export const isValid = makeValidator<TextDecoration>(NONE, UNDERLINE, LINE_THROUGH, UNDERLINE_LINE_THROUGH);
    export const parse = makeParser<TextDecoration>(isValid);
}
export const textDecorationProperty = new CssProperty<Style, TextDecoration>({
    name: "textDecoration",
    cssName: "text-decoration",
    defaultValue: TextDecoration.NONE,
    valueConverter: TextDecoration.parse
});
textDecorationProperty.register(Style);

//TextTransform
export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";
export namespace TextTransform {
    export const NONE: "none" = "none";
    export const CAPITALIZE: "capitalize" = "capitalize";
    export const UPPERCASE: "uppercase" = "uppercase";
    export const LOWERCASE: "lowercase" = "lowercase";
    export const isValid = makeValidator<TextTransform>(NONE, CAPITALIZE, UPPERCASE, LOWERCASE);
    export const parse = makeParser<TextTransform>(isValid);
}
export const textTransformProperty = new CssProperty<Style, TextTransform>({
    name: "textTransform",
    cssName: "text-transform",
    defaultValue: TextTransform.NONE,
    valueConverter: TextTransform.parse
});
textTransformProperty.register(Style);

//Whitespace
export type WhiteSpace = "normal" | "nowrap";
export namespace WhiteSpace {
    export const NORMAL: "normal" = "normal";
    export const NO_WRAP: "nowrap" = "nowrap";
    export const isValid = makeValidator<WhiteSpace>(NORMAL, NO_WRAP);
    export const parse = makeParser<WhiteSpace>(isValid);
}

//NB: Default value is deferent for Android and IOS
export const whiteSpaceProperty = new CssProperty<Style, WhiteSpace>({
    name: "whiteSpace",
    cssName: "white-space",
    defaultValue: isIOS ? WhiteSpace.NO_WRAP : WhiteSpace.NORMAL,
    valueConverter: WhiteSpace.parse
});
whiteSpaceProperty.register(Style);

export const letterSpacingProperty = new CssProperty<Style, number>({
    name: "letterSpacing",
    cssName: "letter-spacing",
    defaultValue: 0,
    affectsLayout: isIOS,
    valueConverter: (v: string) => parseFloat(v)
});
letterSpacingProperty.register(Style);