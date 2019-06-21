// Types
import { TabStrip as TabStripDefinition } from ".";
import { TabStripItem } from "../tab-strip-item";
import { AddArrayFromBuilder, AddChildFromBuilder } from "../../core/view";

// Requires
import { ViewBase, Property, CSSType } from "../../core/view";

export const traceCategory = "TabView";

@CSSType("TabStrip")
export class TabStrip extends ViewBase implements TabStripDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public items: TabStripItem[];
    public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "TabStripItem") {
            if (!this.items) {
                this.items = new Array<TabStripItem>();
            }
            this.items.push(<TabStripItem>value);
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }
    }
}

export const iosIconRenderingModeProperty = new Property<TabStrip, "automatic" | "alwaysOriginal" | "alwaysTemplate">({ name: "iosIconRenderingMode", defaultValue: "automatic" });
iosIconRenderingModeProperty.register(TabStrip);
