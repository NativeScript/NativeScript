import type { GesturesObserverDefinition, GestureEvents, GestureStateTypes, SwipeDirection, TouchAction, GestureEventData, TapGestureEventData, TouchGestureEventData, Pointer, GestureEventDataWithState, PinchGestureEventData, SwipeGestureEventData, PanGestureEventData, RotationGestureEventData } from './gestures-types';
import { GestureTypes } from './gestures-types';
import type { View } from '../core/view';
export { GesturesObserverBase as GesturesObserver };

/**
 * Returns a string representation of a gesture type.
 * @param type - The singular type of the gesture. Looks for an exact match, so
 *   passing plural types like `GestureTypes.tap & GestureTypes.doubleTap` will
 *   simply return undefined.
 */
export function toString(type: GestureTypes): (typeof GestureTypes)[GestureTypes] | undefined {
	switch (type) {
		case GestureTypes.tap:
			return GestureTypes[GestureTypes.tap];

		case GestureTypes.doubleTap:
			return GestureTypes[GestureTypes.doubleTap];

		case GestureTypes.pinch:
			return GestureTypes[GestureTypes.pinch];

		case GestureTypes.pan:
			return GestureTypes[GestureTypes.pan];

		case GestureTypes.swipe:
			return GestureTypes[GestureTypes.swipe];

		case GestureTypes.rotation:
			return GestureTypes[GestureTypes.rotation];

		case GestureTypes.longPress:
			return GestureTypes[GestureTypes.longPress];

		case GestureTypes.touch:
			return GestureTypes[GestureTypes.touch];
	}
}

/**
 * Returns a gesture type enum value from a string (case insensitive).
 *
 * @param type - A string representation of a single gesture type (e.g. "tap").
 */
export function fromString(type: (typeof GestureTypes)[GestureTypes]): GestureTypes | undefined {
	const t = type.trim().toLowerCase();

	switch (t) {
		case 'tap':
			return GestureTypes.tap;
		case 'doubletap':
			return GestureTypes.doubleTap;
		case 'pinch':
			return GestureTypes.pinch;
		case 'pan':
			return GestureTypes.pan;
		case 'swipe':
			return GestureTypes.swipe;
		case 'rotation':
			return GestureTypes.rotation;
		case 'longpress':
			return GestureTypes.longPress;
		case 'touch':
			return GestureTypes.touch;
	}

	return undefined;
}

export abstract class GesturesObserverBase implements GesturesObserverDefinition {
	private _callback: (args: GestureEventData) => void;
	private _target: View;
	private _context?: any;

	/** This is populated on the first call to observe(). */
	type: GestureTypes;

	public get callback(): (args: GestureEventData) => void {
		return this._callback;
	}

	public get target(): View {
		return this._target;
	}

	public get context() {
		return this._context;
	}

	constructor(target: View, callback: (args: GestureEventData) => void, context?: any) {
		this._target = target;
		this._callback = callback;
		this._context = context;
	}

	public abstract androidOnTouchEvent(motionEvent: android.view.MotionEvent);
	public abstract observe(type: GestureTypes);

	public disconnect() {
		this._target = null;
		this._callback = null;
		this._context = null;
	}
}

export { TouchAction, GestureStateTypes, GestureTypes, SwipeDirection, GestureEvents } from './gestures-types';