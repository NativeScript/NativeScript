import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");
import definition = require("ui/text-field");

var TEXT = "text";

export class TextField extends view.View implements definition.TextField {
    private _ios: UIKit.UITextField;
    private _delegate: any;

    constructor() {
        super();

        this._ios = new UIKit.UITextField();

        var that = this;
        var protocolImplementation = Foundation.NSObject.extends({}, {}).implements({
            protocol: "UITextFieldDelegate",
            implementation: {
                textFieldDidEndEditing: function (field: UIKit.UITextField) {
                    that.updateTwoWayBinding(TEXT, field.text);
                    console.log("TextField end edit");
                }
            }
        });

        this._delegate = new protocolImplementation();
        this._ios.delegate = this._delegate;

        var frame = CoreGraphics.CGRectMake(100, 100, 50, 30);
    }

    get ios(): UIKit.UITextField {
        return this._ios;
    }

    get text(): string {
        return this.ios.text;
    }
    set text(value: string) {
        this.setProperty(TEXT, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO: Will this be a gigantic if-else switch?
        if (data.propertyName === TEXT) {
            this._ios.text = data.value;
            this._ios.sizeToFit();
        } else if (true) {
        }
    }
} 