/**
 * Contains the RefreshableListView class, which represents a standard refreshable list view widget.
 */
declare module "ui/refreshable-list-view" {
    import observable = require("data/observable");
    import parent = require("ui/list-view");
    /**
     * Represents a view that shows items in a vertically refreshable scrolling list.
     */
    export class RefreshableListView extends parent.ListView {
        /**
         * String value used when hooking to refresh event.
         */
        public static refreshEvent: string;
        /**
         * Get the wrapped object of native Android ListView and SwipeRefreshLayout. Valid only when running on Android OS.
         */
        android: AndroidListView;
    }
    /**
     * Represents a wrapped object of native Android ListView and SwipeRefreshLayout
     */
    export interface AndroidListView {
        /**
         * Native [android widget](http://developer.android.com/reference/android/support/v4/widget/SwipeRefreshLayout.html).
         */
        RefreshLayout: android.support.v4.widget.SwipeRefreshLayout;
        /**
         * Native [android widget](http://developer.android.com/reference/android/widget/ListView.html).
         */
        ListView: android.widget.ListView;
    }
    /**
     * Event data containing information for "refresh" with done callback
     */
    export interface RefreshEventData extends observable.EventData {
        /**
         * Callback when refresh is done to hide the loading icon
         */
        done: () => void;
    }
}
