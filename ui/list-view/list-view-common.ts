import observable = require("data/observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import definition = require("ui/list-view");
import dependencyObservable = require("ui/core/dependency-observable");
import builder = require("ui/builder");
import label = require("ui/label");
import color = require("color");

var ITEMS = "items";
var ITEMTEMPLATE = "itemTemplate";
var ISSCROLLING = "isScrolling";
var LISTVIEW = "ListView";
var ITEMSCHANGED = "_itemsChanged";
var CHANGE = "change";
var SEPARATORCOLOR = "separatorColor";

export module knownEvents {
    export var itemLoading = "itemLoading";
    export var itemTap = "itemTap";
    export var loadMoreItems = "loadMoreItems";
}

export module knownTemplates {
    export var itemTemplate = "itemTemplate";
}

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <definition.ListView>data.object;
    var itemsChanged = listView[ITEMSCHANGED];

    if (data.oldValue instanceof observable.Observable) {
        (<observable.Observable>data.oldValue).off(CHANGE, itemsChanged);
    }

    if (data.newValue instanceof observable.Observable) {
        (<observable.Observable>data.newValue).on(CHANGE, itemsChanged);
    }

    listView.refresh();
}

function onItemTemplatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <definition.ListView>data.object;
    listView.refresh();
}

export class ListView extends view.View implements definition.ListView {

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

    private _itemsChanged: (args: observable.EventData) => void;

    constructor() {
        super();
        this._itemsChanged = (args: observable.EventData) => { this.refresh(); };
    }

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

    public _getItemTemplateContent(index: number): view.View {
        var v;

        if (this.itemTemplate && this.items) {
            v = builder.parse(this.itemTemplate, getExports(this));
        }

        return v;
    }

    public _prepareItem(item: view.View, index: number) {
        if (item) {
            item.bindingContext = this._getDataItem(index);
        }
    }

    private _getDataItem(index: number): any {
        return this.items.getItem ? this.items.getItem(index) : this.items[index];
    }

    public _getDefaultItemContent(index: number): view.View {
        var lbl = new label.Label();
        lbl.text = this._getDataItem(index) + "";
        return lbl;
    }
}

function getExports(instance: view.View): any {
    var parent = instance.parent;

    while (parent && (<any>parent).exports === undefined) {
        parent = parent.parent;
    }

    return parent ? (<any>parent).exports : undefined;
}