import observable = require("data/observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import definition = require("ui/list-view");
import dependencyObservable = require("ui/core/dependency-observable");
import color = require("color");
import * as builderModule from "ui/builder";
import * as labelModule from "ui/label";
import * as observableArrayModule from "data/observable-array";
import * as weakEventsModule from "ui/core/weak-event-listener";
import {isString, isFunction} from "utils/types";
import { Bindable } from "ui/core/bindable";

var builder: typeof builderModule;
function ensureBuilder() {
    if (!builder) {
        builder = require("ui/builder");
    }
}

var label: typeof labelModule;
function ensureLabel() {
    if (!label) {
        label = require("ui/label");
    }
}

var observableArray: typeof observableArrayModule;
function ensureObservableArray() {
    if (!observableArray) {
        observableArray = require("data/observable-array");
    }
}

var weakEvents: typeof weakEventsModule;
function ensureWeakEvents() {
    if (!weakEvents) {
        weakEvents = require("ui/core/weak-event-listener");
    }
}

var ITEMS = "items";
var ITEMTEMPLATE = "itemTemplate";
var ITEMTEMPLATES = "itemTemplates";
var ISSCROLLING = "isScrolling";
var LISTVIEW = "ListView";
var SEPARATORCOLOR = "separatorColor";
var ROWHEIGHT = "rowHeight";

export module knownTemplates {
    export var itemTemplate = "itemTemplate";
}

export module knownMultiTemplates {
    export var itemTemplates = "itemTemplates";
}

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <ListView>data.object;
    listView._onItemsPropertyChanged(data);
}

function onItemTemplatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <definition.ListView>data.object;
    listView.refresh();
}

function onItemTemplatesPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <ListView>data.object;
    listView._onItemTemplatesPropertyChanged(data);
}

function onRowHeightPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var listView = <ListView>data.object;
    listView._onRowHeightPropertyChanged(data);
}

export class ListView extends view.View implements definition.ListView {
    public static itemLoadingEvent = "itemLoading";
    public static itemTapEvent = "itemTap";
    public static loadMoreItemsEvent = "loadMoreItems";
    public static knownFunctions = ["itemTemplateSelector"]; //See component-builder.ts isKnownFunction
    
    private _itemTemplateSelector: (item: any, index: number, items: any) => string;
    private _itemTemplateSelectorBindable = new Bindable();
    public _defaultTemplate: view.KeyedTemplate = {
        key: "default",
        createView: () => {
            if (this.itemTemplate) {
                ensureBuilder();
                return builder.parse(this.itemTemplate, this); 
            }
            return undefined;
        }
    }
    public _itemTemplatesInternal = new Array<view.KeyedTemplate>(this._defaultTemplate);

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

    public static itemTemplatesProperty = new dependencyObservable.Property(
        ITEMTEMPLATES,
        LISTVIEW,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onItemTemplatesPropertyChanged
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

    public static rowHeightProperty = new dependencyObservable.Property(
        ROWHEIGHT,
        LISTVIEW,
        new proxy.PropertyMetadata(
            -1,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onRowHeightPropertyChanged
            )
    );

    get items(): any {
        return this._getValue(ListView.itemsProperty);
    }
    set items(value: any) {
        this._setValue(ListView.itemsProperty, value);
    }

    get itemTemplate(): string | view.Template {
        return this._getValue(ListView.itemTemplateProperty);
    }
    set itemTemplate(value: string | view.Template) {
        this._setValue(ListView.itemTemplateProperty, value);
    }

    get itemTemplates(): string | Array<view.KeyedTemplate> {
        return this._getValue(ListView.itemTemplatesProperty);
    }
    set itemTemplates(value: string | Array<view.KeyedTemplate>) {
        let newValue = value;
        if (isString(newValue)){
            ensureBuilder();
            newValue = builder.parseMultipleTemplates(<string>newValue, this);
        }
        this._setValue(ListView.itemTemplatesProperty, newValue);
    }

    get itemTemplateSelector(): string | ((item: any, index: number, items: any) => string) {
        return this._itemTemplateSelector;
    }

    set itemTemplateSelector(value: string | ((item: any, index: number, items: any) => string)) {
        if (isString(value)){
            this._itemTemplateSelectorBindable.bind({
                sourceProperty: null,
                targetProperty: "templateKey",
                expression: <string>value
            });
            this._itemTemplateSelector = (item: any, index: number, items: any) => {
                item["$index"] = index;
                this._itemTemplateSelectorBindable.bindingContext = item;
                return this._itemTemplateSelectorBindable.get("templateKey"); 
            };
        }
        else if (isFunction(value)) {
            this._itemTemplateSelector = <((item: any, index: number, items: any) => string)>value;
        }
    }

    get isScrolling(): boolean {
        return false;
    }
    set isScrolling(value: boolean) {
        // Do nothing.
    }

    get separatorColor(): color.Color {
        return this._getValue(ListView.separatorColorProperty);
    }
    set separatorColor(value: color.Color) {
        this._setValue(ListView.separatorColorProperty,
            value instanceof color.Color ? value : new color.Color(<any>value));
    }

    get rowHeight(): number {
        return this._getValue(ListView.rowHeightProperty);
    }
    set rowHeight(value: number) {
        this._setValue(ListView.rowHeightProperty, value);
    }

    public refresh() {
        //
    }

    public scrollToIndex(index: number) {
        //
    }

    public _getItemTemplate(index: number): view.KeyedTemplate {
        let templateKey = "default";
        if (this.itemTemplateSelector){
            let dataItem = this._getDataItem(index);
            templateKey = this._itemTemplateSelector(dataItem, index, this.items);
        }

        for (let i = 0, length = this._itemTemplatesInternal.length; i < length; i++) {
            if (this._itemTemplatesInternal[i].key === templateKey){
                return this._itemTemplatesInternal[i];
            }
        }

        // This is the default template
        return this._itemTemplatesInternal[0]; 
    }
    
    public _prepareItem(item: view.View, index: number) {
        if (item) {
            item.bindingContext = this._getDataItem(index);
        }
    }

    private _getDataItem(index: number): any {
        let thisItems = this.items;
        return thisItems.getItem ? thisItems.getItem(index) : thisItems[index];
    }

    public _getDefaultItemContent(index: number): view.View {
        ensureLabel();

        var lbl = new label.Label();
        lbl.bind({
            targetProperty: "text",
            sourceProperty: "$value"
        });
        return lbl;
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        ensureObservableArray();
        ensureWeakEvents();

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

    public _onRowHeightPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        this.refresh();
    }

    public _onItemTemplatesPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        //
    }
}