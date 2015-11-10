/**
 * Contains the ScrollView class, which represents a scrollable area that can have content that is larger than its bounds.
 */
declare module "ui/scroll-view" {
    import contentView = require("ui/content-view");
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");

    export var orientationProperty: dependencyObservable.Property;

    /**
     * Represents a scrollable area that can have content that is larger than its bounds.
     */
    class ScrollView extends contentView.ContentView {
        public static orientationProperty: dependencyObservable.Property;

        /**
         * String value used when hooking to scroll event.
         */
        public static scrollEvent: string;

        /**
         * Gets a value that contains the vertical offset of the scrolled content.
         */
        verticalOffset: number;

        /**
         * Gets a value that contains the horizontal offset of the scrolled content.
         */
        horizontalOffset: number;

        /**
         * Gets the maximum value for the verticalOffset.
         */
        scrollableHeight: number;
        
        /**
         * Gets the maximum value for the horizontalOffset.
         */        
        scrollableWidth: number;

        /**
         * Scrolls the content the specified vertical offset position.
         * @param value The offset value
         * @param animated true for animated scroll, false for immediate scroll.
         */
        scrollToVerticalOffset(value: number, animated: boolean);
        
        /**
         * Scrolls the content the specified horizontal offset position.
         * @param value The offset value
         * @param animated true for animated scroll, false for immediate scroll.
         */
        scrollToHorizontalOffset(value: number, animated: boolean);

        /**
         * Gets or sets direction in which the content can be scrolled.
         */
        orientation: string;

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when a scroll event occurs.
         */
        on(event: "scroll", callback: (args: ScrollEventData) => void, thisArg?: any);
    }

    interface ScrollEventData extends observable.EventData {
        scrollX: number;
        scrollY: number;
    }
}