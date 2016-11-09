import definition = require("ui/tab-view");
import {View, AddArrayFromBuilder} from "ui/core/view";
import {PropertyMetadataSettings, Property, PropertyChangeData} from "ui/core/dependency-observable";
import {Bindable} from "ui/core/bindable";
import {isAndroid} from "platform";
import {PropertyMetadata} from "ui/core/proxy";
import types = require("utils/types");
import trace = require("trace");
import color = require("color");

// on Android we explicitly set propertySettings to None because android will invalidate its layout (skip unnecessary native call).
let AffectsLayout = isAndroid ? PropertyMetadataSettings.None : PropertyMetadataSettings.AffectsLayout;

export var traceCategory = "TabView";

export class TabViewItem extends Bindable implements definition.TabViewItem {
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

    public _update() {
        //
    }
}

var TAB_VIEW = "TabView";
var ITEMS = "items";
var SELECTED_INDEX = "selectedIndex";

export module knownCollections {
    export var items = "items";
}

var itemsProperty = new Property(ITEMS, TAB_VIEW, new PropertyMetadata(undefined, AffectsLayout));
var selectedIndexProperty = new Property(SELECTED_INDEX, TAB_VIEW, new PropertyMetadata(undefined, AffectsLayout));

(<PropertyMetadata>selectedIndexProperty.metadata).onSetNativeValue = function (data: PropertyChangeData) {
    var tabView = <TabView>data.object;
    tabView._onSelectedIndexPropertyChangedSetNativeValue(data);
};

(<PropertyMetadata>itemsProperty.metadata).onSetNativeValue = function (data: PropertyChangeData) {
    var tabView = <TabView>data.object;
    tabView._onItemsPropertyChangedSetNativeValue(data);
}

