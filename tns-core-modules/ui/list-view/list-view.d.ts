/**
 * Contains the ListView class, which represents a standard list view widget.
 * @module "ui/list-view"
 */ /** */

import { EventData, View, Template, KeyedTemplate, Length, Property, CssProperty, Color, Style } from "../core/view";

/**
 * Known template names.
 */
export module knownTemplates {
    /**
     * The ListView item template.
     */
    export const itemTemplate: string;
}

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
    rowHeight: Length;

    /**
     * Gets or set the estimated height of rows in the ListView.
     * The default value is 44px.
     */
    iosEstimatedRowHeight: Length;

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
     * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
     * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
     * @param callback - Callback function which will be executed when event is raised.
     * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
     */
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

    /**
     * Raised when a View for the data at the specified index should be created.
     * The result should be returned trough the view property of the event data.
     * Note, that the view property of the event data can be pre-initialized with
     * an old instance of a view, so that it can be reused.
     */
    on(event: "itemLoading", callback: (args: ItemEventData) => void, thisArg?: any);

    /**
     * Raised when an item inside the ListView is tapped.
     */
    on(event: "itemTap", callback: (args: ItemEventData) => void, thisArg?: any);

    /**
     * Raised when the ListView is scrolled so that its last item is visible.
     */
    on(event: "loadMoreItems", callback: (args: EventData) => void, thisArg?: any);
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
    on(event: "itemLoading", callback: (args: ItemEventData) => void, thisArg?: any);
    off(event: "itemLoading", callback: (args: EventData) => void, thisArg?: any);
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
export const rowHeightProperty: Property<ListView, Length>;

/**
 * Represents the observable property backing the iosEstimatedRowHeight property of each ListView instance.
 */
export const iosEstimatedRowHeightProperty: Property<ListView, Length>;

/**
 * Backing property for separator color property.
 */
export const separatorColorProperty: CssProperty<Style, Color>;
