﻿import { View } from '../core/view';
import { Property } from '../core/properties';
import { EventData } from '../../data/observable';
import { Color } from '../../color';

/**
 * Represents a search bar component.
 *
 * @nsView SearchBar
 */
export class SearchBar extends View {
	/**
	 * String value used when hooking to submit event.
	 *
	 * @nsEvent {EventData} submit
	 */
	public static submitEvent: string;

	/**
	 * String value used when hooking to clear event.
	 *
	 * @nsEvent {EventData} submit
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
	 *
	 * @nsProperty
	 */
	text: string;

	/**
	 * Gets or sets the text of the search bar text field hint/placeholder.
	 *
	 * @nsProperty
	 */
	hint: string;

	/**
	 * Gets or sets the TextField background color of the SearchBar component.
	 *
	 * @nsProperty
	 */
	textFieldBackgroundColor: Color;

	/**
	 * Gets or sets the TextField Hint color of the SearchBar component.
	 *
	 * @nsProperty
	 */
	textFieldHintColor: Color;

	/**
	 * Adds a listener for the specified event name.
	 *
	 * @param eventName The name of the event.
	 * @param callback The event listener to add. Will be called when an event of
	 * the given name is raised.
	 * @param thisArg An optional parameter which, when set, will be bound as the
	 * `this` context when the callback is called. Falsy values will be not be
	 * bound.
	 */
	on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when a search bar search is submitted.
	 */
	on(event: 'submit', callback: (args: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when a search bar search is closed.
	 */
	on(event: 'close', callback: (args: EventData) => void, thisArg?: any): void;

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
