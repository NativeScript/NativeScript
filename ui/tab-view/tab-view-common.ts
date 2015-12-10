import definition = require("ui/tab-view");
import view = require("ui/core/view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");
import trace = require("trace");
import bindable = require("ui/core/bindable");
import color = require("color");

export var traceCategory = "TabView";

export class TabViewItem extends bindable.Bindable implements definition.TabViewItem {
    private _title: string = "";
    private _view: view.View;
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

    get view(): view.View {
        return this._view;
    }

    set view(value: view.View) {
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
var SELECTED_COLOR = "selectedColor";
var TABS_BACKGROUND_COLOR = "tabsBackgroundColor";

export module knownCollections {
    export var items = "items";
}
var itemsProperty = new dependencyObservable.Property(
    ITEMS,
    TAB_VIEW,
    new proxy.PropertyMetadata(
        undefined,
        dependencyObservable.PropertyMetadataSettings.AffectsLayout));

var selectedIndexProperty = new dependencyObservable.Property(
    SELECTED_INDEX,
    TAB_VIEW,
    new proxy.PropertyMetadata(
        undefined,
        dependencyObservable.PropertyMetadataSettings.AffectsLayout));

var selectedColorProperty = new dependencyObservable.Property(
    SELECTED_COLOR,
    TAB_VIEW,
    new proxy.PropertyMetadata(
        undefined,
        dependencyObservable.PropertyMetadataSettings.None));

var tabsBackgroundColorProperty = new dependencyObservable.Property(
    TABS_BACKGROUND_COLOR,
    TAB_VIEW,
    new proxy.PropertyMetadata(
        undefined,
        dependencyObservable.PropertyMetadataSettings.None));

(<proxy.PropertyMetadata>selectedIndexProperty.metadata).onSetNativeValue = function (data: dependencyObservable.PropertyChangeData) {
    var tabView = <TabView>data.object;
    tabView._onSelectedIndexPropertyChangedSetNativeValue(data);
};

(<proxy.PropertyMetadata>itemsProperty.metadata).onSetNativeValue = function (data: dependencyObservable.PropertyChangeData) {
    var tabView = <TabView>data.object;
    tabView._onItemsPropertyChangedSetNativeValue(data);
}

export class TabView extends view.View implements definition.TabView, view.AddArrayFromBuilder {
    public static itemsProperty = itemsProperty;
    public static selectedIndexProperty = selectedIndexProperty;
    public static selectedColorProperty = selectedColorProperty;
    public static tabsBackgroundColorProperty = tabsBackgroundColorProperty;
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

    public _onItemsPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
        trace.write("TabView.__onItemsPropertyChangedSetNativeValue(" + data.oldValue + " -> " + data.newValue + ");", traceCategory);
        if (data.oldValue) {
            this._removeTabs(data.oldValue);
        }

        if (data.newValue) {
            this._addTabs(data.newValue);
        }

        this._updateSelectedIndexOnItemsPropertyChanged(data.newValue);
    }

    public _updateSelectedIndexOnItemsPropertyChanged(newItems) {
        trace.write("TabView._updateSelectedIndexOnItemsPropertyChanged(" + newItems + ");", traceCategory);
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
        //
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
        }
    }

    get selectedIndex(): number {
        return this._getValue(TabView.selectedIndexProperty);
    }
    set selectedIndex(value: number) {
        this._setValue(TabView.selectedIndexProperty, value);
    }

    get selectedColor(): color.Color {
        return this._getValue(TabView.selectedColorProperty);
    }
    set selectedColor(value: color.Color) {
        this._setValue(TabView.selectedColorProperty,
            value instanceof color.Color ? value : new color.Color(<any>value));
    }

    get tabsBackgroundColor(): color.Color {
        return this._getValue(TabView.tabsBackgroundColorProperty);
    }
    set tabsBackgroundColor(value: color.Color) {
        this._setValue(TabView.tabsBackgroundColorProperty,
            value instanceof color.Color ? value : new color.Color(<any>value));
    }

    public _onSelectedIndexPropertyChangedSetNativeValue(data: dependencyObservable.PropertyChangeData) {
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

    get _selectedView(): view.View {
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

    public _eachChildView(callback: (child: view.View) => boolean) {
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