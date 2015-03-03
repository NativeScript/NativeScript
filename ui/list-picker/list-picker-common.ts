import definition = require("ui/list-picker");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import view = require("ui/core/view");
import types = require("utils/types");

export class ListPicker extends view.View implements definition.ListPicker {
    public static selectedIndexProperty = new dependencyObservable.Property("selectedIndex", "ListPicker", new proxy.PropertyMetadata(0));
    public static itemsProperty = new dependencyObservable.Property("items", "ListPicker", new proxy.PropertyMetadata(undefined));

    constructor() {
        super();
    }

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
        if (types.isDefined(this.items)) {
            var item = this.items.getItem ? this.items.getItem(index) : this.items[index];

            return types.isString(item) ? item : (types.isDefined(item) ? item.toString() : index.toString());
        }

        return index.toString();
    }
} 