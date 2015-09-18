import common = require("ui/switch/switch-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils")

function onCheckedPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var swtch = <Switch>data.object;
    if (!swtch.android) {
        return;
    }

    swtch.android.setChecked(data.newValue);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Switch.checkedProperty.metadata).onSetNativeValue = onCheckedPropertyChanged;

global.moduleMerge(common, exports);

export class Switch extends common.Switch {
    private _android: android.widget.Switch;

    get android(): android.widget.Switch {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.Switch(this._context);

        var that = new WeakRef(this);

        this._android.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener(<utils.Owned & android.widget.CompoundButton.IOnCheckedChangeListener>{
            get owner() {
                return that.get();
            },

            onCheckedChanged: function (sender, isChecked) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.Switch.checkedProperty, isChecked);
                }
            }
        }));
    }
} 
