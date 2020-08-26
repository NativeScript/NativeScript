import { SegmentedBar as SegmentedBarDefinition, SegmentedBarItem as SegmentedBarItemDefinition, SelectedIndexChangedEventData } from '.';
import { View, AddChildFromBuilder, AddArrayFromBuilder, CSSType } from '../core/view';
import { ViewBase } from '../core/view-base';
import { Property, CoercibleProperty, InheritedCssProperty } from '../core/properties';
import { Color } from '../../color';
import { Style } from '../styling/style';
import { EventData } from '../../data/observable';

@CSSType('SegmentedBarItem')
export abstract class SegmentedBarItemBase extends ViewBase implements SegmentedBarItemDefinition {
	private _title: string = '';

	get title(): string {
		return this._title;
	}
	set title(value: string) {
		let strValue = value !== null && value !== undefined ? value.toString() : '';
		if (this._title !== strValue) {
			this._title = strValue;
			this._update();
		}
	}

	public abstract _update();
}

@CSSType('SegmentedBar')
export abstract class SegmentedBarBase extends View implements SegmentedBarDefinition, AddChildFromBuilder, AddArrayFromBuilder {
	public static selectedIndexChangedEvent = 'selectedIndexChanged';

	public selectedIndex: number;
	public items: Array<SegmentedBarItemDefinition>;

	public get selectedBackgroundColor(): Color {
		return this.style.selectedBackgroundColor;
	}
	public set selectedBackgroundColor(value: Color) {
		this.style.selectedBackgroundColor = value;
	}

	public _addArrayFromBuilder(name: string, value: Array<any>): void {
		if (name === 'items') {
			this.items = value;
		}
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (name === 'SegmentedBarItem') {
			const item = <SegmentedBarItemBase>value;
			let items = this.items;
			if (!items) {
				items = new Array<SegmentedBarItemBase>();
				items.push(item);
				this.items = items;
			} else {
				items.push(item);
				this._addView(item);
			}

			if (this.nativeViewProtected) {
				this[itemsProperty.setNative](items);
			}
		}
	}

	public onItemsChanged(oldItems: SegmentedBarItemDefinition[], newItems: SegmentedBarItemDefinition[]): void {
		if (oldItems) {
			for (let i = 0, count = oldItems.length; i < count; i++) {
				this._removeView(oldItems[i]);
			}
		}

		if (newItems) {
			for (let i = 0, count = newItems.length; i < count; i++) {
				this._addView(newItems[i]);
			}
		}
	}

	// TODO: Make _addView to keep its children so this method is not needed!
	public eachChild(callback: (child: ViewBase) => boolean): void {
		const items = this.items;
		if (items) {
			items.forEach((item, i) => {
				callback(item);
			});
		}
	}
}

export interface SegmentedBarBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

SegmentedBarBase.prototype.recycleNativeView = 'auto';

/**
 * Gets or sets the selected index dependency property of the SegmentedBar.
 */
export const selectedIndexProperty = new CoercibleProperty<SegmentedBarBase, number>({
	name: 'selectedIndex',
	defaultValue: -1,
	valueChanged: (target, oldValue, newValue) => {
		target.notify(<SelectedIndexChangedEventData>{
			eventName: SegmentedBarBase.selectedIndexChangedEvent,
			object: target,
			oldIndex: oldValue,
			newIndex: newValue,
		});
	},
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

		return value;
	},
	valueConverter: (v) => parseInt(v),
});
selectedIndexProperty.register(SegmentedBarBase);

export const itemsProperty = new Property<SegmentedBarBase, SegmentedBarItemDefinition[]>({
	name: 'items',
	valueChanged: (target, oldValue, newValue) => {
		target.onItemsChanged(oldValue, newValue);
	},
});
itemsProperty.register(SegmentedBarBase);

export const selectedBackgroundColorProperty = new InheritedCssProperty<Style, Color>({
	name: 'selectedBackgroundColor',
	cssName: 'selected-background-color',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
selectedBackgroundColorProperty.register(Style);
