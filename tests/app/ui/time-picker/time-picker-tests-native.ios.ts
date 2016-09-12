import timePickerModule = require("ui/time-picker");

import * as utils from "utils/utils";

export function getNativeHour(timePicker: timePickerModule.TimePicker): number {
    return utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, timePicker.ios.date).hour;
}

export function getNativeMinute(timePicker: timePickerModule.TimePicker): number {
    return utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, timePicker.ios.date).minute;
}

export function setNativeHour(timePicker: timePickerModule.TimePicker, value: number): void {
    var comps = utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, timePicker.ios.date);
    comps.hour = value;
    timePicker.ios.setDateAnimated(utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(comps), false);
    (<any>timePicker)._changeHandler.valueChanged(timePicker.ios);
}

export function setNativeMinute(timePicker: timePickerModule.TimePicker, value: number): void {
    var comps = utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, timePicker.ios.date);
    comps.minute = value;
    timePicker.ios.setDateAnimated(utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(comps), false);
    (<any>timePicker)._changeHandler.valueChanged(timePicker.ios);
}

export function setNativeTime(timePicker: timePickerModule.TimePicker, hour: number, minute: number): void {
    var comps = utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, timePicker.ios.date);
    comps.hour = hour;
    comps.minute = minute;
    timePicker.ios.setDateAnimated(utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(comps), false);
    (<any>timePicker)._changeHandler.valueChanged(timePicker.ios);
}
    