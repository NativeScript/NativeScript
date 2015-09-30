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
    var repeater = <definition.Repeater>data.object;
    repeater.refresh();
}

function onItemsLayoutPropertyPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var repeater = <definition.Repeater>data.object;
    repeater.refresh();
}

export class Repeater extends viewModule.CustomLayoutView implements definition.Repeater {
    private isDirty: boolean = true;
    private _ios: UIView;

    constructor() {
        super();

        if (platform.device.os === platform.platformNames.ios) {
            this._ios = UIView.new();
        }
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

    get itemTemplate(): string {
        return this._getValue(Repeater.itemTemplateProperty);
    }
    set itemTemplate(value: string) {
        this._setValue(Repeater.itemTemplateProperty, value);
    }

    get itemsLayout(): layoutBaseModule.LayoutBase {
        return this._getValue(Repeater.itemsLayoutProperty);
    }
    set itemsLayout(value: layoutBaseModule.LayoutBase) {
        this._setValue(Repeater.itemsLayoutProperty, value);
    }

    public refresh() {
        this.isDirty = true;

        this._createChildren();
    }

    public onLoaded() {
        super.onLoaded();

        this._createChildren();
    }

    public onUnloaded() {
        super.onUnloaded();
    }

    public _onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
        if (data.oldValue instanceof observable.Observable) {
            weakEvents.removeWeakEventListener(data.oldValue, observableArray.ObservableArray.changeEvent, this._onItemsChanged, this);
        }

        if (data.newValue instanceof observable.Observable) {
            weakEvents.addWeakEventListener(data.newValue, observableArray.ObservableArray.changeEvent, this._onItemsChanged, this);
        }

        if (types.isUndefined(this.itemsLayout)) {
            this.itemsLayout = new stackLayoutModule.StackLayout();
        }

        if (this.itemsLayout.parent !== this) {
            this._addView(this.itemsLayout);
        }

        this.refresh();
    }

    private _onItemsChanged(args: observable.EventData) {
        this.refresh();
    }

    private _createChildren() {
        if (this.isDirty) {
            clearItemsLayout(this.itemsLayout);

            if (!types.isNullOrUndefined(this.items) && types.isNumber(this.items.length)) {
                var i: number;
                for (i = 0; i < this.items.length; i++) {
                    var viewToAdd = !types.isNullOrUndefined(this.itemTemplate) ? builder.parse(this.itemTemplate, this) : this._getDefaultItemContent(i);
                    if (!types.isNullOrUndefined(viewToAdd)) {
                        viewToAdd.bindingContext = this._getDataItem(i);
                        this.itemsLayout.addChild(viewToAdd);
                    }
                }
            }
            this.isDirty = false;
        }
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

function clearItemsLayout(itemsLayout: layoutBaseModule.LayoutBase) {
    if (!types.isNullOrUndefined(itemsLayout)) {
        var i: number = itemsLayout.getChildrenCount();
        if (i > 0) {
            while (i >= 0) {
                var child = itemsLayout.getChildAt(i);
                if (!types.isNullOrUndefined(child)) {
                    itemsLayout.removeChild(child);
                }
                i--;
            }
        }
    }
}