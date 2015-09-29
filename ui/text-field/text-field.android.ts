import common = require("./text-field-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onSecurePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var textField = <TextField>data.object;
    if (!textField.android) {
        return;
    }

    var currentInputType = textField.android.getInputType();
    var currentClass = currentInputType & android.text.InputType.TYPE_MASK_CLASS;
    var currentFlags = currentInputType & android.text.InputType.TYPE_MASK_FLAGS;
    var newInputType = currentInputType;
    
    // Password variations are supported only for Text and Number classes.
    if (data.newValue) {
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
    
    textField.android.setInputType(newInputType);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.secureProperty.metadata).onSetNativeValue = onSecurePropertyChanged;

global.moduleMerge(common, exports);

export class TextField extends common.TextField {
    public _configureEditText() {
        this.android.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_NORMAL | android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        this.android.setLines(1);
        this.android.setMaxLines(1);
        this.android.setHorizontallyScrolling(true);
    }

    public _onReturnPress() {
        this.notify({ eventName: TextField.returnPressEvent, object: this })
    }
}
