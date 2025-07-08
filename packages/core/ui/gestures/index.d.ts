import type { View } from '../core/view';
import { GestureEventData, GestureTypes } from './gestures-types';

export * from './gestures-common';
export * from './touch-manager';
export * from './gestures-types';

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
	 * Singular gesture type (e.g. GestureTypes.tap) attached to the observer.
	 * Does not support plural gesture types (e.g.
	 * GestureTypes.tap & GestureTypes.doubleTap).
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

class Pointer {
	android: any;
	ios: UITouch;

	get location();

	getX(): number;

	getY(): number;
}

export class TouchGestureEventData {
	eventName: string;
	type: GestureTypes;
	ios: any;
	action: string;
	view: View;
	android: android.view.MotionEvent;
	object: any;

	prepare(view: View, e: any): void;

	getPointerCount(): number;

	getActivePointers(): Array<Pointer>;

	getAllPointers(): Array<Pointer>;

	getX(): number;

	getY(): number;
}

/**
 * A short-hand function that is used to create a gesture observer for a view and gesture.
 * @param target - View which will be watched for originating a specific gesture.
 * @param type - Type of the gesture.
 * @param callback - A function that will be executed when a gesture is received.
 * @param context - this argument for the callback.
 */
export function observe(target: View, type: GestureTypes, callback: (args: GestureEventData) => void, context?: any): GesturesObserver;
