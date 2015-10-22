import common = require("./time-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    if (picker.ios) {
        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, picker.ios.date);
        comps.hour = data.newValue;
        picker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    }
}

(<proxy.PropertyMetadata>common.TimePicker.hourProperty.metadata).onSetNativeValue = onHourPropertyChanged;

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    if (picker.ios) {
        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitHour | NSCalendarUnit.NSCalendarUnitMinute, picker.ios.date);
        comps.minute = data.newValue;
        picker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
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

        if (comps.hour !== owner.hour) {
            owner._onPropertyChangedFromNative(common.TimePicker.hourProperty, comps.hour);
        }

        if (comps.minute !== owner.minute) {
            owner._onPropertyChangedFromNative(common.TimePicker.minuteProperty, comps.minute);
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    };
}