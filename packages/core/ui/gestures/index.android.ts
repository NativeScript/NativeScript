// Definitions.
import type { GestureEventData, TapGestureEventData, SwipeGestureEventData, PanGestureEventData, RotationGestureEventData, GestureEventDataWithState, PinchGestureEventData } from './gestures-types';
import type { View } from '../core/view';
import { EventData } from '../../data/observable';

// Types.
import { GesturesObserverBase, toString, TouchAction, GestureStateTypes, GestureTypes, SwipeDirection, GestureEvents } from './gestures-common';

// Import layout from utils directly to avoid circular references
import { layout } from '../../utils/layout-helper';

import * as timer from '../../timer';

export * from './gestures-common';
export * from './gestures-types';
export * from './touch-manager';

type MotionEventCoordinates = {
	rawX: number;
	rawY: number;
	// Use arrow functions to avoid unneeded native calls
	getViewX(): number;
	getViewY(): number;
};

interface TapAndDoubleTapGestureListener {
	new (observer: GesturesObserver, target: View, type: number): android.view.GestureDetector.SimpleOnGestureListener;
}

let TapAndDoubleTapGestureListener: TapAndDoubleTapGestureListener;
function initializeTapAndDoubleTapGestureListener() {
	if (TapAndDoubleTapGestureListener) {
		return;
	}

	@NativeClass
	class TapAndDoubleTapGestureListenerImpl extends android.view.GestureDetector.SimpleOnGestureListener {
		private _observer: GesturesObserver;
		private _target: View;
		private _type: GestureTypes;

		private _lastUpTime = 0;
		private _tapTimeoutId: number;

		private static DoubleTapTimeout = android.view.ViewConfiguration.getDoubleTapTimeout();

		constructor(observer: GesturesObserver, target: View, type: GestureTypes) {
			super();

			this._observer = observer;
			this._target = target;
			this._type = type;

			return global.__native(this);
		}

		public onSingleTapUp(motionEvent: android.view.MotionEvent): boolean {
			this._handleSingleTap(motionEvent);
			this._lastUpTime = Date.now();

			return true;
		}

		public onDown(motionEvent: android.view.MotionEvent): boolean {
			const tapTime = Date.now();
			if (tapTime - this._lastUpTime <= TapAndDoubleTapGestureListenerImpl.DoubleTapTimeout) {
				this._handleDoubleTap(motionEvent);
			}

			return true;
		}

		public onLongPress(motionEvent: android.view.MotionEvent): void {
			if (this._type === GestureTypes.longPress) {
				const args = _getLongPressArgs(GestureTypes.longPress, this._target, GestureStateTypes.began, motionEvent);
				_executeCallback(this._observer, args);
			}
		}

		private _handleSingleTap(motionEvent: android.view.MotionEvent): void {
			if (this._target.getGestureObservers(GestureTypes.doubleTap)) {
				this._tapTimeoutId = timer.setTimeout(() => {
					if (this._type === GestureTypes.tap) {
						const args = _getTapArgs(GestureTypes.tap, this._target, motionEvent);
						_executeCallback(this._observer, args);
					}
					timer.clearTimeout(this._tapTimeoutId);
				}, TapAndDoubleTapGestureListenerImpl.DoubleTapTimeout);
			} else {
				if (this._type === GestureTypes.tap) {
					const args = _getTapArgs(GestureTypes.tap, this._target, motionEvent);
					_executeCallback(this._observer, args);
				}
			}
		}

		private _handleDoubleTap(motionEvent: android.view.MotionEvent): void {
			if (this._tapTimeoutId) {
				timer.clearTimeout(this._tapTimeoutId);
			}
			if (this._type === GestureTypes.doubleTap) {
				const args = _getTapArgs(GestureTypes.doubleTap, this._target, motionEvent);
				_executeCallback(this._observer, args);
			}
		}
	}

	TapAndDoubleTapGestureListener = TapAndDoubleTapGestureListenerImpl;
}

interface PinchGestureListener {
	new (observer: GesturesObserver, target: View): android.view.ScaleGestureDetector.SimpleOnScaleGestureListener;
}

