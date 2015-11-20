import common = require("./gestures-common");
import definition = require("ui/gestures");
import observable = require("data/observable");
import view = require("ui/core/view");
import trace = require("trace");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 100;
const INVALID_POINTER_ID = -1;
const TO_DEGREES = (180 / Math.PI);

export class GesturesObserver extends common.GesturesObserver {
    private _onTouchListener: android.view.View.OnTouchListener;
    private _simpleGestureDetector: android.view.GestureDetector;
    private _scaleGestureDetector: android.view.ScaleGestureDetector;
    private _swipeGestureDetector: android.view.GestureDetector;
    private _panGestureDetector: CustomPanGestureDetector;
    private _rotateGestureDetector: CustomRotateGestureDetector;

    private _onTargetLoaded: (data: observable.EventData) => void;
    private _onTargetUnloaded: (data: observable.EventData) => void;

    public observe(type: definition.GestureTypes) {
        if (this.target) {
            this.type = type;
            this._onTargetLoaded = args => {
                trace.write(this.target + ".target loaded. android:" + this.target._nativeView, "gestures");
                this._attach(this.target, type);
            };
            this._onTargetUnloaded = args => {
                trace.write(this.target + ".target unloaded. android:" + this.target._nativeView, "gestures");
                this._detach();
            };

            this.target.on(view.View.loadedEvent, this._onTargetLoaded);
            this.target.on(view.View.unloadedEvent, this._onTargetUnloaded);

            if (this.target.isLoaded) {
                this._attach(this.target, type);
            }
        }
    }

    public disconnect() {
        this._detach();

        if (this.target) {
            this.target.off(view.View.loadedEvent, this._onTargetLoaded);
            this.target.off(view.View.unloadedEvent, this._onTargetUnloaded);

            this._onTargetLoaded = null;
            this._onTargetUnloaded = null;
        }
        // clears target, context and callback references
        super.disconnect();
    }

    private _detach() {
        trace.write(this.target + "._detach() android:" + this.target._nativeView, "gestures");

        this._onTouchListener = null;
        this._simpleGestureDetector = null;
        this._scaleGestureDetector = null;
        this._swipeGestureDetector = null;
        this._panGestureDetector = null;
        this._rotateGestureDetector = null;
    }

    private _attach(target: view.View, type: definition.GestureTypes) {
        trace.write(this.target + "._attach() android:" + this.target._nativeView, "gestures");
        this._detach();

        if (type & definition.GestureTypes.tap || type & definition.GestureTypes.doubleTap || type & definition.GestureTypes.longPress) {
            this._simpleGestureDetector = new android.support.v4.view.GestureDetectorCompat(target._context, new TapAndDoubleTapGestureListener(this, this.target, type));
        }

        if (type & definition.GestureTypes.pinch) {
            this._scaleGestureDetector = new android.view.ScaleGestureDetector(target._context, new PinchGestureListener(this, this.target));
        }

        if (type & definition.GestureTypes.swipe) {
            this._swipeGestureDetector = new android.support.v4.view.GestureDetectorCompat(target._context, new SwipeGestureListener(this, this.target));
        }

        if (type & definition.GestureTypes.pan) {
            this._panGestureDetector = new CustomPanGestureDetector(this, this.target);
        }

        if (type & definition.GestureTypes.rotation) {
            this._rotateGestureDetector = new CustomRotateGestureDetector(this, this.target);
        }
    }

