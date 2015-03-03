import common = require("ui/time-picker/time-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onHourPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    if (picker.ios) {
        setHourAndMinute(picker.ios, data.newValue, picker.minute);
    }
}

(<proxy.PropertyMetadata>common.TimePicker.hourProperty.metadata).onSetNativeValue = onHourPropertyChanged;

function onMinutePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <TimePicker>data.object;

    if (picker.ios) {
        setHourAndMinute(picker.ios, picker.hour, data.newValue);
    }
}

(<proxy.PropertyMetadata>common.TimePicker.minuteProperty.metadata).onSetNativeValue = onMinutePropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class TimePicker extends common.TimePicker {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;

    constructor() {
        super();

        this._ios = new UIDatePicker();
        this._ios.datePickerMode = UIDatePickerMode.UIDatePickerModeTime;

        this._changeHandler = UITimePickerChangeHandlerImpl.new().initWithOwner(this);
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UIDatePicker {
        return this._ios;
    }
}

class UITimePickerChangeHandlerImpl extends NSObject {
    static new(): UITimePickerChangeHandlerImpl {
        return <UITimePickerChangeHandlerImpl>super.new();
    }

    private _owner: TimePicker;

    public initWithOwner(owner: TimePicker): UITimePickerChangeHandlerImpl {
        this._owner = owner;
        return this;
    }

    public valueChanged(sender: UIDatePicker) {
        var calendar = NSCalendar.currentCalendar();
        var comp = calendar.componentsFromDate(NSCalendarUnit.NSHourCalendarUnit | NSCalendarUnit.NSMinuteCalendarUnit, sender.date);

        this._owner._onPropertyChangedFromNative(common.TimePicker.hourProperty, comp.hour);
        this._owner._onPropertyChangedFromNative(common.TimePicker.minuteProperty, comp.minute);
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    };
}

function setHourAndMinute(picker: UIDatePicker, hour: number, minute: number) {
    var calendar = NSCalendar.currentCalendar();
    var comps = new NSDateComponents();

    comps.hour = hour;
    comps.minute = minute;

    picker.setDateAnimated(calendar.dateFromComponents(comps), false);
}