import { View, CSSType } from '../core/view';
import { Property, CoercibleProperty } from '../core/properties';

export interface ItemsSource {
	length: number;
	getItem(index: number): any;
}

@CSSType('ListPicker')
export class ListPickerBase extends View {
	public selectedIndex: number;
	public items: any[] | ItemsSource;
	public isItemsSource: boolean;
	public textField: string;
	public valueField: string;
	public selectedValue: any;

	public _getItemAsString(index: number): any {
		let items = this.items;
		if (!items) {
			return ' ';
		}

		let item = this.isItemsSource ? (<ItemsSource>this.items).getItem(index) : this.items[index];

		return item === undefined || item === null ? index + '' : this.parseItem(item);
	}

	private parseItem(item) {
		return this.textField ? item[this.textField] + '' : item + '';
	}

	public updateSelectedValue(index) {
		let newVal = null;
		if (index >= 0) {
			const item = this.items[index];

			newVal = this.valueField ? item[this.valueField] : item;
		}

		if (this.selectedValue !== newVal) {
			this.set('selectedValue', newVal);
		}
	}
}

ListPickerBase.prototype.recycleNativeView = 'auto';

export const selectedIndexProperty = new CoercibleProperty<ListPickerBase, number>({
	name: 'selectedIndex',
	defaultValue: -1,
	valueConverter: (v) => parseInt(v),
	coerceValue: (target, value) => {
		let items = target.items;
		if (items) {
			let max = items.length - 1;
			if (value < 0) {
				value = 0;
			}
			if (value > max) {
				value = max;
			}
		} else {
			value = -1;
		}

		target.updateSelectedValue(value);

		return value;
	},
});
selectedIndexProperty.register(ListPickerBase);

export const itemsProperty = new Property<ListPickerBase, any[] | ItemsSource>({
	name: 'items',
	valueChanged: (target, oldValue, newValue) => {
		let getItem = newValue && (<ItemsSource>newValue).getItem;
		target.isItemsSource = typeof getItem === 'function';
	},
});
itemsProperty.register(ListPickerBase);

export const textFieldProperty = new Property<ListPickerBase, string>({
	name: 'textField',
	defaultValue: '',
});
textFieldProperty.register(ListPickerBase);

export const valueFieldProperty = new Property<ListPickerBase, string>({
	name: 'valueField',
	defaultValue: '',
});
valueFieldProperty.register(ListPickerBase);

export const selectedValueProperty = new Property<ListPickerBase, string>({
	name: 'selectedValue',
	defaultValue: null,
});
selectedValueProperty.register(ListPickerBase);
