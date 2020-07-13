import { ContentView } from '../content-view';
import { Property } from '../core/properties';
import { EventData } from '../../data/observable';

/**
 * Represents a scrollable area that can have content that is larger than its bounds.
 */
export class ScrollView extends ContentView {
	/**
	 * String value used when hooking to scroll event.
	 */
	public static scrollEvent: string;

	/**
	 * Gets or sets a value indicating whether scroll is enabled.
	 */
	isScrollEnabled: boolean;

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
	 * Toggles scrollbar indicator visibility
	 */
	scrollBarIndicatorVisible: boolean;

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
	orientation: Orientation;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when a scroll event occurs.
	 */
	on(event: 'scroll', callback: (args: ScrollEventData) => void, thisArg?: any): void;

	_onOrientationChanged(): void;
}

export interface ScrollEventData extends EventData {
	scrollX: number;
	scrollY: number;
}

export type Orientation = 'horizontal' | 'vertical';

export const orientationProperty: Property<ScrollView, Orientation>;
