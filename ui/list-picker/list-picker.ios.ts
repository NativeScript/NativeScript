import common = require("ui/list-picker/list-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

export class ListPicker extends common.ListPicker {
    private _ios: UIPickerView;
    private _dataSource: ListPickerDataSource;
    private _delegate: ListPickerDelegateImpl;

    constructor() {
        super();

        this._ios = new UIPickerView();

        var dataSource = ListPickerDataSource.new().initWithOwner(this);

        this._dataSource = dataSource;
        this._ios.dataSource = this._dataSource;

        this._delegate = ListPickerDelegateImpl.new().initWithOwner(this);
        this._ios.delegate = this._delegate;
    }

    get ios(): UIPickerView {
        return this._ios;
    }

    public _onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        super._onSelectedIndexPropertyChanged(data);

        if (this.ios && types.isNumber(data.newValue)) {
            this.ios.selectRowInComponentAnimated(data.newValue, 0, false);
        }
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (this.ios) {
            this.ios.reloadAllComponents();
        }

        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);
    }
}

class ListPickerDataSource extends NSObject implements UIPickerViewDataSource {
    public static ObjCProtocols = [UIPickerViewDataSource];

    static new(): ListPickerDataSource {
        return <ListPickerDataSource>super.new();
    }

    private _owner: ListPicker;

    public initWithOwner(owner: ListPicker): ListPickerDataSource {
        this._owner = owner;
        return this;
    }

    public numberOfComponentsInPickerView(pickerView: UIPickerView) {
        return 1;
    }

    public pickerViewNumberOfRowsInComponent(pickerView: UIPickerView, component: number) {
        return this._owner.items ? this._owner.items.length : 0;
    }
}

class ListPickerDelegateImpl extends NSObject implements UIPickerViewDelegate {
    public static ObjCProtocols = [UIPickerViewDelegate];

    static new(): ListPickerDelegateImpl {
        return <ListPickerDelegateImpl>super.new();
    }

    private _owner: ListPicker;

    public initWithOwner(owner: ListPicker): ListPickerDelegateImpl {
        this._owner = owner;
        return this;
    }

    public pickerViewTitleForRowForComponent(pickerView: UIPickerView, row: number, component: number): string {
        if (this._owner) {
            return this._owner._getItemAsString(row);
        }

        return row.toString();
    }

    public pickerViewDidSelectRowInComponent(pickerView: UIPickerView, row: number, component: number): void {
        if (this._owner) {
            this._owner._onPropertyChangedFromNative(common.ListPicker.selectedIndexProperty, row);
        }
    }
}
