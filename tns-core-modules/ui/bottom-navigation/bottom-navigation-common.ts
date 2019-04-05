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
    // private _title: string = "";
    private _view: View;
    // private _iconSource: string;

    // get textTransform(): TextTransform {
    //     return this.style.textTransform;
    // }
    // set textTransform(value: TextTransform) {
    //     this.style.textTransform = value;
    // }

    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof View) {
            this.view = value;
        }
    }

    // get title(): string {
    //     return this._title;
    // }
    // set title(value: string) {
    //     if (this._title !== value) {
    //         this._title = value;
    //         this._update();
    //     }
    // }

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

    // get iconSource(): string {
    //     return this._iconSource;
    // }
    // set iconSource(value: string) {
    //     if (this._iconSource !== value) {
    //         this._iconSource = value;
    //         this._update();
    //     }
    // }

    public eachChild(callback: (child: ViewBase) => boolean) {
        const view = this._view;
        if (view) {
            callback(view);
        }
    }

    public loadView(view: ViewBase): void {
        const tabView = this.parent as TabViewBase;
        if (tabView && tabView.items) {
            // Don't load items until their fragments are instantiated.
            if ((<TabContentItemDefinition>this).canBeLoaded) {
                super.loadView(view);
            }
        }
    }

    public abstract _update();
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
export class TabViewBase extends View implements AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public items: TabContentItemDefinition[];
    public tabStrip: TabStrip;
    public selectedIndex: number;
    // public androidOffscreenTabLimit: number;
    // public androidTabsPosition: "top" | "bottom";
    // public androidSwipeEnabled: boolean;
    // public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    // get androidSelectedTabHighlightColor(): Color {
    //     return this.style.androidSelectedTabHighlightColor;
    // }
    // set androidSelectedTabHighlightColor(value: Color) {
    //     this.style.androidSelectedTabHighlightColor = value;
    // }

    // get tabTextFontSize(): number {
    //     return this.style.tabTextFontSize;
    // }
    // set tabTextFontSize(value: number) {
    //     this.style.tabTextFontSize = value;
    // }

    // get tabTextColor(): Color {
    //     return this.style.tabTextColor;
    // }
    // set tabTextColor(value: Color) {
    //     this.style.tabTextColor = value;
    // }

    // get tabBackgroundColor(): Color {
    //     return this.style.tabBackgroundColor;
    // }
    // set tabBackgroundColor(value: Color) {
    //     this.style.tabBackgroundColor = value;
    // }

    // get selectedTabTextColor(): Color {
    //     return this.style.selectedTabTextColor;
    // }
    // set selectedTabTextColor(value: Color) {
    //     this.style.selectedTabTextColor = value;
    // }

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
        this.notify(<SelectedIndexChangedEventData>{ eventName: TabViewBase.selectedIndexChangedEvent, object: this, oldIndex, newIndex });
    }
}

export interface TabViewBase {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

export function traceMissingIcon(icon: string) {
    traceWrite("Could not load tab bar icon: " + icon, traceCategories.Error, traceMessageType.error);
}

export const selectedIndexProperty = new CoercibleProperty<TabViewBase, number>({
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
selectedIndexProperty.register(TabViewBase);

export const itemsProperty = new Property<TabViewBase, TabContentItemDefinition[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
    }
});
itemsProperty.register(TabViewBase);

// export const iosIconRenderingModeProperty = new Property<TabViewBase, "automatic" | "alwaysOriginal" | "alwaysTemplate">({ name: "iosIconRenderingMode", defaultValue: "automatic" });
// iosIconRenderingModeProperty.register(TabViewBase);

// export const androidOffscreenTabLimitProperty = new Property<TabViewBase, number>({
//     name: "androidOffscreenTabLimit", defaultValue: 1, affectsLayout: isIOS,
//     valueConverter: (v) => parseInt(v)
// });
// androidOffscreenTabLimitProperty.register(TabViewBase);

// export const androidTabsPositionProperty = new Property<TabViewBase, "top" | "bottom">({ name: "androidTabsPosition", defaultValue: "top" });
// androidTabsPositionProperty.register(TabViewBase);

// export const androidSwipeEnabledProperty = new Property<TabViewBase, boolean>({ name: "androidSwipeEnabled", defaultValue: true, valueConverter: booleanConverter });
// androidSwipeEnabledProperty.register(TabViewBase);

// export const tabTextFontSizeProperty = new CssProperty<Style, number>({ name: "tabTextFontSize", cssName: "tab-text-font-size", valueConverter: (v) => parseFloat(v) });
// tabTextFontSizeProperty.register(Style);

// export const tabTextColorProperty = new CssProperty<Style, Color>({ name: "tabTextColor", cssName: "tab-text-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
// tabTextColorProperty.register(Style);

// export const tabBackgroundColorProperty = new CssProperty<Style, Color>({ name: "tabBackgroundColor", cssName: "tab-background-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
// tabBackgroundColorProperty.register(Style);

// export const selectedTabTextColorProperty = new CssProperty<Style, Color>({ name: "selectedTabTextColor", cssName: "selected-tab-text-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
// selectedTabTextColorProperty.register(Style);

// export const androidSelectedTabHighlightColorProperty = new CssProperty<Style, Color>({ name: "androidSelectedTabHighlightColor", cssName: "android-selected-tab-highlight-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
// androidSelectedTabHighlightColorProperty.register(Style);
