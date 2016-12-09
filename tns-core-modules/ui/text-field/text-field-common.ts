import { TextField as TextFieldDefinition } from "ui/text-field";
import { EditableTextBase, Property, booleanConverter } from "ui/editable-text-base";

export * from "ui/editable-text-base";

export const secureProperty = new Property<TextFieldBase, boolean>({ name: "secure", defaultValue: false, valueConverter: booleanConverter });
secureProperty.register(TextFieldBase)

export class TextFieldBase extends EditableTextBase implements TextFieldDefinition {
    public static returnPressEvent = "returnPress";
    public secure: boolean;
}