import common = require("./list-picker-common");
import dependencyObservable = require("ui/core/dependency-observable");
import * as types from "utils/types";

global.moduleMerge(common, exports);

export class ListPicker extends common.ListPicker {
    private _ios: UIPickerView;
    private _dataSource: ListPickerDataSource;
    private _delegate: ListPickerDelegateImpl;

    constructor() {
        super();

        this._ios = new UIPickerView();
        this._ios.dataSource = this._dataSource = ListPickerDataSource.initWithOwner(new WeakRef(this));
        this._delegate = ListPickerDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
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
    
    private _owner: WeakRef<ListPicker>;

    public static initWithOwner(owner: WeakRef<ListPicker>): ListPickerDataSource {
        let dataSource = <ListPickerDataSource>ListPickerDataSource.new();
        dataSource._owner = owner;
        return dataSource;
    }

    public numberOfComponentsInPickerView(pickerView: UIPickerView) {
        return 1;
    }

    public pickerViewNumberOfRowsInComponent(pickerView: UIPickerView, component: number) {
        let owner = this._owner.get();
        return (owner && owner.items) ? owner.items.length : 0;
    }
}

class ListPickerDelegateImpl extends NSObject implements UIPickerViewDelegate {
    public static ObjCProtocols = [UIPickerViewDelegate];

    private _owner: WeakRef<ListPicker>;

    public static initWithOwner(owner: WeakRef<ListPicker>): ListPickerDelegateImpl {
        let delegate = <ListPickerDelegateImpl>ListPickerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public pickerViewTitleForRowForComponent(pickerView: UIPickerView, row: number, component: number): string {
        let owner = this._owner.get();
        if (owner) {
            return owner._getItemAsString(row);
        }

        return row.toString();
    }

    public pickerViewDidSelectRowInComponent(pickerView: UIPickerView, row: number, component: number): void {
        let owner = this._owner.get();
        if (owner) {
            owner._onPropertyChangedFromNative(common.ListPicker.selectedIndexProperty, row);
        }
    }
}
