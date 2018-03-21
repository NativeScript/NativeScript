import { TextView as TextViewDefinition } from ".";
import { EditableTextBase, CSSType } from "../editable-text-base";

export * from "../text-base";

@CSSType("TextView")
export class TextView extends EditableTextBase implements TextViewDefinition {

    public _configureEditText(editText: android.widget.EditText) {
        editText.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES | android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE | android.text.InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS);
        editText.setGravity(android.view.Gravity.TOP | android.view.Gravity.START);
    }

    public resetNativeView(): void {
        super.resetNativeView();
        this.nativeViewProtected.setGravity(android.view.Gravity.TOP | android.view.Gravity.START);
    }
}

TextView.prototype.recycleNativeView = "auto";