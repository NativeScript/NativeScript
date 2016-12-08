import { SegmentedBar as SegmentedBarDefinition, SegmentedBarItem as SegmentedBarItemDefinition, SelectedIndexChangedEventData } from "ui/segmented-bar";
import {
    ViewBase, View, AddChildFromBuilder, AddArrayFromBuilder,
    Property, CoercibleProperty, EventData, Color
} from "ui/core/view";

export * from "ui/core/view";

export module knownCollections {
    export var items = "items";
}

export abstract class SegmentedBarItemBase extends ViewBase implements SegmentedBarItemDefinition {
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

    public selectedIndex: number;
    public selectedBackgroundColor: Color;
    public items: Array<SegmentedBarItemDefinition>;

    public _addArrayFromBuilder(name: string, value: Array<any>): void {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "SegmentedBarItem") {
            if (!this.items) {
                this.items = new Array<SegmentedBarItemBase>();
            }
            this.items.push(<SegmentedBarItemBase>value);
        }
    }

    // public _onBindingContextChanged(oldValue: any, newValue: any) {
    //     super._onBindingContextChanged(oldValue, newValue);
    //     if (this.items && this.items.length > 0) {
    //         var i = 0;
    //         var length = this.items.length;
    //         for (; i < length; i++) {
    //             this.items[i].bindingContext = newValue;
    //         }
    //     }
    // }

    public onItemsChanged(oldItems: SegmentedBarItemDefinition[], newItems: SegmentedBarItemDefinition[]): void {
        if (oldItems) {
            for (let i = 0, count = oldItems.length; i < count; i++) {
                this._removeView(oldItems[i]);
            }
        }

        if (newItems) {
            for (let i = 0, count = newItems.length; i < count; i++) {
                this._addView(newItems[i]);
            }
        }
    }
}

/**
 * Gets or sets the selected index dependency property of the SegmentedBar.
 */
export const selectedIndexProperty = new CoercibleProperty<SegmentedBarBase, number>({
    name: "selectedIndex", defaultValue: -1, valueConverter: (v) => parseInt(v), valueChanged: (target, oldValue, newValue) => {
        target.notify(<SelectedIndexChangedEventData>{ eventName: SegmentedBarBase.selectedIndexChangedEvent, object: target, oldIndex: oldValue, newIndex: newValue });
    },
    coerceValue: (target, value) => {
        let items = target.items;
        if (items) {
            let max = items.length - 1;
            if (value > max) {
                value = max;
            }
        } else {
            value = -1;
        }

        return value;
    }
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
export const itemsProperty = new Property<SegmentedBarBase, SegmentedBarItemDefinition[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
        selectedIndexProperty.coerce(target);
    }
});
itemsProperty.register(SegmentedBarBase);