    public androidOnTouchEvent(motionEvent: android.view.MotionEvent) {
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

function getState(e: android.view.MotionEvent): common.GestureStateTypes {
    if (e.getActionMasked() === android.view.MotionEvent.ACTION_DOWN) {
        return common.GestureStateTypes.began;
    } else if (e.getActionMasked() === android.view.MotionEvent.ACTION_CANCEL) {
        return common.GestureStateTypes.cancelled;
    } else if (e.getActionMasked() === android.view.MotionEvent.ACTION_MOVE) {
        return common.GestureStateTypes.changed;
    } else if (e.getActionMasked() === android.view.MotionEvent.ACTION_UP) {
        return common.GestureStateTypes.ended;
    }
}

function _getArgs(type: definition.GestureTypes, view: view.View, e: android.view.MotionEvent): definition.GestureEventData {
    return <definition.GestureEventData>{
        type: type,
        view: view,
        android: e,
        ios: undefined,
        object: view,
        eventName: definition.toString(type),
    };
}

function _getSwipeArgs(direction: definition.SwipeDirection, view: view.View,
    initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent): definition.SwipeGestureEventData {
    return <definition.SwipeGestureEventData>{
        type: definition.GestureTypes.swipe,
        view: view,
        android: { initial: initialEvent, current: currentEvent },
        direction: direction,
        ios: undefined,
        object: view,
        eventName: definition.toString(definition.GestureTypes.swipe),
    };
}

function _getPanArgs(deltaX: number, deltaY: number, view: view.View, state: common.GestureStateTypes,
    initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent): definition.PanGestureEventData {
    return <definition.PanGestureEventData>{
        type: definition.GestureTypes.pan,
        view: view,
        android: { initial: initialEvent, current: currentEvent },
        deltaX: deltaX,
        deltaY: deltaY,
        ios: undefined,
        object: view,
        eventName: definition.toString(definition.GestureTypes.pan),
        state: state
    };
}

function _executeCallback(observer: GesturesObserver, args: definition.GestureEventData) {
    if (observer && observer.callback) {
        observer.callback.call((<any>observer)._context, args);
    }
}

class TapAndDoubleTapGestureListener extends android.view.GestureDetector.SimpleOnGestureListener {
    private _observer: GesturesObserver;
    private _target: view.View;
    private _type: number;

    constructor(observer: GesturesObserver, target: view.View, type: number) {
        super();

        this._observer = observer;
        this._target = target;
        this._type = type;
        return global.__native(this);
    }

    public onSingleTapUp(motionEvent: android.view.MotionEvent): boolean {
        if (this._type & definition.GestureTypes.tap) {
            var args = _getArgs(definition.GestureTypes.tap, this._target, motionEvent);
            _executeCallback(this._observer, args);
        }
        return true;
    }

    public onDoubleTap(motionEvent: android.view.MotionEvent): boolean {
        if (this._type & definition.GestureTypes.doubleTap) {
            var args = _getArgs(definition.GestureTypes.doubleTap, this._target, motionEvent);
            _executeCallback(this._observer, args);
        }
        return true;
    }

    public onDown(motionEvent: android.view.MotionEvent): boolean {
        return true;
    }

    public onLongPress(motionEvent: android.view.MotionEvent): void {
        if (this._type & definition.GestureTypes.longPress) {
            var args = _getArgs(definition.GestureTypes.longPress, this._target, motionEvent);
            _executeCallback(this._observer, args);
        }
    }
}

class PinchGestureListener extends android.view.ScaleGestureDetector.SimpleOnScaleGestureListener {
    private _observer: GesturesObserver;
    private _target: view.View;
    private _scale: number;
    constructor(observer: GesturesObserver, target: view.View) {
        super();

        this._observer = observer;
        this._target = target;
        
        return global.__native(this);
    }

    public onScaleBegin(detector: android.view.ScaleGestureDetector): boolean {
        this._scale = detector.getScaleFactor();

        var args = <definition.PinchGestureEventData>{
            type: definition.GestureTypes.pinch,
            view: this._target,
            android: detector,
            scale: this._scale,
            object: this._target,
            eventName: definition.toString(definition.GestureTypes.pinch),
            ios: undefined,
            state: common.GestureStateTypes.began
        };

        _executeCallback(this._observer, args);

        return true;
    }

    public onScale(detector: android.view.ScaleGestureDetector): boolean {
        this._scale *= detector.getScaleFactor();

        var args = <definition.PinchGestureEventData>{
            type: definition.GestureTypes.pinch,
            view: this._target,
            android: detector,
            scale: this._scale,
            object: this._target,
            eventName: definition.toString(definition.GestureTypes.pinch),
            ios: undefined,
            state: common.GestureStateTypes.changed
        };

        _executeCallback(this._observer, args);
        return true;
    }

    public onScaleEnd(detector: android.view.ScaleGestureDetector): void {
        this._scale *= detector.getScaleFactor();

        var args = <definition.PinchGestureEventData>{
            type: definition.GestureTypes.pinch,
            view: this._target,
            android: detector,
            scale: this._scale,
            object: this._target,
            eventName: definition.toString(definition.GestureTypes.pinch),
            ios: undefined,
            state: common.GestureStateTypes.ended
        };

        _executeCallback(this._observer, args);
    }
}

class SwipeGestureListener extends android.view.GestureDetector.SimpleOnGestureListener {
    private _observer: GesturesObserver;
    private _target: view.View;

    constructor(observer: GesturesObserver, target: view.View) {
        super();

        this._observer = observer;
        this._target = target;

        return global.__native(this);
    }

    public onDown(motionEvent: android.view.MotionEvent): boolean {
        return true;
    }

    public onFling(initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent, velocityX: number, velocityY: number): boolean {
        var result = false;
        var args: definition.SwipeGestureEventData;
        try {
            var deltaY = currentEvent.getY() - initialEvent.getY();
            var deltaX = currentEvent.getX() - initialEvent.getX();

            if (Math.abs(deltaX) > Math.abs(deltaY)) {

                if (Math.abs(deltaX) > SWIPE_THRESHOLD
                    && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {

                    if (deltaX > 0) {

                        args = _getSwipeArgs(definition.SwipeDirection.right, this._target, initialEvent, currentEvent);
                        _executeCallback(this._observer, args);

                        result = true;
                    } else {

                        args = _getSwipeArgs(definition.SwipeDirection.left, this._target, initialEvent, currentEvent);
                        _executeCallback(this._observer, args);

                        result = true;
                    }
                }

            } else {

                if (Math.abs(deltaY) > SWIPE_THRESHOLD
                    && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {

                    if (deltaY > 0) {

                        args = _getSwipeArgs(definition.SwipeDirection.down, this._target, initialEvent, currentEvent);
                        _executeCallback(this._observer, args);

                        result = true;
                    } else {

                        args = _getSwipeArgs(definition.SwipeDirection.up, this._target, initialEvent, currentEvent);
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

class CustomPanGestureDetector {
    private observer: GesturesObserver;
    private target: view.View;

    private density: number;

    private isTracking: boolean;
    private deltaX: number;
    private deltaY: number;
    private initialX: number;
    private initialY: number;

    private lastEventCache: android.view.MotionEvent;

    constructor(observer: GesturesObserver, target: view.View) {
        this.observer = observer;
        this.target = target;
        this.isTracking = false;

        this.density = utils.layout.getDisplayDensity();
    }

    public onTouchEvent(event: android.view.MotionEvent) {
        let pointerID = event.getPointerId(event.getActionIndex());
        let wasTracking = this.isTracking;

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
                    this.trackStart(event)
                }

                this.trackChange(event);
                break;
        }
        return true;
    }

    private trackStop(currentEvent: android.view.MotionEvent, cahceEvent: boolean) {
        if (this.isTracking) {
            let args = _getPanArgs(this.deltaX, this.deltaY, this.target, common.GestureStateTypes.ended, null, currentEvent);
            _executeCallback(this.observer, args);

            this.deltaX = undefined;
            this.deltaY = undefined;
            this.isTracking = false;
        }

        if (cahceEvent) {
            this.lastEventCache = currentEvent;
        }
        else {
            this.lastEventCache = undefined;
        }
    }

    private trackStart(currentEvent: android.view.MotionEvent) {
        let inital = this.getMotionEventCenter(this.lastEventCache ? this.lastEventCache : currentEvent);
        this.initialX = inital.x;
        this.initialY = inital.y;
        this.isTracking = true;

        let args = _getPanArgs(0, 0, this.target, common.GestureStateTypes.began, null, currentEvent);
        _executeCallback(this.observer, args);
    }

    private trackChange(currentEvent: android.view.MotionEvent) {
        let current = this.getMotionEventCenter(currentEvent);
        this.deltaX = current.x - this.initialX;
        this.deltaY = current.y - this.initialY;

        let args = _getPanArgs(this.deltaX, this.deltaY, this.target, common.GestureStateTypes.changed, null, currentEvent);
        _executeCallback(this.observer, args);
    }

    private getMotionEventCenter(event: android.view.MotionEvent): { x: number, y: number } {
        let count = event.getPointerCount();
        let res = { x: 0, y: 0 };
        for (var i = 0; i < count; i++) {
            res.x += event.getX(i);
            res.y += event.getY(i);
        }

        res.x /= (count * this.density);
        res.y /= (count * this.density);

        return res;
    }
}

class CustomRotateGestureDetector {
    private observer: GesturesObserver;
    private target: view.View;
    private trackedPtrId1: number;
    private trackedPtrId2: number;

    private initalPointersAngle: number;
    private angle: number;

    private get isTracking(): boolean {
        return this.trackedPtrId1 !== INVALID_POINTER_ID && this.trackedPtrId2 !== INVALID_POINTER_ID;
    }

    constructor(observer: GesturesObserver, target: view.View) {
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
                }
                else if (this.trackedPtrId2 === INVALID_POINTER_ID && pointerID !== this.trackedPtrId1) {
                    this.trackedPtrId2 = pointerID;
                    assigned = true;
                }

                if (assigned && this.isTracking) {
                    // We have started tracking 2 pointers
                    this.angle = 0;
                    this.initalPointersAngle = this.getPointersAngle(event);
                    this.executeCallback(event, common.GestureStateTypes.began);
                }
                break;

            case android.view.MotionEvent.ACTION_MOVE:
                if (this.isTracking) {
                    this.updateAngle(event);

                    this.executeCallback(event, common.GestureStateTypes.changed);
                }
                break;

            case android.view.MotionEvent.ACTION_UP:
            case android.view.MotionEvent.ACTION_POINTER_UP:
                if (pointerID === this.trackedPtrId1) {
                    this.trackedPtrId1 = INVALID_POINTER_ID;
                }
                else if (pointerID === this.trackedPtrId2) {
                    this.trackedPtrId2 = INVALID_POINTER_ID;
                }

                if (wasTracking && !this.isTracking) {
                    this.executeCallback(event, common.GestureStateTypes.ended);
                }
                break;

            case android.view.MotionEvent.ACTION_CANCEL:
                this.trackedPtrId1 = INVALID_POINTER_ID;
                this.trackedPtrId2 = INVALID_POINTER_ID;
                if (wasTracking) {
                    this.executeCallback(event, common.GestureStateTypes.cancelled);
                }
                break;
        }
        return true;
    }

    private executeCallback(event: android.view.MotionEvent, state: common.GestureStateTypes) {
        var args = <definition.RotationGestureEventData>{
            type: definition.GestureTypes.rotation,
            view: this.target,
            android: event,
            rotation: this.angle,
            ios: undefined,
            object: this.target,
            eventName: definition.toString(definition.GestureTypes.rotation),
            state: state
        }

        _executeCallback(this.observer, args);
    }

    private updateAngle(event: android.view.MotionEvent) {
        var newPointersAngle = this.getPointersAngle(event);
        var result = ((newPointersAngle - this.initalPointersAngle) * TO_DEGREES) % 360;

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

        return Math.atan2((secondY - firstY), (secondX - firstX));
    }
}