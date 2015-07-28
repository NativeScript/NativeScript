import common = require("ui/switch/switch-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onCheckedPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var swtch = <Switch>data.object;
    swtch.ios.on = data.newValue;
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Switch.checkedProperty.metadata).onSetNativeValue = onCheckedPropertyChanged;

global.moduleMerge(common, exports);

class SwitchChangeHandlerImpl extends NSObject {
    static new(): SwitchChangeHandlerImpl {
        return <SwitchChangeHandlerImpl>super.new();
    }

    private _owner: Switch;

    public initWithOwner(owner: Switch): SwitchChangeHandlerImpl {
        this._owner = owner;
        return this;
    }

    public valueChanged(sender: UISwitch) {
        this._owner._onPropertyChangedFromNative(common.Switch.checkedProperty, sender.on);
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UISwitch] }
    };
}

export class Switch extends common.Switch {
    private _ios: UISwitch;
    private _handler: NSObject;

    constructor() {
        super();
        this._ios = new UISwitch();

        this._handler = SwitchChangeHandlerImpl.new().initWithOwner(this);
        this._ios.addTargetActionForControlEvents(this._handler, "valueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UISwitch {
        return this._ios;
    }
} 