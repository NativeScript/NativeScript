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

        var that = this;
        var extendsBody = Foundation.NSObject.extends(
            {
                observeValueForKeyPathOfObjectChangeContext: function (path: string, sender: Foundation.NSObject, change: Foundation.NSDictionary, context) {
                    that.updateTwoWayBinding(Label.textProperty, change.objectForKey(Foundation.NSKeyValueChangeNewKey));
                }
            }, {});

        this.changedHandler = new extendsBody();
        this._ios.addObserverForKeyPathOptionsContext(this.changedHandler, "text", Foundation.NSKeyValueObservingOptions.NSKeyValueObservingOptionNew, null);
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
            this._ios.sizeToFit();
        } else if (true) {
        }
    }
} 