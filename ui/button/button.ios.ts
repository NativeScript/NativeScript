import common = require("./button-common");
import stateChanged = require("ui/core/control-state-change");

class TapHandlerImpl extends NSObject {
    private _owner: WeakRef<Button>;

    public static initWithOwner(owner: WeakRef<Button>): TapHandlerImpl {
        let handler = <TapHandlerImpl>TapHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public tap(args) {
        let owner = this._owner.get();
        if (owner) {
            owner._emit(common.Button.tapEvent);
        }
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}

global.moduleMerge(common, exports);

export class Button extends common.Button {
    private _ios: UIButton;
    private _tapHandler: NSObject;
    private _stateChangedHandler: stateChanged.ControlStateChangeListener;

    constructor() {
        super();
        this._ios = UIButton.buttonWithType(UIButtonType.UIButtonTypeSystem);

        this._tapHandler = TapHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._tapHandler, "tap", UIControlEvents.UIControlEventTouchUpInside);

        this._stateChangedHandler = new stateChanged.ControlStateChangeListener(this._ios, (s: string) => {
            this._goToVisualState(s);
        });
    }

    get ios(): UIButton {
        return this._ios;
    }
} 
