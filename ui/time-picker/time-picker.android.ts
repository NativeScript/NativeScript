import common = require("./time-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils")
import types = require("utils/types")

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    var validValue = common.getValidHour(data.newValue, picker.minHour, picker.maxHour);
    if (validValue === data.newValue) {
        picker._setNativeValueSilently(data.newValue, picker.minute);
    } else {
        throw new Error(`Hour property value (${data.newValue}) is not valid. Min value: (${picker.minHour} ), max value: (${picker.maxHour} ).`);
    }
}

(<proxy.PropertyMetadata>common.TimePicker.hourProperty.metadata).onSetNativeValue = onHourPropertyChanged;

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    var validValue = common.getValidMinute(data.newValue, picker.minMinute, picker.maxMinute);
    if (validValue === data.newValue) {
        picker._setNativeValueSilently(picker.hour, data.newValue);
    } else {
        throw new Error(`Minute property value (${data.newValue}) is not valid. Min value: (${picker.minMinute} ), max value: (${picker.maxMinute} ).`);
    }
}

(<proxy.PropertyMetadata>common.TimePicker.minuteProperty.metadata).onSetNativeValue = onMinutePropertyChanged;

global.moduleMerge(common, exports);

var SDK = android.os.Build.VERSION.SDK_INT;

export class TimePicker extends common.TimePicker {
    private _android: android.widget.TimePicker;
    private _listener: android.widget.TimePicker.OnTimeChangedListener;

    get android(): android.widget.TimePicker {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.TimePicker(this._context);

        var that = new WeakRef(this);

        this._listener = new android.widget.TimePicker.OnTimeChangedListener(
            <utils.Owned & android.widget.TimePicker.IOnTimeChangedListener>{
                get owner() {
                    return that.get();
                },

                onTimeChanged: function (picker: android.widget.TimePicker, hour: number, minute: number) {
                    if (this.owner) {

                        this.owner._setNativeValueSilently(hour, minute);

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

    public _setNativeValueSilently(hour: number, minute: number) {
        if (this.android) {
            this.android.setOnTimeChangedListener(null);

            if (types.isNumber(hour)) {
                var h = new java.lang.Integer(common.getValidHour(hour, this.minHour, this.maxHour));
                if (SDK >= 23) {
                    (<any>this.android).setHour(h);
                } else {
                    this.android.setCurrentHour(h);
                }
            }

            if (types.isNumber(minute)) {
                var m = new java.lang.Integer(common.getValidMinute(minute, this.minMinute, this.maxMinute));
                if (SDK >= 23) {
                    (<any>this.android).setMinute(m);
                } else {
                    this.android.setCurrentMinute(m);
                }
            }

            this.android.setOnTimeChangedListener(this._listener);
        }
    }
} 
