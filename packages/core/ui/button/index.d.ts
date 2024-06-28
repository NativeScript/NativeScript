import { TextBase } from '../text-base';
import { EventData } from '../../data/observable';

/**
 * Represents a standard Button widget.
 */
export class Button extends TextBase {
	/**
	 * String value used when hooking to tap event.
	 */
	public static tapEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/Button.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.Button */;

	/**
	 * Gets the native [UIButton](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIButton_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIButton */;

	/**
	 * Gets or sets whether the Button wraps text or not.
	 */
	textWrap: boolean;

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
	 * Raised when a tap event occurs.
	 */
	on(event: 'tap', callback: (args: EventData) => void, thisArg?: any): void;
}
