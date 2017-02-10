import { TimePickerBase, getValidTime, timeProperty, hourProperty, minuteProperty } from "./time-picker-common";

export * from "./time-picker-common";

@Interfaces([android.widget.TimePicker.OnTimeChangedListener])
class TimeChangedListener extends java.lang.Object implements android.widget.TimePicker.OnTimeChangedListener {
    constructor(public owner: WeakRef<TimePicker>) {
        super();
        return global.__native(this);
    }

    onTimeChanged(picker: android.widget.TimePicker, hour: number, minute: number): void {
        let timePicker = this.owner.get();
        if (timePicker) {
            let validTime = getValidTime(timePicker, hour, minute);
            timePicker._setNativeValueSilently(validTime.hour, validTime.minute);
            timeProperty.nativeValueChange(timePicker, new Date(0, 0, 0, validTime.hour, validTime.minute));
        }
    }
}

export class TimePicker extends TimePickerBase {
    private _android: android.widget.TimePicker;
    private _listener: android.widget.TimePicker.OnTimeChangedListener;

    public _createNativeView() {
        this._android = new android.widget.TimePicker(this._context);
        this._listener = this._listener || new TimeChangedListener(new WeakRef(this));
        this._android.setOnTimeChangedListener(this._listener);

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

    get android(): android.widget.TimePicker {
        return this._android;
    }

    public _setNativeValueSilently(hour: number, minute: number) {
        if (this._android) {
            this._android.setOnTimeChangedListener(null);

            this._android.setCurrentHour(new java.lang.Integer(hour));
            this._android.setCurrentMinute(new java.lang.Integer(minute));

            this.minute = minute;
            this.hour = hour;

            this._android.setOnTimeChangedListener(this._listener);
        }
    }

    public _setNativeTime() {
        this._setNativeValueSilently(this.hour, this.minute);
    }

    get [timeProperty.native](): Date {
        let nativeView = this._android;
        return new Date(0, 0, 0, nativeView.getCurrentHour().intValue(), nativeView.getCurrentMinute().intValue());
    }
    set [timeProperty.native](value: Date) {
        this._setNativeValueSilently(this.hour, this.minute);
    }

    get [minuteProperty.native](): number {
        return this._android.getCurrentMinute().intValue();
    }
    set [minuteProperty.native](value: number) {
        this._setNativeValueSilently(this.hour, value);
    }

    get [hourProperty.native](): number {
        return this._android.getCurrentHour().intValue()
    }
    set [hourProperty.native](value: number) {
        this._setNativeValueSilently(value, this.minute);
    }
}