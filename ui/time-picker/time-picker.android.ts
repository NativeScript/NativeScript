import common = require("ui/time-picker/time-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    if (picker.android) {
        picker.android.setCurrentHour(new java.lang.Integer(data.newValue));
    }
}

(<proxy.PropertyMetadata>common.TimePicker.hourProperty.metadata).onSetNativeValue = onHourPropertyChanged;

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    if (picker.android) {
        picker.android.setCurrentMinute(new java.lang.Integer(data.newValue));
    }
}

(<proxy.PropertyMetadata>common.TimePicker.minuteProperty.metadata).onSetNativeValue = onMinutePropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class TimePicker extends common.TimePicker {
    private _android: android.widget.TimePicker;

    get android(): android.widget.TimePicker {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.TimePicker(this._context);

        var that = new WeakRef(this);

        this._android.setOnTimeChangedListener(new android.widget.TimePicker.OnTimeChangedListener({
            get owner() {
                return that.get();
            },

            onTimeChanged: function (picker: android.widget.TimePicker, hourOfDay: number, minute: number) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.TimePicker.hourProperty, hourOfDay);
                    this.owner._onPropertyChangedFromNative(common.TimePicker.minuteProperty, minute);
                }
            }
        }));
    }
} 