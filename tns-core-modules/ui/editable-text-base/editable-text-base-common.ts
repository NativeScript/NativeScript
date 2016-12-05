import { EditableTextBase as EditableTextBaseDefinition } from "ui/editable-text-base";
import { Property, CssProperty } from "ui/core/properties";
import { TextBase } from "ui/text-base";
import { Style } from "ui/styling/style";
import { Color } from "color";

export * from "ui/text-base";

export abstract class EditableTextBase extends TextBase implements EditableTextBaseDefinition {

    public keyboardType: "datetime" | "phone" | "number" | "url" | "email";
    public returnKeyType: "done" | "next" | "go" | "search" | "send";
    public updateTextTrigger: "focusLost" | "textChanged";
    public autocapitalizationType: "none" | "words" | "sentences" | "allCharacters";
    public editable: boolean;
    public autocorrect: boolean;
    public hint: string;

    public abstract dismissSoftInput();
}

export const placeholderColorProperty = new CssProperty<Style, Color>({ name: "placeholderColor", cssName: "placeholder-color", equalityComparer: Color.equals, valueConverter: (v: string) => new Color(v) });
placeholderColorProperty.register(Style);

export const keyboardTypeProperty = new Property<EditableTextBase, "datetime" | "phone" | "number" | "url" | "email">({ name: "keyboardType" });
keyboardTypeProperty.register(EditableTextBase);

export const returnKeyTypeProperty = new Property<EditableTextBase, "done" | "next" |  "go" | "search" | "send">({ name: "returnKeyType" });
returnKeyTypeProperty.register(EditableTextBase);

export const editableProperty = new Property<EditableTextBase, boolean>({ name: "editable", defaultValue: true });
editableProperty.register(EditableTextBase);

export const updateTextTriggerProperty = new Property<EditableTextBase, "focusLost" | "textChanged">({ name: "updateTextTrigger", defaultValue: "textChanged" });
updateTextTriggerProperty.register(EditableTextBase);

export const autocapitalizationTypeProperty = new Property<EditableTextBase, "none" | "words" | "sentences" | "allCharacters">({ name: "autocapitalizationType", defaultValue: "sentences" });
autocapitalizationTypeProperty.register(EditableTextBase);

export const autocorrectProperty = new Property<EditableTextBase, boolean>({ name: "autocorrect" });
autocorrectProperty.register(EditableTextBase);

export const hintProperty = new Property<EditableTextBase, string>({ name: "hint", defaultValue: "" });
hintProperty.register(EditableTextBase);