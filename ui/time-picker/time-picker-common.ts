import definition = require("ui/time-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");
import types = require("utils/types");

function isHourValid(value: number): boolean {
    return types.isNumber(value) && value >= 0 && value <= 23;
}

function isMinuteValid(value: number): boolean {
    return types.isNumber(value) && value >= 0 && value <= 59;
}

function isMinuteIntervalValid(value: number): boolean {
    return types.isNumber(value) && value >= 1 && value <= 30 && 60 % value === 0;
}

export interface Time {
    hour: number;
    minute: number;
}

function getMinutes(hour: number): number {
    return hour * 60;
}

export function isGreaterThanMinTime(picker: definition.TimePicker, hour?: number, minute?: number): boolean {
    if (!types.isDefined(picker.minHour) || !types.isDefined(picker.minMinute)) {
        return true;
    }
    return getMinutes(types.isDefined(hour) ? hour : picker.hour) + (types.isDefined(minute) ? minute : picker.minute) >= getMinutes(picker.minHour) + picker.minMinute;
}

export function isLessThanMaxTime(picker: definition.TimePicker, hour?: number, minute?: number): boolean {
    if (!types.isDefined(picker.maxHour) || !types.isDefined(picker.maxMinute)) {
        return true;
    }
    return getMinutes(types.isDefined(hour) ? hour : picker.hour) + (types.isDefined(minute) ? minute : picker.minute) <= getMinutes(picker.maxHour) + picker.maxMinute;
}

export function isValidTime(picker: definition.TimePicker): boolean {
    return isGreaterThanMinTime(picker) && isLessThanMaxTime(picker);
}

export function getValidTime(picker: definition.TimePicker, hour: number, minute: number): Time {
    if (picker.minuteInterval > 1) {
        let minuteFloor = minute - (minute % picker.minuteInterval);
        minute = minuteFloor + (minute === minuteFloor + 1 ? picker.minuteInterval : 0);

        if (minute === 60) {
            hour++;
            minute = 0;
        }
    }

    let time = { hour: hour, minute: minute };

    if (!isGreaterThanMinTime(picker, hour, minute)) {
        time = { hour: picker.minHour, minute: picker.minMinute };
    }

    if (!isLessThanMaxTime(picker, hour, minute)) {
        time = { hour: picker.maxHour, minute: picker.maxMinute };
    }

    return time;
}

function toString(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
}

function getMinMaxTimeErrorMessage(picker: definition.TimePicker): string {
    return `Min time: (${toString(picker.minHour) }:${toString(picker.minMinute) }), max time: (${toString(picker.maxHour) }:${toString(picker.maxMinute) })`;
}

function getErrorMessage(picker: definition.TimePicker, propertyName: string, newValue: number): string {
    return `${propertyName} property value (${toString(newValue) }:${toString(picker.minute) }) is not valid. ${getMinMaxTimeErrorMessage(picker) }.`;
}

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    if (isValidTime(picker)) {
        picker._setNativeTime();
        if (picker.time) {
            picker.time.setHours(picker.hour);
        }
        else {
            picker.time = new Date(0, 0, 0, picker.hour, picker.minute);
        }
    } else {
        throw new Error(getErrorMessage(picker, "Hour", data.newValue));
    }
}

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    if (isValidTime(picker)) {
        picker._setNativeTime();
        if (picker.time) {
            picker.time.setMinutes(picker.minute);
        }
        else {
            picker.time = new Date(0, 0, 0, picker.hour, picker.minute);
        }
    } else {
        throw new Error(getErrorMessage(picker, "Minute", data.newValue));
    }
}

function onTimePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;
    
    let newTime = <Date>data.newValue;
    picker.hour = newTime.getHours();
    picker.minute = newTime.getMinutes();

    if (isValidTime(picker)) {
        picker._setNativeTime();
    } else {
        throw new Error(getErrorMessage(picker, "Time", data.newValue));
    }
}

function onMinMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    if (isValidTime(picker)) {
        picker._setNativeMinTime();
    } else {
        throw new Error(getErrorMessage(picker, "Minute", data.newValue));
    }
}

function onMaxMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    if (isValidTime(picker)) {
        picker._setNativeMaxTime();
    } else {
        throw new Error(getErrorMessage(picker, "Minute", data.newValue));
    }
}

function onMinHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    if (isValidTime(picker)) {
        picker._setNativeMinTime();
    } else {
        throw new Error(getErrorMessage(picker, "Hour", data.newValue));
    }
}

function onMaxHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    if (isValidTime(picker)) {
        picker._setNativeMaxTime();
    } else {
        throw new Error(getErrorMessage(picker, "Hour", data.newValue));
    }
}

function onMinuteIntervalPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <definition.TimePicker>data.object;

    picker._setNativeMinuteIntervalTime();
}

export class TimePicker extends view.View implements definition.TimePicker {
    public static hourProperty = new dependencyObservable.Property("hour", "TimePicker",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, onHourPropertyChanged, isHourValid));

    public static minHourProperty = new dependencyObservable.Property("minHour", "TimePicker",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, onMinHourPropertyChanged, isHourValid));

    public static maxHourProperty = new dependencyObservable.Property("maxHour", "TimePicker",
        new proxy.PropertyMetadata(23, dependencyObservable.PropertyMetadataSettings.None, onMaxHourPropertyChanged, isHourValid));

    public static minuteProperty = new dependencyObservable.Property("minute", "TimePicker",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, onMinutePropertyChanged, isMinuteValid));

    public static minMinuteProperty = new dependencyObservable.Property("minMinute", "TimePicker",
        new proxy.PropertyMetadata(0, dependencyObservable.PropertyMetadataSettings.None, onMinMinutePropertyChanged, isMinuteValid));

    public static maxMinuteProperty = new dependencyObservable.Property("maxMinute", "TimePicker",
        new proxy.PropertyMetadata(59, dependencyObservable.PropertyMetadataSettings.None, onMaxMinutePropertyChanged, isMinuteValid));

    public static minuteIntervalProperty = new dependencyObservable.Property("minuteInterval", "TimePicker",
        new proxy.PropertyMetadata(1, dependencyObservable.PropertyMetadataSettings.None, onMinuteIntervalPropertyChanged, isMinuteIntervalValid));
        
    public static timeProperty = new dependencyObservable.Property("time", "TimePicker",
        new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.None, onTimePropertyChanged, isValidTime));

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
    
    get time(): Date {
        return this._getValue(TimePicker.timeProperty);
    }
    set time(value: Date) {
        this._setValue(TimePicker.timeProperty, value);
    }

    get minuteInterval(): number {
        return this._getValue(TimePicker.minuteIntervalProperty);
    }
    set minuteInterval(value: number) {
        this._setValue(TimePicker.minuteIntervalProperty, value);
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

    public _setNativeTime() {
        //
    }

    public _setNativeMinTime() {
        //
    }

    public _setNativeMaxTime() {
        //
    }

    public _setNativeMinuteIntervalTime() {
        //
    }
} 