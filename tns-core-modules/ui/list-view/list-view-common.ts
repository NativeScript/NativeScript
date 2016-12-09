import { ListView as ListViewDefinition, ItemsSource } from "ui/list-view";
import { CoercibleProperty, CssProperty, Style, Bindable, EventData, Observable, View, Template, KeyedTemplate, Length, layout, Property, Color, lengthComparer } from "ui/core/view";
import { parse, parseMultipleTemplates } from "ui/builder";
import { Label } from "ui/label";
import { ObservableArray, ChangedData } from "data/observable-array";
import { addWeakEventListener, removeWeakEventListener } from "ui/core/weak-event-listener";

export * from "ui/core/view";

// TODO: Think of a way to register these instead of relying on hardcoded values.
export module knownTemplates {
    export const itemTemplate = "itemTemplate";
}

export module knownMultiTemplates {
    export const itemTemplates = "itemTemplates";
}

function getLengthEffectiveValue(param: Length): number {
    switch (param.unit) {
        case "px":
            return Math.round(param.value);

        default:
        case "dip":
            return Math.round(layout.getDisplayDensity() * param.value);
    }
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
    public _effectiveRowHeight: number = -1;
    public rowHeight: Length;
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

    public _onItemsChanged(args: ChangedData<any>) {
        this.refresh();
    }

    public _onRowHeightPropertyChanged(oldValue: Length, newValue: Length) {
        this.refresh();
    }

    protected updateEffectiveRowHeight(): void {
        rowHeightProperty.coerce(this);
    }
}

/**
 * Represents the property backing the items property of each ListView instance.
 */
export const itemsProperty = new Property<ListViewBase, any[] | ItemsSource>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        if (oldValue instanceof ObservableArray) {
            removeWeakEventListener(oldValue, ObservableArray.changeEvent, target._onItemsChanged, target);
        }

        if (newValue instanceof ObservableArray) {
            addWeakEventListener(newValue, ObservableArray.changeEvent, target._onItemsChanged, target);
        }

        target.refresh();
    }
});
itemsProperty.register(ListViewBase);

/**
 * Represents the item template property of each ListView instance.
 */
export const itemTemplateProperty = new Property<ListViewBase, string | Template>({
    name: "itemTemplate", valueChanged: (target) => {
        target.refresh();
    }
});
itemTemplateProperty.register(ListViewBase);

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
itemTemplatesProperty.register(ListViewBase);

const defaultRowHeight: Length = { value: -1, unit: "px" };
/**
 * Represents the observable property backing the rowHeight property of each ListView instance.
 */
export const rowHeightProperty = new CoercibleProperty<ListViewBase, Length>({
    name: "rowHeight", defaultValue: defaultRowHeight, equalityComparer: lengthComparer,
    coerceValue: (target, value) => {
        // We coerce to default value if we don't have display density.
        return target._nativeView ? value : defaultRowHeight;
    },
    valueChanged: (target, oldValue, newValue) => {
        target._effectiveRowHeight = getLengthEffectiveValue(newValue);
        target._onRowHeightPropertyChanged(oldValue, newValue);
    }, valueConverter: Length.parse
});
rowHeightProperty.register(ListViewBase);

export const separatorColorProperty = new CssProperty<Style, Color>({ name: "separatorColor", cssName: "separator-color", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
separatorColorProperty.register(Style);