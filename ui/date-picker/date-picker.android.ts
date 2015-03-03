import common = require("ui/date-picker/date-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");

function onYearPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.android) {
        picker.android.init(data.newValue, picker.month, picker.day, picker._listener);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.yearProperty.metadata).onSetNativeValue = onYearPropertyChanged;

function onMonthPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.android) {
        picker.android.init(picker.year, data.newValue, picker.day, picker._listener);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.monthProperty.metadata).onSetNativeValue = onMonthPropertyChanged;

function onDayPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <DatePicker>data.object;

    if (picker.android) {
        picker.android.init(picker.year, picker.month, data.newValue, picker._listener);
    }
}

(<proxy.PropertyMetadata>common.DatePicker.dayProperty.metadata).onSetNativeValue = onDayPropertyChanged;

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class DatePicker extends common.DatePicker {
    private _android: android.widget.DatePicker;
    public _listener: android.widget.DatePicker.OnDateChangedListener;

    get android(): android.widget.DatePicker {
        return this._android;
    }

    constructor() {
        super();

        var that = new WeakRef(this);

        this._listener = new android.widget.DatePicker.OnDateChangedListener({
            get owner() {
                return that.get();
            },

            onDateChanged: function (picker: android.widget.DatePicker, monthOfYear: number, dayOfMonth: number) {
                if (this.owner) {
                    this.owner._onPropertyChangedFromNative(common.DatePicker.yearProperty, picker.getYear());
                    this.owner._onPropertyChangedFromNative(common.DatePicker.monthProperty, monthOfYear);
                    this.owner._onPropertyChangedFromNative(common.DatePicker.dayProperty, dayOfMonth);
                }
            }
        });
    }

    public _createUI() {
        this._android = new android.widget.DatePicker(this._context);
        this._android.setCalendarViewShown(false);
    }
} 