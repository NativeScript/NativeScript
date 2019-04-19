import { BottomNavigation as TabViewDefinition, TabContentItem as TabContentItemDefinition, SelectedIndexChangedEventData } from ".";
import {
    View, ViewBase, Style, Property, CssProperty, CoercibleProperty,
    Color, isIOS, AddArrayFromBuilder, AddChildFromBuilder, EventData, CSSType,
    traceWrite, traceCategories, traceMessageType, booleanConverter
} from "../core/view";

export * from "../core/view";
import { TextTransform } from "../text-base";
import { Image } from "../image/image";
import { Label } from "../label/label";

export const traceCategory = "TabView";

@CSSType("TabContentItem")
export abstract class TabContentItemBase extends ViewBase implements TabContentItemDefinition, AddChildFromBuilder {
    private _view: View;

    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof View) {
            this.view = value;
        }
    }

    get view(): View {
        return this._view;
    }
    set view(value: View) {
        if (this._view !== value) {
            if (this._view) {
                throw new Error("Changing the view of an already loaded TabContentItem is not currently supported.");
            }

            this._view = value;
            this._addView(value);
        }
    }

    public eachChild(callback: (child: ViewBase) => boolean) {
        const view = this._view;
        if (view) {
            callback(view);
        }
    }

    public loadView(view: ViewBase): void {
        const tabView = this.parent as TabNavigationBase;
        if (tabView && tabView.items) {
            // Don't load items until their fragments are instantiated.
            if ((<TabContentItemDefinition>this).canBeLoaded) {
                super.loadView(view);
            }
        }
    }

    // public abstract _update();
}

export class TabStripItem extends ViewBase implements AddChildFromBuilder {
    public title: string;
    public iconSource: string;
    public image: Image;
    public label: Label;

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "Image") {
            this.image = <Image>value;
            this.iconSource = (<Image>value).src;
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }

        if (name === "Label") {
            this.label = <Label>value;
            this.title = (<Label>value).text;
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }
    }
}

export class TabStrip extends ViewBase implements AddChildFromBuilder, AddArrayFromBuilder {
    public items: TabStripItem[];
    public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "TabStripItem") {
            if (!this.items) {
                this.items = new Array<TabStripItem>();
            }
            this.items.push(<TabStripItem>value);
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }
    }
} 

export module knownCollections {
    export const items = "items";
}

@CSSType("TabView")
export class TabNavigationBase extends View implements AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabContentItemDefinition[];
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
                this.items = new Array<TabContentItemBase>();
            }
            this.items.push(<TabContentItemBase>value);
            this._addView(value);
            selectedIndexProperty.coerce(this);
        } else if (name === "TabStrip") {
            this.tabStrip = value;
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
    }

    public eachChildView(callback: (child: View) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item.view);
            });
        }
    }

    public onItemsChanged(oldItems: TabContentItemDefinition[], newItems: TabContentItemDefinition[]): void {
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

    public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
        // to be overridden in platform specific files
        this.notify(<SelectedIndexChangedEventData>{ eventName: TabNavigationBase.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
    }
}

export interface TabViewBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

export function traceMissingIcon(icon: string) {
    traceWrite("Could not load tab bar icon: " + icon, traceCategories.Error, traceMessageType.error);
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

export const itemsProperty = new Property<TabNavigationBase, TabContentItemDefinition[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
    }
});
itemsProperty.register(TabNavigationBase);

export const iosIconRenderingModeProperty = new Property<TabStrip, "automatic" | "alwaysOriginal" | "alwaysTemplate">({ name: "iosIconRenderingMode", defaultValue: "automatic" });
iosIconRenderingModeProperty.register(TabStrip);
