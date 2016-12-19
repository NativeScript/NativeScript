import { Slider as SliderDefinition } from "ui/slider";
import { View, Property, CoercibleProperty, isIOS } from "ui/core/view";

export * from "ui/core/view";

// TODO: Extract base Range class for slider and progress
export class SliderBase extends View implements SliderDefinition {
    public value: number;
    public minValue: number;
    public maxValue: number;
}

/**
 * Represents the observable property backing the value property of each Slider instance.
 */
export const valueProperty = new CoercibleProperty<SliderBase, number>({
    name: "value", defaultValue: 0, coerceValue: (target, value) => {
        value = Math.max(value, this.minValue);
        value = Math.min(value, this.maxValue);
        return value;
    }, valueConverter: (v) => isIOS ? parseFloat(v) : parseInt(v)
});
valueProperty.register(SliderBase);

/**
 * Represents the observable property backing the minValue property of each Slider instance.
 */
export const minValueProperty = new Property<SliderBase, number>({
    name: "minValue", defaultValue: 0, valueChanged: (target, oldValue, newValue) => {
         maxValueProperty.coerce(target);
         valueProperty.coerce(target);
    }, valueConverter: (v) => isIOS ? parseFloat(v) : parseInt(v)
});
minValueProperty.register(SliderBase);

/**
 * Represents the observable property backing the maxValue property of each Slider instance.
 */
export const maxValueProperty = new CoercibleProperty<SliderBase, number>({
    name: "maxValue", defaultValue: 100, coerceValue: (target, value) => {
        let minValue = target.minValue; 
        if (value < minValue) {
            value = minValue;
        }

        return value;
    },
    valueChanged: (target, oldValue, newValue) => valueProperty.coerce(target),
    valueConverter: (v) => isIOS ? parseFloat(v) : parseInt(v)
});
maxValueProperty.register(SliderBase);