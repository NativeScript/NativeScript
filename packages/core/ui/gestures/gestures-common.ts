import { GestureEventData, GesturesObserver as GesturesObserverDefinition } from '.';
import { View } from '../core/view';

export * from './touch-manager';

export enum GestureEvents {
	gestureAttached = 'gestureAttached',
	touchDown = 'touchDown',
	touchUp = 'touchUp',
}

export enum GestureTypes {
	tap = 1 << 0,
	doubleTap = 1 << 1,
	pinch = 1 << 2,
	pan = 1 << 3,
	swipe = 1 << 4,
	rotation = 1 << 5,
	longPress = 1 << 6,
	touch = 1 << 7,
}

export enum GestureStateTypes {
	cancelled,
	began,
	changed,
	ended,
}

export enum SwipeDirection {
	right = 1 << 0,
	left = 1 << 1,
	up = 1 << 2,
	down = 1 << 3,
}

export namespace TouchAction {
	export const down = 'down';
	export const up = 'up';
	export const move = 'move';
	export const cancel = 'cancel';
}

export function toString(type: GestureTypes, separator?: string): string {
	const types = new Array<string>();

	if (type & GestureTypes.tap) {
		types.push('tap');
	}

	if (type & GestureTypes.doubleTap) {
		types.push('doubleTap');
	}

	if (type & GestureTypes.pinch) {
		types.push('pinch');
	}

	if (type & GestureTypes.pan) {
		types.push('pan');
	}

	if (type & GestureTypes.swipe) {
		types.push('swipe');
	}

	if (type & GestureTypes.rotation) {
		types.push('rotation');
	}

	if (type & GestureTypes.longPress) {
		types.push('longPress');
	}

	if (type & GestureTypes.touch) {
		types.push('touch');
	}

	return types.join(separator);
}

// NOTE: toString could return the text of multiple GestureTypes.
// Souldn't fromString do split on separator and return multiple GestureTypes?
export function fromString(type: string): GestureTypes {
	const t = type.trim().toLowerCase();

	if (t === 'tap') {
		return GestureTypes.tap;
	} else if (t === 'doubletap') {
		return GestureTypes.doubleTap;
	} else if (t === 'pinch') {
		return GestureTypes.pinch;
	} else if (t === 'pan') {
		return GestureTypes.pan;
	} else if (t === 'swipe') {
		return GestureTypes.swipe;
	} else if (t === 'rotation') {
		return GestureTypes.rotation;
	} else if (t === 'longpress') {
		return GestureTypes.longPress;
	} else if (t === 'touch') {
		return GestureTypes.touch;
	}

	return undefined;
}

export abstract class GesturesObserverBase implements GesturesObserverDefinition {
	private _target: View;

	public type: GestureTypes;

	public get target(): View {
		return this._target;
	}

	public abstract callback(data: GestureEventData);

	constructor(target: View) {
		this._target = target;
	}

	public abstract androidOnTouchEvent(motionEvent: android.view.MotionEvent);
	public abstract observe(type: GestureTypes);

	public disconnect() {
		// remove gesture observer from map
		if (this.target) {
			const list = this.target.getGestureObservers(this.type);
			if (list && list.length > 0) {
				this.target._gestureObservers[this.type] = undefined;
				delete this.target._gestureObservers[this.type];
			}
		}
		this._target = null;
	}
}
