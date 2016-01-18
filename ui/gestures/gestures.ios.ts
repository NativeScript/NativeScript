import common = require("./gestures-common");
import definition = require("ui/gestures");
import view = require("ui/core/view");
import observable = require("data/observable");
import trace = require("trace");
import types = require("utils/types");

global.moduleMerge(common, exports);

class UIGestureRecognizerDelegateImpl extends NSObject implements UIGestureRecognizerDelegate {
    public static ObjCProtocols = [UIGestureRecognizerDelegate];
    public gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean {
        return true;
    }
}
var recognizerDelegateInstance: UIGestureRecognizerDelegateImpl = <UIGestureRecognizerDelegateImpl>UIGestureRecognizerDelegateImpl.new();

class UIGestureRecognizerImpl extends NSObject {

    private _owner: WeakRef<GesturesObserver>;
    private _type: any;
    private _callback: Function;
    private _context: any;

    public static initWithOwnerTypeCallback(owner: WeakRef<GesturesObserver>, type: any, callback?: Function, thisArg?: any): UIGestureRecognizerImpl {
        let handler = <UIGestureRecognizerImpl>UIGestureRecognizerImpl.new();
        handler._owner = owner;
        handler._type = type;

        if (callback) {
            handler._callback = callback;
        }

        if (thisArg) {
            handler._context = thisArg;
        }

        return handler;
    }

    public static ObjCExposedMethods = {
        "recognize": { returns: interop.types.void, params: [UIGestureRecognizer] }
    };

    public recognize(recognizer: UIGestureRecognizer): void {
        let owner = this._owner.get();
        let callback = this._callback ? this._callback : (owner ? owner.callback : null);
        let typeParam = this._type;
        let target = owner ? owner.target : undefined;

        var args = {
            type: typeParam,
            view: target,
            ios: recognizer,
            android: undefined,
            object: target,
            eventName: definition.toString(typeParam),
        };

        if (callback) {
            callback.call(this._context, args);
        }
    }
}

export class GesturesObserver extends common.GesturesObserver {
    private _recognizers: {};

    private _onTargetLoaded: (data: observable.EventData) => void;
    private _onTargetUnloaded: (data: observable.EventData) => void;

    constructor(target: view.View, callback: (args: definition.GestureEventData) => void, context: any) {
        super(target, callback, context);
        this._recognizers = {};
    }

    public observe(type: definition.GestureTypes) {
        if (this.target) {
            this.type = type;
            this._onTargetLoaded = args => {
                trace.write(this.target + ".target loaded. _nativeView:" + this.target._nativeView, "gestures");
                this._attach(this.target, type);
            };
            this._onTargetUnloaded = args => {
                trace.write(this.target + ".target unloaded. _nativeView:" + this.target._nativeView, "gestures");
                this._detach();
            };

            this.target.on(view.View.loadedEvent, this._onTargetLoaded);
            this.target.on(view.View.unloadedEvent, this._onTargetUnloaded);

            if (this.target.isLoaded) {
                this._attach(this.target, type);
            }
        }
    }

