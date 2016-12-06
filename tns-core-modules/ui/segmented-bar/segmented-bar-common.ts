import { SegmentedBar as SegmentedBarDefinition, SegmentedBarItem as SegmentedBarItemDefinition } from "ui/segmented-bar";
import {
    View, AddChildFromBuilder, AddArrayFromBuilder,
    Property, EventData, Color, Bindable
} from "ui/core/view";

export * from "ui/core/view";

export module knownCollections {
    export var items = "items";
}

var CHILD_SEGMENTED_BAR_ITEM = "SegmentedBarItem";

export abstract class SegmentedBarItemBase extends Bindable implements SegmentedBarItemDefinition {
    private _title: string = "";
    public _parent: SegmentedBarBase;

    get title(): string {
        return this._title;
    }
    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
            this._update();
        }
    }

    public abstract _update();
}

export abstract class SegmentedBarBase extends View implements SegmentedBarDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public static selectedIndexChangedEvent = "selectedIndexChanged";

    protected previousSelectedIndex: number;

    public selectedIndex: number;
    public items: Array<SegmentedBarItemDefinition>;
    public selectedBackgroundColor: Color;

    public _addArrayFromBuilder(name: string, value: Array<any>): void {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === CHILD_SEGMENTED_BAR_ITEM) {
            if (!this.items) {
                this.items = new Array<SegmentedBarItemBase>();
            }
            this.items.push(<SegmentedBarItemBase>value);
        }
    }

    public _adjustSelectedIndex(items: Array<SegmentedBarItemDefinition>) {
        if (this.items) {
            if (this.items.length > 0) {
                if (this.selectedIndex === undefined || (this.selectedIndex > this.items.length - 1)) {
                    this.selectedIndex = 0;
                }
            } else {
                this.selectedIndex = undefined;
            }
        } else {
            this.selectedIndex = undefined;
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

    public abstract insertTab(tabItem: SegmentedBarItemBase, index?: number): void;

    public getValidIndex(index?: number): number {
        let idx: number;
        let itemsLength = this.items ? this.items.length : 0;
        if (index === null || index === undefined) {
            idx = itemsLength - 1;
        } else {
            if (index < 0 || index > itemsLength) {
                idx = itemsLength - 1;
            } else {
                idx = index;
            }
        }
        return idx;
    }

    public onSelectedIndexChanged(oldValue: number, newValue: number): void {
        this.previousSelectedIndex = oldValue;
    }
}

/**
 * Gets or sets the selected index dependency property of the SegmentedBar.
 */
export const selectedIndexProperty = new Property<SegmentedBarBase, number>({
    name: "selectedIndex", defaultValue: -1, valueConverter: (v) => parseInt(v), valueChanged: (target, oldValue, newValue) => target.onSelectedIndexChanged(oldValue, newValue)
});
selectedIndexProperty.register(SegmentedBarBase);

/**
 * Gets or sets the selected background color property of the SegmentedBar.
 */
export const selectedBackgroundColorProperty = new Property<SegmentedBarBase, Color>({ name: "selectedBackgroundColor", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) })
selectedBackgroundColorProperty.register(SegmentedBarBase);

/**
 * Gets or sets the items dependency property of the SegmentedBar.
 */
export const itemsProperty = new Property<SegmentedBarBase, SegmentedBarItemDefinition[]>({ name: "items" });
itemsProperty.register(SegmentedBarBase);
