import { View, Template, KeyedTemplate } from '../core/view';
import { Color } from '../../color';
import { CoreTypes } from '../../core-types';
import { EventData } from '../../data/observable';
import { Length } from '../styling/style-properties';
import { Style } from '../styling/style';
import { Property, CssProperty } from '../core/properties';

/**
 * Represents a view that shows items in a vertically scrolling list.
 */
export class ListView extends View {
	/**
	 * String value used when hooking to itemLoading event.
	 */
	public static itemLoadingEvent: string;
	/**
	 * String value used when hooking to itemTap event.
	 */
	public static itemTapEvent: string;
	/**
	 * String value used when hooking to loadMoreItems event.
	 */
	public static loadMoreItemsEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ListView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ListView */;

	/**
	 * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITableView */;

	/**
	 * Gets or set the items collection of the ListView.
	 * The items property can be set to an array or an object defining length and getItem(index) method.
	 */
	items: any[] | ItemsSource;

	/**
	 * Gets or set the item template of the ListView.
	 */
	itemTemplate: string | Template;

	/**
	 * Gets or set the list of item templates for the item template selector
	 */
	itemTemplates: string | Array<KeyedTemplate>;

	/**
	 * A function that returns the appropriate ket template based on the data item.
	 */
	itemTemplateSelector: string | ((item: any, index: number, items: any) => string);

	/**
	 * Item id generator
	 */
	itemIdGenerator: (item: any, index: number, items: any) => number;

	/**
	 * Gets or set the items separator line color of the ListView.
	 */
	separatorColor: Color;

	/**
	 * Gets or set row height of the ListView.
	 */
	rowHeight: CoreTypes.LengthType;

	/**
	 * Gets or set the estimated height of rows in the ListView.
	 * The default value is 44px.
	 */
	iosEstimatedRowHeight: CoreTypes.LengthType;

	/**
	 * Forces the ListView to reload all its items.
	 */
	refresh();

	/**
	 * Scrolls the specified item with index into view.
	 * [iOS](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UITableView_Class/#//apple_ref/occ/instm/UITableView/scrollToRowAtIndexPath:atScrollPosition:animated:)
	 * [Android](http://developer.android.com/reference/android/widget/ListView.html#setSelection(int))
	 * @param index - Item index.
	 */
	scrollToIndex(index: number);

	/**
	 * Scrolls the specified item with index into view with animation.
	 * [iOS](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UITableView_Class/#//apple_ref/occ/instm/UITableView/scrollToRowAtIndexPath:atScrollPosition:animated:)
	 * [Android](https://developer.android.com/reference/android/widget/ListView.html#smoothScrollToPosition(int))
	 * @param index - Item index.
	 */
	scrollToIndexAnimated(index: number);

	/**
	 * Checks if Specified item with index is visible.
	 * @param index - Item index.
	 */
	isItemAtIndexVisible(index: number): boolean;

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
	 * Raised when a View for the data at the specified index should be created.
	 * The result should be returned trough the view property of the event data.
	 * Note, that the view property of the event data can be pre-initialized with
	 * an old instance of a view, so that it can be reused.
	 */
	on(event: 'itemLoading', callback: (args: ItemEventData) => void, thisArg?: any): void;

	/**
	 * Raised when an item inside the ListView is tapped.
	 */
	on(event: 'itemTap', callback: (args: ItemEventData) => void, thisArg?: any): void;

	/**
	 * Raised when the ListView is scrolled so that its last item is visible.
	 */
	on(event: 'loadMoreItems', callback: (args: EventData) => void, thisArg?: any): void;
}

/**
 * Event data containing information for the index and the view associated to a list view item.
 */
export interface ItemEventData extends EventData {
	/**
	 * The index of the item, for which the event is raised.
	 */
	index: number;

	/**
	 * The view that is associated to the item, for which the event is raised.
	 */
	view: View;

	/**
	 * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableViewCell_Class/) that represents the user interface where the view is hosted. Valid only when running on iOS.
	 */
	ios: any /* UITableViewCell */;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/view/ViewGroup.html) that represents the user interface where the view is hosted. Valid only when running on Android OS.
	 */
	android: any /* android.view.ViewGroup */;
}

export interface ItemsSource {
	length: number;
	getItem(index: number): any;
}

export interface TemplatedItemsView {
	items: any[] | ItemsSource;
	itemTemplate: string | Template;
	itemTemplates?: string | Array<KeyedTemplate>;
	refresh(): void;
	on(event: 'itemLoading', callback: (args: ItemEventData) => void, thisArg?: any): void;
	off(event: 'itemLoading', callback: (args: EventData) => void, thisArg?: any): void;
}

/**
 * Represents the property backing the items property of each ListView instance.
 */
export const itemsProperty: Property<ListView, any[] | ItemsSource>;

/**
 * Represents the item template property of each ListView instance.
 */
export const itemTemplateProperty: Property<ListView, string | Template>;

/**
 * Represents the items template property of each ListView instance.
 */
export const itemTemplatesProperty: Property<ListView, string | Array<KeyedTemplate>>;

/**
 * Represents the separator color backing property.
 */
export const separatorColor: Property<ListView, Color>;

/**
 * Represents the observable property backing the rowHeight property of each ListView instance.
 */
export const rowHeightProperty: Property<ListView, CoreTypes.LengthType>;

/**
 * Represents the observable property backing the iosEstimatedRowHeight property of each ListView instance.
 */
export const iosEstimatedRowHeightProperty: Property<ListView, CoreTypes.LengthType>;

/**
 * Backing property for separator color property.
 */
export const separatorColorProperty: CssProperty<Style, Color>;
