/**
 * Contains the ListView class, which represents a standard list view widget.
 */
declare module "ui/list-view" {
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");
    import view = require("ui/core/view");
    import color = require("color");

    /**
     * Known template names.
     */
    export module knownTemplates {
        /**
         * The ListView item template.
         */
        export var itemTemplate: string;
    }

    /**
     * Represents a view that shows items in a vertically scrolling list.
     */
    export class ListView extends view.View {
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
         * Represents the observable property backing the items property of each ListView instance.
         */
        public static itemsProperty: dependencyObservable.Property;

        /**
         * Represents the item template property of each ListView instance.
         */
        public static itemTemplateProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the isScrolling property of each ListView instance.
         */
        @Deprecated // in 2.1
        public static isScrollingProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the rowHeight property of each ListView instance.
         */
        public static rowHeightProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/ListView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.ListView */;

        /**
         * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableView_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UITableView */;

        /**
         * Gets a value indicating whether the ListView is currently scrolling.
         */
        @Deprecated // in 2.1
        isScrolling: boolean;

        /**
         * Gets or set the items collection of the ListView. 
         * The items property can be set to an array or an object defining length and getItem(index) method.
         */
        items: any;

        /**
         * Gets or set the item template of the ListView. 
         */
        itemTemplate: string | view.Template;

        /**
         * Gets or set the list of item templates for the item template selector 
         */
        itemTemplates: string | Array<view.KeyedTemplate>;

        /**
         * A function that returns the appropriate ket template based on the data item.
         */

        itemTemplateSelector: string | ((index: number, item: any) => string);
        /**
         * Gets or set the items separator line color of the ListView. 
         */
        separatorColor: color.Color;

        /**
         * Gets or set row height of the ListView.
         */
        rowHeight: number;

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
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void, thisArg?: any);

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
        on(event: "loadMoreItems", callback: (args: observable.EventData) => void, thisArg?: any);
    }

    /**
     * Event data containing information for the index and the view associated to a list view item.
     */
    export interface ItemEventData extends observable.EventData {
        /**
         * The index of the item, for which the event is raised.
         */
        index: number;

        /**
         * The view that is associated to the item, for which the event is raised.
         */
        view: view.View;

        /**
         * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableViewCell_Class/) that represents the user interface where the view is hosted. Valid only when running on iOS.
         */
        ios: any /* UITableViewCell */;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/view/ViewGroup.html) that represents the user interface where the view is hosted. Valid only when running on Android OS.
         */
        android: any /* android.view.ViewGroup */;
    }
}
