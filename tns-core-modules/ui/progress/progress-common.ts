import definition = require("ui/progress");
import {View} from "ui/core/view";
import {Property} from "ui/core/dependency-observable";
import proxy = require("ui/core/proxy");

export class Progress extends View implements definition.Progress {
    public static valueProperty = new Property("value", "Progress", new proxy.PropertyMetadata(0));
    public static maxValueProperty = new Property("maxValue", "Progress", new proxy.PropertyMetadata(100));

    constructor() {
        super();

        // This calls make both platforms have default values from 0 to 100.
        this.maxValue = 100;
        this.value = 0;
    }

    get maxValue(): number {
        return this._getValue(Progress.maxValueProperty);
    }
    set maxValue(newMaxValue: number) {
        this._setValue(Progress.maxValueProperty, newMaxValue);

        // Adjust value if needed.
        if (this.value > newMaxValue) {
            this.value = newMaxValue;
        }
    }

    get value(): number {
        return this._getValue(Progress.valueProperty);
    }
    set value(value: number) {
        value = Math.min(value, this.maxValue);
        this._setValue(Progress.valueProperty, value);
    }
}