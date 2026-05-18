export * from './gestures-common';
export * from './gestures-types';
export * from './touch-manager';

import { GesturesObserverBase, GestureTypes } from './gestures-common';
import type { View } from '../core/view';

export class GesturesObserver extends GesturesObserverBase {
	observe(type: GestureTypes): void {}
	disconnect(): void {}
}

export function observe(target: View, type: GestureTypes, callback: (args: any) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);
	return observer;
}
