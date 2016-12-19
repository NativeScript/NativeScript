import { TabView as TabViewDefinition, TabViewItem as TabViewItemDefinition } from "ui/tab-view";
import {
    View, Style, Bindable, Property, CssProperty, CoercibleProperty,
    EventData, Color, isIOS, AddArrayFromBuilder
} from "ui/core/view";

export * from "ui/core/view";

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
    export const items = "items";
}

export class TabViewBase extends View implements TabViewDefinition, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabViewItemDefinition[];
    public selectedIndex: number;
    public androidOffscreenTabLimit: number;
    public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    protected previousItems: TabViewItemDefinition[];

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
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

    get _selectedView(): View {
        let selectedIndex = this.selectedIndex;
        return selectedIndex > -1 ? this.items[selectedIndex].view : null;
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

    // public _onBindingContextChanged(oldValue: any, newValue: any) {
    //     super._onBindingContextChanged(oldValue, newValue);
    //     if (this.items && this.items.length > 0) {

    //         for (let i = 0, length = this.items.length; i < length; i++) {
    //             this.items[i].bindingContext = newValue;
    //         }
    //     }
    // }

    public onItemsPropertyChanged(oldValue: TabViewItemDefinition[], newValue: TabViewItemDefinition[]) {
        this.previousItems = oldValue;
    }
}

export const itemsProperty = new Property<TabViewBase, TabViewItemBase[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsPropertyChanged(oldValue, newValue);
        selectedIndexProperty.coerce(target);
    }
});
itemsProperty.register(TabViewBase);

export const selectedIndexProperty = new CoercibleProperty<TabViewBase, number>({
    name: "selectedIndex", defaultValue: -1, affectsLayout: isIOS,
    valueChanged: (target, oldValue, newValue) => {
        let args = { eventName: TabViewBase.selectedIndexChangedEvent, object: this, oldIndex: oldValue, newIndex: newValue };
        target.notify(args);
    },
    coerceValue: (target, value) => {
        let items = target.items;
        if (items) {
            let max = items.length - 1;
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
selectedIndexProperty.register(TabViewBase);

export const iosIconRenderingModeProperty = new Property<TabViewBase, "automatic" | "alwaysOriginal" | "alwaysTemplate">({name: "iosIconRenderingMode", defaultValue: "automatic" });
iosIconRenderingModeProperty.register(TabViewBase);

export const androidOffscreenTabLimitProperty = new Property<TabViewBase, number>({
    name: "androidOffscreenTabLimit", defaultValue: 1, affectsLayout: isIOS,
    valueConverter: (v) => parseInt(v)
});
androidOffscreenTabLimitProperty.register(TabViewBase);

export const tabTextColorProperty = new CssProperty<Style, Color>({ name: "tabTextColor", cssName: "tab-text-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
tabTextColorProperty.register(Style);

export const tabBackgroundColorProperty = new CssProperty<Style, Color>({ name: "tabBackgroundColor", cssName: "tab-background-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
tabBackgroundColorProperty.register(Style);

export const selectedTabTextColorProperty = new CssProperty<Style, Color>({ name: "selectedTabTextColor", cssName: "selected-tab-text-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
selectedTabTextColorProperty.register(Style);

export const androidSelectedTabHighlightColorProperty = new CssProperty<Style, Color>({ name: "androidSelectedTabHighlightColor", cssName: "android-selected-tab-highlight-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
androidSelectedTabHighlightColorProperty.register(Style);