/**
 * Contains the ListView class, which represents a standard list view widget.
 */
declare module "ui/list-view" {
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");
    import view = require("ui/core/view");

    /**
     * Known event names.
     */
    export module knownEvents {
        /**
         * The name of event raised when item is loading inside the ListView.
         */
        export var itemLoading: string;

        /**
         * The name of event raised when ListView item is tapped.
         */
        export var itemTap: string;

        /**
         * The name of event raised when the ListView is scrolled so that its last item is visible.
         */
        export var loadMoreItems: string;
    }

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
        public static isScrollingProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/ListView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.widget.ListView;

        /**
         * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableView_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UITableView;

        /**
         * Gets a value indicating whether the ListView is currently scrolling.
         */
        isScrolling: boolean;

        /**
         * Gets or set the items collection of the ListView. 
         * The items property can be set to an array or an object defining length and getItem(index) method.
         */
        items: any;

        /**
         * Gets or set the item template of the ListView. 
         */
        itemTemplate: string;

        /**
         * Forces the ListView to reload all its items.
         */
        refresh();

        on(event: string, callback: (data: observable.EventData) => void);

        /**
         * Raised when a View for the data at the specified index should be created. 
         * The result should be returned trough the view property of the event data.
         * Note, that the view property of the event data can be pre-initialized with 
         * an old instance of a view, so that it can be reused. 
         */
        on(event: "itemLoading", callback: (args: ItemEventData) => void);

        /**
         * Raised when an item inside the ListView is tapped.
         */
        on(event: "itemTap", callback: (args: ItemEventData) => void);

        /**
         * Raised when the ListView is scrolled so that its last item is visible.
         */
        on(event: "loadMoreItems", callback: (args: observable.EventData) => void);
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
    }
}
