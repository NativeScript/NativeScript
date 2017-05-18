import { TextView as TextViewDefinition } from ".";
import { EditableTextBase } from "../editable-text-base";

export * from "../text-base";

export class TextView extends EditableTextBase implements TextViewDefinition {
    
    public _configureEditText(editText: android.widget.EditText) {
        editText.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        editText.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT);
    }
}

TextView.prototype.recycleNativeView = true;