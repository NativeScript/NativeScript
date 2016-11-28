import { TextBase as TextBaseDefinition } from "ui/text-base";
import { View } from "ui/core/view";
import { Observable, PropertyChangeData } from "data/observable";
import { FormattedString, FormattedStringView } from "text/formatted-string";
import { isIOS } from "platform";
import { Property, CssProperty, InheritedCssProperty } from "ui/core/properties";
import { Style } from "ui/styling/style";
import { addWeakEventListener, removeWeakEventListener } from "ui/core/weak-event-listener";

export * from "ui/core/view";

function onFormattedTextPropertyChanged(textBase: TextBaseCommon, oldValue: FormattedString, newValue: FormattedString) {
    if (oldValue) {
        oldValue.parent = null;
        removeWeakEventListener(oldValue, Observable.propertyChangeEvent, textBase.onFormattedTextChanged, textBase);
    }

    if (newValue) {
        newValue.parent = textBase;
        addWeakEventListener(newValue, Observable.propertyChangeEvent, textBase.onFormattedTextChanged, textBase);
    }

    // textBase._onFormattedTextPropertyChanged(newValue);
}
function onTextPropertyChanged(textBase: TextBaseCommon, oldValue: string, newValue: string) {
    // textBase._onTextPropertyChanged(newValue);

    // //RemoveThisDoubleCall
    // textBase.style._updateTextTransform();
    // textBase.style._updateTextDecoration();
}

// (<proxy.PropertyMetadata>textProperty.metadata).onSetNativeValue = onTextPropertyChanged;
// (<proxy.PropertyMetadata>formattedTextProperty.metadata).onSetNativeValue = onFormattedTextPropertyChanged;

export abstract class TextBaseCommon extends View implements TextBaseDefinition, FormattedStringView {

    constructor() {
        super();
        // NOTE: this was added so that FormattedString.addFormattedStringToView does not instantiate it.
        this.formattedText = new FormattedString();
    }

    public abstract _setFormattedTextPropertyToNative(value): void;

    // public _onBindingContextChanged(oldValue: any, newValue: any) {
    //     super._onBindingContextChanged(oldValue, newValue);
    //     if (this.formattedText) {
    //         this.formattedText.updateSpansBindingContext(newValue);
    //     }

    //     //This is because of ListView virtualization
    //     //RemoveThisDoubleCall        
    //     this.style._updateTextTransform();
    //     this.style._updateTextDecoration();
    // }

    public text: string;
    public formattedText: FormattedString;

    // TODO: Do we need to export these properties here??
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

    get textAlignment(): "left" | "center" | "right" {
        return this.style.textAlignment;
    }
    set textAlignment(value: "left" | "center" | "right") {
        this.style.textAlignment = value;
    }

    get textDecoration(): "none" | "underline" | "lineThrough" {
        return this.style.textDecoration;
    }
    set textDecoration(value: "none" | "underline" | "lineThrough") {
        this.style.textDecoration = value;
    }

    get textTransform(): "none" | "capitalize" | "uppercase" | "lowercase" {
        return this.style.textTransform;
    }
    set textTransform(value: "none" | "capitalize" | "uppercase" | "lowercase") {
        this.style.textTransform = value;
    }

    get whiteSpace(): "normal" | "nowrap" {
        return this.style.whiteSpace;
    }
    set whiteSpace(value: "normal" | "nowrap") {
        this.style.whiteSpace = value;
    }

    public onFormattedTextChanged(data: PropertyChangeData) {
        let value = data.value;
        this._setFormattedTextPropertyToNative(value);
        this.nativePropertyChanged(textProperty, value.toString());
    }

    public _addChildFromBuilder(name: string, value: any): void {
        FormattedString.addFormattedStringToView(this, name, value);
    }

    _requestLayoutOnTextChanged(): void {
        this.requestLayout();
    }
}

export let textProperty = new Property<TextBaseCommon, string>({ name: "text", defaultValue: "" });
textProperty.register(TextBaseCommon);

export let formattedTextProperty = new Property<TextBaseCommon, FormattedString>({ name: "formattedText", affectsLayout: isIOS, valueChanged: onFormattedTextPropertyChanged });
formattedTextProperty.register(TextBaseCommon);

export let textAlignmentProperty = new InheritedCssProperty<Style, "left" | "center" | "right">({
    name: "textAlignment", cssName: "text-align", valueConverter: (value) => {
        switch (value) {
            case "left":
            case "center":
            case "right":
                return value;

            default:
                throw new Error(`CSS text-align ${value} is not supported.`);
        }
    }
});
textAlignmentProperty.register(Style);

export let textDecorationProperty = new CssProperty<Style, "none" | "underline" | "line-through">({
    name: "textDecoration", cssName: "text-decoration", defaultValue: "none", valueConverter: (value) => {
        let values = (value + "").split(" ");

        if (values.indexOf("none") !== -1 || values.indexOf("underline") !== -1 || values.indexOf("lineThrough") !== -1) {
            return value;
        } else {
            throw new Error(`CSS text-decoration ${value} is not supported.`);
        }
    }
});
textDecorationProperty.register(Style);

export let textTransformProperty = new CssProperty<Style, "none" | "capitalize" | "uppercase" | "lowercase">({
    name: "textTransform", cssName: "text-transform", defaultValue: "none", valueConverter: (value) => {
        switch (value) {
            case "none":
            case "uppercase":
            case "lowercase":
            case "capitalize":
                return value;

            default:
                throw new Error(`CSS text-transform ${value} is not supported.`);
        }
    }
});
textTransformProperty.register(Style);

export let whiteSpaceProperty = new CssProperty<Style, "normal" | "nowrap">({
    name: "whiteSpace", cssName: "white-space", valueConverter: (value: "normal" | "nowrap") => {
        switch (value) {
            case "normal":
            case "nowrap":
                return value;
            default:
                throw new Error(`CSS white-space ${value} is not supported.`);
        }
    }
});
whiteSpaceProperty.register(Style);

export let letterSpacingProperty = new CssProperty<Style, number>({ name: "letterSpacing", cssName: "letter-spacing", defaultValue: 0, affectsLayout: isIOS, valueConverter: (v: string) => parseFloat(v) });
letterSpacingProperty.register(Style);