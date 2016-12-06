import { Progress as ProgressDefinition } from "ui/progress";
import { View, Property } from "ui/core/view";

export * from "ui/core/view";

export class ProgressBase extends View implements ProgressDefinition {
    constructor() {
        super();

        // This calls make both platforms have default values from 0 to 100.
        this.maxValue = 100;
        this.value = 0;
    }

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
export const valueProperty = new Property<ProgressBase, number>({ name: "value", defaultValue: 0 });
valueProperty.register(ProgressBase);

/**
 * Represents the observable property backing the maxValue property of each Progress instance.
 */
export const maxValueProperty = new Property<ProgressBase, number>({ name: "maxValue", defaultValue: 100 });
maxValueProperty.register(ProgressBase);