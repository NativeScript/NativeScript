import { TextBase as TextBaseDefinition } from "ui/text-base";
import { View, Property, CssProperty, InheritedCssProperty, Style, isIOS, Observable, makeValidator, makeParser, Length } from "ui/core/view";
import { PropertyChangeData } from "data/observable";
import { FormattedString, FormattedStringView } from "text/formatted-string";
import { addWeakEventListener, removeWeakEventListener } from "ui/core/weak-event-listener";

export { FormattedString };
export * from "ui/core/view";

export abstract class TextBaseCommon extends View implements TextBaseDefinition, FormattedStringView {

    public abstract _setFormattedTextPropertyToNative(value: FormattedString): void;

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

    public onFormattedTextChanged(data: PropertyChangeData) {
        let value = data.value;
        this._setFormattedTextPropertyToNative(value);
        this.nativePropertyChanged(textProperty, value.toString());
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (!this.formattedText) {
            this.formattedText = new FormattedString();
        }

        FormattedString.addFormattedStringToView(this, name, value);
    }

    _requestLayoutOnTextChanged(): void {
        this.requestLayout();
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
        oldValue.parent = null;
        removeWeakEventListener(oldValue, Observable.propertyChangeEvent, textBase.onFormattedTextChanged, textBase);
    }

    if (newValue) {
        newValue.parent = textBase;
        addWeakEventListener(newValue, Observable.propertyChangeEvent, textBase.onFormattedTextChanged, textBase);
    }
}

//TextAlignment
export type TextAlignment = "left" | "center" | "right";
export namespace TextAlignment {
    export const LEFT: "left" = "left";
    export const CENTER: "center" = "center";
    export const RIGHT: "right" = "right";
    export const isValid = makeValidator<TextAlignment>(LEFT, CENTER, RIGHT);
    export const parse = makeParser(isValid, undefined);
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
    export const parse = makeParser(isValid, NONE);
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
    export const parse = makeParser(isValid, NONE);
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
    export const parse = makeParser(isValid, NORMAL);
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