import { TimePickerBase, getValidTime, timeProperty, hourProperty, minuteProperty } from "./time-picker-common";
export * from "./time-picker-common";

@Interfaces([android.widget.TimePicker.OnTimeChangedListener])
class TimeChangedListener implements android.widget.TimePicker.OnTimeChangedListener {
    constructor(public owner: WeakRef<TimePicker>) { }

    onTimeChanged(picker: android.widget.TimePicker, hour: number, minute: number) {
        let timePicker = this.owner.get();
        if (timePicker) {
            let validTime = getValidTime(timePicker, hour, minute);
            timePicker._setNativeValueSilently(validTime.hour, validTime.minute);
            timePicker.nativePropertyChanged(timeProperty, new Date(0, 0, 0, validTime.hour, validTime.minute));
        }
    }
}

export class TimePicker extends TimePickerBase {
    public nativeView: android.widget.TimePicker;
    private _listener: android.widget.TimePicker.OnTimeChangedListener;

    public _createUI() {
        this.nativeView = new android.widget.TimePicker(this._context);
        this._listener = new TimeChangedListener(new WeakRef(this));
        this.nativeView.setOnTimeChangedListener(this._listener);

        let c = java.util.Calendar.getInstance();
        if (this.hour === 0) {
            this.hour = c.get(java.util.Calendar.HOUR_OF_DAY);
        }

        if (this.minute === 0) {
            this.minute = c.get(java.util.Calendar.MINUTE);
        }

        let validTime = getValidTime(this, this.hour, this.minute);
        this._setNativeValueSilently(validTime.hour, validTime.minute);
    }

    public _setNativeValueSilently(hour: number, minute: number) {
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

    get [timeProperty.native](): Date {
        let nativeView = this.nativeView;
        return new Date(0, 0, 0, nativeView.getCurrentHour().intValue(), nativeView.getCurrentMinute().intValue());
    }
    set [timeProperty.native](value: Date) {
        this._setNativeValueSilently(this.hour, this.minute);
    }

    get [minuteProperty.native](): number {
        return this.nativeView.getCurrentMinute().intValue();
    }
    set [minuteProperty.native](value: number) {
        this._setNativeValueSilently(this.hour, value);
    }

    get [hourProperty.native](): number {
        return this.nativeView.getCurrentHour().intValue()
    }
    set [hourProperty.native](value: number) {
        this._setNativeValueSilently(value, this.minute);
    }
}