    private _attach(target: view.View, type: definition.GestureTypes) {
        trace.write(target + "._attach() _nativeView:" + target._nativeView, "gestures");
        this._detach();

        if (target && target._nativeView && target._nativeView.addGestureRecognizer) {
            var nativeView = <UIView>target._nativeView;

            if (type & definition.GestureTypes.tap) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.tap));
            }

            if (type & definition.GestureTypes.doubleTap) {
                var r = <UITapGestureRecognizer>this._createRecognizer(definition.GestureTypes.doubleTap);
                r.numberOfTapsRequired = 2;

                nativeView.addGestureRecognizer(r);
            }

            if (type & definition.GestureTypes.pinch) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.pinch, args => {
                    this._executeCallback(_getPinchData(args));
                }));
            }

            if (type & definition.GestureTypes.pan) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.pan, args => {
                    this._executeCallback(_getPanData(args, target._nativeView));
                }));
            }

            if (type & definition.GestureTypes.swipe) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.swipe, args => {
                    this._executeCallback(_getSwipeData(args));
                }, UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionDown));

                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.swipe, args => {
                    this._executeCallback(_getSwipeData(args));
                }, UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionLeft));

                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.swipe, args => {
                    this._executeCallback(_getSwipeData(args));
                }, UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionRight));

                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.swipe, args => {
                    this._executeCallback(_getSwipeData(args));
                }, UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionUp));
            }

            if (type & definition.GestureTypes.rotation) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.rotation, args => {
                    this._executeCallback(_getRotationData(args));
                }));
            }

            if (type & definition.GestureTypes.longPress) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.longPress));
            }

            if (type & definition.GestureTypes.touch) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.touch));
            }
        }
    }

    private _detach() {
        trace.write(this.target + "._detach() _nativeView:" + this.target._nativeView, "gestures");
        if (this.target && this.target._nativeView) {
            for (var name in this._recognizers) {
                if (this._recognizers.hasOwnProperty(name)) {
                    var item = <RecognizerCache>this._recognizers[name];
                    this.target._nativeView.removeGestureRecognizer(item.recognizer);

                    item.recognizer = null;
                    item.target = null;
                }
            }
            this._recognizers = {};
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

    public _executeCallback(args: definition.GestureEventData) {
        if (this.callback) {
            this.callback.call(this.context, args);
        }
    }

    private _createRecognizer(type: definition.GestureTypes, callback?: (args: definition.GestureEventData) => void, swipeDirection?: UISwipeGestureRecognizerDirection): UIGestureRecognizer {
        var recognizer: UIGestureRecognizer;
        var name = definition.toString(type);
        var target = _createUIGestureRecognizerTarget(this, type, callback, this.context);
        var recognizerType = _getUIGestureRecognizerType(type);

        if (recognizerType) {
            recognizer = recognizerType.alloc().initWithTargetAction(target, "recognize");

            if (type === definition.GestureTypes.swipe && swipeDirection) {
                name = name + swipeDirection.toString();
                (<UISwipeGestureRecognizer>recognizer).direction = swipeDirection;
            }
            else if (type === definition.GestureTypes.touch) {
                (<TouchGestureRecognizer>recognizer).observer = this;
            }

            if (recognizer) {
                recognizer.delegate = recognizerDelegateInstance;
                this._recognizers[name] = <RecognizerCache>{ recognizer: recognizer, target: target };
            }
        }

        return recognizer;
    }
}

function _createUIGestureRecognizerTarget(owner: GesturesObserver, type: definition.GestureTypes, callback?: (args: definition.GestureEventData) => void, context?: any): any {
    return UIGestureRecognizerImpl.initWithOwnerTypeCallback(new WeakRef(owner), type, callback, context);
}

interface RecognizerCache {
    recognizer: UIGestureRecognizer;
    target: any;
}

function _getUIGestureRecognizerType(type: definition.GestureTypes): any {
    var nativeType = null;

    if (type === definition.GestureTypes.tap) {
        nativeType = UITapGestureRecognizer;
    } else if (type === definition.GestureTypes.doubleTap) {
        nativeType = UITapGestureRecognizer;
    } else if (type === definition.GestureTypes.pinch) {
        nativeType = UIPinchGestureRecognizer;
    } else if (type === definition.GestureTypes.pan) {
        nativeType = UIPanGestureRecognizer;
    } else if (type === definition.GestureTypes.swipe) {
        nativeType = UISwipeGestureRecognizer;
    } else if (type === definition.GestureTypes.rotation) {
        nativeType = UIRotationGestureRecognizer;
    } else if (type === definition.GestureTypes.longPress) {
        nativeType = UILongPressGestureRecognizer;
    } else if (type === definition.GestureTypes.touch) {
        nativeType = TouchGestureRecognizer;
    }

    return nativeType;
}

function getState(recognizer: UIGestureRecognizer) {
    if (recognizer.state === UIGestureRecognizerState.UIGestureRecognizerStateBegan) {
        return common.GestureStateTypes.began;
    } else if (recognizer.state === UIGestureRecognizerState.UIGestureRecognizerStateCancelled) {
        return common.GestureStateTypes.cancelled;
    } else if (recognizer.state === UIGestureRecognizerState.UIGestureRecognizerStateChanged) {
        return common.GestureStateTypes.changed;
    } else if (recognizer.state === UIGestureRecognizerState.UIGestureRecognizerStateEnded) {
        return common.GestureStateTypes.ended;
    }
}

function _getSwipeDirection(direction: UISwipeGestureRecognizerDirection): definition.SwipeDirection {
    if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionDown) {
        return definition.SwipeDirection.down;
    } else if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionLeft) {
        return definition.SwipeDirection.left;
    } else if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionRight) {
        return definition.SwipeDirection.right;
    } else if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionUp) {
        return definition.SwipeDirection.up;
    }
}

function _getPinchData(args: definition.GestureEventData): definition.PinchGestureEventData {
    var recognizer = <UIPinchGestureRecognizer>args.ios;
    var center = recognizer.locationInView(args.view._nativeView);

    return <definition.PinchGestureEventData>{
        type: args.type,
        view: args.view,
        ios: args.ios,
        android: undefined,
        scale: recognizer.scale,
        getFocusX: () => { return center.x; },
        getFocusY: () => { return center.y; },
        object: args.view,
        eventName: definition.toString(args.type),
        state: getState(recognizer)
    };
}

