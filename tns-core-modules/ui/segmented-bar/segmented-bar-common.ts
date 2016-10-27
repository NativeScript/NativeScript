import definition = require("ui/segmented-bar");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");
import bindable = require("ui/core/bindable");
import * as typesModule from "utils/types";

var types: typeof typesModule;
function ensureTypes() {
    if (!types) {
        types = require("utils/types");
    }
}

export module knownCollections {
    export var items = "items";
}

var CHILD_SEGMENTED_BAR_ITEM = "SegmentedBarItem";

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
                ensureTypes();

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
        return this.style.selectedBackgroundColor;
    }
    set selectedBackgroundColor(value: color.Color) {
        this.style.selectedBackgroundColor = value;
    }
    
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
    
    public _addChildFromBuilder(name: string, value: any): void {
        if(name === CHILD_SEGMENTED_BAR_ITEM) {
            if (!this.items) {
                this.items = new Array<SegmentedBarItem>();
            }
            this.items.push(<SegmentedBarItem>value);
            this.insertTab(<SegmentedBarItem>value);
            
        }
    }
    
    public insertTab(tabItem: SegmentedBarItem, index?: number): void {
        //
    }
    
    public getValidIndex(index?: number): number {
        ensureTypes();
        let idx: number;
        let itemsLength = this.items ? this.items.length : 0; 
        if (types.isNullOrUndefined(index)) {
            idx = itemsLength - 1;
        } else {
            if (index < 0 || index > itemsLength) {
                idx = itemsLength - 1;
            } else {
                idx = index;
            }
        }
        return idx;
    }
}
