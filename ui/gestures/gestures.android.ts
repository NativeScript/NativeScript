import common = require("ui/gestures/gestures-common");
import definition = require("ui/gestures");
import observable = require("data/observable");
import view = require("ui/core/view");
import trace = require("trace");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

var SWIPE_THRESHOLD = 100;
var SWIPE_VELOCITY_THRESHOLD = 100;

export class GesturesObserver implements definition.GesturesObserver {
    private _callback: (args: definition.GestureEventData) => void;
    private _target: view.View;
    private _context: any;

    private _onTouchListener: android.view.View.OnTouchListener;
    public _simpleGestureDetector: android.view.GestureDetector;
    public _scaleGestureDetector: android.view.ScaleGestureDetector;
    public _swipeGestureDetector: android.view.GestureDetector;
    public _panGestureDetector: android.view.GestureDetector

    private _onTargetLoaded: (data: observable.EventData) => void;
    private _onTargetUnloaded: (data: observable.EventData) => void;
    public type: definition.GestureTypes;

    constructor(callback: (args: definition.GestureEventData) => void) {
        this._callback = callback;
    }

    get callback(): (args: definition.GestureEventData) => void {
        return this._callback;
    }

    public observe(target: view.View, type: definition.GestureTypes, thisArg?: any) {
        if (target) {
            this.type = type;
            this._target = target;
            this._context = thisArg;
            this._onTargetLoaded = args => {
                trace.write(this._target + ".target loaded. android:" + this._target.android, "gestures");
                this._attach(target, type);
            };
            this._onTargetUnloaded = args => {
                trace.write(this._target + ".target unloaded. android:" + this._target.android, "gestures");
                this._dettach();
            };

            target.on(view.View.loadedEvent, this._onTargetLoaded);
            target.on(view.View.unloadedEvent, this._onTargetUnloaded);

            if (target.isLoaded) {
                this._attach(target, type);
            }
        }
    }

    public disconnect() {
        this._dettach();

        if (this._target) {
            this._target.off(view.View.loadedEvent, this._onTargetLoaded);
            this._target.off(view.View.unloadedEvent, this._onTargetUnloaded);

            this._onTargetLoaded = null;
            this._onTargetUnloaded = null;
            this._target = null;
        }
    }

    private _dettach() {
        trace.write(this._target + "._detach() android:" + this._target.android, "gestures");

        this._onTouchListener = null;
        this._simpleGestureDetector = null;
        this._scaleGestureDetector = null;
        this._swipeGestureDetector = null;
        this._panGestureDetector = null;
    }

    private _attach(target: view.View, type: definition.GestureTypes) {
        trace.write(this._target + "._attach() android:" + this._target.android, "gestures");
        this._dettach();

        if (type & definition.GestureTypes.tap || type & definition.GestureTypes.doubleTap || type & definition.GestureTypes.longPress) {
            this._simpleGestureDetector = new android.support.v4.view.GestureDetectorCompat(target._context, new TapAndDoubleTapGestureListener(this, this._target, type));
        }

        if (type & definition.GestureTypes.pinch) {
            this._scaleGestureDetector = new android.view.ScaleGestureDetector(target._context, new PinchGestureListener(this, this._target));
        }

        if (type & definition.GestureTypes.swipe) {
            this._swipeGestureDetector = new android.support.v4.view.GestureDetectorCompat(target._context, new SwipeGestureListener(this, this._target));
        }

        if (type & definition.GestureTypes.pan) {
            this._panGestureDetector = new android.support.v4.view.GestureDetectorCompat(target._context, new PanGestureListener(this, this._target));
        }
    }
}

function _getArgs(type: definition.GestureTypes, view: view.View, e: android.view.MotionEvent): definition.GestureEventData {
    return <definition.GestureEventData>{
        type: type,
        view: view,
        android: e
    };
}

function _getSwipeArgs(direction: definition.SwipeDirection, view: view.View,
    initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent): definition.SwipeGestureEventData {
    return <definition.SwipeGestureEventData>{
        type: definition.GestureTypes.swipe,
        view: view,
        android: { initial: initialEvent, current: currentEvent },
        direction: direction
    };
}

function _getPanArgs(deltaX: number, deltaY: number, view: view.View,
    initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent): definition.PanGestureEventData {
    return <definition.PanGestureEventData>{
        type: definition.GestureTypes.pan,
        view: view,
        android: { initial: initialEvent, current: currentEvent },
        deltaX: deltaX,
        deltaY: deltaY
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

    public onSingleTapConfirmed(motionEvent: android.view.MotionEvent): boolean {
        if (this._type === definition.GestureTypes.tap) {
            var args = _getArgs(definition.GestureTypes.tap, this._target, motionEvent);
            _executeCallback(this._observer, args);
        }
        return true;
    }

    public onDoubleTap(motionEvent: android.view.MotionEvent): boolean {
        if (this._type === definition.GestureTypes.doubleTap) {
            var args = _getArgs(definition.GestureTypes.doubleTap, this._target, motionEvent);
            _executeCallback(this._observer, args);
        }
        return true;
    }

    public onDown(motionEvent: android.view.MotionEvent): boolean {
        return true;
    }

    public onLongPress(motionEvent: android.view.MotionEvent): boolean {
        if (this._type === definition.GestureTypes.longPress) {
            var args = _getArgs(definition.GestureTypes.longPress, this._target, motionEvent);
            _executeCallback(this._observer, args);
        }
        return true;
    }
}

class PinchGestureListener extends android.view.ScaleGestureDetector.SimpleOnScaleGestureListener {
    private _observer: GesturesObserver;
    private _target: view.View;

    constructor(observer: GesturesObserver, target: view.View) {
        super();

        this._observer = observer;
        this._target = target;

        return global.__native(this);
    }

    public onScale(detector: android.view.ScaleGestureDetector): boolean {
        var args = <definition.PinchGestureEventData>{
            type: definition.GestureTypes.pinch,
            view: this._target,
            android: detector,
            scale: detector.getScaleFactor()
        };

        _executeCallback(this._observer, args);
        return true;
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

class PanGestureListener extends android.view.GestureDetector.SimpleOnGestureListener {
    private _observer: GesturesObserver;
    private _target: view.View;

    constructor(observer: GesturesObserver, target: view.View) {
        super();

        this._observer = observer;
        this._target = target;

        return global.__native(this);
    }

    public onDown(motionEvent: android.view.MotionEvent): boolean {
        return false;
    }

    public onScroll(initialEvent: android.view.MotionEvent, currentEvent: android.view.MotionEvent, lastDeltaX: number, lastDeltaY: number): boolean {
        var deltaX = currentEvent.getX() - initialEvent.getX();
        var deltaY = currentEvent.getY() - initialEvent.getY();
        var args = _getPanArgs(deltaX, deltaY, this._target, initialEvent, currentEvent);
        _executeCallback(this._observer, args);
        return true;
    }
}