import definition = require("ui/date-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");

export class DatePicker extends view.View implements definition.DatePicker {
    public static yearProperty = new dependencyObservable.Property("year", "DatePicker", new proxy.PropertyMetadata(0));
    public static monthProperty = new dependencyObservable.Property("month", "DatePicker", new proxy.PropertyMetadata(0));
    public static dayProperty = new dependencyObservable.Property("day", "DatePicker", new proxy.PropertyMetadata(0));

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
} 