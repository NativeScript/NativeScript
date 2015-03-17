/**
 * Contains the SearchBar class, which represents a standard search bar component.
 */
declare module "ui/search-bar" {
    import view = require("ui/core/view");
    import observable = require("data/observable");
    import dependencyObservable = require("ui/core/dependency-observable");
    import color = require("color");

    /**
     * Known event names.
     */
    module knownEvents {
        /**
         * Raised when search request has been submitted.
         */
        export var submit: string;

        /**
         * Raised when search critea has been cleared.
         */
        export var clear: string;
    }

    /**
     * Represents a search bar component.
     */
    export class SearchBar extends view.View {
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
        android: android.widget.SearchView;

        /**
         * Gets the native iOS [UISearchBar](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISearchBar_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UISearchBar;

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

        on(event: string, callback: (data: observable.EventData) => void);

        /**
         * Raised when a search bar search is submitted.
         */
        on(event: "submit", callback: (args: observable.EventData) => void);

        /**
         * Raised when a search bar search is closed.
         */
        on(event: "close", callback: (args: observable.EventData) => void);
    }
}