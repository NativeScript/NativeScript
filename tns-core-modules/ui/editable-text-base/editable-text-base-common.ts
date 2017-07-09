import { EditableTextBase as EditableTextBaseDefinition, KeyboardType, ReturnKeyType, UpdateTextTrigger, AutocapitalizationType } from ".";
import { TextBase, Property, CssProperty, Style, Color, booleanConverter, makeValidator, makeParser } from "../text-base";

export * from "../text-base";

export abstract class EditableTextBase extends TextBase implements EditableTextBaseDefinition {
    public static blurEvent = "blur";

    public keyboardType: KeyboardType;
    public returnKeyType: ReturnKeyType;
    public updateTextTrigger: UpdateTextTrigger;
    public autocapitalizationType: AutocapitalizationType;
    public editable: boolean;
    public autocorrect: boolean;
    public hint: string;
    public maxLength: number;

    public abstract dismissSoftInput();
    public abstract _setInputType(inputType: number): void;
}

// TODO: Why not name it - hintColor property??
// TODO: Or rename hintProperty to 'placeholder' and make it CSSProperty??
// https://developer.mozilla.org/en-US/docs/Web/CSS/:-moz-placeholder
export const placeholderColorProperty = new CssProperty<Style, Color>({ name: "placeholderColor", cssName: "placeholder-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
placeholderColorProperty.register(Style);

const keyboardTypeConverter = makeParser<KeyboardType>(makeValidator<KeyboardType>("datetime", "phone", "number", "url", "email"));

export const keyboardTypeProperty = new Property<EditableTextBase, KeyboardType>({ name: "keyboardType", valueConverter: keyboardTypeConverter });
keyboardTypeProperty.register(EditableTextBase);

const returnKeyTypeConverter = makeParser<ReturnKeyType>(makeValidator<ReturnKeyType>("done", "next", "go", "search", "send"));

export const returnKeyTypeProperty = new Property<EditableTextBase, ReturnKeyType>({ name: "returnKeyType", valueConverter: returnKeyTypeConverter });
returnKeyTypeProperty.register(EditableTextBase);

export const editableProperty = new Property<EditableTextBase, boolean>({ name: "editable", defaultValue: true, valueConverter: booleanConverter });
editableProperty.register(EditableTextBase);

export const updateTextTriggerProperty = new Property<EditableTextBase, UpdateTextTrigger>({ name: "updateTextTrigger", defaultValue: "textChanged" });
updateTextTriggerProperty.register(EditableTextBase);

const autocapitalizationTypeConverter = makeParser<AutocapitalizationType>(makeValidator<AutocapitalizationType>("none", "words", "sentences", "allcharacters"));

export const autocapitalizationTypeProperty = new Property<EditableTextBase, AutocapitalizationType>({ name: "autocapitalizationType", defaultValue: "sentences", valueConverter: autocapitalizationTypeConverter });
autocapitalizationTypeProperty.register(EditableTextBase);

export const autocorrectProperty = new Property<EditableTextBase, boolean>({ name: "autocorrect", valueConverter: booleanConverter });
autocorrectProperty.register(EditableTextBase);

export const hintProperty = new Property<EditableTextBase, string>({ name: "hint", defaultValue: "" });
hintProperty.register(EditableTextBase);

export const maxLengthProperty = new Property<EditableTextBase, number>({ name: "maxLength", defaultValue: Number.POSITIVE_INFINITY, valueConverter: parseInt });
maxLengthProperty.register(EditableTextBase);
