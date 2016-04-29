import common = require("./slider-common");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");

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

global.moduleMerge(common, exports);

class SliderChangeHandlerImpl extends NSObject {

    private _owner: WeakRef<Slider>;

    public static initWithOwner(owner: WeakRef<Slider>): SliderChangeHandlerImpl {
        let handler = <SliderChangeHandlerImpl>SliderChangeHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public sliderValueChanged(sender: UISlider) {
        let owner = this._owner.get();
        if (owner) {
            owner._onPropertyChangedFromNative(common.Slider.valueProperty, sender.value);
        }
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

        this._changeHandler = SliderChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "sliderValueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UISlider {
        return this._ios;
    }
} 

export class SliderStyler implements style.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <UISlider>view.ios;
        bar.thumbTintColor = newValue;
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISlider>view.ios;
        bar.thumbTintColor = nativeValue;
    }

    private static getNativeColorValue(view: view.View): any {
        var bar = <UISlider>view.ios;
        return bar.thumbTintColor;
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <UISlider>view.ios;
        bar.minimumTrackTintColor = newValue;
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <UISlider>view.ios;
        bar.minimumTrackTintColor = nativeValue;
    }

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <UISlider>view.ios;
        return bar.minimumTrackTintColor;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            SliderStyler.setColorProperty,
            SliderStyler.resetColorProperty,
            SliderStyler.getNativeColorValue), "Slider");

        style.registerHandler(style.backgroundColorProperty, new style.StylePropertyChangedHandler(
            SliderStyler.setBackgroundColorProperty,
            SliderStyler.resetBackgroundColorProperty,
            SliderStyler.getBackgroundColorProperty), "Slider");

        style.registerHandler(style.backgroundInternalProperty, style.ignorePropertyHandler, "Slider");
    }
}

SliderStyler.registerHandlers();
