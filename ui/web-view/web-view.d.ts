/**
 * Contains the WebView class, which represents a standard browser widget.
 */
declare module "ui/web-view" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import observable = require("data/observable");

    /**
     * Represents a standard WebView widget.
     */
    export class WebView extends view.View {
        /**
         * String value used when hooking to loadStarted event.
         */
        public static loadStartedEvent: string;

        /**
         * String value used when hooking to loadFinished event.
         */
        public static loadFinishedEvent: string;

        /**
         * Represents the observable property backing the Url property of each WebView instance.
         */
        public static urlProperty: dependencyObservable.Property;

        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/webkit/WebView.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: android.webkit.WebView;

        /**
         * Gets the native [UIWebView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIWebView_Class/) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: UIWebView;

        /**
         * [Obsolete. Please use src instead!] Gets or sets the url displayed by this instance.
         */
        url: string;

        /**
         * Gets or sets the url, local file path or HTML string.
         */
        src: string;

        /**
         * Gets a value indicating whether the WebView can navigate back.
         */
        canGoBack: boolean;

        /**
         * Gets a value indicating whether the WebView can navigate forward.
         */
        canGoForward: boolean;

        /**
         * Stops loading the current content (if any).
         */
        stopLoading(): void;

        /**
         * Navigates back.
         */
        goBack();

        /**
         * Navigates forward.
         */
        goForward();

        /**
         * Reload the current url.
         */
        reload();

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when a loadFinished event occurs.
         */
        on(event: "loadFinished", callback: (args: LoadEventData) => void, thisArg?: any);

        /**
         * Raised when a loadStarted event occurs.
         */
        on(event: "loadStarted", callback: (args: LoadEventData) => void, thisArg?: any);
    }

    /**
     * Event data containing information for the loading events of a WebView.
     */
    export interface LoadEventData extends observable.EventData {
        /**
         * Gets the url of the web-view.
         */
        url: string;
        /**
         * Gets the error (if any). 
         */
        error: string;
    }
}