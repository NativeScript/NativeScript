import definition = require("ui/segmented-bar");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");

export module knownCollections {
    export var items = "items";
}

export class SegmentedBar extends view.View implements definition.SegmentedBar {
    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    get selectedIndex(): number {
        return this._getValue(SegmentedBar.selectedIndexProperty);
    }
    set selectedIndex(value: number) {
        this._setValue(SegmentedBar.selectedIndexProperty, value);
    }

    get items(): Array<definition.SegmentedBarEntry> {
        return this._getValue(SegmentedBar.itemsProperty);
    }
    set items(value: Array<definition.SegmentedBarEntry>) {
        this._setValue(SegmentedBar.itemsProperty, value);
    }

    public static selectedIndexProperty = new dependencyObservable.Property("selectedIndex", "SegmentedBar", new proxy.PropertyMetadata(0))

    public static itemsProperty = new dependencyObservable.Property("items", "SegmentedBar", new proxy.PropertyMetadata(undefined))
}