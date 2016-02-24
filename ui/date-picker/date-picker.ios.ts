import common = require("./date-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import style = require("ui/styling/style");
import view = require("ui/core/view");

function onYearPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, picker.ios.date);
        comps.year = data.newValue;
        picker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.yearProperty.metadata).onSetNativeValue = onYearPropertyChanged;

function onMonthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, picker.ios.date);
        comps.month = data.newValue;
        picker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.monthProperty.metadata).onSetNativeValue = onMonthPropertyChanged;

function onDayPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, picker.ios.date);
        comps.day = data.newValue;
        picker.ios.setDateAnimated(NSCalendar.currentCalendar().dateFromComponents(comps), false);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.dayProperty.metadata).onSetNativeValue = onDayPropertyChanged;

function onMaxDatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        var nsDate = NSDate.dateWithTimeIntervalSince1970((<Date>data.newValue).getTime() / 1000);
        picker.ios.maximumDate = nsDate;
    }
}

(<proxy.PropertyMetadata>common.DatePicker.maxDateProperty.metadata).onSetNativeValue = onMaxDatePropertyChanged;

function onMinDatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.ios) {
        picker.ios.minimumDate = NSDate.dateWithTimeIntervalSince1970((<Date>data.newValue).getTime() / 1000);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.minDateProperty.metadata).onSetNativeValue = onMinDatePropertyChanged;

global.moduleMerge(common, exports);

export class DatePicker extends common.DatePicker {
    private _ios: UIDatePicker;
    private _changeHandler: NSObject;

    constructor() {
        super();

        this._ios = new UIDatePicker();
        this._ios.datePickerMode = UIDatePickerMode.UIDatePickerModeDate;

        this._changeHandler = UIDatePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UIDatePicker {
        return this._ios;
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
        var comps = NSCalendar.currentCalendar().componentsFromDate(NSCalendarUnit.NSCalendarUnitYear | NSCalendarUnit.NSCalendarUnitMonth | NSCalendarUnit.NSCalendarUnitDay, sender.date);
        
        let owner = this._owner.get();
        if (!owner) {
            return;
        }

        if (comps.year !== owner.year) {
            owner._onPropertyChangedFromNative(common.DatePicker.yearProperty, comps.year);
        }

        if (comps.month !== owner.month) {
            owner._onPropertyChangedFromNative(common.DatePicker.monthProperty, comps.month);
        }

        if (comps.day !== owner.day) {
            owner._onPropertyChangedFromNative(common.DatePicker.dayProperty, comps.day);
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UIDatePicker] }
    };
}

export class DatePickerStyler implements style.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var picker = <UIDatePicker>view._nativeView;
        picker.setValueForKey(newValue, "textColor");
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var picker = <UIDatePicker>view._nativeView;
        picker.setValueForKey(nativeValue, "textColor");
    }

    private static getColorProperty(view: view.View): any {
        var picker = <UIDatePicker>view._nativeView;
        return picker.valueForKey("textColor");
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            DatePickerStyler.setColorProperty,
            DatePickerStyler.resetColorProperty,
            DatePickerStyler.getColorProperty), "DatePicker");
    }
}

DatePickerStyler.registerHandlers();