function _getSwipeData(args: definition.GestureEventData): definition.SwipeGestureEventData {
    var recognizer = <UISwipeGestureRecognizer>args.ios;

    return <definition.SwipeGestureEventData>{
        type: args.type,
        view: args.view,
        ios: args.ios,
        android: undefined,
        direction: _getSwipeDirection(recognizer.direction),
        object: args.view,
        eventName: definition.toString(args.type),
    };
}

function _getPanData(args: definition.GestureEventData, view: UIView): definition.PanGestureEventData {
    var recognizer = <UIPanGestureRecognizer>args.ios;
    return <definition.PanGestureEventData>{
        type: args.type,
        view: args.view,
        ios: args.ios,
        android: undefined,
        deltaX: recognizer.translationInView(view).x,
        deltaY: recognizer.translationInView(view).y,
        object: args.view,
        eventName: definition.toString(args.type),
        state: getState(recognizer)
    };
}

function _getRotationData(args: definition.GestureEventData): definition.RotationGestureEventData {
    var recognizer = <UIRotationGestureRecognizer>args.ios;
    return <definition.RotationGestureEventData>{
        type: args.type,
        view: args.view,
        ios: args.ios,
        android: undefined,
        rotation: recognizer.rotation * (180.0 / Math.PI),
        object: args.view,
        eventName: definition.toString(args.type),
        state: getState(recognizer)
    };
}

class TouchGestureRecognizer extends UIGestureRecognizer {
    public observer: GesturesObserver;
    private _eventData: TouchGestureEventData;

    touchesBeganWithEvent(touches: NSSet, event: any): void {
        this.executeCallback(common.TouchAction.down, touches, event);
    }

    touchesMovedWithEvent(touches: NSSet, event: any): void {
        this.executeCallback(common.TouchAction.move, touches, event);
    }

    touchesEndedWithEvent(touches: NSSet, event: any): void {
        this.executeCallback(common.TouchAction.up, touches, event);
    }

    touchesCancelledWithEvent(touches: NSSet, event: any): void {
        this.executeCallback(common.TouchAction.cancel, touches, event);
    }

    private executeCallback(action: string, touches: NSSet, event: any): void {
        if (!this._eventData) {
            this._eventData = new TouchGestureEventData();
        }

        this._eventData.prepare(this.observer.target, action, touches, event);
        this.observer._executeCallback(this._eventData);
    }
}

class Pointer implements definition.Pointer {
    public android: any = undefined;
    public ios: UITouch = undefined;

    private _view: view.View;

    private _location: CGPoint;
    private get location(): CGPoint {
        if (!this._location) {
            this._location = this.ios.locationInView(this._view._nativeView);
        }

        return this._location;
    }

    constructor(touch: UITouch, targetView: view.View) {
        this.ios = touch;
        this._view = targetView;
    }

    getX(): number {
        return this.location.x;
    }

    getY(): number {
        return this.location.x;
    }
}

class TouchGestureEventData implements definition.TouchGestureEventData {
    eventName: string = definition.toString(definition.GestureTypes.touch);
    type: definition.GestureTypes = definition.GestureTypes.touch;
    android: any = undefined;
    action: string;
    view: view.View;
    ios: { touches: NSSet, event: { allTouches: () => NSSet } };
    object: any;

    private _activePointers: Array<Pointer>;
    private _allPointers: Array<Pointer>;
    private _mainPointer: UITouch;

    public prepare(view: view.View, action: string, touches: NSSet, event: any) {
        this.action = action;
        this.view = view;
        this.object = view;
        this.ios = {
            touches: touches,
            event: event
        };

        this._mainPointer = undefined;
        this._activePointers = undefined;
        this._allPointers = undefined;
    }

    getPointerCount(): number {
        return this.ios.event.allTouches().count;
    }

    private getMainPointer(): UITouch {
        if (types.isUndefined(this._mainPointer)) {
            this._mainPointer = this.ios.touches.anyObject();
        }
        return this._mainPointer;
    }

    getActivePointers(): Array<Pointer> {
        if (!this._activePointers) {
            this._activePointers = [];

            for (let i = 0, nsArr = this.ios.touches.allObjects; i < nsArr.count; i++) {
                this._activePointers.push(new Pointer(nsArr.objectAtIndex(i), this.view));
            }
        }

        return this._activePointers;
    }

    getAllPointers(): Array<Pointer> {
        if (!this._allPointers) {
            this._allPointers = [];

            let nsArr = this.ios.event.allTouches().allObjects;
            for (var i = 0; i < nsArr.count; i++) {
                this._allPointers.push(new Pointer(nsArr.objectAtIndex(i), this.view));
            }
        }

        return this._allPointers;
    }

    getX(): number {
        return this.getMainPointer().locationInView(this.view._nativeView).x;
    }

    getY(): number {
        return this.getMainPointer().locationInView(this.view._nativeView).y
    }
}