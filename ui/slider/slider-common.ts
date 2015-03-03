import view = require("ui/core/view");
import definition = require("ui/slider");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

// TODO: Extract base Range class for slider and progress
export class Slider extends view.View implements definition.Slider {

    public static valueProperty = new dependencyObservable.Property(
        "value",
        "Slider",
        new proxy.PropertyMetadata(0)
        );

    public static minValueProperty = new dependencyObservable.Property(
        "minValue",
        "Slider",
        new proxy.PropertyMetadata(0)
        );

    public static maxValueProperty = new dependencyObservable.Property(
        "maxValue",
        "Slider",
        new proxy.PropertyMetadata(100)
        );

    constructor() {
        super();
    }

    get value(): number {
        return this._getValue(Slider.valueProperty);
    }
    set value(value: number) {
        var newValue = value;
        newValue = Math.max(newValue, this.minValue);
        newValue = Math.min(newValue, this.maxValue);

        this._setValue(Slider.valueProperty, newValue);
    }

    get minValue(): number {
        return this._getValue(Slider.minValueProperty);
    }
    set minValue(newValue: number) {
        this._setValue(Slider.minValueProperty, newValue);

        if (newValue > this.maxValue) {
            this._setValue(Slider.maxValueProperty, newValue);
        }

        if (newValue > this.value) {
            this._setValue(Slider.valueProperty, newValue);
        }
    }

    get maxValue(): number {
        return this._getValue(Slider.maxValueProperty);
    }
    set maxValue(newValue: number) {
        this._setValue(Slider.maxValueProperty, newValue);

        if (newValue < this.minValue) {
            this._setValue(Slider.minValueProperty, newValue);
        }

        if (newValue < this.value) {
            this._setValue(Slider.valueProperty, newValue);
        }
    }
}