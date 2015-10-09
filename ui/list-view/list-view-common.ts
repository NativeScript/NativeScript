import observable = require("data/observable");
import observableArray = require("data/observable-array");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import definition = require("ui/list-view");
import dependencyObservable = require("ui/core/dependency-observable");
import builder = require("ui/builder");
import label = require("ui/label");
import color = require("color");
import weakEvents = require("ui/core/weak-event-listener");

var ITEMS = "items";
var ITEMTEMPLATE = "itemTemplate";
var ISSCROLLING = "isScrolling";
var LISTVIEW = "ListView";
var SEPARATORCOLOR = "separatorColor";

export module knownTemplates {
    export var itemTemplate = "itemTemplate";
}

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <ListView>data.object;
    listView._onItemsPropertyChanged(data);
}

function onItemTemplatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <definition.ListView>data.object;
    listView.refresh();
}

export class ListView extends view.View implements definition.ListView {
    public static itemLoadingEvent = "itemLoading";
    public static itemTapEvent = "itemTap";
    public static loadMoreItemsEvent = "loadMoreItems";

    public static separatorColorProperty = new dependencyObservable.Property(
        SEPARATORCOLOR,
        LISTVIEW,
        new proxy.PropertyMetadata(undefined));

    public static itemsProperty = new dependencyObservable.Property(
        ITEMS,
        LISTVIEW,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onItemsPropertyChanged
            )
        );

    public static itemTemplateProperty = new dependencyObservable.Property(
        ITEMTEMPLATE,
        LISTVIEW,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onItemTemplatePropertyChanged
            )
        );

    public static isScrollingProperty = new dependencyObservable.Property(
        ISSCROLLING,
        LISTVIEW,
        new proxy.PropertyMetadata(
            false,
            dependencyObservable.PropertyMetadataSettings.None
            )
        );

    get items(): any {
        return this._getValue(ListView.itemsProperty);
    }
    set items(value: any) {
        this._setValue(ListView.itemsProperty, value);
    }

    get itemTemplate(): string {
        return this._getValue(ListView.itemTemplateProperty);
    }
    set itemTemplate(value: string) {
        this._setValue(ListView.itemTemplateProperty, value);
    }

    get isScrolling(): boolean {
        return this._getValue(ListView.isScrollingProperty);
    }
    set isScrolling(value: boolean) {
        this._setValue(ListView.isScrollingProperty, value);
    }

    get separatorColor(): color.Color {
        return this._getValue(ListView.separatorColorProperty);
    }
    set separatorColor(value: color.Color) {
        this._setValue(ListView.separatorColorProperty,
            value instanceof color.Color ? value : new color.Color(<any>value));
    }

    public refresh() {
        //
    }

    public scrollToIndex(index: number) {
        //
    }

    public _getItemTemplateContent(index: number): view.View {
        var v;

        if (this.itemTemplate && this.items) {
            v = builder.parse(this.itemTemplate, this);
        }

        return v;
    }

    public _prepareItem(item: view.View, index: number) {
        if (item) {
            var dataItem = this._getDataItem(index);
            if (!(dataItem instanceof observable.Observable)) {
                item.bindingContext = null;
            }
            item.bindingContext = dataItem;
            item._inheritProperties(this);
        }
    }

    private _getDataItem(index: number): any {
        return this.items.getItem ? this.items.getItem(index) : this.items[index];
    }

    public _getDefaultItemContent(index: number): view.View {
        var lbl = new label.Label();
        lbl.bind({
            targetProperty: "text",
            sourceProperty: "$value"
        });
        return lbl;
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (data.oldValue instanceof observable.Observable) {
            weakEvents.removeWeakEventListener(data.oldValue, observableArray.ObservableArray.changeEvent, this._onItemsChanged, this);
        }

        if (data.newValue instanceof observable.Observable) {
            weakEvents.addWeakEventListener(data.newValue, observableArray.ObservableArray.changeEvent, this._onItemsChanged, this);
        }

        this.refresh();
    }

    private _onItemsChanged(args: observable.EventData) {
        this.refresh();
    }

    public _propagateInheritableProperties(view: view.View) {
        // do not get binding context from parent when adding items, since the binding context of the items will be different.
    }
}