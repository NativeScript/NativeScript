/**
 * Contains the WebView class, which represents a standard browser widget.
 */

import { View } from '../core/view';
import { Property } from '../core/properties';
import { EventData } from '../../data/observable';

/**
 * Represents the observable property backing the Url property of each WebView instance.
 */
export const urlProperty: Property<WebView, string>;

/**
 * Represents navigation type
 */
export type WebViewNavigationType = 'linkClicked' | 'formSubmitted' | 'backForward' | 'reload' | 'formResubmitted' | 'other' | undefined;

/**
 * Represents a standard WebView widget.
 */
export class WebView extends View {
	/**
	 * String value used when hooking to loadStarted event.
	 */
	public static loadStartedEvent: string;

	/**
	 * String value used when hooking to loadFinished event.
	 */
	public static loadFinishedEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/webkit/WebView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.webkit.WebView */;

	/**
	 * Gets the native [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* WKWebView */;

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
	 *  Disable scrolling in the WebView
	 */
	disableZoom: boolean;

	/**
	 * Enables inline media playback on iOS.
	 * By default, webview forces iPhone into fullscreen media playback.
	 */
	iosAllowInlineMediaPlayback: boolean;

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
	 * Reloads the current url.
	 */
	reload();

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on<T extends Observable = WebView>(eventNames: string, callback: (data: EventData<T>) => void, thisArg?: any): void;

	/**
	 * Raised when a loadFinished event occurs.
	 */
	on<T extends Observable = WebView>(event: 'loadFinished', callback: (args: LoadEventData<T>) => void, thisArg?: any): void;

	/**
	 * Raised when a loadStarted event occurs.
	 */
	on<T extends Observable = WebView>(event: 'loadStarted', callback: (args: LoadEventData<T>) => void, thisArg?: any): void;
}

/**
 * Event data containing information for the loading events of a WebView.
 */
export interface LoadEventData<T extends Observable = WebView> extends EventData<T> {
	/**
	 * Gets the url of the web-view.
	 */
	url: string;

	/**
	 * Gets the navigation type of the web-view.
	 */
	navigationType: NavigationType;

	/**
	 * Gets the error (if any).
	 */
	error: string;
}
