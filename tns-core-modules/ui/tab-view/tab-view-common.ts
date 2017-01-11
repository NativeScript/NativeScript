import { TabView as TabViewDefinition, TabViewItem as TabViewItemDefinition, SelectedIndexChangedEventData } from "ui/tab-view";
import {
    View, ViewBase, Style, Property, CssProperty, CoercibleProperty,
    Color, isIOS, AddArrayFromBuilder, AddChildFromBuilder
} from "ui/core/view";

export * from "ui/core/view";

export const traceCategory = "TabView";

// TODO: Change base class to ViewBase and use addView method to add it.
// This way we will support property and binding propagation automatically.
export abstract class TabViewItemBase extends ViewBase implements TabViewItemDefinition, AddChildFromBuilder {
    private _title: string = "";
    private _view: View;
    private _iconSource: string;

    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof View) {
            this.view = value;
        }
    }

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
            this._addView(value);
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

    public eachChild(callback: (child: ViewBase) => boolean) {
        const view = this._view;
        if (view) {
            callback(view);
        }
    }

    public abstract _update();
}

export module knownCollections {
    export const items = "items";
}

export class TabViewBase extends View implements TabViewDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabViewItemDefinition[];
    public selectedIndex: number;
    public androidOffscreenTabLimit: number;
    public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "TabViewItem") {
            if (!this.items) {
                this.items = new Array<TabViewItemBase>();
            }
            this.items.push(<TabViewItemBase>value);
            this._addView(value);
            selectedIndexProperty.coerce(this);
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

    public eachChild(callback: (child: ViewBase) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item);
            });
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

    public onItemsChanged(oldItems: TabViewItemDefinition[], newItems: TabViewItemDefinition[]): void {
        if (oldItems) {
            for (let i = 0, count = oldItems.length; i < count; i++) {
                this._removeView(oldItems[i]);
            }
        }

        if (newItems) {
            for (let i = 0, count = newItems.length; i < count; i++) {
                const item = newItems[i];
                if (!item) {
                    throw new Error(`TabViewItem at index ${i} is undefined.`);
                }

                if (!item.view) {
                    throw new Error(`TabViewItem at index ${i} does not have a view.`);
                }
                this._addView(item);
            }
        }
    }
}

export const selectedIndexProperty = new CoercibleProperty<TabViewBase, number>({
    name: "selectedIndex", defaultValue: -1, affectsLayout: isIOS,
    valueChanged: (target, oldValue, newValue) => {
        target.notify(<SelectedIndexChangedEventData>{ eventName: TabViewBase.selectedIndexChangedEvent, object: this, oldIndex: oldValue, newIndex: newValue });
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
selectedIndexProperty.register(TabViewBase);

export const itemsProperty = new Property<TabViewBase, TabViewItemDefinition[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
        selectedIndexProperty.coerce(target);
    }
});
itemsProperty.register(TabViewBase);

export const iosIconRenderingModeProperty = new Property<TabViewBase, "automatic" | "alwaysOriginal" | "alwaysTemplate">({ name: "iosIconRenderingMode", defaultValue: "automatic" });
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