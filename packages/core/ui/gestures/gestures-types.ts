// Shared types/interfaces for gestures
import type { View } from '../core/view';
import type { EventData, Observable } from '../../data/observable';

export interface GesturesObserverDefinition {
	/**
	 * Registers a gesture observer to a view and gesture.
	 * @param type - Type of the gesture.
	 */
	observe(type: any): void;

	/**
	 * Disconnects the gesture observer.
	 */
	disconnect(): void;

	/**
	 * Singular gesture type (e.g. GestureTypes.tap) attached to the observer.
	 * Does not support plural gesture types (e.g.
	 * GestureTypes.tap & GestureTypes.doubleTap).
	 */
	type: any;

	/**
	 * A function that will be executed when a gesture is received.
	 */
	callback: (args: any) => void;

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
 * Events emitted during gesture lifecycle
 */
export enum GestureEvents {
	/**
	 * When the gesture is attached to the view
	 * Provides access to the native gesture recognizer for further customization
	 *
	 * @nsEvent {GestureEventData} gestureAttached
	 */
	gestureAttached = 'gestureAttached',
	/**
	 * When a touch down was detected
	 *
	 * @nsEvent touchDown
	 */
	touchDown = 'touchDown',
	/**
	 * When a touch up was detected
	 *
	 * @nsEvent touchUp
	 */
	touchUp = 'touchUp',
}

/**
 * Defines an enum with supported gesture types.
 */
export enum GestureTypes {
	/**
	 * Denotes tap (click) gesture.
	 *
	 * @nsEvent {TapGestureEventData} tap
	 */
	tap = 1 << 0,
	/**
	 * Denotes double tap gesture.
	 *
	 * @nsEvent {TapGestureEventData} doubleTap
	 */
	doubleTap = 1 << 1,
	/**
	 * Denotes pinch gesture.
	 *
	 * @nsEvent {PinchGestureEventData} pinch
	 */
	pinch = 1 << 2,
	/**
	 * Denotes pan gesture.
	 *
	 * @nsEvent {PanGestureEventData} pan
	 */
	pan = 1 << 3,
	/**
	 * Denotes swipe gesture.
	 *
	 * @nsEvent {SwipeGestureEventData} swipe
	 */
	swipe = 1 << 4,
	/**
	 * Denotes rotation gesture.
	 *
	 * @nsEvent {RotationGestureEventData} rotate
	 */
	rotation = 1 << 5,
	/**
	 * Denotes long press gesture.
	 *
	 * @nsEvent {GestureEventDataWithState} longPress
	 */
	longPress = 1 << 6,
	/**
	 * Denotes touch action.
	 *
	 * @nsEvent {TouchGestureEventData} touch
	 */
	touch = 1 << 7,
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
	right = 1 << 0,
	/**
	 * Denotes left direction for swipe gesture.
	 */
	left = 1 << 1,
	/**
	 * Denotes up direction for swipe gesture.
	 */
	up = 1 << 2,
	/**
	 * Denotes down direction for swipe gesture.
	 */
	down = 1 << 3,
}

/**
 * Defines a touch action
 */
export enum TouchAction {
	/**
	 * Down action.
	 */
	down = 'down',

	/**
	 * Up action.
	 */
	up = 'up',

	/**
	 * Move action.
	 */
	move = 'move',

	/**
	 * Cancel action.
	 */
	cancel = 'cancel',
}

/**
 * Provides gesture event data.
 */
export interface GestureEventData<T = Observable> extends EventData<T> {
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