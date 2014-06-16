import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Switch extends view.View {
    private static checkedProperty = "checked";
    private _ios: UIKit.UISwitch;
    private _handler: Foundation.NSObject;

    constructor() {
        super();
        this._ios = new UIKit.UISwitch();

        var that = this;
        var target = Foundation.NSObject.extends({
            valueChange: (sender: UIKit.UISwitch) => {
                that.setProperty(Switch.checkedProperty, sender.on);
            }
        }, { exposedMethods: { "valueChange": "v@:@" } });
        this._handler = new target();
        this._ios.addTargetActionForControlEvents(this._handler, "valueChange", UIKit.UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UIKit.UISwitch {
        return this._ios;
    }

    get checked(): boolean {
        return this.ios.on
    }
    set checked(value: boolean) {
        this.setProperty(Switch.checkedProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        if (data.propertyName === Switch.checkedProperty) {
            this.ios.on = data.value;
        } else if (true) {
            //
        }
    }
} 