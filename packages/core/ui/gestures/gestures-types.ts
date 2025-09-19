// Shared types/interfaces for gestures
import type { View } from '../core/view';
import type { EventData } from '../../data/observable';

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

// Shared gesture types, interfaces, and enums for gestures-common.ts and touch-manager.ts
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

export enum TouchAction {
	down = 'down',
	up = 'up',
	move = 'move',
	cancel = 'cancel',
}

export interface GestureEventData extends EventData {
	type: GestureTypes;
	view: View;
	ios: any;
	android: any;
}

export interface TapGestureEventData extends GestureEventData {
	getPointerCount(): number;
	getX(): number;
	getY(): number;
}

export interface TouchGestureEventData extends TapGestureEventData {
	action: 'up' | 'move' | 'down' | 'cancel';
	getActivePointers(): Array<Pointer>;
	getAllPointers(): Array<Pointer>;
}

export interface Pointer {
	android: any;
	ios: any;
	getX(): number;
	getY(): number;
	getXPixels(): number;
	getXDIP(): number;
	getYPixels(): number;
	getYDIP(): number;
}

export interface GestureEventDataWithState extends GestureEventData {
	state: number;
}

export interface PinchGestureEventData extends GestureEventDataWithState {
	scale: number;
	getFocusX(): number;
	getFocusY(): number;
}

export interface SwipeGestureEventData extends GestureEventData {
	direction: SwipeDirection;
}

export interface PanGestureEventData extends GestureEventDataWithState {
	deltaX: number;
	deltaY: number;
}

export interface RotationGestureEventData extends GestureEventDataWithState {
	rotation: number;
}
