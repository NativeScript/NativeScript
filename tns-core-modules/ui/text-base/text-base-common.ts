// Definitions.
import { TextBase as TextBaseDefinition, TextAlignment, TextDecoration, TextTransform, WhiteSpace } from ".";
import { FontStyle, FontWeight } from "../styling/font";
import { PropertyChangeData } from "../../data/observable";

// Types.
import { View, ViewBase, Property, CssProperty, InheritedCssProperty, Style, isIOS, Observable, makeValidator, makeParser, Length } from "../core/view";
import { FormattedString, Span } from "../../text/formatted-string";

export { FormattedString, Span };
export * from "../core/view";

const CHILD_SPAN = "Span";
const CHILD_FORMATTED_TEXT = "formattedText";
const CHILD_FORMATTED_STRING = "FormattedString";

export abstract class TextBaseCommon extends View implements TextBaseDefinition {

    public text: string;
    public formattedText: FormattedString;

    get fontFamily(): string {
        return this.style.fontFamily;
    }
    set fontFamily(value: string) {
        this.style.fontFamily = value;
    }

    get fontSize(): number {
        return this.style.fontSize;
    }
    set fontSize(value: number) {
        this.style.fontSize = value;
    }

    get fontStyle(): FontStyle {
        return this.style.fontStyle;
    }
    set fontStyle(value: FontStyle) {
        this.style.fontStyle = value;
    }

    get fontWeight(): FontWeight {
        return this.style.fontWeight;
    }
    set fontWeight(value: FontWeight) {
        this.style.fontWeight = value;
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
        if (this.nativeView) {
            // Notifications from the FormattedString start arriving before the Android view is even created.
            this[formattedTextProperty.setNative](data.value);
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

    _setNativeText(reset: boolean = false): void {
        //
    }
}

export function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === "bold" || fontWeight === "700" || fontWeight === "800" || fontWeight === "900";
}

export const textProperty = new Property<TextBaseCommon, string>({ name: "text", defaultValue: "" });
textProperty.register(TextBaseCommon);

export const formattedTextProperty = new Property<TextBaseCommon, FormattedString>({ name: "formattedText", affectsLayout: isIOS, valueChanged: onFormattedTextPropertyChanged });
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

const textAlignmentConverter = makeParser<TextAlignment>(makeValidator<TextAlignment>("initial", "left", "center", "right"));
export const textAlignmentProperty = new InheritedCssProperty<Style, TextAlignment>({ name: "textAlignment", cssName: "text-align", defaultValue: "initial", valueConverter: textAlignmentConverter });
textAlignmentProperty.register(Style);

const textTransformConverter = makeParser<TextTransform>(makeValidator<TextTransform>("initial", "none", "capitalize", "uppercase", "lowercase"));
export const textTransformProperty = new CssProperty<Style, TextTransform>({ name: "textTransform", cssName: "text-transform", defaultValue: "initial", valueConverter: textTransformConverter });
textTransformProperty.register(Style);

const whiteSpaceConverter = makeParser<WhiteSpace>(makeValidator<WhiteSpace>("initial", "normal", "nowrap"));
export const whiteSpaceProperty = new CssProperty<Style, WhiteSpace>({ name: "whiteSpace", cssName: "white-space", defaultValue: "initial", affectsLayout: isIOS, valueConverter: whiteSpaceConverter });
whiteSpaceProperty.register(Style);

const textDecorationConverter = makeParser<TextDecoration>(makeValidator<TextDecoration>("none", "underline", "line-through", "underline line-through"));
export const textDecorationProperty = new CssProperty<Style, TextDecoration>({ name: "textDecoration", cssName: "text-decoration", defaultValue: "none", valueConverter: textDecorationConverter });
textDecorationProperty.register(Style);

export const letterSpacingProperty = new CssProperty<Style, number>({ name: "letterSpacing", cssName: "letter-spacing", defaultValue: 0, affectsLayout: isIOS, valueConverter: v => parseFloat(v) });
letterSpacingProperty.register(Style);