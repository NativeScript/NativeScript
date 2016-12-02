import { Slider as SliderDefinition } from "ui/slider";
import { View } from "ui/core/view";
import { Property } from "ui/core/properties";

// TODO: Extract base Range class for slider and progress
export class SliderBase extends View implements SliderDefinition {
    public value: number;
    public minValue: number;
    public maxValue: number;
}

/**
 * Represents the observable property backing the value property of each Slider instance.
 */
export const valueProperty = new Property<SliderBase, number>({
    name: "value", defaultValue: 0, valueChanged: (target, oldValue, newValue) => {
        newValue = Math.max(newValue, this.minValue);
        newValue = Math.min(newValue, this.maxValue);

        target.value = newValue;
    }
});
valueProperty.register(SliderBase);

/**
 * Represents the observable property backing the minValue property of each Slider instance.
 */
export const minValueProperty = new Property<SliderBase, number>({
    name: "minValue", defaultValue: 0, valueChanged: (target, oldValue, newValue) => {
        if (newValue > target.maxValue) {
            target.maxValue = newValue;
        }

        if (newValue > target.value) {
            target.value = newValue;
        }
    }
});
minValueProperty.register(SliderBase);

/**
 * Represents the observable property backing the maxValue property of each Slider instance.
 */
export const maxValueProperty = new Property<SliderBase, number>({
    name: "maxValue", defaultValue: 100, valueChanged: (target, oldValue, newValue) => {
        if (newValue < target.minValue) {
            target.minValue = newValue;
        }

        if (newValue < target.value) {
            target.value = newValue;
        }
    }
});
maxValueProperty.register(SliderBase);