let PinchGestureListener: PinchGestureListener;
function initializePinchGestureListener() {
	if (PinchGestureListener) {
		return;
	}

	@NativeClass
	class PinchGestureListenerImpl extends android.view.ScaleGestureDetector.SimpleOnScaleGestureListener {
		private _observer: GesturesObserver;
		private _target: View;
		private _scale: number;

		constructor(observer: GesturesObserver, target: View) {
			super();

			this._observer = observer;
			this._target = target;

			return global.__native(this);
		}

		public onScaleBegin(detector: android.view.ScaleGestureDetector): boolean {
			this._scale = detector.getScaleFactor();

			const args = new PinchGestureEventDataImpl(this._target, detector, this._scale, this._target, GestureStateTypes.began);
			_executeCallback(this._observer, args);

			return true;
		}

		public onScale(detector: android.view.ScaleGestureDetector): boolean {
			this._scale *= detector.getScaleFactor();

			const args = new PinchGestureEventDataImpl(this._target, detector, this._scale, this._target, GestureStateTypes.changed);
			_executeCallback(this._observer, args);

			return true;
		}

		public onScaleEnd(detector: android.view.ScaleGestureDetector): void {
			this._scale *= detector.getScaleFactor();

			const args = new PinchGestureEventDataImpl(this._target, detector, this._scale, this._target, GestureStateTypes.ended);
			_executeCallback(this._observer, args);
		}
	}

	PinchGestureListener = PinchGestureListenerImpl;
}

interface SwipeGestureListener {
	new (observer: GesturesObserver, target: View): android.view.GestureDetector.SimpleOnGestureListener;
}

