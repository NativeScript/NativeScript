import { View, AddChildFromBuilder, AddArrayFromBuilder } from '../core/view';
import { ViewBase } from '../core/view-base';
import { Property, CoercibleProperty, CssProperty } from '../core/properties';
import { EventData } from '../../data/observable';
import { Color } from '../../color';
import { Style } from '../styling/style';

/**
 * Represents a SegmentedBar item.
 */
export class SegmentedBarItem extends ViewBase {
	/**
	 * Gets or sets the title of the SegmentedBarItem.
	 */
	public title: string;
}

/**
 * Defines the data for the SegmentedBar.selectedIndexChanged event.
 */
export interface SelectedIndexChangedEventData extends EventData {
	/**
	 * The old selected index.
	 */
	oldIndex: number;

	/**
	 * The new selected index.
	 */
	newIndex: number;
}

/**
 * Represents a UI SegmentedBar component.
 */
export class SegmentedBar extends View implements AddChildFromBuilder, AddArrayFromBuilder {
	/**
	 * Gets or sets the selected index of the SegmentedBar component.
	 */
	selectedIndex: number;

	/**
	 * Gets or sets the selected background color of the SegmentedBar component.
	 */
	selectedBackgroundColor: Color;

	/**
	 * Gets or sets the selected text color of the SegmentedBar component.
	 */
	selectedTextColor: Color;

	/**
	 * Gets or sets the items of the SegmentedBar.
	 */
	items: Array<SegmentedBarItem>;

	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * Adds a listener for the specified event name.
	 *
	 * @param eventName The name of the event.
	 * @param callback The event listener to add. Will be called when an event of
	 * the given name is raised.
	 * @param thisArg An optional parameter which, when set, will be bound as the
	 * `this` context when the callback is called. Falsy values will be not be
	 * bound.
	 */
	on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any): void;

	/**
	 * Called for every child element declared in xml.
	 * @param name - Name of the element.
	 * @param value - Value of the element.
	 */
	public _addChildFromBuilder(name: string, value: any): void;
	public _addArrayFromBuilder(name: string, value: Array<any>): void;
}

/**
 * Gets or sets the selected index dependency property of the SegmentedBar.
 */
export const selectedIndexProperty: CoercibleProperty<SegmentedBar, number>;

/**
 * Gets or sets the selected background color property of the SegmentedBar.
 */
export const selectedBackgroundColorProperty: CssProperty<Style, Color>;

/**
 * Gets or sets the items dependency property of the SegmentedBar.
 */
export const itemsProperty: Property<SegmentedBar, SegmentedBarItem[]>;

/**
 * Gets or sets the selected text color property of the SegmentedBar.
 */
export const selectedTextColorProperty: CssProperty<Style, Color>;
