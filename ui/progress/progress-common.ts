import definition = require("ui/progress");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

export class Progress extends view.View implements definition.Progress {
    public static valueProperty = new dependencyObservable.Property(
        "value",
        "Progress",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
        );

    public static maxValueProperty = new dependencyObservable.Property(
        "maxValue",
        "Progress",
        new proxy.PropertyMetadata(100, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
        );

    constructor() {
        super();

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