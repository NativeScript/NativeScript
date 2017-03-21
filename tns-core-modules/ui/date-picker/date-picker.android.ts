import {
    DatePickerBase, yearProperty, monthProperty, dayProperty,
    dateProperty, maxDateProperty, minDateProperty
} from "./date-picker-common";

export * from "./date-picker-common";

interface DateChangedListener {
    new (owner: DatePicker): android.widget.DatePicker.OnDateChangedListener;
}

let DateChangedListener: DateChangedListener;

function initializeDateChangedListener(): void {
    if (DateChangedListener) {
        return;
    }

    @Interfaces([android.widget.DatePicker.OnDateChangedListener])
    class DateChangedListenerImpl extends java.lang.Object implements android.widget.DatePicker.OnDateChangedListener {
        constructor(public owner: DatePicker) {
            super()
            return global.__native(this);
        }

        onDateChanged(picker: android.widget.DatePicker, year: number, month: number, day: number) {
            const owner = this.owner;
            let dateIsChanged = false;
            if (year !== owner.year) {
                yearProperty.nativeValueChange(owner, year);
                dateIsChanged = true;
            }

            if ((month + 1) !== owner.month) {
                monthProperty.nativeValueChange(owner, month + 1);
                dateIsChanged = true;
            }

            if (day !== owner.day) {
                dayProperty.nativeValueChange(owner, day);
                dateIsChanged = true;
            }

            if (dateIsChanged) {
                dateProperty.nativeValueChange(owner, new Date(year, month, day));
            }
        }
    }

    DateChangedListener = DateChangedListenerImpl;
}

export class DatePicker extends DatePickerBase {
    private _android: android.widget.DatePicker;
    public _listener: android.widget.DatePicker.OnDateChangedListener;

    get android(): android.widget.DatePicker {
        return this._android;
    }

    public _createNativeView() {
        initializeDateChangedListener();
        const picker = this._android = new android.widget.DatePicker(this._context);
        picker.setCalendarViewShown(false);
        this._listener = this._listener = new DateChangedListener(this);
        picker.init(0, 0, 0, this._listener);
        return picker;
    }

    private updateNativeDate(): void {
        const year = typeof this.year === "number" ? this.year : this.android.getYear();
        const month = typeof this.month === "number" ? (this.month - 1) : this.android.getMonth();
        const day = typeof this.day === "number" ? this.day : this.android.getDayOfMonth();
        this.date = new Date(year, month, day);
    }

    [yearProperty.getDefault](): number {
        return this.android.getYear();
    }
    [yearProperty.setNative](value: number) {
        if (this.android.getYear() !== value) {
            this.updateNativeDate();
        }
    }

    [monthProperty.getDefault](): number {
        return this.android.getMonth();
    }
    [monthProperty.setNative](value: number) {
        if (this.android.getMonth() !== (value - 1)) {
            this.updateNativeDate();
        }
    }

    [dayProperty.getDefault](): number {
        return this.android.getDayOfMonth();
    }
    [dayProperty.setNative](value: number) {
        if (this.android.getDayOfMonth() !== value) {
            this.updateNativeDate();
        }
    }

    [dateProperty.getDefault](): Date {
        return new Date(this.android.getYear(), this.android.getMonth(), this.android.getDayOfMonth());
    }
    [dateProperty.setNative](value: Date) {
        if (this.android.getDayOfMonth() !== value.getDay()
            || this.android.getMonth() !== value.getMonth()
            || this.android.getYear() !== value.getFullYear()) {
            this.android.updateDate(value.getFullYear(), value.getMonth(), value.getDate());
        }
    }

    [maxDateProperty.getDefault](): Date {
        return this.android.getMaxDate();
    }
    [maxDateProperty.setNative](value: Date) {
        let newValue = value.getTime();
        if (this.android.getMaxDate() !== newValue) {
            this.android.setMaxDate(newValue);
        }
    }

    [minDateProperty.getDefault](): Date {
        return this.android.getMinDate();
    }
    [minDateProperty.setNative](value: Date) {
        let picker = this.android;
        let newValue = value.getTime();
        if (picker.getMinDate() !== newValue) {
            picker.setMinDate(newValue);
        }
    }
}