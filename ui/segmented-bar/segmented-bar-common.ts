import definition = require("ui/segmented-bar");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");
import bindable = require("ui/core/bindable");
import * as typesModule from "utils/types";

export module knownCollections {
    export var items = "items";
}

export class SegmentedBarItem extends bindable.Bindable implements definition.SegmentedBarItem {
    private _title: string = "";
    public _parent: SegmentedBar;

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
            this._update();
        }
    }

    public _update() {
        //
    }
}

export class SegmentedBar extends view.View implements definition.SegmentedBar {
    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this._setValue(SegmentedBar.itemsProperty, value);
        }
    }

    public _adjustSelectedIndex(items: Array<definition.SegmentedBarItem>) {
        if (this.items) {
            if (this.items.length > 0) {
                var types: typeof typesModule = require("utils/types");

                if (types.isUndefined(this.selectedIndex) || (this.selectedIndex > this.items.length - 1)) {
                    this._setValue(SegmentedBar.selectedIndexProperty, 0);
                }
            } else {
                this._setValue(SegmentedBar.selectedIndexProperty, undefined);
            }
        } else {
            this._setValue(SegmentedBar.selectedIndexProperty, undefined);
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

    public static selectedBackgroundColorProperty = new dependencyObservable.Property("selectedBackgroundColor", "SegmentedBar", new proxy.PropertyMetadata(undefined));
    public static selectedIndexProperty = new dependencyObservable.Property("selectedIndex", "SegmentedBar", new proxy.PropertyMetadata(undefined));
    public static itemsProperty = new dependencyObservable.Property("items", "SegmentedBar", new proxy.PropertyMetadata(undefined));
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.items && this.items.length > 0) {
            var i = 0;
            var length = this.items.length;
            for (; i < length; i++) {
                this.items[i].bindingContext = newValue;
            }
        }
    }
}
