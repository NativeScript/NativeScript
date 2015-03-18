import datePickerModule = require("ui/date-picker");

export function getNativeYear(datePicker: datePickerModule.DatePicker): number {
    return NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, datePicker.ios.date).year;
}

export function getNativeMonth(datePicker: datePickerModule.DatePicker): number {
    return NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, datePicker.ios.date).month;
}

export function getNativeDay(datePicker: datePickerModule.DatePicker): number {
    return NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, datePicker.ios.date).day;
}

export function getNativeMaxDate(datePicker: datePickerModule.DatePicker): Date {
    return new Date(1000* NSDate.dateWithTimeIntervalSinceDate(0, datePicker.ios.maximumDate).timeIntervalSince1970);
}

export function getNativeMinDate(datePicker: datePickerModule.DatePicker): Date {
    return new Date(1000* NSDate.dateWithTimeIntervalSinceDate(0, datePicker.ios.minimumDate).timeIntervalSince1970);
}

export function setNativeYear(datePicker: datePickerModule.DatePicker, value: number): void {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, datePicker.ios.date);
    comps.year = value;
    datePicker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    (<any>datePicker)._changeHandler.valueChanged(datePicker.ios);
}

export function setNativeMonth(datePicker: datePickerModule.DatePicker, value: number): void {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, datePicker.ios.date);
    comps.month = value;
    datePicker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    (<any>datePicker)._changeHandler.valueChanged(datePicker.ios);
}

export function setNativeDay(datePicker: datePickerModule.DatePicker, value: number): void {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, datePicker.ios.date);
    comps.day = value;
    datePicker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    (<any>datePicker)._changeHandler.valueChanged(datePicker.ios);
}

    