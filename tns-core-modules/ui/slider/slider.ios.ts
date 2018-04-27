import { Background } from "../styling/background";

import {
    SliderBase, valueProperty, minValueProperty, maxValueProperty,
    colorProperty, backgroundColorProperty, backgroundInternalProperty,
    Color
} from "./slider-common";

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
            valueProperty.nativeValueChange(owner, sender.value);
        }
    }

    public static ObjCExposedMethods = {
        "sliderValueChanged": { returns: interop.types.void, params: [UISlider] }
    };
}

export class Slider extends SliderBase {
    private _ios: UISlider;
    private _changeHandler: NSObject;

    constructor() {
        super();
        this.nativeViewProtected = this._ios = UISlider.new();

        // default values
        this._ios.minimumValue = 0;
        this._ios.maximumValue = this.maxValue;

        this._changeHandler = SliderChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "sliderValueChanged", UIControlEvents.ValueChanged);
    }

    get ios(): UISlider {
        return this._ios;
    }

    [valueProperty.getDefault](): number {
        return 0;
    }
    [valueProperty.setNative](value: number) {
        this._ios.value = value;
    }
    [minValueProperty.getDefault](): number {
        return 0;
    }
    [minValueProperty.setNative](value: number) {
        this._ios.minimumValue = value;
    }
    [maxValueProperty.getDefault](): number {
        return 100;
    }
    [maxValueProperty.setNative](value: number) {
        this._ios.maximumValue = value;
    }

    [colorProperty.getDefault](): UIColor {
        return this._ios.thumbTintColor;
    }
    [colorProperty.setNative](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.thumbTintColor = color;
    }

    [backgroundColorProperty.getDefault](): UIColor {
        return this._ios.minimumTrackTintColor;
    }
    [backgroundColorProperty.setNative](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.minimumTrackTintColor = color;
    }

    [backgroundInternalProperty.getDefault](): Background {
        return null;
    }
    [backgroundInternalProperty.setNative](value: Background) {
        //
    }
}
