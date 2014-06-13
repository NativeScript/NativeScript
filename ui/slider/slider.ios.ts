
import observable = require("ui/core/observable");
import view = require("ui/core/view");

export class Slider extends view.View {
    private static valueProperty = "value";
    private static maxValueProperty = "maxValue";
    private _ios: UIKit.UISlider;
    private changeHandler: Foundation.NSObject;

    constructor() {
        super();
        this._ios = new UIKit.UISlider();

        // default values
        this._ios.minimumValue = 0;
        this._ios.maximumValue = 100;

        var that = this;
        var ChangeHandler = Foundation.NSObject.extends(
            {
                sliderValueChanged: function (sender: UIKit.UISlider) {
                    that.setProperty(Slider.valueProperty, sender.value);
                }
            }, {
                exposedMethods: {
                    'sliderValueChanged': 'v@:@'
                }
            });

        this.changeHandler = new ChangeHandler();
        this._ios.addTargetActionForControlEvents(this.changeHandler, "sliderValueChanged", UIKit.UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UIKit.UISlider {
        return this._ios;
    }

    get maxValue(): number {
        return this._ios.maximumValue;
    }

    set maxValue(value: number) {
        this.setProperty(Slider.maxValueProperty, value);
    }

    get value(): number {
        return this._ios.value;
    }

    set value(value: number) {
        this.setProperty(Slider.valueProperty, value);
    }

    public setNativeProperty(data: observable.PropertyChangeData) {
        if (data.propertyName === Slider.maxValueProperty) {
            this._ios.maximumValue = data.value;
        } else if (data.propertyName === Slider.valueProperty) {
            this._ios.value = data.value;
        } else if (true) {
        }
    }
} 