import timePickerModule = require("ui/time-picker");

export function getNativeHour(timePicker: timePickerModule.TimePicker): number {
    return NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, timePicker.ios.date).hour;
}

export function getNativeMinute(timePicker: timePickerModule.TimePicker): number {
    return NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, timePicker.ios.date).minute;
}

export function setNativeHour(timePicker: timePickerModule.TimePicker, value: number): void {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, timePicker.ios.date);
    comps.hour = value;
    timePicker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    (<any>timePicker)._changeHandler.valueChanged(timePicker.ios);
}

export function setNativeMinute(timePicker: timePickerModule.TimePicker, value: number): void {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, timePicker.ios.date);
    comps.minute = value;
    timePicker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    (<any>timePicker)._changeHandler.valueChanged(timePicker.ios);
}

export function setNativeTime(timePicker: timePickerModule.TimePicker, hour: number, minute: number): void {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, timePicker.ios.date);
    comps.hour = hour;
    comps.minute = minute;
    timePicker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    (<any>timePicker)._changeHandler.valueChanged(timePicker.ios);
}
    