export class TabView extends View implements definition.TabView, AddArrayFromBuilder {
    public static itemsProperty = itemsProperty;
    public static selectedIndexProperty = selectedIndexProperty;
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === ITEMS) {
            this.items = value;
        }
    }

    get items(): Array<definition.TabViewItem> {
        return this._getValue(TabView.itemsProperty);
    }
    set items(value: Array<definition.TabViewItem>) {
        this._setValue(TabView.itemsProperty, value);
    }

    public _onItemsPropertyChangedSetNativeValue(data: PropertyChangeData) {
        if (trace.enabled) {
            trace.write("TabView.__onItemsPropertyChangedSetNativeValue(" + data.oldValue + " -> " + data.newValue + ");", traceCategory);
        }
        if (data.oldValue) {
            this._removeTabs(data.oldValue);
        }

        if (data.newValue) {
            this._addTabs(data.newValue);
        }

        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);
    }

    public _updateSelectedIndexOnItemsPropertyChanged(newItems) {
        if (trace.enabled) {
            trace.write("TabView._updateSelectedIndexOnItemsPropertyChanged(" + newItems + ");", traceCategory);
        }
        var newItemsCount = 0;
        if (newItems) {
            newItemsCount = newItems.length;
        }

        if (newItemsCount === 0) {
            this.selectedIndex = undefined;
        }
        else if (types.isUndefined(this.selectedIndex) || this.selectedIndex >= newItemsCount) {
            this.selectedIndex = 0;
        }
    }

    public _removeTabs(oldItems: Array<definition.TabViewItem>) {
        var i: number;
        var length = oldItems.length;
        var oldItem: definition.TabViewItem;
        for (i = 0; i < length; i++) {
            oldItem = oldItems[i];

            if (!oldItem) {
                throw new Error("TabViewItem at index " + i + " is undefined.");
            }

            if (!oldItem.view) {
                throw new Error("TabViewItem at index " + i + " does not have a view.");
            }
            this._removeView(oldItem.view);
        }        
    }

    public _addTabs(newItems: Array<definition.TabViewItem>) {
        // Validate that all items are ok before the native _addTabs code runs.
        var i: number;
        var length = newItems.length;
        var newItem: definition.TabViewItem;
        for (i = 0; i < length; i++) {
            newItem = newItems[i];

            if (!newItem) {
                throw new Error("TabViewItem at index " + i + " is undefined.");
            }

            if (!newItem.view) {
                throw new Error("TabViewItem at index " + i + " does not have a view.");
            }
            this._addView(newItem.view, i);
        }
    }

    get selectedIndex(): number {
        return this._getValue(TabView.selectedIndexProperty);
    }
    set selectedIndex(value: number) {
        this._setValue(TabView.selectedIndexProperty, value);
    }

    // [Deprecated. Please use `selectedTabTextColor` to color the titles of the tabs on both platforms and `androidSelectedTabHighlightColor` to color the horizontal line at the bottom of the tab on Android.]
    get selectedColor(): color.Color {
        // Avoid breaking changes and keep the old behavior until we remove this prop
        if (isAndroid){
            return this.style.androidSelectedTabHighlightColor;
        }
        else {
            return this.style.selectedTabTextColor;
        }
    }
    set selectedColor(value: color.Color) {
        // Avoid breaking changes and keep the old behavior until we remove this prop
        if (isAndroid){
            this.style.androidSelectedTabHighlightColor = value;;
        }
        else {
            this.style.selectedTabTextColor = value;
        }
    }

    // [Deprecated. Please use `tabBackgroundColor` instead]
    get tabsBackgroundColor(): color.Color {
        return this.style.tabBackgroundColor;
    }
    set tabsBackgroundColor(value: color.Color) {
        this.style.tabBackgroundColor = value;
    }

    get tabTextColor(): color.Color {
        return this.style.tabTextColor;
    }
    set tabTextColor(value: color.Color) {
        this.style.tabTextColor = value;
    }

    get tabBackgroundColor(): color.Color {
        return this.style.tabBackgroundColor;
    }
    set tabBackgroundColor(value: color.Color) {
        this.style.tabBackgroundColor = value;
    }

    get selectedTabTextColor(): color.Color {
        return this.style.selectedTabTextColor;
    }
    set selectedTabTextColor(value: color.Color) {
        this.style.selectedTabTextColor = value;
    }

    get androidSelectedTabHighlightColor(): color.Color {
        return this.style.androidSelectedTabHighlightColor;
    }
    set androidSelectedTabHighlightColor(value: color.Color) {
        this.style.androidSelectedTabHighlightColor = value;
    }

    get textTransform(): string {
        return this.style.textTransform;
    }
    set textTransform(value: string) {
        this.style.textTransform = value;
    }

    get iosIconRenderingMode(): string {
        return undefined;
    }
    set iosIconRenderingMode(value: string) {
        //
    }

    get androidOffscreenTabLimit(): number {
        return undefined;
    }
    set androidOffscreenTabLimit(value: number) {
        //
    }

    public _onSelectedIndexPropertyChangedSetNativeValue(data: PropertyChangeData) {
        var index = this.selectedIndex;
        if (types.isUndefined(index)) {
            return;
        }

        if (types.isDefined(this.items)) {
            if (index < 0 || index >= this.items.length) {
                this.selectedIndex = undefined;
                throw new Error("SelectedIndex should be between [0, items.length)");
            }
        }
    }

    get _selectedView(): View {
        var _items = this.items;
        var _selectedIndex = this.selectedIndex;

        if (!_items) {
            return undefined;
        }

        if (_items.length === 0) {
            return undefined;
        }

        if (_selectedIndex === undefined) {
            return undefined;
        }

        return _items[_selectedIndex].view;
    }

    get _childrenCount(): number {
        if (this.items) {
            return this.items.length;
        }

        return 0;
    }

    public _eachChildView(callback: (child: View) => boolean) {
        var _items = this.items;

        if (!_items) {
            return;
        }

        var i;
        var length = _items.length;
        var item: definition.TabViewItem;
        var retVal: boolean;

        for (i = 0; i < length; i++) {
            item = _items[i];
            if (item.view) {
                retVal = callback(item.view);
                if (retVal === false) {
                    break;
                }
            }
        }
    }

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
    
    public _getAndroidTabView(): org.nativescript.widgets.TabLayout {
        // Android specific
        return undefined;
    }

    public _updateIOSTabBarColorsAndFonts(): void {
        // iOS sepcific
    }
} 