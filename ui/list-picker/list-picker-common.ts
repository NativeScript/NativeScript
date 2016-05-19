import definition = require("ui/list-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");
import types = require("utils/types");
import trace = require("trace");

export var traceCategory = "ListPicker";

export class ListPicker extends view.View implements definition.ListPicker {
    public static selectedIndexProperty = new dependencyObservable.Property("selectedIndex", "ListPicker", new proxy.PropertyMetadata(undefined));
    public static itemsProperty = new dependencyObservable.Property("items", "ListPicker", new proxy.PropertyMetadata(undefined));

    get selectedIndex(): number {
        return this._getValue(ListPicker.selectedIndexProperty);
    }
    set selectedIndex(value: number) {
        this._setValue(ListPicker.selectedIndexProperty, value);
    }

    get items(): any {
        return this._getValue(ListPicker.itemsProperty);
    }
    set items(value: any) {
        this._setValue(ListPicker.itemsProperty, value);
    }

    public _getItemAsString(index: number): any {
        if (!this.items || !this.items.length) {
            return " ";
        }
        
        if (types.isDefined(this.items)) {
            var item = this.items.getItem ? this.items.getItem(index) : this.items[index];

            return types.isString(item) ? item : (types.isDefined(item) ? item.toString() : index.toString());
        }

        return index.toString();
    }

    public _onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (trace.enabled) {
            trace.write("ListPicker._onSelectedIndexPropertyChanged("+data.oldValue+" => "+data.newValue+");", traceCategory);
        }
        var index = this.selectedIndex;
        if (types.isUndefined(index)) {
            return;
        }

        if (types.isDefined(this.items)) {
            if (index < 0 || index >= this.items.length) {
                this.selectedIndex = undefined;
                throw new Error("selectedIndex should be between [0, items.length - 1]");
            }
        }
    }
    
    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //trace.write("ListPicker._onItemsPropertyChanged(" + data.oldValue + " => " + data.newValue + ");", traceCategory);
    }

    public _updateSelectedIndexOnItemsPropertyChanged(newItems) {
        if (trace.enabled) {
            trace.write("ListPicker._updateSelectedIndexOnItemsPropertyChanged(" + newItems + ");", traceCategory);
        }
        var newItemsCount = 0;
        if (newItems && newItems.length) {
            newItemsCount = newItems.length;
        }

        if (newItemsCount === 0) {
            this.selectedIndex = undefined;
        }
        else if (types.isUndefined(this.selectedIndex) || this.selectedIndex >= newItemsCount) {
            this.selectedIndex = 0;
        }
    }
} 

function onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <ListPicker>data.object;
    picker._onSelectedIndexPropertyChanged(data);
}

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var picker = <ListPicker>data.object;
    picker._onItemsPropertyChanged(data);
}

(<proxy.PropertyMetadata>ListPicker.selectedIndexProperty.metadata).onSetNativeValue = onSelectedIndexPropertyChanged;
(<proxy.PropertyMetadata>ListPicker.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;
