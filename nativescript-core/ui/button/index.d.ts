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
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a tap event occurs.
	 */
	on(event: 'tap', callback: (args: EventData) => void, thisArg?: any);
}
