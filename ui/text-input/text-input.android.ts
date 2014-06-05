import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class TextInput extends view.View {
    private _android: android.widget.EditText;
    private static textProperty = "text";

    constructor() {
        super();

        var context = application.android.currentContext;
        this._android = new android.widget.EditText(context);

        // TODO: This code is same for Label, extract base class or derive from Label
        var that = this;
        var textWatcher = new android.text.TextWatcher({
            beforeTextChanged: function (text: string, start: number, count: number, after: number) {
            },
            onTextChanged: function (text: string, start: number, before: number, count: number) {
            },
            afterTextChanged: function (editable: android.text.IEditable) {
                //if (that.hasObservers(observable.Observable.propertyChangeEvent)) {
                //    var data = that.createPropertyChangeData(TextView.textProperty, that.text);
                //    that.notify(data);
                //}
                that.updateTwoWayBinding("text", editable.toString());
            }
        });
        this._android.addTextChangedListener(textWatcher);
    }

    get android(): android.widget.EditText {
        return this._android;
    }

    get text(): string {
        return this._android.getText().toString();
    }
    set text(value: string) {
        this.setProperty(TextInput.textProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO: Will this be a gigantic if-else switch?
        if (data.propertyName === TextInput.textProperty) {
            this._android.setText(data.value, android.widget.TextView.BufferType.EDITABLE);
        } else if (true) {
        }
    }
}