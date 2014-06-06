import observable = require("ui/core/observable");
import view = require("ui/core/view");
import application = require("application");

export class Label extends view.View {
    private static textProperty = "text";
    private _ios: UIKit.UILabel;
    private changedHandler: Foundation.NSObject;

    constructor() {
        super();

        this._ios = new UIKit.UILabel();

        //var extendsBody = Foundation.NSObject.extends(
        //    {
        //        onTextChanged: function (path, sender, change, context) {
        //        }
        //    },
        //    {
        //        exposedMethods: { "tick:": "v@:@" }
        //    });

        //this.changedHandler = new extendsBody();
    }

    get ios(): UIKit.UILabel {
        return this._ios;
    }

    get text(): string {
        return this._ios.text;
    }
    set text(value: string) {
        this.setProperty(Label.textProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        // TODO: Will this be a gigantic if-else switch?
        if (data.propertyName === Label.textProperty) {
            this._ios.text = data.value;
        } else if (true) {
        }
    }

    public addToParent(parent: UIKit.UIView) {
        super.addToParent(parent);
        this._ios.sizeToFit();
    }
} 