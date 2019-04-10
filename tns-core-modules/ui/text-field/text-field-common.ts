import { TextField as TextFieldDefinition } from ".";
import { EditableTextBase } from "../editable-text-base";
import { CSSType } from "../core/view";
import { Property } from "../core/properties";
import { booleanConverter } from "../core/view-base";

@CSSType("TextField")
export class TextFieldBase extends EditableTextBase implements TextFieldDefinition {
    public static returnPressEvent = "returnPress";
    public secure: boolean;
}

TextFieldBase.prototype.recycleNativeView = "auto";

export const secureProperty = new Property<TextFieldBase, boolean>({ name: "secure", defaultValue: false, valueConverter: booleanConverter });
secureProperty.register(TextFieldBase);