import { TextFieldBase, secureProperty } from "./text-field-common";

export * from "./text-field-common";

export class TextField extends TextFieldBase {
    public _configureEditText() {
        let nativeView = this.nativeView;
        nativeView.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        nativeView.setLines(1);
        nativeView.setMaxLines(1);
        nativeView.setHorizontallyScrolling(true);
    }

    public _onReturnPress() {
        this.notify({ eventName: TextField.returnPressEvent, object: this })
    }

    get [secureProperty.native](): boolean {
        return false;
    }
    set [secureProperty.native](value: boolean) {
        let nativeView = this.nativeView;
        let currentInputType = nativeView.getInputType();
        let currentClass = currentInputType & android.text.InputType.TYPE_MASK_CLASS;
        let currentFlags = currentInputType & android.text.InputType.TYPE_MASK_FLAGS;
        let newInputType = currentInputType;

        // Password variations are supported only for Text and Number classes.
        if (value) {
            if (currentClass === android.text.InputType.TYPE_CLASS_TEXT) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD;
            }
            else if (currentClass === android.text.InputType.TYPE_CLASS_NUMBER) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_NUMBER_VARIATION_PASSWORD;
            }

            // Lower all autocapitalization bits, because password bits don't like them and we will receive "Unsupported input type: 16513" error for example.
            newInputType = newInputType & ~28672; //28672 (0x0070000) 13,14,15 bits (111 0000 0000 0000)
        }
        else {
            if (currentClass === android.text.InputType.TYPE_CLASS_TEXT) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL;
            }
            else if (currentClass === android.text.InputType.TYPE_CLASS_NUMBER) {
                newInputType = currentClass | currentFlags | android.text.InputType.TYPE_NUMBER_VARIATION_NORMAL;
            }
        }

        nativeView.setInputType(newInputType);
    }
}
