import definition = require("ui/time-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");
import types = require("utils/types");

function isHourValid(value: number): boolean {
    return types.isNumber(value) && value >= 1 && value <= 24;
}

function isMinuteValid(value: number): boolean {
    return types.isNumber(value) && value >= 0 && value <= 59;
}

export function getValidHour(hour: number, minHour: number, maxHour: number): number {
    let hourValue = hour;

    if (minHour && hour < minHour) {
        hourValue = minHour
    }

    if (maxHour && hour > maxHour) {
        hourValue = maxHour
    }

    return hourValue;
}

export function getValidMinute(minute: number, minMinute: number, maxMinute: number): number {
    let minuteValue = minute;

    if (minMinute && minute < minMinute) {
        minuteValue = minMinute
    }

    if (maxMinute && minute > maxMinute) {
        minuteValue = maxMinute
    }

    return minuteValue;
}

export class TimePicker extends view.View implements definition.TimePicker {
    public static hourProperty = new dependencyObservable.Property("hour", "TimePicker",
        new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, undefined, isHourValid));

    public static minHourProperty = new dependencyObservable.Property("minHour", "TimePicker",
        new proxy.PropertyMetadata(1, dependencyObservable.PropertyMetadataSettings.None, undefined, isHourValid));

    public static maxHourProperty = new dependencyObservable.Property("maxHour", "TimePicker",
        new proxy.PropertyMetadata(24, dependencyObservable.PropertyMetadataSettings.None, undefined, isHourValid));

    public static minuteProperty = new dependencyObservable.Property("minute", "TimePicker",
        new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, undefined, isMinuteValid));

    public static minMinuteProperty = new dependencyObservable.Property("minMinute", "TimePicker",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, undefined, isMinuteValid));

    public static maxMinuteProperty = new dependencyObservable.Property("maxMinute", "TimePicker",
        new proxy.PropertyMetadata(59, dependencyObservable.PropertyMetadataSettings.None, undefined, isMinuteValid));

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

    get maxHour(): number {
        return this._getValue(TimePicker.maxHourProperty);
    }
    set maxHour(value: number) {
        this._setValue(TimePicker.maxHourProperty, value);
    }

    get maxMinute(): number {
        return this._getValue(TimePicker.maxMinuteProperty);
    }
    set maxMinute(value: number) {
        this._setValue(TimePicker.maxMinuteProperty, value);
    }

    get minHour(): number {
        return this._getValue(TimePicker.minHourProperty);
    }
    set minHour(value: number) {
        this._setValue(TimePicker.minHourProperty, value);
    }

    get minMinute(): number {
        return this._getValue(TimePicker.minMinuteProperty);
    }
    set minMinute(value: number) {
        this._setValue(TimePicker.minMinuteProperty, value);
    }
} 