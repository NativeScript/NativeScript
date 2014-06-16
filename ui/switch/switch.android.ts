import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Switch extends view.View {
    private static checkedProperty = "checked";
    private _android: android.widget.Switch;

    constructor() {
        super();
        this._android = new android.widget.Switch(application.android.currentContext);

        var that = this;
        this._android.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener({
            onCheckedChanged: function (sender, isChecked) {
                that.setProperty(Switch.checkedProperty, isChecked);
            }
        }));
    }

    get android(): android.widget.Switch {
        return this._android;
    }

    get checked(): boolean {
        return this.android.isChecked();
    }
    set checked(value: boolean) {
        this.setProperty(Switch.checkedProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        if (data.propertyName === Switch.checkedProperty) {
            this.android.setChecked(data.value);
        } else if (true) {
            //
        }
    }
} 