let SwipeGestureListener: SwipeGestureListener;
function initializeSwipeGestureListener() {
	if (SwipeGestureListener) {
		return;
	}

	@NativeClass
	class SwipeGestureListenerImpl extends android.view.GestureDetector.SimpleOnGestureListener {
		private _observer: GesturesObserver;
		private _target: View;

		constructor(observer: GesturesObserver, target: View) {
			super();

			this._observer = observer;
			this._target = target;

			return global.__native(this);
		}

		public onDown(motionEvent: android.view.MotionEvent): boolean {
			return true;
		}

		public onFling(initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent, velocityX: number, velocityY: number): boolean {
			let result = false;
			let args: SwipeGestureEventData;
			try {
				const deltaY = currentEvent.getY() - initialEvent.getY();
				const deltaX = currentEvent.getX() - initialEvent.getX();

				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {
						if (deltaX > 0) {
							args = _getSwipeArgs(SwipeDirection.right, this._target, initialEvent, currentEvent);
							_executeCallback(this._observer, args);
							result = true;
						} else {
							args = _getSwipeArgs(SwipeDirection.left, this._target, initialEvent, currentEvent);
							_executeCallback(this._observer, args);
							result = true;
						}
					}
				} else {
					if (Math.abs(deltaY) > SWIPE_THRESHOLD && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {
						if (deltaY > 0) {
							args = _getSwipeArgs(SwipeDirection.down, this._target, initialEvent, currentEvent);
							_executeCallback(this._observer, args);
							result = true;
						} else {
							args = _getSwipeArgs(SwipeDirection.up, this._target, initialEvent, currentEvent);
							_executeCallback(this._observer, args);
							result = true;
						}
					}
				}
			} catch (ex) {
				//
			}

			return result;
		}
	}

	SwipeGestureListener = SwipeGestureListenerImpl;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 100;
const INVALID_POINTER_ID = -1;
const TO_DEGREES = 180 / Math.PI;

export function observe(target: View, type: GestureTypes, callback: (args: GestureEventData) => void, context?: any): GesturesObserver {
	const observer = new GesturesObserver(target, callback, context);
	observer.observe(type);

	return observer;
}

export class GesturesObserver extends GesturesObserverBase {
	private _notifyTouch: boolean;
	private _simpleGestureDetector: android.view.GestureDetector;
	private _scaleGestureDetector: android.view.ScaleGestureDetector;
	private _swipeGestureDetector: android.view.GestureDetector;
	private _panGestureDetector: CustomPanGestureDetector;
	private _rotateGestureDetector: CustomRotateGestureDetector;

	private _eventData: TouchGestureEventData;

	private _onTargetLoaded: (data: EventData) => void;
	private _onTargetUnloaded: (data: EventData) => void;

	public observe(type: GestureTypes) {
		this.type = type;

		if (!this.target) {
			return;
		}

		this._onTargetLoaded = () => {
			this._attach(this.target, type);
		};
		this._onTargetUnloaded = () => {
			this._detach();
		};

		this.target.on('loaded', this._onTargetLoaded);
		this.target.on('unloaded', this._onTargetUnloaded);

		if (this.target.isLoaded) {
			this._attach(this.target, type);
		}
	}

	public disconnect() {
		this._detach();

		if (this.target) {
			this.target.off('loaded', this._onTargetLoaded);
			this.target.off('unloaded', this._onTargetUnloaded);

			this._onTargetLoaded = null;
			this._onTargetUnloaded = null;
		}

		// clears target, context and callback references
		super.disconnect();
	}

	private _detach() {
		this._notifyTouch = false;
		this._simpleGestureDetector = null;
		this._scaleGestureDetector = null;
		this._swipeGestureDetector = null;
		this._panGestureDetector = null;
		this._rotateGestureDetector = null;
		this._eventData = null;
	}

	private _attach(target: View, type: GestureTypes) {
		this._detach();

		let recognizer: unknown;

		switch (type) {
			// Whether it's a tap, doubleTap, or longPress, we handle with the same
			// listener. It'll listen for all three of these gesture types, but only
			// notify if the type it was registered with matched the relevant gesture.
			case GestureTypes.tap:
			case GestureTypes.doubleTap:
			case GestureTypes.longPress: {
				initializeTapAndDoubleTapGestureListener();
				recognizer = this._simpleGestureDetector = <any>new androidx.core.view.GestureDetectorCompat(target._context, new TapAndDoubleTapGestureListener(this, this.target, type));
				break;
			}
			case GestureTypes.pinch: {
				initializePinchGestureListener();
				recognizer = this._scaleGestureDetector = new android.view.ScaleGestureDetector(target._context, new PinchGestureListener(this, this.target));
				break;
			}

			case GestureTypes.swipe: {
				initializeSwipeGestureListener();
				recognizer = this._swipeGestureDetector = <any>new androidx.core.view.GestureDetectorCompat(target._context, new SwipeGestureListener(this, this.target));
				break;
			}

			case GestureTypes.pan: {
				recognizer = this._panGestureDetector = new CustomPanGestureDetector(this, this.target);
				break;
			}

			case GestureTypes.rotation: {
				recognizer = this._rotateGestureDetector = new CustomRotateGestureDetector(this, this.target);
				break;
			}

			case GestureTypes.touch: {
				this._notifyTouch = true;
				// For touch events, return early rather than breaking from the switch
				// statement.
				return;
			}
		}

		this.target.notify({
			eventName: GestureEvents.gestureAttached,
			object: this.target,
			type: type,
			view: this.target,
			android: recognizer,
		});
	}

	public androidOnTouchEvent(motionEvent: android.view.MotionEvent) {
		if (this._notifyTouch) {
			if (!this._eventData) {
				this._eventData = new TouchGestureEventData();
			}

			this._eventData.prepare(this.target, motionEvent);
			_executeCallback(this, this._eventData);
		}

		if (this._simpleGestureDetector) {
			this._simpleGestureDetector.onTouchEvent(motionEvent);
		}

		if (this._scaleGestureDetector) {
			this._scaleGestureDetector.onTouchEvent(motionEvent);
		}

		if (this._swipeGestureDetector) {
			this._swipeGestureDetector.onTouchEvent(motionEvent);
		}

		if (this._panGestureDetector) {
			this._panGestureDetector.onTouchEvent(motionEvent);
		}

		if (this._rotateGestureDetector) {
			this._rotateGestureDetector.onTouchEvent(motionEvent);
		}
	}
}

function _getTapArgs(type: GestureTypes, view: View, e: android.view.MotionEvent): TapGestureEventData {
	return <TapGestureEventData>{
		type: type,
		view: view,
		android: e,
		ios: undefined,
		object: view,
		eventName: toString(type),
		getPointerCount: () => e.getPointerCount(),
		getX: () => layout.toDeviceIndependentPixels(e.getX()),
		getY: () => layout.toDeviceIndependentPixels(e.getY()),
	};
}

function _getLongPressArgs(type: GestureTypes, view: View, state: GestureStateTypes, e: android.view.MotionEvent): GestureEventDataWithState {
	return <GestureEventDataWithState>{
		type: type,
		view: view,
		android: e,
		ios: undefined,
		object: view,
		eventName: toString(type),
		state: state,
	};
}

function _getSwipeArgs(direction: SwipeDirection, view: View, initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent): SwipeGestureEventData {
	return <SwipeGestureEventData>{
		type: GestureTypes.swipe,
		view: view,
		android: { initial: initialEvent, current: currentEvent },
		direction: direction,
		ios: undefined,
		object: view,
		eventName: toString(GestureTypes.swipe),
	};
}

function _executeCallback(observer: GesturesObserver, args: GestureEventData) {
	if (observer && observer.callback) {
		observer.callback.call(observer.context, args);
	}
}

abstract class CustomGestureDetector {
	protected readonly _observer: GesturesObserver;
	protected readonly _target: View;
	protected readonly _density: number;

	constructor(observer: GesturesObserver, target: View) {
		this._observer = observer;
		this._target = target;
		this._density = layout.getDisplayDensity();
	}

	protected abstract get _isTrackingGesture(): boolean;
	protected abstract _notifyEvent(state: GestureStateTypes, event: android.view.MotionEvent, initialEvent?: android.view.MotionEvent): void;
	public abstract onTouchEvent(event: android.view.MotionEvent);
}

class CustomPanGestureDetector extends CustomGestureDetector {
	private _isTracking: boolean = false;
	private _deltaX: number;
	private _deltaY: number;
	private _startRawX: number = 0;
	private _startRawY: number = 0;
	private _startX: number = 0;
	private _startY: number = 0;

	protected override get _isTrackingGesture(): boolean {
		return this._isTracking;
	}

	public override onTouchEvent(event: android.view.MotionEvent) {
		switch (event.getActionMasked()) {
			case android.view.MotionEvent.ACTION_UP:
			case android.view.MotionEvent.ACTION_CANCEL:
				if (this._isTrackingGesture) {
					this._trackStop(event);
				}
				break;
			case android.view.MotionEvent.ACTION_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_UP:
				if (this._isTrackingGesture) {
					this._trackStop(event);
				}

				this._trackInit(event);
				break;
			case android.view.MotionEvent.ACTION_MOVE:
				if (!this._isTrackingGesture) {
					this._trackStart(event);
				}

				this._trackChange(event);
				break;
		}

		return true;
	}

	protected override _notifyEvent(state: GestureStateTypes, event: android.view.MotionEvent, initialEvent?: android.view.MotionEvent): void {
		const args = <PanGestureEventData>{
			type: GestureTypes.pan,
			view: this._target,
			android: { initial: initialEvent, current: event },
			startX: this._startX,
			startY: this._startY,
			deltaX: this._deltaX,
			deltaY: this._deltaY,
			ios: undefined,
			object: this._target,
			eventName: toString(GestureTypes.pan),
			state,
		};

		_executeCallback(this._observer, args);
	}

	private _trackInit(currentEvent: android.view.MotionEvent) {
		if (this._isTrackingGesture) {
			this._trackStop(currentEvent);
		}

		const initialPos = this._getEventCoordinates(currentEvent);

		this._startRawX = initialPos.rawX;
		this._startRawY = initialPos.rawY;
		this._startX = initialPos.getViewX();
		this._startY = initialPos.getViewY();
	}

	private _trackStop(currentEvent: android.view.MotionEvent) {
		this._notifyEvent(GestureStateTypes.ended, currentEvent);

		this._deltaX = undefined;
		this._deltaY = undefined;
		this._startRawX = 0;
		this._startRawY = 0;
		this._startX = 0;
		this._startY = 0;
		this._isTracking = false;
	}

	private _trackStart(currentEvent: android.view.MotionEvent) {
		this._deltaX = 0;
		this._deltaY = 0;
		this._isTracking = true;

		this._notifyEvent(GestureStateTypes.began, currentEvent);
	}

	private _trackChange(currentEvent: android.view.MotionEvent) {
		const currentPos = this._getEventCoordinates(currentEvent);

		this._deltaX = currentPos.rawX - this._startRawX;
		this._deltaY = currentPos.rawY - this._startRawY;

		this._notifyEvent(GestureStateTypes.changed, currentEvent);
	}

	private _getEventCoordinates(event: android.view.MotionEvent): MotionEventCoordinates {
		const count = event.getPointerCount();
		let res: MotionEventCoordinates;

		if (count === 1) {
			res = {
				rawX: event.getRawX() / this._density,
				rawY: event.getRawY() / this._density,
				getViewX: () => event.getX() / this._density,
				getViewY: () => event.getY() / this._density,
			};
		} else {
			const offX = event.getRawX() - event.getX();
			const offY = event.getRawY() - event.getY();
			let rawX: number = 0;
			let rawY: number = 0;
			let viewX: number = 0;
			let viewY: number = 0;

			for (let i = 0; i < count; i++) {
				const x = event.getX(i);
				const y = event.getY(i);

				rawX += x + offX;
				rawY += y + offY;
				viewX += x;
				viewY += y;
			}

			res = {
				rawX: (rawX / count) * this._density,
				rawY: (rawY / count) * this._density,
				getViewX: () => (viewX / count) * this._density,
				getViewY: () => (viewY / count) * this._density,
			};
		}

		return res;
	}
}

class CustomRotateGestureDetector extends CustomGestureDetector {
	private _trackedPtrId1: number = INVALID_POINTER_ID;
	private _trackedPtrId2: number = INVALID_POINTER_ID;

	private _initalPointersAngle: number;
	private _angle: number;

	protected override get _isTrackingGesture(): boolean {
		return this._trackedPtrId1 !== INVALID_POINTER_ID && this._trackedPtrId2 !== INVALID_POINTER_ID;
	}

	public override onTouchEvent(event: android.view.MotionEvent) {
		const pointerID = event.getPointerId(event.getActionIndex());
		const wasTracking = this._isTrackingGesture;

		switch (event.getActionMasked()) {
			case android.view.MotionEvent.ACTION_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_DOWN: {
				let assigned = false;
				if (this._trackedPtrId1 === INVALID_POINTER_ID && pointerID !== this._trackedPtrId2) {
					this._trackedPtrId1 = pointerID;
					assigned = true;
				} else if (this._trackedPtrId2 === INVALID_POINTER_ID && pointerID !== this._trackedPtrId1) {
					this._trackedPtrId2 = pointerID;
					assigned = true;
				}

				if (assigned && this._isTrackingGesture) {
					// We have started tracking 2 pointers
					this._angle = 0;
					this._initalPointersAngle = this._getPointersAngle(event);
					this._notifyEvent(GestureStateTypes.began, event);
				}
				break;
			}
			case android.view.MotionEvent.ACTION_MOVE:
				if (this._isTrackingGesture) {
					this._updateAngle(event);
					this._notifyEvent(GestureStateTypes.changed, event);
				}
				break;

			case android.view.MotionEvent.ACTION_UP:
			case android.view.MotionEvent.ACTION_POINTER_UP:
				if (pointerID === this._trackedPtrId1) {
					this._trackedPtrId1 = INVALID_POINTER_ID;
				} else if (pointerID === this._trackedPtrId2) {
					this._trackedPtrId2 = INVALID_POINTER_ID;
				}

				if (wasTracking && !this._isTrackingGesture) {
					this._notifyEvent(GestureStateTypes.ended, event);
				}
				break;

			case android.view.MotionEvent.ACTION_CANCEL:
				this._trackedPtrId1 = INVALID_POINTER_ID;
				this._trackedPtrId2 = INVALID_POINTER_ID;
				if (wasTracking) {
					this._notifyEvent(GestureStateTypes.cancelled, event);
				}
				break;
		}

		return true;
	}

	protected override _notifyEvent(state: GestureStateTypes, event: android.view.MotionEvent, initialEvent?: android.view.MotionEvent): void {
		const args = <RotationGestureEventData>{
			type: GestureTypes.rotation,
			view: this._target,
			android: event,
			rotation: this._angle,
			ios: undefined,
			object: this._target,
			eventName: toString(GestureTypes.rotation),
			state: state,
		};
		_executeCallback(this._observer, args);
	}

	private _updateAngle(event: android.view.MotionEvent) {
		const newPointersAngle = this._getPointersAngle(event);
		let result = ((newPointersAngle - this._initalPointersAngle) * TO_DEGREES) % 360;

		if (result < -180) {
			result += 360;
		}
		if (result > 180) {
			result -= 360;
		}

		this._angle = result;
	}

	private _getPointersAngle(event: android.view.MotionEvent) {
		const firstX = event.getX(event.findPointerIndex(this._trackedPtrId1));
		const firstY = event.getY(event.findPointerIndex(this._trackedPtrId1));
		const secondX = event.getX(event.findPointerIndex(this._trackedPtrId2));
		const secondY = event.getY(event.findPointerIndex(this._trackedPtrId2));

		return Math.atan2(secondY - firstY, secondX - firstX);
	}
}

class Pointer {
	public android: number;
	public ios: any = undefined;

	constructor(
		id: number,
		private event: android.view.MotionEvent,
	) {
		this.android = id;
	}

	getX(): number {
		return this.event.getX(this.android) / layout.getDisplayDensity();
	}

	getY(): number {
		return this.event.getY(this.android) / layout.getDisplayDensity();
	}
}

class PinchGestureEventDataImpl implements PinchGestureEventData {
	public type = GestureTypes.pinch;
	public eventName = toString(GestureTypes.pinch);
	public ios;

	constructor(
		public view: View,
		public android: android.view.ScaleGestureDetector,
		public scale: number,
		public object: any,
		public state: GestureStateTypes,
	) {}

	getFocusX(): number {
		return this.android.getFocusX() / layout.getDisplayDensity();
	}
	getFocusY(): number {
		return this.android.getFocusY() / layout.getDisplayDensity();
	}
}

export class TouchGestureEventData implements GestureEventData {
	eventName: string = toString(GestureTypes.touch);
	type: GestureTypes = GestureTypes.touch;
	ios: any = undefined;
	action: string;
	view: View;
	android: android.view.MotionEvent;
	object: any;

	private _activePointers: Array<Pointer>;
	private _allPointers: Array<Pointer>;

	public prepare(view: View, e: android.view.MotionEvent) {
		this.view = view;
		this.object = view;
		this.android = e;
		this.action = this.getActionType(e);

		this._activePointers = undefined;
		this._allPointers = undefined;
	}

	getPointerCount(): number {
		return this.android.getPointerCount();
	}

	getActivePointers(): Array<Pointer> {
		// Only one active pointer in Android
		if (!this._activePointers) {
			this._activePointers = [new Pointer(this.android.getActionIndex(), this.android)];
		}

		return this._activePointers;
	}

	getAllPointers(): Array<Pointer> {
		if (!this._allPointers) {
			this._allPointers = [];
			for (let i = 0; i < this.getPointerCount(); i++) {
				this._allPointers.push(new Pointer(i, this.android));
			}
		}

		return this._allPointers;
	}

	getX(): number {
		return this.getActivePointers()[0].getX();
	}

	getY(): number {
		return this.getActivePointers()[0].getY();
	}

	private getActionType(e: android.view.MotionEvent): string {
		switch (e.getActionMasked()) {
			case android.view.MotionEvent.ACTION_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_DOWN:
				return TouchAction.down;

			case android.view.MotionEvent.ACTION_MOVE:
				return TouchAction.move;

			case android.view.MotionEvent.ACTION_UP:
			case android.view.MotionEvent.ACTION_POINTER_UP:
				return TouchAction.up;

			case android.view.MotionEvent.ACTION_CANCEL:
				return TouchAction.cancel;
		}

		return '';
	}
}
