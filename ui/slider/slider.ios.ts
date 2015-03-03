import common = require("ui/slider/slider-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slider = <Slider>data.object;
    slider.ios.value = data.newValue;
}

function onMinValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slider = <Slider>data.object;
    slider.ios.minimumValue = data.newValue;
}

function onMaxValuePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var slider = <Slider>data.object;
    slider.ios.maximumValue = data.newValue;
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Slider.valueProperty.metadata).onSetNativeValue = onValuePropertyChanged;
(<proxy.PropertyMetadata>common.Slider.minValueProperty.metadata).onSetNativeValue = onMinValuePropertyChanged;
(<proxy.PropertyMetadata>common.Slider.maxValueProperty.metadata).onSetNativeValue = onMaxValuePropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

class SliderChangeHandlerImpl extends NSObject {
    static new(): SliderChangeHandlerImpl {
        return <SliderChangeHandlerImpl>super.new();
    }

    private _owner: Slider;

    public initWithOwner(owner: Slider): SliderChangeHandlerImpl {
        this._owner = owner;
        return this;
    }
    
    public sliderValueChanged(sender: UISlider) {
        this._owner._onPropertyChangedFromNative(common.Slider.valueProperty, sender.value);
    }

    public static ObjCExposedMethods = {
        'sliderValueChanged': { returns: interop.types.void, params: [UISlider] }
    };
}

export class Slider extends common.Slider {
    private _ios: UISlider;
    private _changeHandler: NSObject;

    constructor() {
        super();
        this._ios = new UISlider();

        // default values
        this._ios.minimumValue = 0;
        this._ios.maximumValue = this.maxValue;

        this._changeHandler = SliderChangeHandlerImpl.new().initWithOwner(this);
        this._ios.addTargetActionForControlEvents(this._changeHandler, "sliderValueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UISlider {
        return this._ios;
    }
} 