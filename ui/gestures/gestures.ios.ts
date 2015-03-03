import common = require("ui/gestures/gestures-common");
import definition = require("ui/gestures");
import view = require("ui/core/view");

//var OWNER = "_owner";
//var CALLBACK = "_callback";
//var TYPE = "_type";
//var TARGET = "_target";

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

class UIGestureRecognizerImpl extends NSObject {
    static new(): UIGestureRecognizerImpl {
        return <UIGestureRecognizerImpl>super.new();
    }

    private _owner: GesturesObserver;
    private _type: any;
    private _callback: Function;

    public initWithOwnerTypeCallback(owner: GesturesObserver, type: any, callback?: Function): UIGestureRecognizerImpl {
        this._owner = owner;
        this._type = type;
        if (callback) {
            this._callback = callback;
        }

        return this;
    }

    public static ObjCExposedMethods = {
        "recognize": { returns: interop.types.void, params: [UIGestureRecognizer] }
    };

    public recognize(recognizer: UIGestureRecognizer): void {
        var callback = this._callback ? this._callback : this._owner._callback;
        var type = this._type;
        var target = this._owner._target;

        var args = {
            type: type,
            view: target,
            ios: recognizer,
            android: undefined
        };

        if (callback) {
            callback(args);
        }
    }
}

export class GesturesObserver implements definition.GesturesObserver {
    public _callback: (args: definition.GestureEventData) => void;
    public _target: view.View;
    private _recognizers: {};

    constructor(callback: (args: definition.GestureEventData) => void) {
        this._callback = callback;
        this._recognizers = {};
    }

    public observe(target: view.View, type: definition.GestureTypes) {
        this.disconnect();

        this._target = target;

        if (this._target && this._target.ios && this._target.ios.addGestureRecognizer) {
            var nativeView = <UIView>this._target.ios;

            if (type & definition.GestureTypes.Tap) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.Tap));
            }

            if (type & definition.GestureTypes.DoubleTap) {
                var r = <UITapGestureRecognizer>this._createRecognizer(definition.GestureTypes.DoubleTap);
                r.numberOfTapsRequired = 2;

                nativeView.addGestureRecognizer(r);
            }

            if (type & definition.GestureTypes.Pinch) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.Pinch, args => {
                    this._executeCallback(_getPinchData(args));
                }));
            }

            if (type & definition.GestureTypes.Pan) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.Pan, args => {
                    this._executeCallback(_getPanData(args, this._target.ios));
                }));
            }

            if (type & definition.GestureTypes.Swipe) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.Swipe, args => {
                    this._executeCallback(_getSwipeData(args));
                }));
            }

            if (type & definition.GestureTypes.Rotation) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.Rotation, args => {
                    this._executeCallback(_getRotationData(args));
                }));
            }

            if (type & definition.GestureTypes.LongPress) {
                nativeView.addGestureRecognizer(this._createRecognizer(definition.GestureTypes.LongPress));
            }
        }
    }

    public disconnect() {
        if (this._target && this._target.ios) {

            for (var name in this._recognizers) {
                if (this._recognizers.hasOwnProperty(name)) {
                    var item = <RecognizerCache>this._recognizers[name];
                    this._target.ios.removeGestureRecognizer(item.recognizer);

                    item.recognizer = null;
                    item.target = null;
                }
            }

            this._recognizers = {};
        }

        this._target = null;
    }

    private _executeCallback(args: definition.GestureEventData) {
        if (this._callback) {
            this._callback(args);
        }
    }

    private _createRecognizer(type: definition.GestureTypes, callback?: (args: definition.GestureEventData) => void): UIGestureRecognizer {
        var recognizer: UIGestureRecognizer;
        var name = definition.toString(type);
        var target = _createUIGestureRecognizerTarget(this, type, callback);
        var recognizerType = _getUIGestureRecognizerType(type);

        if (recognizerType) {
            recognizer = recognizerType.alloc().initWithTargetAction(target, "recognize");
            if (recognizer) {
                this._recognizers[name] = <RecognizerCache>{ recognizer: recognizer, target: target };
            }
        }

        return recognizer;
    }
}

function _createUIGestureRecognizerTarget(owner: GesturesObserver, type: definition.GestureTypes, callback?: (args: definition.GestureEventData) => void): any {
    return UIGestureRecognizerImpl.new().initWithOwnerTypeCallback(owner, type, callback);
}

interface RecognizerCache {
    recognizer: UIGestureRecognizer;
    target: any;
}

function _getUIGestureRecognizerType(type: definition.GestureTypes): any {
    var nativeType = null;

    if (type === definition.GestureTypes.Tap) {
        nativeType = UITapGestureRecognizer;
    } else if (type === definition.GestureTypes.DoubleTap) {
        nativeType = UITapGestureRecognizer;
    } else if (type === definition.GestureTypes.Pinch) {
        nativeType = UIPinchGestureRecognizer;
    } else if (type === definition.GestureTypes.Pan) {
        nativeType = UIPanGestureRecognizer;
    } else if (type === definition.GestureTypes.Swipe) {
        nativeType = UISwipeGestureRecognizer;
    } else if (type === definition.GestureTypes.Rotation) {
        nativeType = UIRotationGestureRecognizer;
    } else if (type === definition.GestureTypes.LongPress) {
        nativeType = UILongPressGestureRecognizer;
    }

    return nativeType;
}

function _getSwipeDirection(direction: UISwipeGestureRecognizerDirection): definition.SwipeDirection {
    if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionDown) {
        return definition.SwipeDirection.Down;
    } else if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionLeft) {
        return definition.SwipeDirection.Left;
    } else if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionRight) {
        return definition.SwipeDirection.Right;
    } else if (direction === UISwipeGestureRecognizerDirection.UISwipeGestureRecognizerDirectionUp) {
        return definition.SwipeDirection.Up;
    }
}

function _getPinchData(args: definition.GestureEventData): definition.PinchGestureEventData {
    var recognizer = <UIPinchGestureRecognizer>args.ios;
    return <definition.PinchGestureEventData>{
        type: args.type,
        view: args.view,
        ios: args.ios,
        android: undefined,
        scale: recognizer.scale,
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
        deltaY: recognizer.translationInView(view).y
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
    };
}
