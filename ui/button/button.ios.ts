import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Button extends view.View {
    private static textProperty = "text";
    private _ios: UIKit.UIButton;
    private _clickHandler: Foundation.NSObject;

    constructor() {
        super();
        this._ios = UIKit.UIButton.buttonWithType(UIKit.UIButtonType.UIButtonTypeSystem);

        var that = this;
        var target = Foundation.NSObject.extends({ click: (args) => { that.emit("click"); } }, { exposedMethods: { "click": "v@:@" } });
        this._clickHandler = new target();
        this._ios.addTargetActionForControlEvents(this._clickHandler, "click", UIKit.UIControlEvents.UIControlEventTouchUpInside);
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
            this.ios.sizeToFit();
        } else if (true) {
            //
        }
    }
} 