import { TextView as TextViewDefinition } from ".";
import { EditableTextBase } from "../editable-text-base";

export * from "../text-base";

export class TextView extends EditableTextBase implements TextViewDefinition {
    public _configureEditText() {
        this.android.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        this.android.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT);
    }
}
