import common = require("./time-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

function getDate(date: NSDate, hour?: number, minute?: number): NSDate {
    var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, date);

    if (hour) {
        comps.hour = hour;
    }

    if (minute) {
        comps.minute = minute;
    }

    return NSCalendar.currentCalendar().dateFromComponents(comps);
}

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;
    var validValue = common.getValidHour(data.newValue, picker.minHour, picker.maxHour);
    if (validValue === data.newValue) {
        picker.ios.setDateAnimated(getDate(picker.ios.date, data.newValue, picker.minute), false);
    } else {
        throw new Error(`Hour property value (${data.newValue}) is not valid. Min value: (${picker.minHour} ), max value: (${picker.maxHour} ).`);
    }
}
(<proxy.PropertyMetadata>common.TimePicker.hourProperty.metadata).onSetNativeValue = onHourPropertyChanged;

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;
    var validValue = common.getValidMinute(data.newValue, picker.minMinute, picker.maxMinute);
    if (validValue === data.newValue) {
        picker.ios.setDateAnimated(getDate(picker.ios.date, picker.hour, data.newValue), false);
    } else {
        throw new Error(`Minute property value (${data.newValue}) is not valid. Min value: (${picker.minMinute} ), max value: (${picker.maxMinute} ).`);
    }
}
(<proxy.PropertyMetadata>common.TimePicker.minuteProperty.metadata).onSetNativeValue = onMinutePropertyChanged;

global.moduleMerge(common, exports);

export class TimePicker extends common.TimePicker {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;

    constructor() {
        super();

        this._ios = new UIDatePicker();
        this._ios.datePickerMode = UIDatePickerMode.UIDatePickerModeTime;

        this._changeHandler = UITimePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UIDatePicker {
        return this._ios;
    }

    public _setNativeValueSilently(hour: number, minute: number) {
        if (this.ios) {
            this.ios.removeTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.UIControlEventValueChanged)

            if (types.isNumber(hour) && types.isNumber(minute)) {
                this.ios.setDateAnimated(getDate(this.ios.date,
                    common.getValidHour(hour, this.minHour, this.maxHour),
                    common.getValidMinute(minute, this.minMinute, this.maxMinute)), false);
            }

            this.ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.UIControlEventValueChanged);
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

        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, sender.date);
        owner._setNativeValueSilently(comps.hour, comps.minute);
        comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, sender.date);

        if (comps.hour !== owner.hour) {
            owner._onPropertyChangedFromNative(common.TimePicker.hourProperty, comps.hour);
        }

        if (comps.minute !== owner.minute) {
            owner._onPropertyChangedFromNative(common.TimePicker.minuteProperty, comps.minute);
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    }
}