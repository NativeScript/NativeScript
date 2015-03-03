import common = require("ui/date-picker/date-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onYearPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        setYearMonthDay(picker.ios, data.newValue, picker.month, picker.day);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.yearProperty.metadata).onSetNativeValue = onYearPropertyChanged;

function onMonthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        setYearMonthDay(picker.ios, picker.year, data.newValue, picker.day);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.monthProperty.metadata).onSetNativeValue = onMonthPropertyChanged;

function onDayPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        setYearMonthDay(picker.ios, picker.year, picker.month, data.newValue);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.dayProperty.metadata).onSetNativeValue = onDayPropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class DatePicker extends common.DatePicker {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;

    constructor() {
        super();

        this._ios = new UIDatePicker();
        this._ios.datePickerMode = UIDatePickerMode.UIDatePickerModeDate;

        this._changeHandler = UIDatePickerChangeHandlerImpl.new().initWithOwner(this);
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UIDatePicker {
        return this._ios;
    }
}

class UIDatePickerChangeHandlerImpl extends NSObject {
    static new(): UIDatePickerChangeHandlerImpl {
        return <UIDatePickerChangeHandlerImpl>super.new();
    }

    private _owner: DatePicker;

    public initWithOwner(owner: DatePicker): UIDatePickerChangeHandlerImpl {
        this._owner = owner;
        return this;
    }

    public valueChanged(sender: UIDatePicker) {
        var calendar = NSCalendar.currentCalendar();
        var comp = calendar.componentsFromDate(NSCalendarUnit.NSHourCalendarUnit | NSCalendarUnit.NSMinuteCalendarUnit, sender.date);

        this._owner._onPropertyChangedFromNative(common.DatePicker.yearProperty, comp.year);
        this._owner._onPropertyChangedFromNative(common.DatePicker.monthProperty, comp.month);
        this._owner._onPropertyChangedFromNative(common.DatePicker.dayProperty, comp.day);
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    };
}

function setYearMonthDay(picker: UIDatePicker, year: number, month: number, day: number) {
    var calendar = NSCalendar.currentCalendar();
    var comps = new NSDateComponents();

    comps.year = year;
    comps.month = month;
    comps.day = day;

    picker.setDateAnimated(calendar.dateFromComponents(comps), false);
}