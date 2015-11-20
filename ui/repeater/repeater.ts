import definition = require("ui/repeater");
import proxy = require("ui/core/proxy");
import dependencyObservable = require("ui/core/dependency-observable");
import viewModule = require("ui/core/view");
import observable = require("data/observable");
import observableArray = require("data/observable-array");
import weakEvents = require("ui/core/weak-event-listener");
import types = require("utils/types");
import layoutBaseModule = require("ui/layouts/layout-base");
import stackLayoutModule = require("ui/layouts/stack-layout");
import builder = require("ui/builder");
import utils = require("utils/utils");
import platform = require("platform");
import labelModule = require("ui/label");
import trace = require("trace");

var ITEMS = "items";
var ITEMTEMPLATE = "itemTemplate";
var LAYOUT = "layout";
var REPEATER = "Repeater";

export module knownTemplates {
    export var itemTemplate = "itemTemplate";
}

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var repeater = <Repeater>data.object;
    repeater._onItemsPropertyChanged(data);
}

function onItemTemplatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var repeater = <Repeater>data.object;
    repeater._onItemTemplatePropertyChanged(data);
}

function onItemsLayoutPropertyPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var repeater = <Repeater>data.object;
    repeater._onItemsLayoutPropertyPropertyChanged(data);

}

export class Repeater extends viewModule.CustomLayoutView implements definition.Repeater {
    private _ios: UIView;
    private _isDirty = false;

    constructor() {
        super();

        if (platform.device.os === platform.platformNames.ios) {
            this._ios = UIView.new();
        }

        this.itemsLayout = new stackLayoutModule.StackLayout();
    }

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

    public static itemsLayoutProperty = new dependencyObservable.Property(
        LAYOUT,
        REPEATER,
        new proxy.PropertyMetadata(
            undefined,
            dependencyObservable.PropertyMetadataSettings.AffectsLayout,
            onItemsLayoutPropertyPropertyChanged
            )
        );

    get items(): any {
        return this._getValue(Repeater.itemsProperty);
    }
    set items(value: any) {
        this._setValue(Repeater.itemsProperty, value);
    }

    get itemTemplate(): string | viewModule.Template {
        return this._getValue(Repeater.itemTemplateProperty);
    }
    set itemTemplate(value: string | viewModule.Template) {
        this._setValue(Repeater.itemTemplateProperty, value);
    }

    get itemsLayout(): layoutBaseModule.LayoutBase {
        return this._getValue(Repeater.itemsLayoutProperty);
    }
    set itemsLayout(value: layoutBaseModule.LayoutBase) {
        this._setValue(Repeater.itemsLayoutProperty, value);
    }

    public onLoaded() {
        trace.write("Repeater.onLoaded()", "Repeater");
        if (this._isDirty) {
            this.refresh();
        }

        super.onLoaded();
    }

    private _requestRefresh() {
        trace.write(`Repeater._requestRefresh()`, "Repeater");
        this._isDirty = true;
        if (this.isLoaded) {
            this.refresh();
        }
    }

    public refresh() {
        trace.write("Repeater.refresh()", "Repeater");
        if (this.itemsLayout) {
            this.itemsLayout.removeChildren();
        }

        if (types.isNullOrUndefined(this.items) || !types.isNumber(this.items.length)) {
            return;
        }

        var length = this.items.length;
        for (let i = 0; i < length; i++) {
            let viewToAdd = !types.isNullOrUndefined(this.itemTemplate) ? builder.parse(this.itemTemplate, this) : this._getDefaultItemContent(i);
            var dataItem = this._getDataItem(i);
            //trace.write(`viewToAdd.bindingContext = ${dataItem};`, "Repeater");
            viewToAdd.bindingContext = dataItem;
            //trace.write(`Repeater.itemsLayout.addChild(${viewToAdd})`, "Repeater");
            this.itemsLayout.addChild(viewToAdd);
        }

        this._isDirty = false;
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        trace.write(`Repeater._onItemsPropertyChanged(${data.oldValue} => ${data.newValue})`, "Repeater");
        if (data.oldValue instanceof observableArray.ObservableArray) {
            weakEvents.removeWeakEventListener(data.oldValue, observableArray.ObservableArray.changeEvent, this._onItemsChanged, this);
        }

        if (data.newValue instanceof observableArray.ObservableArray) {
            weakEvents.addWeakEventListener(data.newValue, observableArray.ObservableArray.changeEvent, this._onItemsChanged, this);
        }

        this._requestRefresh();
    }

    public _onItemTemplatePropertyChanged(data: dependencyObservable.PropertyChangeData) {
        trace.write(`Repeater._onItemTemplatePropertyChanged(${data.oldValue} => ${data.newValue})`, "Repeater");
        this._requestRefresh();
    }

    public _onItemsLayoutPropertyPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        trace.write(`Repeater._onItemsLayoutPropertyPropertyChanged(${data.oldValue} => ${data.newValue})`, "Repeater");
        if (data.oldValue instanceof layoutBaseModule.LayoutBase) {
            this._removeView((<layoutBaseModule.LayoutBase>data.oldValue));
        }

        if (data.newValue instanceof layoutBaseModule.LayoutBase) {
            this._addView((<layoutBaseModule.LayoutBase>data.newValue));
        }

        this._requestRefresh();
    }

    private _onItemsChanged(data: observable.EventData) {
        trace.write(`Repeater._onItemsChanged(${data})`, "Repeater");
        this._requestRefresh();
    }

    public _getDefaultItemContent(index: number): viewModule.View {
        var lbl = new labelModule.Label();
        lbl.bind({
            targetProperty: "text",
            sourceProperty: "$value"
        });
        return lbl;
    }

    private _getDataItem(index: number): any {
        return this.items.getItem ? this.items.getItem(index) : this.items[index];
    }

    get ios(): UIView {
        return this._ios;
    }

    get _childrenCount(): number {
        var count = 0;

        if (this.itemsLayout) {
            count++;
        }

        return count;
    }

    public _eachChildView(callback: (child: viewModule.View) => boolean) {
        if (this.itemsLayout) {
            callback(this.itemsLayout);
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        viewModule.View.layoutChild(this, this.itemsLayout, 0, 0, right - left, bottom - top);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var result = viewModule.View.measureChild(this, this.itemsLayout, widthMeasureSpec, heightMeasureSpec);

        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

        var widthAndState = viewModule.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        var heightAndState = viewModule.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

}