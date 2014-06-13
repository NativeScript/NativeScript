import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Button extends view.View {
    private static textProperty = "text";
    private _android: android.widget.Button;

    constructor() {
        super();
        this._android = new android.widget.Button(application.android.currentContext);

        var that = this;
        this._android.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (v) { that.emit("click"); }
        }));
    }

    get android(): android.widget.Button {
        return this._android;
    }

    get text(): string {
        return this.android.getText().toString();
    }
    set text(value: string) {
        this.setProperty(Button.textProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        if (data.propertyName === Button.textProperty) {
            this.android.setText(data.value);
        } else if (true) {
            //
        }
    }
} 