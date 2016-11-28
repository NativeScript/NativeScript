import { ListView as ListViewDefinition, ItemsSource } from "ui/list-view";
import { EventData, Observable } from "data/observable";
import { View, Template, KeyedTemplate } from "ui/core/view";
import { Property } from "ui/core/properties";
import { Color } from "color";

import { parse, parseMultipleTemplates } from "ui/builder";
import { Label } from "ui/label";
import { ObservableArray } from "data/observable-array";
import { addWeakEventListener, removeWeakEventListener } from "ui/core/weak-event-listener";
import { Bindable } from "ui/core/bindable";

// TODO: Think of a way to register these instead of relying on hardcoded values.
export module knownTemplates {
    export let itemTemplate = "itemTemplate";
}

export module knownMultiTemplates {
    export let itemTemplates = "itemTemplates";
}

export abstract class ListViewBase extends View implements ListViewDefinition {
    public static itemLoadingEvent = "itemLoading";
    public static itemTapEvent = "itemTap";
    public static loadMoreItemsEvent = "loadMoreItems";
    // TODO: get rid of such hacks.
    public static knownFunctions = ["itemTemplateSelector"]; //See component-builder.ts isKnownFunction

    private _itemTemplateSelector: (item: any, index: number, items: any) => string;
    private _itemTemplateSelectorBindable = new Bindable();
    public _defaultTemplate: KeyedTemplate = {
        key: "default",
        createView: () => {
            if (this.itemTemplate) {
                return parse(this.itemTemplate, this);
            }
            return undefined;
        }
    }

    public _itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);

    public rowHeight: number;
    public separatorColor: Color;
    public items: any[] | ItemsSource;
    public itemTemplate: string | Template;
    public itemTemplates: string | Array<KeyedTemplate>;

    get itemTemplateSelector(): string | ((item: any, index: number, items: any) => string) {
        return this._itemTemplateSelector;
    }
    set itemTemplateSelector(value: string | ((item: any, index: number, items: any) => string)) {
        if (typeof value === "string") {
            this._itemTemplateSelectorBindable.bind({
                sourceProperty: null,
                targetProperty: "templateKey",
                expression: value
            });
            this._itemTemplateSelector = (item: any, index: number, items: any) => {
                item["$index"] = index;
                this._itemTemplateSelectorBindable.bindingContext = item;
                return this._itemTemplateSelectorBindable.get("templateKey");
            };
        }
        else if (typeof value === "function") {
            this._itemTemplateSelector = value;
        }
    }

    public refresh() {
        //
    }

    public scrollToIndex(index: number) {
        //
    }

    public _getItemTemplate(index: number): KeyedTemplate {
        let templateKey = "default";
        if (this.itemTemplateSelector) {
            let dataItem = this._getDataItem(index);
            templateKey = this._itemTemplateSelector(dataItem, index, this.items);
        }

        for (let i = 0, length = this._itemTemplatesInternal.length; i < length; i++) {
            if (this._itemTemplatesInternal[i].key === templateKey) {
                return this._itemTemplatesInternal[i];
            }
        }

        // This is the default template
        return this._itemTemplatesInternal[0];
    }

    public _prepareItem(item: View, index: number) {
        if (item) {
            item.bindingContext = this._getDataItem(index);
        }
    }

    private _getDataItem(index: number): any {
        let thisItems = <ItemsSource>this.items;
        return thisItems.getItem ? thisItems.getItem(index) : thisItems[index];
    }

    public _getDefaultItemContent(index: number): View {
        let lbl = new Label();
        lbl.bind({
            targetProperty: "text",
            sourceProperty: "$value"
        }, null);
        return lbl;
    }

    public _onItemsChanged(args: EventData) {
        this.refresh();
    }

    public _onRowHeightPropertyChanged(oldValue: number, newValue: number) {
        this.refresh();
    }
}

/**
 * Represents the property backing the items property of each ListView instance.
 */
export const itemsProperty = new Property<ListViewBase, any[] | ItemsSource>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        if (oldValue instanceof Observable) {
            removeWeakEventListener(oldValue, ObservableArray.changeEvent, target._onItemsChanged, target);
        }

        if (newValue instanceof Observable) {
            addWeakEventListener(newValue, ObservableArray.changeEvent, target._onItemsChanged, target);
        }

        target.refresh();
    }
});

/**
 * Represents the item template property of each ListView instance.
 */
export const itemTemplateProperty = new Property<ListViewBase, string | Template>({
    name: "itemTemplate", valueChanged: (target) => {
        target.refresh();
    }
});

/**
 * Represents the items template property of each ListView instance.
 */
export const itemTemplatesProperty = new Property<ListViewBase, string | Array<KeyedTemplate>>({
    name: "itemTemplates", valueConverter: (value) => {
        if (typeof value === "string") {
            return parseMultipleTemplates(value);
        }

        return value;
    }
})

/**
 * Represents the separator color backing property. 
 */
export const separatorColor = new Property<ListViewBase, Color>({
    name: "separatorColor", valueConverter: (value) => {
        if (typeof value === "string") {
            return new Color(value);
        }

        return value;
    }
})

/**
 * Represents the observable property backing the rowHeight property of each ListView instance.
 */
export const rowHeightProperty = new Property<ListViewBase, number>({
    name: "rowHeight", defaultValue: -1, valueChanged: (target, oldValue, newValue) => target._onRowHeightPropertyChanged(oldValue, newValue)
});
