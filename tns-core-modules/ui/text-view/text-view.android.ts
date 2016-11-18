import { TextView as TextViewDefinition } from "ui/text-view";
import { EditableTextBase } from "ui/editable-text-base";

export * from "ui/text-base";

export class TextView extends EditableTextBase implements TextViewDefinition {
    public _configureEditText() {
        this.android.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE);
        this.android.setGravity(android.view.Gravity.TOP | android.view.Gravity.LEFT);
    }
}