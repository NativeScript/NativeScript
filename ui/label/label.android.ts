import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Label extends view.View {
    private static textProperty = "text";
    private _android: android.widget.TextView;

    constructor() {
        super();

        // TODO: Verify that this is always true
        var context = application.android.currentContext;
        if (!context) {
            // TODO: Delayed loading?
        }

        this._android = new android.widget.TextView(context);

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

    get android(): android.widget.TextView {
        return this._android;
    }

    get text(): string {
        return this._android.getText().toString();
    }
    set text(value: string) {
        this.setProperty(Label.textProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO: Will this be a gigantic if-else switch?
        if (data.propertyName === Label.textProperty) {
            this._android.setText(data.value);
        } else if (true) {
        }
    }
} 