import { View } from '../core/view';
import { Property } from '../core/properties';
import { EventData } from '../../data/observable';
import { Color } from '../../color';

/**
 * Represents a search bar component.
 */
export class SearchBar extends View {
	/**
	 * String value used when hooking to submit event.
	 */
	public static submitEvent: string;

	/**
	 * String value used when hooking to clear event.
	 */
	public static clearEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/SearchView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.SearchView */;

	/**
	 * Gets the native iOS [UISearchBar](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISearchBar_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UISearchBar */;

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
	textFieldBackgroundColor: Color;

	/**
	 * Gets or sets the TextField Hint color of the SearchBar component.
	 */
	textFieldHintColor: Color;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a search bar search is submitted.
	 */
	on(event: 'submit', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when a search bar search is closed.
	 */
	on(event: 'close', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Hides the soft input method, usually a soft keyboard.
	 */
	dismissSoftInput(): void;
}

/**
 * Dependency property used to support binding operations related to search-bar text.
 */
export const textProperty: Property<SearchBar, string>;
export const hintProperty: Property<SearchBar, string>;

/**
 * Gets or sets the TextField background color of the SearchBar component.
 */
export const textFieldBackgroundColorProperty: Property<SearchBar, Color>;

export const textFieldHintColorProperty: Property<SearchBar, Color>;
