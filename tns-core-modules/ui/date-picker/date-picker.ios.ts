import {
    DatePickerBase, yearProperty, monthProperty, dayProperty,
    dateProperty, maxDateProperty, minDateProperty, colorProperty
} from "./date-picker-common";

import { Color } from "color";

import { ios } from "utils/utils";

export * from "./date-picker-common";

export class DatePicker extends DatePickerBase {
    private _changeHandler: NSObject;
    public nativeView: UIDatePicker;

    constructor() {
        super();

        this.nativeView = UIDatePicker.new();
        this.nativeView.datePickerMode = UIDatePickerMode.Date;

        this._changeHandler = UIDatePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this.nativeView.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);
    }

    get ios(): UIDatePicker {
        return this.nativeView;
    }

    get [yearProperty.native](): number {
        return this.nativeView.date.getFullYear();
    }
    set [yearProperty.native](value: number) {
        let picker = this.nativeView;
        let comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
        comps.year = value;
        this.date = new Date(comps.year, comps.month - 1, comps.day);
    }

    get [monthProperty.native](): number {
        return this.nativeView.date.getMonth();
    }
    set [monthProperty.native](value: number) {
        let picker = this.nativeView;
        let comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
        comps.month = value;
        this.date = new Date(comps.year, comps.month - 1, comps.day);
    }

    get [dayProperty.native](): number {
        return this.nativeView.date.getDay();
    }
    set [dayProperty.native](value: number) {
        let picker = this.nativeView;
        let comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
        comps.day = value;
        this.date = new Date(comps.year, comps.month - 1, comps.day);
    }

    get [dateProperty.native](): Date {
        return this.nativeView.date;
    }
    set [dateProperty.native](value: Date) {
        let picker = this.nativeView;
        let comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
        comps.year = value.getFullYear();
        comps.month = value.getMonth() + 1;
        comps.day = value.getDate();
        picker.setDateAnimated(ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(comps), false);
    }

    get [maxDateProperty.native](): Date {
        return this.nativeView.maximumDate;
    }
    set [maxDateProperty.native](value: Date) {
        let picker = this.nativeView;
        let nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
        picker.maximumDate = <any>nsDate;
    }

    get [minDateProperty.native](): Date {
        return this.nativeView.minimumDate;
    }
    set [minDateProperty.native](value: Date) {
        let picker = this.nativeView;
        let nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
        picker.minimumDate = <any>nsDate;
    }

    get [colorProperty.native](): Color {
        return ios.getColor(this.nativeView.valueForKey("textColor"));
    }
    set [colorProperty.native](value: Color) {
        let picker = this.nativeView;
        picker.setValueForKey(value.ios, "textColor");
    }
}

class UIDatePickerChangeHandlerImpl extends NSObject {
    private _owner: WeakRef<DatePicker>;

    public static initWithOwner(owner: WeakRef<DatePicker>): UIDatePickerChangeHandlerImpl {
        let impl = <UIDatePickerChangeHandlerImpl>UIDatePickerChangeHandlerImpl.new();
        impl._owner = owner;
        return impl;
    }

    public valueChanged(sender: UIDatePicker) {
        let comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, sender.date);

        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        let dateChanged = false;
        if (comps.year !== owner.year) {
            owner.nativePropertyChanged(yearProperty, comps.year);
            dateChanged = true;
        }

        if (comps.month !== owner.month) {
            owner.nativePropertyChanged(monthProperty, comps.month);
            dateChanged = true;
        }

        if (comps.day !== owner.day) {
            owner.nativePropertyChanged(dayProperty, comps.day);
            dateChanged = true;
        }

        if (dateChanged) {
            owner.nativePropertyChanged(dateProperty, new Date(comps.year, comps.month - 1, comps.day));
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    };
}