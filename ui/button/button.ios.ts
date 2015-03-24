import common = require("ui/button/button-common");
import stateChanged = require("ui/core/control-state-change");

class TapHandlerImpl extends NSObject {
    static new(): TapHandlerImpl {
        return <TapHandlerImpl>super.new();
    }

    private _owner: Button;

    public initWithOwner(owner: Button): TapHandlerImpl {
        this._owner = owner;
        return this;
    }

    public tap(args) {
        this._owner._emit(common.knownEvents.tap);
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class Button extends common.Button {
    private _ios: UIButton;
    private _tapHandler: NSObject;
    private _stateChangedHandler: stateChanged.ControlStateChangeListener;

    constructor() {
        super();
        this._ios = UIButton.buttonWithType(UIButtonType.UIButtonTypeSystem);

        this._tapHandler = TapHandlerImpl.new().initWithOwner(this);
        this._ios.addTargetActionForControlEvents(this._tapHandler, "tap", UIControlEvents.UIControlEventTouchUpInside);

        this._stateChangedHandler = new stateChanged.ControlStateChangeListener(this._ios, (s: string) => {
            this._goToVisualState(s);
        });
    }

    get ios(): UIButton {
        return this._ios;
    }
} 