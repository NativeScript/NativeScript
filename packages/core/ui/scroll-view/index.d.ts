import { ContentView } from '../content-view';
import { Property } from '../core/properties';
import { View } from '../core/view';
import { EventData } from '../../data/observable';
import { CoreTypes } from '../../core-types';

/**
 * Represents a scrollable area that can have content that is larger than its bounds.
 *
 * @nsView ScrollView
 */
export class ScrollView extends ContentView {
	/**
	 * String value used when hooking to scroll event.
	 *
	 * @nsEvent {ScrollEventData} scroll
	 */
	public static scrollEvent: string;

	/**
	 * Gets or sets a value indicating whether scroll is enabled.
	 *
	 * @nsProperty
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
	 *
	 * @nsProperty
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
	 *
	 * @nsProperty
	 */
	orientation: CoreTypes.OrientationType;

	/**
	 * iOS-only. Maps to `UIScrollView.contentInsetAdjustmentBehavior`.
	 *
	 * - `never` (default): NativeScript subtracts safe-area insets manually.
	 * - `automatic` / `scrollableAxes` / `always`: iOS manages insets — recommended
	 *   with large titles to avoid scroll drift.
	 *
	 * @nsProperty
	 */
	iosContentInsetAdjustmentBehavior: 'never' | 'automatic' | 'scrollableAxes' | 'always';

	/**
	 * iOS 26+ only. The scroll edge effect UIKit draws where content scrolls
	 * under a bar, applied to every edge of the native scroll view.
	 *
	 * - `automatic` (default): UIKit chooses.
	 * - `soft`: content beneath the status bar (and any bar registered with
	 *   `addScrollEdgeContainer`) blurs and fades out.
	 * - `hard`: a flat edge instead of a blur.
	 * - `none`: no effect.
	 *
	 * Ignored before iOS 26 and on Android.
	 *
	 * @nsProperty
	 */
	iosScrollEdgeEffect: CoreTypes.ScrollEdgeEffectType;

	/**
	 * iOS 26+ only. Registers `view` as a bar this scroll view's content passes
	 * beneath: the scroll edge effect extends under the bar and follows it as
	 * it moves. A bar in another window (a keyboard accessory) works too.
	 * Either view may still be loading; registration completes once both
	 * native views exist. No-op elsewhere.
	 * @param view The bar.
	 * @param edge The edge of the scroll view the bar sits on.
	 */
	addScrollEdgeContainer(view: View, edge: CoreTypes.ScrollEdgeType): void;

	/**
	 * Unregisters a bar passed to `addScrollEdgeContainer`.
	 */
	removeScrollEdgeContainer(view: View): void;

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
	 * Raised when a scroll event occurs.
	 */
	on(eventName: 'scroll', callback: (data: ScrollEventData) => void, thisArg?: any): void;

	_onOrientationChanged(): void;
}

export interface ScrollEventData extends EventData {
	scrollX: number;
	scrollY: number;
}

export const orientationProperty: Property<ScrollView, CoreTypes.OrientationType>;
