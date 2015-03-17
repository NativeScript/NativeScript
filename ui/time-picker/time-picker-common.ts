import definition = require("ui/time-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");

export class TimePicker extends view.View implements definition.TimePicker {
    public static hourProperty = new dependencyObservable.Property("hour", "TimePicker", new proxy.PropertyMetadata(undefined));
    public static minuteProperty = new dependencyObservable.Property("minute", "TimePicker", new proxy.PropertyMetadata(undefined));

    constructor() {
        super();
    }

    get hour(): number {
        return this._getValue(TimePicker.hourProperty);
    }
    set hour(value: number) {
        this._setValue(TimePicker.hourProperty, value);
    }

    get minute(): number {
        return this._getValue(TimePicker.minuteProperty);
    }
    set minute(value: number) {
        this._setValue(TimePicker.minuteProperty, value);
    }
} 