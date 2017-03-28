import { TextField as TextFieldDefinition } from ".";
import { EditableTextBase, Property, booleanConverter } from "../editable-text-base";

export * from "../editable-text-base";

export class TextFieldBase extends EditableTextBase implements TextFieldDefinition {
    public static returnPressEvent = "returnPress";
    public secure: boolean;
}

TextFieldBase.prototype.recycleNativeView = true;

export const secureProperty = new Property<TextFieldBase, boolean>({ name: "secure", defaultValue: false, valueConverter: booleanConverter });
secureProperty.register(TextFieldBase);