import common = require("ui/time-picker/time-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;
    picker._setNativeHourSilently(data.newValue);
}

(<proxy.PropertyMetadata>common.TimePicker.hourProperty.metadata).onSetNativeValue = onHourPropertyChanged;

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;
    picker._setNativeMinuteSilently(data.newValue);
}

(<proxy.PropertyMetadata>common.TimePicker.minuteProperty.metadata).onSetNativeValue = onMinutePropertyChanged;

global.moduleMerge(common, exports);

export class TimePicker extends common.TimePicker {
    private _android: android.widget.TimePicker;
    private _listener: android.widget.TimePicker.OnTimeChangedListener;
    private _isSettingTime: boolean = false;

    get android(): android.widget.TimePicker {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.TimePicker(this._context);

        var that = new WeakRef(this);

        this._listener = new android.widget.TimePicker.OnTimeChangedListener({
            get owner() {
                return that.get();
            },

            onTimeChanged: function (picker: android.widget.TimePicker, hour: number, minute: number) {
                if (this.owner && !this.owner._isSettingTime) {

                    if (hour !== this.owner.hour) {
                        this.owner._onPropertyChangedFromNative(common.TimePicker.hourProperty, hour);
                    }

                    if (minute !== this.owner.minute) {
                        this.owner._onPropertyChangedFromNative(common.TimePicker.minuteProperty, minute);
                    }
                }
            }
        });
        this._android.setOnTimeChangedListener(this._listener);
    }

    public _setNativeHourSilently(newValue: number) {
        if (!this.android) {
            return;
        }

        this._isSettingTime = true;
        try {
            this.android.setCurrentHour(new java.lang.Integer(newValue));
        }
        finally {
            this._isSettingTime = false;
        }
    }

    public _setNativeMinuteSilently(newValue: number) {
        if (!this.android) {
            return;
        }

        this._isSettingTime = true;
        try {
            this.android.setCurrentMinute(new java.lang.Integer(newValue));
        }
        finally {
            this._isSettingTime = false;
        }
    }
} 