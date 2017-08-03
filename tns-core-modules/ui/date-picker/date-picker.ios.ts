import {
    DatePickerBase, yearProperty, monthProperty, dayProperty,
    dateProperty, maxDateProperty, minDateProperty, colorProperty, Color
} from "./date-picker-common";

import { ios } from "../../utils/utils";

export * from "./date-picker-common";

export class DatePicker extends DatePickerBase {
    private _changeHandler: NSObject;
    public nativeViewProtected: UIDatePicker;

    constructor() {
        super();

        this.nativeViewProtected = UIDatePicker.new();
        this.nativeViewProtected.datePickerMode = UIDatePickerMode.Date;

        this._changeHandler = UIDatePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);
    }

    get ios(): UIDatePicker {
        return this.nativeViewProtected;
    }

    [yearProperty.getDefault](): number {
        return this.nativeViewProtected.date.getFullYear();
    }
    [yearProperty.setNative](value: number) {
        this.date = new Date(value, this.month, this.day);
    }

    [monthProperty.getDefault](): number {
        return this.nativeViewProtected.date.getMonth();
    }
    [monthProperty.setNative](value: number) {
        this.date = new Date(this.year, value, this.day);
    }

    [dayProperty.getDefault](): number {
        return this.nativeViewProtected.date.getDay();
    }
    [dayProperty.setNative](value: number) {
        this.date = new Date(this.year, this.month, value);
    }

    [dateProperty.getDefault](): Date {
        return this.nativeViewProtected.date;
    }
    [dateProperty.setNative](value: Date) {
        const picker = this.nativeViewProtected;
        const comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
        comps.year = value.getFullYear();
        comps.month = value.getMonth() + 1;
        comps.day = value.getDate();
        picker.setDateAnimated(ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(comps), false);
    }

    [maxDateProperty.getDefault](): Date {
        return this.nativeViewProtected.maximumDate;
    }
    [maxDateProperty.setNative](value: Date) {
        const picker = this.nativeViewProtected;
        const nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
        picker.maximumDate = <any>nsDate;
    }

    [minDateProperty.getDefault](): Date {
        return this.nativeViewProtected.minimumDate;
    }
    [minDateProperty.setNative](value: Date) {
        const picker = this.nativeViewProtected;
        const nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
        picker.minimumDate = <any>nsDate;
    }

    [colorProperty.getDefault](): UIColor {
        return this.nativeViewProtected.valueForKey("textColor");
    }
    [colorProperty.setNative](value: Color | UIColor) {
        const picker = this.nativeViewProtected;
        picker.setValueForKey(value instanceof Color ? value.ios : value, "textColor");
    }
}

class UIDatePickerChangeHandlerImpl extends NSObject {
    private _owner: WeakRef<DatePicker>;

    public static initWithOwner(owner: WeakRef<DatePicker>): UIDatePickerChangeHandlerImpl {
        const impl = <UIDatePickerChangeHandlerImpl>UIDatePickerChangeHandlerImpl.new();
        impl._owner = owner;
        return impl;
    }

    public valueChanged(sender: UIDatePicker) {
        const comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, sender.date);

        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        let dateChanged = false;
        if (comps.year !== owner.year) {
            yearProperty.nativeValueChange(owner, comps.year);
            dateChanged = true;
        }

        const jsMonth = comps.month - 1;
        if (jsMonth !== owner.month) {
            monthProperty.nativeValueChange(owner, jsMonth);
            dateChanged = true;
        }

        if (comps.day !== owner.day) {
            dayProperty.nativeValueChange(owner, comps.day);
            dateChanged = true;
        }

        if (dateChanged) {
            dateProperty.nativeValueChange(owner, new Date(comps.year, jsMonth, comps.day));
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    };
}
