import { Progress as ProgressDefinition } from "ui/progress";
import { View, Property, CoercibleProperty } from "ui/core/view";

export * from "ui/core/view";

export class ProgressBase extends View implements ProgressDefinition {
    public value: number;
    public maxValue: number;
    // get maxValue(): number {
    //     return this._getValue(Progress.maxValueProperty);
    // }
    // set maxValue(newMaxValue: number) {
    //     this._setValue(Progress.maxValueProperty, newMaxValue);

    //     // Adjust value if needed.
    //     if (this.value > newMaxValue) {
    //         this.value = newMaxValue;
    //     }
    // }

    // get value(): number {
    //     return this._getValue(Progress.valueProperty);
    // }
    // set value(value: number) {
    //     value = Math.min(value, this.maxValue);
    //     this._setValue(Progress.valueProperty, value);
    // }
}

/**
 * Represents the observable property backing the value property of each Progress instance.
 */
export const valueProperty = new CoercibleProperty<ProgressBase, number>({
    name: "value", 
    defaultValue: 0, 
    coerceValue: (t, v) => {
        return v < 0 ? 0 : Math.min(v, t.maxValue)
    },
    valueConverter: (v) => parseInt(v)
});
valueProperty.register(ProgressBase);

/**
 * Represents the observable property backing the maxValue property of each Progress instance.
 */
export const maxValueProperty = new Property<ProgressBase, number>({
    name: "maxValue",
    defaultValue: 100,
    valueChanged: (target, oldValue, newValue) => {
        valueProperty.coerce(target);
    },
    valueConverter: (v) => parseInt(v)
});
maxValueProperty.register(ProgressBase);