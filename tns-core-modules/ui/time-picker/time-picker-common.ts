import { TimePicker as TimePickerDefinition } from "ui/time-picker";
import { View, Property } from "ui/core/view";

export * from "ui/core/view";

interface Time {
    hour: number;
    minute: number;
}

export function getValidTime(picker: TimePickerDefinition, hour: number, minute: number): Time {
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

function isValidTime(picker: TimePickerDefinition): boolean {
    return isGreaterThanMinTime(picker) && isLessThanMaxTime(picker);
}

function isHourValid(value: number): boolean {
    return typeof value === "number" && value >= 0 && value <= 23;
}

function isMinuteValid(value: number): boolean {
    return typeof value === "number" && value >= 0 && value <= 59;
}

function isMinuteIntervalValid(value: number): boolean {
    return typeof value === "number" && value >= 1 && value <= 30 && 60 % value === 0;
}

function getMinutes(hour: number): number {
    return hour * 60;
}

export function isDefined(value: any): boolean {
    return typeof value !== "undefined";
}

function isGreaterThanMinTime(picker: TimePickerDefinition, hour?: number, minute?: number): boolean {

    if (typeof picker.minHour === undefined || typeof picker.minMinute === undefined) {
        return true;
    }
    return getMinutes(typeof hour !== "undefined" ? hour : picker.hour) + (typeof minute !== "undefined" ? minute : picker.minute) >= getMinutes(picker.minHour) + picker.minMinute;
}

function isLessThanMaxTime(picker: TimePickerDefinition, hour?: number, minute?: number): boolean {
    if (!isDefined(picker.maxHour) || !isDefined(picker.maxMinute)) {
        return true;
    }
    return getMinutes(isDefined(hour) ? hour : picker.hour) + (isDefined(minute) ? minute : picker.minute) <= getMinutes(picker.maxHour) + picker.maxMinute;
}

function toString(value: number | Date): string {
    if (value instanceof Date) {
        return value + "";
    }
    return value < 10 ? `0${value}` : `${value}`;
}

function getMinMaxTimeErrorMessage(picker: TimePickerDefinition): string {
    return `Min time: (${toString(picker.minHour)}:${toString(picker.minMinute)}), max time: (${toString(picker.maxHour)}:${toString(picker.maxMinute)})`;
}

function getErrorMessage(picker: TimePickerDefinition, propertyName: string, newValue: number | Date): string {
    return `${propertyName} property value (${toString(newValue)}:${toString(picker.minute)}) is not valid. ${getMinMaxTimeErrorMessage(picker)}.`;
}

export abstract class TimePickerBase extends View implements TimePickerDefinition {
    public hour: number;
    public minute: number;
    public time: Date;
    public minuteInterval: number;
    public minHour: number;
    public maxHour: number;
    public minMinute: number;
    public maxMinute: number;
}

export var hourProperty = new Property<TimePickerBase, number>({
    name: "hour", defaultValue: 0, valueChanged: (picker, oldValue, newValue) => {
        if (!isHourValid(newValue)) {
            throw new Error(getErrorMessage(picker, "Hour", newValue));
        }

        if (isValidTime(picker)) {
            // picker._setNativeTime();
            if (picker.time) {
                picker.time.setHours(picker.hour);
            }
            else {
                picker.time = new Date(0, 0, 0, picker.hour, picker.minute);
            }
        } else {
            throw new Error(getErrorMessage(picker, "Hour", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
hourProperty.register(TimePickerBase);

export var minHourProperty = new Property<TimePickerBase, number>({
    name: "minHour", defaultValue: 0, valueChanged: (picker, oldValue, newValue) => {
        if (!isHourValid(newValue)) {
            throw new Error(getErrorMessage(picker, "minHour", newValue));
        }
        if (isValidTime(picker)) {
            // picker._setNativeMinTime();
        } else {
            throw new Error(getErrorMessage(picker, "Hour", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
minHourProperty.register(TimePickerBase);

export var maxHourProperty = new Property<TimePickerBase, number>({
    name: "maxHour", defaultValue: 23, valueChanged: (picker, oldValue, newValue) => {
        if (!isHourValid(newValue)) {
            throw new Error(getErrorMessage(picker, "maxHour", newValue));
        }
        if (isValidTime(picker)) {
            // picker._setNativeMaxTime();
        } else {
            throw new Error(getErrorMessage(picker, "Hour", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
maxHourProperty.register(TimePickerBase);

export var minuteProperty = new Property<TimePickerBase, number>({
    name: "minute", defaultValue: 0, valueChanged: (picker, oldValue, newValue) => {
        if (!isMinuteValid(newValue)) {
            throw new Error(getErrorMessage(picker, "minute", newValue));
        }

        if (isValidTime(picker)) {
            // picker._setNativeTime();
            if (picker.time) {
                picker.time.setMinutes(picker.minute);
            }
            else {
                picker.time = new Date(0, 0, 0, picker.hour, picker.minute);
            }
        } else {
            throw new Error(getErrorMessage(picker, "Minute", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
minuteProperty.register(TimePickerBase);

export var minMinuteProperty = new Property<TimePickerBase, number>({
    name: "minMinute", defaultValue: 0, valueChanged: (picker, oldValue, newValue) => {
        if (!isMinuteValid(newValue)) {
            throw new Error(getErrorMessage(picker, "minMinute", newValue));
        }

        if (isValidTime(picker)) {
            // picker._setNativeMinTime();
        } else {
            throw new Error(getErrorMessage(picker, "Minute", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
minMinuteProperty.register(TimePickerBase);

export var maxMinuteProperty = new Property<TimePickerBase, number>({
    name: "maxMinute", defaultValue: 59, valueChanged: (picker, oldValue, newValue) => {
        if (!isMinuteValid(newValue)) {
            throw new Error(getErrorMessage(picker, "maxMinute", newValue));
        }

        if (isValidTime(picker)) {
            // picker._setNativeMaxTime();
        } else {
            throw new Error(getErrorMessage(picker, "Minute", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
maxMinuteProperty.register(TimePickerBase);

export var minuteIntervalProperty = new Property<TimePickerBase, number>({
    name: "minuteInterval", defaultValue: 1, valueChanged: (picker, oldValue, newValue) => {
        if (!isMinuteIntervalValid(newValue)) {
            throw new Error(getErrorMessage(picker, "minuteInterval", newValue));
        }
    }, valueConverter: (v) => parseInt(v)
});
minuteIntervalProperty.register(TimePickerBase);

function dateComparer(x: Date, y: Date): boolean {
    return (x <= y && x >= y) ? true : false;
}

export var timeProperty = new Property<TimePickerBase, Date>({
    name: "time", equalityComparer: dateComparer, valueChanged: (picker, oldValue, newValue) => {
        if (!isValidTime(picker)) {
            throw new Error(getErrorMessage(picker, "time", newValue));
        }

        picker.hour = newValue.getHours();
        picker.minute = newValue.getMinutes();
        // picker._set
    }
});
timeProperty.register(TimePickerBase);