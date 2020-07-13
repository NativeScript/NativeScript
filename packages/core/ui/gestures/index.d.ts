import { View } from '../core/view';
import { EventData } from '../../data/observable';

/**
 * Defines an enum with supported gesture types.
 */
export enum GestureTypes {
	/**
	 * Denotes tap (click) gesture.
	 */
	tap,
	/**
	 * Denotes double tap gesture.
	 */
	doubleTap,
	/**
	 * Denotes pinch gesture.
	 */
	pinch,
	/**
	 * Denotes pan gesture.
	 */
	pan,
	/**
	 * Denotes swipe gesture.
	 */
	swipe,
	/**
	 * Denotes rotation gesture.
	 */
	rotation,
	/**
	 * Denotes long press gesture.
	 */
	longPress,
	/**
	 * Denotes touch action.
	 */
	touch,
}

/**
 * Defines an enum with supported gesture states.
 */
export enum GestureStateTypes {
	/**
	 * Gesture canceled.
	 */
	cancelled,
	/**
	 * Gesture began.
	 */
	began,
	/**
	 * Gesture changed.
	 */
	changed,
	/**
	 * Gesture ended.
	 */
	ended,
}

/**
 * Defines an enum for swipe gesture direction.
 */
export enum SwipeDirection {
	/**
	 * Denotes right direction for swipe gesture.
	 */
	right,
	/**
	 * Denotes left direction for swipe gesture.
	 */
	left,
	/**
	 * Denotes up direction for swipe gesture.
	 */
	up,
	/**
	 * Denotes down direction for swipe gesture.
	 */
	down,
}

/**
 * Defines a touch action
 */
export module TouchAction {
	/**
	 * Down action.
	 */
	export const down: string;

	/**
	 * Up action.
	 */
	export const up: string;

	/**
	 * Move action.
	 */
	export const move: string;

	/**
	 * Cancel action.
	 */
	export const cancel: string;
}

/**
 * Provides gesture event data.
 */
export interface GestureEventData extends EventData {
	/**
	 * Gets the type of the gesture.
	 */
	type: GestureTypes;
	/**
	 * Gets the view which originates the gesture.
	 */
	view: View;
	/**
	 * Gets the underlying native iOS specific [UIGestureRecognizer](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIGestureRecognizer_Class/).
	 */
	ios: any /* UIGestureRecognizer */;
	/**
	 * Gets the underlying native android specific [gesture detector](http://developer.android.com/reference/android/view/GestureDetector.html).
	 */
	android: any;
}

/**
 * Provides gesture event data.
 */
export interface TapGestureEventData extends GestureEventData {
	/**
	 * Gets the number of pointers in the event.
	 */
	getPointerCount(): number;
	/**
	 * Gets the X coordinate of this event inside the view that triggered the event
	 */
	getX(): number;
	/**
	 * Gets the Y coordinate of the event inside the view that triggered the event.
	 */
	getY(): number;
}

/**
 * Provides gesture event data.
 */
export interface TouchGestureEventData extends TapGestureEventData {
	/**
	 * Gets action of the touch. Possible values: 'up', 'move', 'down', 'cancel'
	 */
	action: 'up' | 'move' | 'down' | 'cancel';
	/**
	 * Gets the pointers that triggered the event.
	 * Note: In Android there is aways only one active pointer.
	 */
	getActivePointers(): Array<Pointer>;

	/**
	 * Gets all pointers.
	 */
	getAllPointers(): Array<Pointer>;
}

/**
 * Pointer is an object representing a finger (or other object) that is touching the screen.
 */
export interface Pointer {
	/**
	 * The id of the pointer.
	 */
	android: any;

	/**
	 * The UITouch object associated to the touch
	 */
	ios: any;

	/**
	 * Gets the X coordinate of the pointer inside the view that triggered the event.
	 */
	getX(): number;

	/**
	 * Gets the Y coordinate of the pointer inside the view that triggered the event.
	 */
	getY(): number;

	/**
	 * Gests the X coordinate of the pointer inside the view that triggered the event.
	 * @returns The X coordinate in _Device Pixels_.
	 */
	getXPixels(): number;

	/**
	 * Gets the X coordinate of the pointer inside the view that triggered the event.
	 * @returns The X coordinate in _Device Independent Pixels_.
	 */
	getXDIP(): number;

	/**
	 * Gests the Y coordinate of the pointer inside the view that triggered the event.
	 * @returns The Y coordinate in _Device Pixels_.
	 */
	getYPixels(): number;

	/**
	 * Gets the Y coordinate of the pointer inside the view that triggered the event.
	 * @returns The Y coordinate in _Device Independent Pixels_.
	 */
	getYDIP(): number;
}

/**
 * Provides gesture event data.
 */
export interface GestureEventDataWithState extends GestureEventData {
	state: number;
}

/**
 * Provides gesture event data for pinch gesture.
 */
export interface PinchGestureEventData extends GestureEventDataWithState {
	scale: number;

	getFocusX(): number;
	getFocusY(): number;
}

/**
 * Provides gesture event data for swipe gesture.
 */
export interface SwipeGestureEventData extends GestureEventData {
	direction: SwipeDirection;
}

/**
 * Provides gesture event data for pan gesture.
 */
export interface PanGestureEventData extends GestureEventDataWithState {
	deltaX: number;
	deltaY: number;
}

/**
 * Provides gesture event data for rotation gesture.
 */
export interface RotationGestureEventData extends GestureEventDataWithState {
	rotation: number;
}

/**
 * Provides options for the GesturesObserver.
 */
export class GesturesObserver {
	/**
	 * Creates an instance of GesturesObserver class.
	 * @param target - The view for which the observer is created.
	 * @param callback - A function that will be executed when a gesture is received.
	 * @param context - default this argument for the callbacks.
	 */
	constructor(target: View, callback: (args: GestureEventData) => void, context: any);

	/**
	 * Registers a gesture observer to a view and gesture.
	 * @param type - Type of the gesture.
	 */
	observe(type: GestureTypes);

	/**
	 * Disconnects the gesture observer.
	 */
	disconnect();

	/**
	 * Gesture type attached to the observer.
	 */
	type: GestureTypes;

	/**
	 * A function that will be executed when a gesture is received.
	 */
	callback: (args: GestureEventData) => void;

	/**
	 * A context which will be used as `this` in callback execution.
	 */
	context: any;

	/**
	 * An internal Android specific method used to pass the motion event to the correct gesture observer.
	 */
	androidOnTouchEvent: (motionEvent: any /* android.view.MotionEvent */) => void;
}

/**
 * A short-hand function that is used to create a gesture observer for a view and gesture.
 * @param target - View which will be watched for originating a specific gesture.
 * @param type - Type of the gesture.
 * @param callback - A function that will be executed when a gesture is received.
 * @param context - this argument for the callback.
 */
export function observe(target: View, type: GestureTypes, callback: (args: GestureEventData) => void, context?: any): GesturesObserver;

/**
 * Returns a string representation of a gesture type.
 * @param type - Type of the gesture.
 * @param separator(optional) - Text separator between gesture type strings.
 */
export function toString(type: GestureTypes, separator?: string): string;

/**
 * Returns a gesture type enum value from a string (case insensitive).
 * @param type - A string representation of a gesture type (e.g. Tap).
 */
export function fromString(type: string): GestureTypes;
