import definition = require("ui/repeater");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import viewModule = require("ui/core/view");
import observable = require("data/observable");
import observableArray = require("data/observable-array");
import weakEvents = require("ui/core/weak-event-listener");
import enums = require("ui/enums");

var ITEMS = "items";
var WRAP = "wrap";
var ORIENTATION = "orientation";
var ITEMTEMPLATE = "itemTemplate";
var ITEMWIDTH = "itemWidth";
var ITEMHEIGHT = "itemHeight";
var REPEATER = "Repeater";

export module knownTemplates {
    export var itemTemplate = "itemTemplate";
}

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var repeater = <Repeater>data.object;
    repeater._onItemsPropertyChanged(data);
}

function onItemTemplatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var repeater = <definition.Repeater>data.object;
    repeater.refresh();
}

function validateOrientation(value: any): boolean {
    return value === enums.Orientation.vertical || value === enums.Orientation.horizontal;
}

function isWidthHeightValid(value: any): boolean {
    return isNaN(value) || (value >= 0.0 && value !== Number.POSITIVE_INFINITY);
}

export class Repeater extends viewModule.View implements definition.Repeater {

    public static itemsProperty = new dependencyObservable.Property(
        ITEMS,
        REPEATER,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onItemsPropertyChanged
            )
        );

    public static itemTemplateProperty = new dependencyObservable.Property(
        ITEMTEMPLATE,
        REPEATER,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onItemTemplatePropertyChanged
            )
        );

    public static orientationProperty = new dependencyObservable.Property(
        ORIENTATION,
        REPEATER,
        new proxy.PropertyMetadata(enums.Orientation.vertical,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            undefined,
            validateOrientation)
        );

    public static wrapProperty = new dependencyObservable.Property(
        WRAP,
        REPEATER,
        new proxy.PropertyMetadata(false, dependencyObservable.PropertyMetadataSettings.AffectsLayout)
        );

    public static itemWidthProperty = new dependencyObservable.Property(
        ITEMWIDTH,
        REPEATER,
        new proxy.PropertyMetadata(Number.NaN,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            undefined,
            isWidthHeightValid)
        );

    public static itemHeightProperty = new dependencyObservable.Property(
        ITEMHEIGHT,
        REPEATER,
        new proxy.PropertyMetadata(Number.NaN,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            undefined,
            isWidthHeightValid)
        );

    get items(): any {
        return this._getValue(Repeater.itemsProperty);
    }
    set items(value: any) {
        this._setValue(Repeater.itemsProperty, value);
    }

    get itemTemplate(): string {
        return this._getValue(Repeater.itemTemplateProperty);
    }
    set itemTemplate(value: string) {
        this._setValue(Repeater.itemTemplateProperty, value);
    }

    public refresh() {
        //
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

    get wrap(): boolean {
        return this._getValue(Repeater.wrapProperty);
    }
    set wrap(value: boolean) {
        this._setValue(Repeater.wrapProperty, value);
    }

    get orientation(): string {
        return this._getValue(Repeater.orientationProperty);
    }
    set orientation(value: string) {
        this._setValue(Repeater.orientationProperty, value);
    }

    get itemWidth(): number {
        return this._getValue(Repeater.itemWidthProperty);
    }
    set itemWidth(value: number) {
        this._setValue(Repeater.itemWidthProperty, value);
    }

    get itemHeight(): number {
        return this._getValue(Repeater.itemHeightProperty);
    }
    set itemHeight(value: number) {
        this._setValue(Repeater.itemHeightProperty, value);
    }
}