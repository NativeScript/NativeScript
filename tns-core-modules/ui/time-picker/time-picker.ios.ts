import common = require("./time-picker-common");
import style = require("ui/styling/style");
import {View} from "ui/core/view";

function getDate(hour: number, minute: number): NSDate {
    var comps = NSDateComponents.alloc().init();
    comps.hour = hour;
    comps.minute = minute;
    return NSCalendar.currentCalendar().dateFromComponents(comps);
}

function getComponents(date: NSDate): NSDateComponents {
    return NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, date);
}

global.moduleMerge(common, exports);

export class TimePicker extends common.TimePicker {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;

    constructor() {
        super();

        this._ios = new UIDatePicker();
        this._ios.datePickerMode = UIDatePickerMode.Time;

        this._changeHandler = UITimePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);

        var comps = getComponents(NSDate.date());
        this.hour = comps.hour;
        this.minute = comps.minute;
    }

    get ios(): UIDatePicker {
        return this._ios;
    }

    public _setNativeTime() {
        if (this.ios) {
            this.ios.date = getDate(this.hour, this.minute);
        }
    }

    public _setNativeMinTime() {
        if (this.ios) {
            this.ios.minimumDate = getDate(this.minHour, this.minMinute);
        }
    }

    public _setNativeMaxTime() {
        if (this.ios) {
            this.ios.maximumDate = getDate(this.maxHour, this.maxMinute);
        }
    }

    public _setNativeMinuteIntervalTime() {
        if (this.ios) {
            this.ios.minuteInterval = this.minuteInterval;
        }
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

        var comps = getComponents(sender.date);
        
        let timeChanged = false;
        if (comps.hour !== owner.hour) {
            owner._onPropertyChangedFromNative(common.TimePicker.hourProperty, comps.hour);
            timeChanged = true;
        }

        if (comps.minute !== owner.minute) {
            owner._onPropertyChangedFromNative(common.TimePicker.minuteProperty, comps.minute);
            timeChanged = true;
        }
        
        if (timeChanged) {
            owner._onPropertyChangedFromNative(common.TimePicker.timeProperty, new Date(0, 0, 0, comps.hour, comps.minute));
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    }
}

export class TimePickerStyler implements style.Styler {
    // color
    private static setColorProperty(view: View, newValue: any) {
        var picker = <UIDatePicker>view._nativeView;
        picker.setValueForKey(newValue, "textColor");
    }

    private static resetColorProperty(view: View, nativeValue: any) {
        var picker = <UIDatePicker>view._nativeView;
        picker.setValueForKey(nativeValue, "textColor");
    }

    private static getColorProperty(view: View): any {
        var picker = <UIDatePicker>view._nativeView;
        return picker.valueForKey("textColor");
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            TimePickerStyler.setColorProperty,
            TimePickerStyler.resetColorProperty,
            TimePickerStyler.getColorProperty), "TimePicker");
    }
}

TimePickerStyler.registerHandlers();
