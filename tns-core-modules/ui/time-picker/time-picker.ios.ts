import { TimePickerBase, timeProperty, 
    minuteProperty, minMinuteProperty, maxMinuteProperty,
    hourProperty, minHourProperty, maxHourProperty, colorProperty } from "./time-picker-common";
import { Color } from "color";

import { ios } from "utils/utils";
import getter = ios.getter;

export * from "./time-picker-common";

function getDate(hour: number, minute: number): Date {
    let components = NSDateComponents.alloc().init();
    components.hour = hour;
    components.minute = minute;
    return getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(<any>components);
}

function getComponents(date: Date | NSDate): NSDateComponents {
    return getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, <any>date);
}

export class TimePicker extends TimePickerBase {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;
    public nativeView: UIDatePicker;

    constructor() {
        super();

        this._ios = UIDatePicker.new();
        this._ios.datePickerMode = UIDatePickerMode.Time;

        this._changeHandler = UITimePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);

        let components = getComponents(NSDate.date());
        this.hour = components.hour;
        this.minute = components.minute;
        this.nativeView = this._ios;
    }

    get ios(): UIDatePicker {
        return this._ios;
    }

    get [timeProperty.native](): Date {
        return this.nativeView.date;
    }
    set [timeProperty.native](value: Date) {
        this.nativeView.date = getDate(this.hour, this.minute);
    }

    get [minuteProperty.native](): number {
        return this.nativeView.date.getMinutes();
    }
    set [minuteProperty.native](value: number) {
        this.nativeView.date = getDate(this.hour, value);
    }

    get [hourProperty.native](): number {
        return this.nativeView.date.getHours();
    }
    set [hourProperty.native](value: number) {
        this.nativeView.date = getDate(value, this.minute);
    }

    get [minHourProperty.native](): number {
        return this.nativeView.minimumDate ? this.nativeView.minimumDate.getHours() : 0;
    }
    set [minHourProperty.native](value: number) {
        this.nativeView.minimumDate = getDate(value, this.minute);
    }

    get [maxHourProperty.native](): number {
        return this.nativeView.maximumDate ? this.nativeView.maximumDate.getHours() : 24;
    }
    set [maxHourProperty.native](value: number) {
        this.nativeView.maximumDate = getDate(value, this.minute);
    }

    get [minMinuteProperty.native](): number {
        return this.nativeView.minimumDate ? this.nativeView.minimumDate.getMinutes() : 0;
    }
    set [minMinuteProperty.native](value: number) {
        this.nativeView.minimumDate = getDate(this.hour, value);
    }

    get [maxMinuteProperty.native](): number {
        return this.nativeView.maximumDate ? this.nativeView.maximumDate.getMinutes() : 60;
    }
    set [maxMinuteProperty.native](value: number) {
        this.nativeView.maximumDate = getDate(this.hour, value);
    }

    get [timeProperty.native](): number {
        return this.nativeView.minuteInterval;
    }
    set [timeProperty.native](value: number) {
        this.nativeView.minuteInterval = value;
    }

    get [colorProperty.native](): Color {
        return ios.getColor(this.nativeView.valueForKey("textColor"));
    }
    set [colorProperty.native](value: Color) {
        this.nativeView.setValueForKey(value.ios, "textColor");
    }
}

class UITimePickerChangeHandlerImpl extends NSObject {

    private _owner: WeakRef<TimePicker>;

    public static initWithOwner(owner: WeakRef<TimePicker>): UITimePickerChangeHandlerImpl {
        let handler = <UITimePickerChangeHandlerImpl>UITimePickerChangeHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public valueChanged(sender: UIDatePicker) {
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        let components = getComponents(sender.date);

        let timeChanged = false;
        if (components.hour !== owner.hour) {
            hourProperty.nativeValueChange(owner, components.hour);
            timeChanged = true;
        }

        if (components.minute !== owner.minute) {
            minuteProperty.nativeValueChange(owner, components.minute);
            timeChanged = true;
        }

        if (timeChanged) {
            timeProperty.nativeValueChange(owner, new Date(0, 0, 0, components.hour, components.minute));
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    }
}