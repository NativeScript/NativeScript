import { TabView as TabViewDefinition, TabViewItem as TabViewItemDefinition } from "ui/tab-view";
import { Property } from "ui/core/properties";
import { View, AddArrayFromBuilder } from "ui/core/view";
import { Bindable } from "ui/core/bindable";
import { isIOS } from "platform";
import { Color } from "color";

import trace = require("trace");

export const traceCategory = "TabView";

// TODO: Change base class to ViewBase and use addView method to add it.
// This way we will support property and binding propagation automatically.
export abstract class TabViewItemBase extends Bindable implements TabViewItemDefinition {
    private _title: string = "";
    private _view: View;
    private _iconSource: string;

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
            this._update();
        }
    }

    get view(): View {
        return this._view;
    }
    set view(value: View) {
        if (this._view !== value) {
            if (this._view) {
                throw new Error("Changing the view of an already loaded TabViewItem is not currently supported.");
            }

            this._view = value;
        }
    }

    get iconSource(): string {
        return this._iconSource;
    }
    set iconSource(value: string) {
        if (this._iconSource !== value) {
            this._iconSource = value;
            this._update();
        }
    }

    public abstract _update();
}

export module knownCollections {
    export let items = "items";
}

export class TabViewBase extends View implements TabViewDefinition, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabViewItemDefinition[];
    public selectedIndex: number;
    public selectedColor: Color;
    public tabsBackgroundColor: Color;

    protected previousItems: TabViewItemDefinition[];

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _updateSelectedIndexOnItemsPropertyChanged(newItems) {
        if (trace.enabled) {
            trace.write("TabView._updateSelectedIndexOnItemsPropertyChanged(" + newItems + ");", traceCategory);
        }
        let newItemsCount = 0;
        if (newItems) {
            newItemsCount = newItems.length;
        }

        if (newItemsCount === 0) {
            this.selectedIndex = undefined;
        }
        else if (this.selectedIndex < 0 || this.selectedIndex >= newItemsCount) {
            this.selectedIndex = 0;
        }
    }

    public _removeTabs(oldItems: Array<TabViewItemDefinition>) {

        for (let i = 0, length = oldItems.length; i < length; i++) {
            let oldItem = oldItems[i];

            if (!oldItem) {
                throw new Error("TabViewItem at index " + i + " is undefined.");
            }

            if (!oldItem.view) {
                throw new Error("TabViewItem at index " + i + " does not have a view.");
            }
            this._removeView(oldItem.view);
        }
    }

    public _addTabs(newItems: Array<TabViewItemDefinition>) {
        // Validate that all items are ok before the native _addTabs code runs.
        for (let i = 0, length = newItems.length; i < length; i++) {
            let newItem = newItems[i];

            if (!newItem) {
                throw new Error(`TabViewItem at index ${i} is undefined.`);
            }

            if (!newItem.view) {
                throw new Error(`TabViewItem at index ${i} does not have a view.`);
            }
            this._addView(newItem.view, i);
        }
    }

    public _onSelectedIndexPropertyChangedSetNativeValue() {
        let index = this.selectedIndex;
        if (index < 0) {
            return;
        }

        if (this.items) {
            if (index >= this.items.length) {
                this.selectedIndex = unsetValue;
                throw new Error("SelectedIndex should be between [0, items.length)");
            }
        }
    }

    get _selectedView(): View {
        let items = this.items;
        let selectedIndex = this.selectedIndex;

        if (!items || items.length === 0 || selectedIndex < (items.length - 1)) {
            return undefined;
        }

        return items[selectedIndex].view;
    }

    get _childrenCount(): number {
        if (this.items) {
            return this.items.length;
        }

        return 0;
    }

    public _eachChildView(callback: (child: View) => boolean) {
        let items = this.items;
        if (!items) {
            return;
        }

        for (let i = 0, length = items.length; i < length; i++) {
            let item = items[i];
            if (item.view) {
                let retVal = callback(item.view);
                if (retVal === false) {
                    break;
                }
            }
        }
    }

    public _onBindingContextChanged(oldValue: any, newValue: any) {
        super._onBindingContextChanged(oldValue, newValue);
        if (this.items && this.items.length > 0) {
            
            for (let i = 0, length = this.items.length; i < length; i++) {
                this.items[i].bindingContext = newValue;
            }
        }
    }

    public _getAndroidTabView(): org.nativescript.widgets.TabLayout {
        // Android specific
        return undefined;
    }

    public _updateIOSTabBarColorsAndFonts(): void {
        // iOS sepcific
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        this._onSelectedIndexPropertyChangedSetNativeValue();
    }

    public onItemsPropertyChanged(oldValue: TabViewItemDefinition[], newValue: TabViewItemDefinition[]) {
        this.previousItems = oldValue;
    }
}

export const itemsProperty = new Property<TabViewBase, TabViewItemBase[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsPropertyChanged(oldValue, newValue);
    }
});
itemsProperty.register(TabViewBase);

export const selectedIndexProperty = new Property<TabViewBase, number>({ name: "selectedIndex", defaultValue: -1, affectsLayout: isIOS });
selectedIndexProperty.register(TabViewBase);

export const selectedColorProperty = new Property<TabViewBase, Color>({ name: "selectedColor" });
selectedColorProperty.register(TabViewBase);

export const tabsBackgroundColorProperty = new Property<TabViewBase, Color>({ name: "tabsBackgroundColor" });
tabsBackgroundColorProperty.register(TabViewBase);
