import view = require("ui/core/view");
import definition = require("ui/switch");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

export class Switch extends view.View implements definition.Switch {
    public static checkedProperty = new dependencyObservable.Property(
        "checked",
        "Switch",
        new proxy.PropertyMetadata(false)
        );

    get checked(): boolean {
        return this._getValue(Switch.checkedProperty);
    }
    set checked(value: boolean) {
        this._setValue(Switch.checkedProperty, value);
    }
}