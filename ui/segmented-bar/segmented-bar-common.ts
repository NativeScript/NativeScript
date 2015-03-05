import definition = require("ui/segmented-bar");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");

export module knownCollections {
    export var items = "items";
}

export class SegmentedBar extends view.View implements definition.SegmentedBar {
    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this._setValue(SegmentedBar.itemsProperty, value);
        }
    }

    public _adjustSelectedIndex() {
        if (this.selectedIndex > this.items.length - 1) {
            this._setValue(SegmentedBar.selectedIndexProperty, this.items.length - 1);
        }
    }

    get selectedIndex(): number {
        return this._getValue(SegmentedBar.selectedIndexProperty);
    }
    set selectedIndex(value: number) {
        this._setValue(SegmentedBar.selectedIndexProperty, value);
    }

    get items(): Array<definition.SegmentedBarItem> {
        return this._getValue(SegmentedBar.itemsProperty);
    }
    set items(value: Array<definition.SegmentedBarItem>) {
        this._setValue(SegmentedBar.itemsProperty, value);
    }

    get selectedBackgroundColor(): color.Color {
        return this._getValue(SegmentedBar.selectedBackgroundColorProperty);
    }
    set selectedBackgroundColor(value: color.Color) {
        this._setValue(SegmentedBar.selectedBackgroundColorProperty, 
            value instanceof color.Color ? value : new color.Color(<any>value));
    }

    public static selectedBackgroundColorProperty = new dependencyObservable.Property("selectedBackgroundColor", "SegmentedBar", new proxy.PropertyMetadata(undefined))
    public static selectedIndexProperty = new dependencyObservable.Property("selectedIndex", "SegmentedBar", new proxy.PropertyMetadata(0))
    public static itemsProperty = new dependencyObservable.Property("items", "SegmentedBar", new proxy.PropertyMetadata(undefined))
}