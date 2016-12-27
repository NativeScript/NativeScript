import { Repeater as RepeaterDefinition, ItemsSource } from "ui/repeater";
import { Label } from "ui/label";
import { LayoutBase, CustomLayoutView, View, Template, Property, layout } from "ui/layouts/layout-base";
import { StackLayout } from "ui/layouts/stack-layout";
import { ObservableArray, ChangedData } from "data/observable-array";
import { addWeakEventListener, removeWeakEventListener } from "ui/core/weak-event-listener";
import { parse } from "ui/builder";

export * from "ui/layouts/layout-base";

export module knownTemplates {
    export const itemTemplate = "itemTemplate";
}

export class Repeater extends CustomLayoutView implements RepeaterDefinition {
    private _isDirty = false;
    public ios;
    public android;

    constructor() {
        super();
        // TODO: Do we need this as property?
        this.itemsLayout = new StackLayout();
    }

    public items: any[] | ItemsSource;
    public itemTemplate: string | Template;
    public itemsLayout: LayoutBase;

    public onLoaded() {
        if (this._isDirty) {
            this.refresh();
        }

        super.onLoaded();
    }

    public _requestRefresh() {
        this._isDirty = true;
        if (this.isLoaded) {
            this.refresh();
        }
    }

    public refresh() {
        if (this.itemsLayout) {
            this.itemsLayout.removeChildren();
        }

        if (!this.items) {
            return;
        }

        const length = this.items.length;
        for (let i = 0; i < length; i++) {
            const viewToAdd = this.itemTemplate ? parse(this.itemTemplate, this) : this._getDefaultItemContent(i);
            const dataItem = this._getDataItem(i);
            viewToAdd.bindingContext = dataItem;
            this.itemsLayout.addChild(viewToAdd);
        }

        this._isDirty = false;
    }

    public _onItemsChanged(data: ChangedData<any>) {
        // TODO: use the event args and optimize this code by remove/add single items instead of full rebuild.
        this._requestRefresh();
    }

    public _getDefaultItemContent(index: number): View {

        const lbl = new Label();
        lbl.bind({
            targetProperty: "text",
            sourceProperty: "$value"
        }, null);
        return lbl;
    }

    private _getDataItem(index: number): any {
        let items = <ItemsSource>this.items;
        return items.getItem ? items.getItem(index) : this.items[index];
    }

    get _childrenCount(): number {
        var count = 0;

        if (this.itemsLayout) {
            count++;
        }

        return count;
    }

    public eachChildView(callback: (child: View) => boolean) {
        if (this.itemsLayout) {
            callback(this.itemsLayout);
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        View.layoutChild(this, this.itemsLayout, 0, 0, right - left, bottom - top);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const result = View.measureChild(this, this.itemsLayout, widthMeasureSpec, heightMeasureSpec);

        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const widthAndState = View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

}

/**
 * Represents the item template property of each ListView instance.
 */
export const itemTemplateProperty = new Property<Repeater, string | Template>({
    name: "itemTemplate", affectsLayout: true, valueChanged: (target) => {
        target._requestRefresh();
    }
});
itemTemplateProperty.register(Repeater);

/**
 * Represents the property backing the items property of each ListView instance.
 */
export const itemsProperty = new Property<Repeater, any[] | ItemsSource>({
    name: "items", affectsLayout: true, valueChanged: (target, oldValue, newValue) => {
        if (oldValue instanceof ObservableArray) {
            removeWeakEventListener(oldValue, ObservableArray.changeEvent, target._onItemsChanged, target);
        }

        if (newValue instanceof ObservableArray) {
            addWeakEventListener(newValue, ObservableArray.changeEvent, target._onItemsChanged, target);
        }

        target._requestRefresh();
    }
});
itemsProperty.register(Repeater);

export const itemsLayoutProperty = new Property<Repeater, LayoutBase>({
    name: "itemsLayout", affectsLayout: true, valueChanged: (target, oldValue, newValue) => {
        if (oldValue) {
            target._removeView(oldValue);
            oldValue.removeChildren();
        }

        if (newValue) {
            target._addView(newValue);
        }

        target._requestRefresh();
    }
});
itemsLayoutProperty.register(Repeater);