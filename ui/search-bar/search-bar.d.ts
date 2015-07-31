/**
 * Contains the SearchBar class, which represents a standard search bar component.
 */
declare module "ui/search-bar" {
    import view = require("ui/core/view");
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");
    import color = require("color");
    import native_api = require("native-api");

    /**
     * Represents a search bar component.
     */
    export class SearchBar extends view.View {
        /**
         * String value used when hooking to submit event.
         */
        public static submitEvent: string;

        /**
         * String value used when hooking to clear event.
         */
        public static clearEvent: string;

        /**
         * Dependency property used to support binding operations related to search-bar text.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Gets or sets the TextField background color of the SearchBar component.
         */
        public static textFieldBackgroundColorProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/SearchView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: native_api.android.widget.SearchView;

        /**
         * Gets the native iOS [UISearchBar](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISearchBar_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: native_api.UISearchBar;

        /**
         * Gets or sets a search bar text.
         */
        text: string;

        /**
         * Gets or sets the text of the search bar text field hint/placeholder.
         */
        hint: string;

        /**
         * Gets or sets the TextField background color of the SearchBar component.
         */
        textFieldBackgroundColor: color.Color;

        /**
         * Gets or sets the TextField Hint color of the SearchBar component.
         */
        textFieldHintColor: color.Color;
				
        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when a search bar search is submitted.
         */
        on(event: "submit", callback: (args: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when a search bar search is closed.
         */
        on(event: "close", callback: (args: observable.EventData) => void, thisArg?: any);
    }
}
