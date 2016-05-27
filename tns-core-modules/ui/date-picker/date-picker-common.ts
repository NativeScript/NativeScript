import definition = require("ui/date-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");

export class DatePicker extends view.View implements definition.DatePicker {
    public static yearProperty = new dependencyObservable.Property("year", "DatePicker", new proxy.PropertyMetadata(undefined));
    public static monthProperty = new dependencyObservable.Property("month", "DatePicker", new proxy.PropertyMetadata(undefined));
    public static dayProperty = new dependencyObservable.Property("day", "DatePicker", new proxy.PropertyMetadata(undefined));
    public static maxDateProperty = new dependencyObservable.Property("maxDate", "DatePicker", new proxy.PropertyMetadata(undefined));
    public static minDateProperty = new dependencyObservable.Property("minDate", "DatePicker", new proxy.PropertyMetadata(undefined));
    public static dateProperty = new dependencyObservable.Property("date", "DatePicker", new proxy.PropertyMetadata(undefined));

    constructor() {
        super();
    }

    get year(): number {
        return this._getValue(DatePicker.yearProperty);
    }
    set year(value: number) {
        this._setValue(DatePicker.yearProperty, value);
    }

    get month(): number {
        return this._getValue(DatePicker.monthProperty);
    }
    set month(value: number) {
        this._setValue(DatePicker.monthProperty, value);
    }

    get day(): number {
        return this._getValue(DatePicker.dayProperty);
    }
    set day(value: number) {
        this._setValue(DatePicker.dayProperty, value);
    }

    get maxDate(): Date {
        return this._getValue(DatePicker.maxDateProperty);
    }
    set maxDate(value: Date) {
        this._setValue(DatePicker.maxDateProperty, value);
    }

    get minDate(): Date {
        return this._getValue(DatePicker.minDateProperty);
    }
    set minDate(value: Date) {
        this._setValue(DatePicker.minDateProperty, value);
    }
    
    get date(): Date {
        return this._getValue(DatePicker.dateProperty);
    }
    set date(value: Date) {
        this._setValue(DatePicker.dateProperty, value);
    }
} 