import definition = require("ui/tool-bar");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");

export module knownCollections {
    export var items = "items";
}

export class ToolBar extends view.View implements definition.ToolBar {
    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this._setValue(ToolBar.itemsProperty, value);
        }
    }

    get items(): Array<definition.ToolBarItem> {
        return this._getValue(ToolBar.itemsProperty);
    }
    set items(value: Array<definition.ToolBarItem>) {
        this._setValue(ToolBar.itemsProperty, value);
    }

    public static itemsProperty = new dependencyObservable.Property("items", "ToolBar", new proxy.PropertyMetadata(undefined))
}