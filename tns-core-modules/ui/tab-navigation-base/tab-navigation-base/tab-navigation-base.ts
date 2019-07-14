// Types
import { TabNavigationBase as TabNavigationBaseDefinition, SelectedIndexChangedEventData } from ".";
import { TabContentItem } from "../tab-content-item";
import { TabStrip } from "../tab-strip";
import { TabStripItem } from "../tab-strip-item";
import { ViewBase, AddArrayFromBuilder, AddChildFromBuilder, EventData } from "../../core/view";

// Requires
import { View, Property, CoercibleProperty, isIOS } from "../../core/view";

// TODO: Impl trace
// export const traceCategory = "TabView";

export module knownCollections {
    export const items = "items";
}

export class TabNavigationBase extends View implements TabNavigationBaseDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabContentItem[];
    public tabStrip: TabStrip;
    public selectedIndex: number;

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "TabContentItem") {
            if (!this.items) {
                this.items = new Array<TabContentItem>();
            }
            this.items.push(<TabContentItem>value);
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        } else if (name === "TabStrip") {
            this.tabStrip = value;
            this._addView(value);
        }
    }

    get _selectedView(): View {
        let selectedIndex = this.selectedIndex;

        return selectedIndex > -1 ? this.items[selectedIndex].view : null;
    }

    get _childrenCount(): number {
        const items = this.items;

        return items ? items.length : 0;
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item);
            });
        }

        const tabStrip = this.tabStrip;
        if (tabStrip) {
            callback(tabStrip);
        }
    }

    public eachChildView(callback: (child: View) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item.view);
            });
        }
    }

    public onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void {
        if (oldItems) {
            oldItems.forEach(item => this._removeView(item));
        }

        if (newItems) {
            newItems.forEach(item => {
                if (!item.view) {
                    throw new Error(`TabContentItem must have a view.`);
                }

                this._addView(item);
            });
        }
    }

    public onTabStripChanged(oldTabStrip: TabStrip, newTabStrip: TabStrip) {
        if (oldTabStrip && oldTabStrip.items && oldTabStrip.items.length) {
            oldTabStrip.items.forEach(item => this._removeView(item));
        }

        if (newTabStrip && newTabStrip.items && newTabStrip.items.length) {
            newTabStrip.items.forEach(item => {
                this._addView(item);
            });
        }
    }

    public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
        // to be overridden in platform specific files
        this.notify(<SelectedIndexChangedEventData>{ eventName: TabNavigationBase.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
    }

    public getTabBarBackgroundColor(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarBackgroundColor(value: any): void {
        // overridden by inheritors
    }

    public getTabBarFontInternal(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarFontInternal(value: any): void {
        // overridden by inheritors
    }

    public getTabBarTextTransform(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarTextTransform(value: any): void {
        // overridden by inheritors
    }

    public getTabBarHighlightColor(): any {
        // overridden by inheritors
    }

    public setTabBarHighlightColor(value: any) {
        // overridden by inheritors
    }

    public getTabBarColor(): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarColor(value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemBackgroundColor(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemColor(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemColor(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemFontSize(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemFontSize(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemFontInternal(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemFontInternal(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }

    public getTabBarItemTextTransform(tabStripItem: TabStripItem): any {
        // overridden by inheritors
        return null;
    }

    public setTabBarItemTextTransform(tabStripItem: TabStripItem, value: any): void {
        // overridden by inheritors
    }
}

export interface TabNavigationBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

export const selectedIndexProperty = new CoercibleProperty<TabNavigationBase, number>({
    name: "selectedIndex", defaultValue: -1, affectsLayout: isIOS,
    valueChanged: (target, oldValue, newValue) => {
        target.onSelectedIndexChanged(oldValue, newValue);
    },
    coerceValue: (target, value) => {
        let items = target.items;
        if (items) {
            let max = items.length - 1;
            if (value < 0) {
                value = 0;
            }
            if (value > max) {
                value = max;
            }
        } else {
            value = -1;
        }

        return value;
    },
    valueConverter: (v) => parseInt(v)
});
selectedIndexProperty.register(TabNavigationBase);

export const itemsProperty = new Property<TabNavigationBase, TabContentItem[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
    }
});
itemsProperty.register(TabNavigationBase);

export const tabStripProperty = new Property<TabNavigationBase, TabStrip>({
    name: "tabStrip", valueChanged: (target, oldValue, newValue) => {
        target.onTabStripChanged(oldValue, newValue);
    }
});
tabStripProperty.register(TabNavigationBase);
