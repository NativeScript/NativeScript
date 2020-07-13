import { Progress as ProgressDefinition } from '.';
import { View, CSSType } from '../core/view';
import { Property, CoercibleProperty } from '../core/properties';

@CSSType('Progress')
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

ProgressBase.prototype.recycleNativeView = 'auto';

/**
 * Represents the observable property backing the value property of each Progress instance.
 */
export const valueProperty = new CoercibleProperty<ProgressBase, number>({
	name: 'value',
	defaultValue: 0,
	coerceValue: (t, v) => {
		return v < 0 ? 0 : Math.min(v, t.maxValue);
	},
	valueConverter: (v) => parseInt(v),
});
valueProperty.register(ProgressBase);

/**
 * Represents the observable property backing the maxValue property of each Progress instance.
 */
export const maxValueProperty = new Property<ProgressBase, number>({
	name: 'maxValue',
	defaultValue: 100,
	valueChanged: (target, oldValue, newValue) => {
		valueProperty.coerce(target);
	},
	valueConverter: (v) => parseInt(v),
});
maxValueProperty.register(ProgressBase);
