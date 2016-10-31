import { TimePickerBase, getValidTime, timeProperty, minuteProperty, hourProperty } from "./time-picker-common";
import { colorProperty } from "ui/styling/style";
import * as utils from "utils/utils";
import getter = utils.ios.getter;
export * from "./time-picker-common";


function getDate(hour: number, minute: number): Date {
    let components = NSDateComponents.alloc().init();
    components.hour = hour;
    components.minute = minute;
    return utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(<any>components);
}

function getComponents(date: Date | NSDate): NSDateComponents {
    return utils.ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, <any>date);
}

export class TimePicker extends TimePickerBase {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;

    constructor() {
        super();

        this._ios = UIDatePicker.new();
        this._ios.datePickerMode = UIDatePickerMode.Time;

        this._changeHandler = UITimePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);

        let components = getComponents(NSDate.date());
        this.hour = components.hour;
        this.minute = components.minute;
    }

    get ios(): UIDatePicker {
        return this._ios;
    }

    public _setNativeTime() {
        if (this.ios) {
            this.ios.date = <any>getDate(this.hour, this.minute);
        }
    }

    public _setNativeMinTime() {
        if (this.ios) {
            this.ios.minimumDate = <any>getDate(this.minHour, this.minMinute);
        }
    }

    public _setNativeMaxTime() {
        if (this.ios) {
            this.ios.maximumDate = <any>getDate(this.maxHour, this.maxMinute);
        }
    }

    public _setNativeMinuteIntervalTime() {
        if (this.ios) {
            this.ios.minuteInterval = this.minuteInterval;
        }
    }

    get [colorProperty.native](): UIColor {
        return this.nativeView.valueForKey("textColor");
    }
    set [colorProperty.native](value: UIColor) {
        this.nativeView.setValueForKey(value, "textColor");
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
            owner.nativePropertyChanged(hourProperty, components.hour);
            timeChanged = true;
        }

        if (components.minute !== owner.minute) {
            owner.nativePropertyChanged(minuteProperty, components.minute);
            timeChanged = true;
        }

        if (timeChanged) {
            owner.nativePropertyChanged(timeProperty, new Date(0, 0, 0, components.hour, components.minute));
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    }
}