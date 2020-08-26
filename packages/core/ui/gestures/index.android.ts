// Definitions.
import { GestureEventData, TapGestureEventData, SwipeGestureEventData, PanGestureEventData, RotationGestureEventData, GestureEventDataWithState } from '.';
import { View } from '../core/view';
import { EventData } from '../../data/observable';

// Types.
import { GesturesObserverBase, toString, TouchAction, GestureStateTypes, GestureTypes, SwipeDirection } from './gestures-common';

// Import layout from utils directly to avoid circular references
import { layout } from '../../utils';

import * as timer from '../../timer';

export * from './gestures-common';

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
		private _type: number;

		private _lastUpTime: number = 0;
		private _tapTimeoutId: number;

		private static DoubleTapTimeout = android.view.ViewConfiguration.getDoubleTapTimeout();

		constructor(observer: GesturesObserver, target: View, type: number) {
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
			if (this._type & GestureTypes.longPress) {
				const args = _getLongPressArgs(GestureTypes.longPress, this._target, GestureStateTypes.began, motionEvent);
				_executeCallback(this._observer, args);
			}
		}

		private _handleSingleTap(motionEvent: android.view.MotionEvent): void {
			if (this._target.getGestureObservers(GestureTypes.doubleTap)) {
				this._tapTimeoutId = timer.setTimeout(() => {
					if (this._type & GestureTypes.tap) {
						const args = _getTapArgs(GestureTypes.tap, this._target, motionEvent);
						_executeCallback(this._observer, args);
					}
					timer.clearTimeout(this._tapTimeoutId);
				}, TapAndDoubleTapGestureListenerImpl.DoubleTapTimeout);
			} else {
				if (this._type & GestureTypes.tap) {
					const args = _getTapArgs(GestureTypes.tap, this._target, motionEvent);
					_executeCallback(this._observer, args);
				}
			}
		}

		private _handleDoubleTap(motionEvent: android.view.MotionEvent): void {
			if (this._tapTimeoutId) {
				timer.clearTimeout(this._tapTimeoutId);
			}
			if (this._type & GestureTypes.doubleTap) {
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

			const args = new PinchGestureEventData(this._target, detector, this._scale, this._target, GestureStateTypes.began);

			_executeCallback(this._observer, args);

			return true;
		}

		public onScale(detector: android.view.ScaleGestureDetector): boolean {
			this._scale *= detector.getScaleFactor();

			const args = new PinchGestureEventData(this._target, detector, this._scale, this._target, GestureStateTypes.changed);

			_executeCallback(this._observer, args);

			return true;
		}

		public onScaleEnd(detector: android.view.ScaleGestureDetector): void {
			this._scale *= detector.getScaleFactor();

			const args = new PinchGestureEventData(this._target, detector, this._scale, this._target, GestureStateTypes.ended);

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
				let deltaY = currentEvent.getY() - initialEvent.getY();
				let deltaX = currentEvent.getX() - initialEvent.getX();

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
		if (this.target) {
			this.type = type;
			this._onTargetLoaded = (args) => {
				this._attach(this.target, type);
			};
			this._onTargetUnloaded = (args) => {
				this._detach();
			};

			this.target.on('loaded', this._onTargetLoaded);
			this.target.on('unloaded', this._onTargetUnloaded);

			if (this.target.isLoaded) {
				this._attach(this.target, type);
			}
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

		if (type & GestureTypes.tap || type & GestureTypes.doubleTap || type & GestureTypes.longPress) {
			initializeTapAndDoubleTapGestureListener();
			this._simpleGestureDetector = <any>new androidx.core.view.GestureDetectorCompat(target._context, new TapAndDoubleTapGestureListener(this, this.target, type));
		}

		if (type & GestureTypes.pinch) {
			initializePinchGestureListener();
			this._scaleGestureDetector = new android.view.ScaleGestureDetector(target._context, new PinchGestureListener(this, this.target));
		}

		if (type & GestureTypes.swipe) {
			initializeSwipeGestureListener();
			this._swipeGestureDetector = <any>new androidx.core.view.GestureDetectorCompat(target._context, new SwipeGestureListener(this, this.target));
		}

		if (type & GestureTypes.pan) {
			this._panGestureDetector = new CustomPanGestureDetector(this, this.target);
		}

		if (type & GestureTypes.rotation) {
			this._rotateGestureDetector = new CustomRotateGestureDetector(this, this.target);
		}

		if (type & GestureTypes.touch) {
			this._notifyTouch = true;
		}
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

function _getPanArgs(deltaX: number, deltaY: number, view: View, state: GestureStateTypes, initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent): PanGestureEventData {
	return <PanGestureEventData>{
		type: GestureTypes.pan,
		view: view,
		android: { initial: initialEvent, current: currentEvent },
		deltaX: deltaX,
		deltaY: deltaY,
		ios: undefined,
		object: view,
		eventName: toString(GestureTypes.pan),
		state: state,
	};
}

function _executeCallback(observer: GesturesObserver, args: GestureEventData) {
	if (observer && observer.callback) {
		observer.callback.call((<any>observer)._context, args);
	}
}

class PinchGestureEventData implements PinchGestureEventData {
	public type = GestureTypes.pinch;
	public eventName = toString(GestureTypes.pinch);
	public ios;

	constructor(public view: View, public android: android.view.ScaleGestureDetector, public scale: number, public object: any, public state: GestureStateTypes) {}

	getFocusX(): number {
		return this.android.getFocusX() / layout.getDisplayDensity();
	}
	getFocusY(): number {
		return this.android.getFocusY() / layout.getDisplayDensity();
	}
}

class CustomPanGestureDetector {
	private observer: GesturesObserver;
	private target: View;

	private density: number;

	private isTracking: boolean;
	private deltaX: number;
	private deltaY: number;
	private initialX: number;
	private initialY: number;

	private lastEventCache: android.view.MotionEvent;

	constructor(observer: GesturesObserver, target: View) {
		this.observer = observer;
		this.target = target;
		this.isTracking = false;

		this.density = layout.getDisplayDensity();
	}

	public onTouchEvent(event: android.view.MotionEvent) {
		switch (event.getActionMasked()) {
			case android.view.MotionEvent.ACTION_UP:
			case android.view.MotionEvent.ACTION_CANCEL:
				this.trackStop(event, false);
				break;

			case android.view.MotionEvent.ACTION_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_UP:
				this.trackStop(event, true);
				break;

			case android.view.MotionEvent.ACTION_MOVE:
				if (!this.isTracking) {
					this.trackStart(event);
				}

				this.trackChange(event);
				break;
		}

		return true;
	}

	private trackStop(currentEvent: android.view.MotionEvent, cacheEvent: boolean) {
		if (this.isTracking) {
			let args = _getPanArgs(this.deltaX, this.deltaY, this.target, GestureStateTypes.ended, null, currentEvent);
			_executeCallback(this.observer, args);

			this.deltaX = undefined;
			this.deltaY = undefined;
			this.isTracking = false;
		}

		if (cacheEvent) {
			this.lastEventCache = currentEvent;
		} else {
			this.lastEventCache = undefined;
		}
	}

	private trackStart(currentEvent: android.view.MotionEvent) {
		let inital = this.getEventCoordinates(this.lastEventCache ? this.lastEventCache : currentEvent);
		this.initialX = inital.x;
		this.initialY = inital.y;
		this.isTracking = true;

		let args = _getPanArgs(0, 0, this.target, GestureStateTypes.began, null, currentEvent);
		_executeCallback(this.observer, args);
	}

	private trackChange(currentEvent: android.view.MotionEvent) {
		let current = this.getEventCoordinates(currentEvent);
		this.deltaX = current.x - this.initialX;
		this.deltaY = current.y - this.initialY;

		let args = _getPanArgs(this.deltaX, this.deltaY, this.target, GestureStateTypes.changed, null, currentEvent);
		_executeCallback(this.observer, args);
	}

	private getEventCoordinates(event: android.view.MotionEvent): { x: number; y: number } {
		const count = event.getPointerCount();
		if (count === 1) {
			return {
				x: event.getRawX() / this.density,
				y: event.getRawY() / this.density,
			};
		} else {
			const offX = event.getRawX() - event.getX();
			const offY = event.getRawY() - event.getY();
			let res = { x: 0, y: 0 };

			for (let i = 0; i < count; i++) {
				res.x += event.getX(i) + offX;
				res.y += event.getY(i) + offY;
			}

			res.x /= count * this.density;
			res.y /= count * this.density;

			return res;
		}
	}
}

class CustomRotateGestureDetector {
	private observer: GesturesObserver;
	private target: View;
	private trackedPtrId1: number;
	private trackedPtrId2: number;

	private initalPointersAngle: number;
	private angle: number;

	private get isTracking(): boolean {
		return this.trackedPtrId1 !== INVALID_POINTER_ID && this.trackedPtrId2 !== INVALID_POINTER_ID;
	}

	constructor(observer: GesturesObserver, target: View) {
		this.observer = observer;
		this.target = target;

		this.trackedPtrId1 = INVALID_POINTER_ID;
		this.trackedPtrId2 = INVALID_POINTER_ID;
	}

	public onTouchEvent(event: android.view.MotionEvent) {
		let pointerID = event.getPointerId(event.getActionIndex());
		let wasTracking = this.isTracking;

		switch (event.getActionMasked()) {
			case android.view.MotionEvent.ACTION_DOWN:
			case android.view.MotionEvent.ACTION_POINTER_DOWN:
				let assigned = false;
				if (this.trackedPtrId1 === INVALID_POINTER_ID && pointerID !== this.trackedPtrId2) {
					this.trackedPtrId1 = pointerID;
					assigned = true;
				} else if (this.trackedPtrId2 === INVALID_POINTER_ID && pointerID !== this.trackedPtrId1) {
					this.trackedPtrId2 = pointerID;
					assigned = true;
				}

				if (assigned && this.isTracking) {
					// We have started tracking 2 pointers
					this.angle = 0;
					this.initalPointersAngle = this.getPointersAngle(event);
					this.executeCallback(event, GestureStateTypes.began);
				}
				break;

			case android.view.MotionEvent.ACTION_MOVE:
				if (this.isTracking) {
					this.updateAngle(event);

					this.executeCallback(event, GestureStateTypes.changed);
				}
				break;

			case android.view.MotionEvent.ACTION_UP:
			case android.view.MotionEvent.ACTION_POINTER_UP:
				if (pointerID === this.trackedPtrId1) {
					this.trackedPtrId1 = INVALID_POINTER_ID;
				} else if (pointerID === this.trackedPtrId2) {
					this.trackedPtrId2 = INVALID_POINTER_ID;
				}

				if (wasTracking && !this.isTracking) {
					this.executeCallback(event, GestureStateTypes.ended);
				}
				break;

			case android.view.MotionEvent.ACTION_CANCEL:
				this.trackedPtrId1 = INVALID_POINTER_ID;
				this.trackedPtrId2 = INVALID_POINTER_ID;
				if (wasTracking) {
					this.executeCallback(event, GestureStateTypes.cancelled);
				}
				break;
		}

		return true;
	}

	private executeCallback(event: android.view.MotionEvent, state: GestureStateTypes) {
		let args = <RotationGestureEventData>{
			type: GestureTypes.rotation,
			view: this.target,
			android: event,
			rotation: this.angle,
			ios: undefined,
			object: this.target,
			eventName: toString(GestureTypes.rotation),
			state: state,
		};

		_executeCallback(this.observer, args);
	}

	private updateAngle(event: android.view.MotionEvent) {
		let newPointersAngle = this.getPointersAngle(event);
		let result = ((newPointersAngle - this.initalPointersAngle) * TO_DEGREES) % 360;

		if (result < -180) {
			result += 360;
		}
		if (result > 180) {
			result -= 360;
		}

		this.angle = result;
	}

	private getPointersAngle(event: android.view.MotionEvent) {
		let firstX = event.getX(event.findPointerIndex(this.trackedPtrId1));
		let firstY = event.getY(event.findPointerIndex(this.trackedPtrId1));
		let secondX = event.getX(event.findPointerIndex(this.trackedPtrId2));
		let secondY = event.getY(event.findPointerIndex(this.trackedPtrId2));

		return Math.atan2(secondY - firstY, secondX - firstX);
	}
}

class Pointer implements Pointer {
	public android: number;
	public ios: any = undefined;

	constructor(id: number, private event: android.view.MotionEvent) {
		this.android = id;
	}

	getX(): number {
		return this.event.getX(this.android) / layout.getDisplayDensity();
	}

	getY(): number {
		return this.event.getY(this.android) / layout.getDisplayDensity();
	}
}

class TouchGestureEventData implements TouchGestureEventData {
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
