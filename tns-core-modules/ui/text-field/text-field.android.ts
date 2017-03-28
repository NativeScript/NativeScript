import { TextFieldBase, secureProperty, whiteSpaceProperty, WhiteSpace } from "./text-field-common";

export * from "./text-field-common";

export class TextField extends TextFieldBase {
    public _configureEditText(editText: android.widget.EditText) {
        editText.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        editText.setLines(1);
        editText.setMaxLines(1);
        editText.setHorizontallyScrolling(true);
    }

    public _initNativeView(): void {
        // TODO: We should be able to reset it using only our properties. Check it first.
        super._initNativeView();
        this.nativeView.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
    }

    public _onReturnPress() {
        this.notify({ eventName: TextField.returnPressEvent, object: this })
    }

    [secureProperty.getDefault](): boolean {
        return false;
    }
    [secureProperty.setNative](value: boolean) {
        const nativeView = this.nativeView;
        const currentInputType = nativeView.getInputType();
        const currentClass = currentInputType & android.text.InputType.TYPE_MASK_CLASS;
        const currentFlags = currentInputType & android.text.InputType.TYPE_MASK_FLAGS;
        let newInputType = currentInputType;

        // Password variations are supported only for Text and Number classes.
        if (value) {
            if (currentClass === android.text.InputType.TYPE_CLASS_TEXT) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD;
            } else if (currentClass === android.text.InputType.TYPE_CLASS_NUMBER) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD;
            }

            // Lower all autocapitalization bits, because password bits don't like them and we will receive "Unsupported input type: 16513" error for example.
            newInputType = newInputType & ~28672; //28672 (0x0070000) 13,14,15 bits (111 0000 0000 0000)
        } else {
            if (currentClass === android.text.InputType.TYPE_CLASS_TEXT) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL;
            } else if (currentClass === android.text.InputType.TYPE_CLASS_NUMBER) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL;
            }
        }

        nativeView.setInputType(newInputType);
    }

    [whiteSpaceProperty.getDefault](): WhiteSpace {
        return "nowrap";
    }
    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        // Don't change it otherwise TextField will go to multiline mode.
    }
}