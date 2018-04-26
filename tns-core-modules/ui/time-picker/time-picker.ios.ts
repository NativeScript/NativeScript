import {
    TimePickerBase, timeProperty,
    minuteProperty, minMinuteProperty, maxMinuteProperty,
    hourProperty, minHourProperty, maxHourProperty, colorProperty, Color
} from "./time-picker-common";

import { ios } from "../../utils/utils";
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
    public nativeViewProtected: UIDatePicker;

    constructor() {
        super();

        this._ios = UIDatePicker.new();
        this._ios.datePickerMode = UIDatePickerMode.Time;

        this._changeHandler = UITimePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);

        let components = getComponents(NSDate.date());
        this.hour = components.hour;
        this.minute = components.minute;
        this.nativeViewProtected = this._ios;
    }

    get ios(): UIDatePicker {
        return this._ios;
    }

    [timeProperty.getDefault](): Date {
        return this.nativeViewProtected.date;
    }
    [timeProperty.setNative](value: Date) {
        this.nativeViewProtected.date = getDate(this.hour, this.minute);
    }

    [minuteProperty.getDefault](): number {
        return this.nativeViewProtected.date.getMinutes();
    }
    [minuteProperty.setNative](value: number) {
        this.nativeViewProtected.date = getDate(this.hour, value);
    }

    [hourProperty.getDefault](): number {
        return this.nativeViewProtected.date.getHours();
    }
    [hourProperty.setNative](value: number) {
        this.nativeViewProtected.date = getDate(value, this.minute);
    }

    [minHourProperty.getDefault](): number {
        return this.nativeViewProtected.minimumDate ? this.nativeViewProtected.minimumDate.getHours() : 0;
    }
    [minHourProperty.setNative](value: number) {
        this.nativeViewProtected.minimumDate = getDate(value, this.minute);
    }

    [maxHourProperty.getDefault](): number {
        return this.nativeViewProtected.maximumDate ? this.nativeViewProtected.maximumDate.getHours() : 24;
    }
    [maxHourProperty.setNative](value: number) {
        this.nativeViewProtected.maximumDate = getDate(value, this.minute);
    }

    [minMinuteProperty.getDefault](): number {
        return this.nativeViewProtected.minimumDate ? this.nativeViewProtected.minimumDate.getMinutes() : 0;
    }
    [minMinuteProperty.setNative](value: number) {
        this.nativeViewProtected.minimumDate = getDate(this.hour, value);
    }

    [maxMinuteProperty.getDefault](): number {
        return this.nativeViewProtected.maximumDate ? this.nativeViewProtected.maximumDate.getMinutes() : 60;
    }
    [maxMinuteProperty.setNative](value: number) {
        this.nativeViewProtected.maximumDate = getDate(this.hour, value);
    }

    [timeProperty.getDefault](): number {
        return this.nativeViewProtected.minuteInterval;
    }
    [timeProperty.setNative](value: number) {
        this.nativeViewProtected.minuteInterval = value;
    }

    [colorProperty.getDefault](): UIColor {
        return this.nativeViewProtected.valueForKey("textColor");
    }
    [colorProperty.setNative](value: Color | UIColor) {
        const color = value instanceof Color ? value.ios : value;
        this.nativeViewProtected.setValueForKey(color, "textColor");
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
        "valueChanged": { returns: interop.types.void, params: [UIDatePicker] }
    }
}
