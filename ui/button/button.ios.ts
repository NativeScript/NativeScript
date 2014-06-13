import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Button extends view.View {
    private static textProperty = "text";
    private _ios: UIKit.UIButton;

    constructor() {
        super();
        this._ios = UIKit.UIButton.buttonWithType(UIKit.UIButtonType.UIButtonTypeRoundedRect);

        var that = this;
        var target = Foundation.NSObject.extends({ click: (args) => { that.emit("click"); } }, { exposedMethods: { "click:": "v@:@" } });
        this._ios.addTargetActionForControlEvents(new target(), "click:", UIKit.UIControlEvents.UIControlEventTouchUpInside);
    }

    get ios(): UIKit.UIButton {
        return this._ios;
    }

    get text(): string {
        return this.ios.titleForState(UIKit.UIControlState.UIControlStateNormal);
    }
    set text(value: string) {
        this.setProperty(Button.textProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        if (data.propertyName === Button.textProperty) {
            this.ios.setTitleForState(data.value, UIKit.UIControlState.UIControlStateNormal);
        } else if (true) {
            //
        }
    }
} 