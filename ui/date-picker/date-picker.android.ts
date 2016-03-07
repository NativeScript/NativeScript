import common = require("./date-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils")
import * as types from "utils/types";

function onYearPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.android && picker.android.getYear() !== data.newValue) {
        updateNativeDate(picker);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.yearProperty.metadata).onSetNativeValue = onYearPropertyChanged;

function onMonthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.android && picker.android.getMonth() !== (data.newValue - 1)) {
        updateNativeDate(picker);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.monthProperty.metadata).onSetNativeValue = onMonthPropertyChanged;

function onDayPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.android && picker.android.getDayOfMonth !== data.newValue) {
        updateNativeDate(picker);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.dayProperty.metadata).onSetNativeValue = onDayPropertyChanged;

function updateNativeDate(picker: DatePicker) {
    var year = types.isNumber(picker.year) ? picker.year : picker.android.getYear();
    var month = types.isNumber(picker.month) ? (picker.month - 1) : picker.android.getMonth();
    var day = types.isNumber(picker.day) ? picker.day : picker.android.getDayOfMonth();

    picker.date = new Date(year, month, day);
}

function onMaxDatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    var newValue = (<Date>data.newValue).getTime();
    if (picker.android && picker.android.getMaxDate() !== newValue) {
        picker.android.setMaxDate(newValue);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.maxDateProperty.metadata).onSetNativeValue = onMaxDatePropertyChanged;

function onMinDatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    var newValue = (<Date>data.newValue).getTime();
    if (picker.android && picker.android.getMinDate() !== newValue) {
        picker.android.setMinDate(newValue);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.minDateProperty.metadata).onSetNativeValue = onMinDatePropertyChanged;

function onDatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    var newValue = <Date>data.newValue;
    if (picker.android && (picker.android.getDayOfMonth() !== newValue.getDay() 
                            || picker.android.getMonth() !== newValue.getMonth() 
                            || picker.android.getYear() !== newValue.getFullYear())) {
        picker.android.updateDate(newValue.getFullYear(), newValue.getMonth(), newValue.getDate());
    }
}

(<proxy.PropertyMetadata>common.DatePicker.dateProperty.metadata).onSetNativeValue = onDatePropertyChanged;

global.moduleMerge(common, exports);

export class DatePicker extends common.DatePicker {
    private _android: android.widget.DatePicker;
    public _listener: android.widget.DatePicker.OnDateChangedListener;

    get android(): android.widget.DatePicker {
        return this._android;
    }

    constructor() {
        super();

        var that = new WeakRef(this);

        this._listener = new android.widget.DatePicker.OnDateChangedListener(
            <utils.Owned & android.widget.DatePicker.IOnDateChangedListener>{
            get owner() {
                return that.get();
            },

            onDateChanged: function (picker: android.widget.DatePicker, year: number, month: number, day: number) {
                if (this.owner) {

                    if (year !== this.owner.year) {
                        this.owner._onPropertyChangedFromNative(common.DatePicker.yearProperty, year);
                        this.owner._onPropertyChangedFromNative(common.DatePicker.dateProperty, new Date(year, this.owner.month - 1, this.owner.day));
                    }

                    if ((month + 1) !== this.owner.month) {
                        this.owner._onPropertyChangedFromNative(common.DatePicker.monthProperty, month + 1);
                        this.owner._onPropertyChangedFromNative(common.DatePicker.dateProperty, new Date(this.owner.year, month, this.owner.day));
                    }

                    if (day !== this.owner.day) {
                        this.owner._onPropertyChangedFromNative(common.DatePicker.dayProperty, day);
                        this.owner._onPropertyChangedFromNative(common.DatePicker.dateProperty, new Date(this.owner.year, this.owner.month - 1, day));
                    }
                }
            }
        });
    }

    public _createUI() {
        this._android = new android.widget.DatePicker(this._context);
        this._android.setCalendarViewShown(false);
        this._android.init(0, 0, 0, this._listener);
    }
} 
