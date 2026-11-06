export * from './gestures-common';
export * from './gestures-types';
export * from './touch-manager';

import { GesturesObserverBase, GestureTypes } from './gestures-common';
import type { View } from '../core/view';

export function isHovered(_view: View): boolean {
	return false;
}

// TODO(linux): GtkGesture based recognizers.
export class GesturesObserver extends GesturesObserverBase {
	public observe(_type: GestureTypes) {}

	public androidOnTouchEvent(_motionEvent: any): void {}
}

export function observe(target: View, type: GestureTypes, callback: (args: any) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);
	return observer;
}
