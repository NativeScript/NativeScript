import common = require("./time-picker-common");
import {Owned} from "utils/utils";

global.moduleMerge(common, exports);

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
            <Owned & android.widget.TimePicker.IOnTimeChangedListener>{
                get owner() {
                    return that.get();
                },

                onTimeChanged: function (picker: android.widget.TimePicker, hour: number, minute: number) {
                    if (this.owner) {
                        var validTime = common.getValidTime(this.owner, hour, minute);
                        this.owner._setNativeValueSilently(validTime.hour, validTime.minute);
                        this.owner._onPropertyChangedFromNative(common.TimePicker.timeProperty, new Date(0, 0, 0, validTime.hour, validTime.minute));
                    }
                }
            });
        this._android.setOnTimeChangedListener(this._listener);

        var c = java.util.Calendar.getInstance();

        if (this.hour === common.TimePicker.hourProperty.metadata.defaultValue) {
            this.hour = c.get(java.util.Calendar.HOUR_OF_DAY);
        }

        if (this.minute === common.TimePicker.minuteProperty.metadata.defaultValue) {
            this.minute = c.get(java.util.Calendar.MINUTE);
        }

        var validTime = common.getValidTime(this, this.hour, this.minute);
        this._setNativeValueSilently(validTime.hour, validTime.minute);
    }

    private _setNativeValueSilently(hour: number, minute: number) {
        if (this.android) {
            this.android.setOnTimeChangedListener(null);

            this.android.setCurrentHour(new java.lang.Integer(hour));
            this.android.setCurrentMinute(new java.lang.Integer(minute));

            this.minute = minute;
            this.hour = hour;
            
            this.android.setOnTimeChangedListener(this._listener);
        }
    }

    public _setNativeTime() {
        this._setNativeValueSilently(this.hour, this.minute);
    }
} 
