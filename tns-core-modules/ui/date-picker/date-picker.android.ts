import {
    DatePickerBase, yearProperty, monthProperty, dayProperty,
    dateProperty, maxDateProperty, minDateProperty
} from "./date-picker-common";

export * from "./date-picker-common";

@Interfaces([android.widget.DatePicker.OnDateChangedListener])
class DateChangedListener extends java.lang.Object implements android.widget.DatePicker.OnDateChangedListener {
    constructor(public owner: WeakRef<DatePicker>) {
        super()
        return global.__native(this);
    }

    onDateChanged(picker: android.widget.DatePicker, year: number, month: number, day: number) {
        let owner = this.owner.get();
        if (!owner) {
            return;
        }

        let dateIsChanged = false;
        if (year !== owner.year) {
            owner.nativePropertyChanged(yearProperty, year);
            dateIsChanged = true;
        }

        if ((month + 1) !== owner.month) {
            owner.nativePropertyChanged(monthProperty, month + 1);
            dateIsChanged = true;
        }

        if (day !== owner.day) {
            owner.nativePropertyChanged(dayProperty, day);
            dateIsChanged = true;
        }

        if (dateIsChanged) {
            owner.nativePropertyChanged(dateProperty, new Date(year, month, day));
        }
    }
}

export class DatePicker extends DatePickerBase {
    private _android: android.widget.DatePicker;
    public _listener: android.widget.DatePicker.OnDateChangedListener;
    public _datePicker: android.widget.DatePicker;

    get android(): android.widget.DatePicker {
        return this._android;
    }

    public _createUI() {        
        this._android = new android.widget.DatePicker(this._context);
        this._android.setCalendarViewShown(false);
        this._listener = this._listener = new DateChangedListener(new WeakRef(this));
        this._android.init(0, 0, 0, this._listener);
    }

    private updateNativeDate(): void {
        let year = typeof this.year === "number" ? this.year : this._datePicker.getYear();
        let month = typeof this.month === "number" ? (this.month - 1) : this._datePicker.getMonth();
        let day = typeof this.day === "number" ? this.day : this._datePicker.getDayOfMonth();
        this.date = new Date(year, month, day);
    }

    get [yearProperty.native](): number {
        return this._datePicker.getYear();
    }
    set [yearProperty.native](value: number) {
        let picker = this._datePicker;
        if (picker.getYear() !== value) {
            this.updateNativeDate();
        }
    }

    get [monthProperty.native](): number {
        return this._datePicker.getMonth();
    }
    set [monthProperty.native](value: number) {
        let picker = this._datePicker;
        if (picker.getMonth() !== (value - 1)) {
            this.updateNativeDate();
        }
    }

    get [dayProperty.native](): number {
        return this._datePicker.getDayOfMonth();
    }
    set [dayProperty.native](value: number) {
        let picker = this._datePicker;
        if (picker.getDayOfMonth() !== value) {
            this.updateNativeDate();
        }
    }

    get [dateProperty.native](): Date {
        let picker = this._datePicker;
        return new Date(picker.getYear(), picker.getMonth(), picker.getDayOfMonth());
    }
    set [dateProperty.native](value: Date) {
        let picker = this._datePicker;
        if (picker.getDayOfMonth() !== value.getDay()
            || picker.getMonth() !== value.getMonth()
            || picker.getYear() !== value.getFullYear()) {
            picker.updateDate(value.getFullYear(), value.getMonth(), value.getDate());
        }
    }

    get [maxDateProperty.native](): Date {
        return this._datePicker.getMaxDate();
    }
    set [maxDateProperty.native](value: Date) {
        let picker = this._datePicker;
        let newValue = value.getTime();
        if (picker.getMaxDate() !== newValue) {
            picker.setMaxDate(newValue);
        }
    }

    get [minDateProperty.native](): Date {
        return this._datePicker.getMinDate();
    }
    set [minDateProperty.native](value: Date) {
        let picker = this._datePicker;
        let newValue = value.getTime();
        if (picker.getMinDate() !== newValue) {
            picker.setMinDate(newValue);
        }
    }
}
