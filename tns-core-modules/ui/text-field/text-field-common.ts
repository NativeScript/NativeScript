import { TextField as TextFieldDefinition } from "ui/text-field";
import { Property } from "ui/core/properties";
import { EditableTextBase } from "ui/editable-text-base";

export * from "ui/editable-text-base";

export let secureProperty = new Property<TextFieldBase, boolean>({ name: "secure", defaultValue: false });
secureProperty.register(TextFieldBase)

export class TextFieldBase extends EditableTextBase implements TextFieldDefinition {
    public static returnPressEvent = "returnPress";
    public secure: boolean;
}