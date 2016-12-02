import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from "./slider-common";
import { colorProperty, backgroundColorProperty, backgroundInternalProperty } from "ui/core/view";
import { Color } from "color";
import { Background } from "ui/styling/background";

export * from "./slider-common";

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
            owner.nativePropertyChanged(valueProperty, sender.value);
        }
    }

    public static ObjCExposedMethods = {
        'sliderValueChanged': { returns: interop.types.void, params: [UISlider] }
    };
}

export class Slider extends SliderBase {
    private _ios: UISlider;
    private _changeHandler: NSObject;

    constructor() {
        super();
        this._ios = UISlider.new();

        // default values
        this._ios.minimumValue = 0;
        this._ios.maximumValue = this.maxValue;

        this._changeHandler = SliderChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "sliderValueChanged", UIControlEvents.ValueChanged);
    }

    get ios(): UISlider {
        return this._ios;
    }

    get [valueProperty.native](): number {
        return 0;
    }
    set [valueProperty.native](value: number) {
        this._ios.value = value;
    }
    get [minValueProperty.native](): number {
        return 0;
    }
    set [minValueProperty.native](value: number) {
        this._ios.minimumValue = value;
    }
    get [maxValueProperty.native](): number {
        return 100;
    }
    set [maxValueProperty.native](value: number) {
        this._ios.maximumValue = value;
    }

    get [colorProperty.native](): UIColor {
        return this._ios.thumbTintColor;
    }
    set [colorProperty.native](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.thumbTintColor = color;
    }

    get [backgroundColorProperty.native](): UIColor {
        return this._ios.minimumTrackTintColor;
    }
    set [backgroundColorProperty.native](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.minimumTrackTintColor = color;
    }

    get [backgroundInternalProperty.native](): Background {
        return null;
    }
    set [backgroundInternalProperty.native](value: Background) {
        //
    }
}