import common = require("ui/switch/switch-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onCheckedPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var swtch = <Switch>data.object;
    if (!swtch.android) {
        return;
    }

    swtch.android.setChecked(data.newValue);
}

// register the setNativeValue callbacks
(<proxy.PropertyMetadata>common.Switch.checkedProperty.metadata).onSetNativeValue = onCheckedPropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class Switch extends common.Switch {
    private _android: android.widget.Switch;

    get android(): android.widget.Switch {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.Switch(this._context);

        var that = new WeakRef(this);

        this._android.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener({
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