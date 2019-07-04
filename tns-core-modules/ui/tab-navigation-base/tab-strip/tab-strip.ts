// Types
import { TabStrip as TabStripDefinition } from ".";
import { TabStripItem } from "../tab-strip-item";
import { TabNavigationBase } from "../tab-navigation-base";
import { Color } from "../../../color";
import { ViewBase, AddArrayFromBuilder, AddChildFromBuilder } from "../../core/view";

// Requires
import { View, Property, CSSType, backgroundColorProperty, backgroundInternalProperty, colorProperty } from "../../core/view";

export const traceCategory = "TabView";

@CSSType("TabStrip")
export class TabStrip extends View implements TabStripDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public items: TabStripItem[];
    public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    public eachChild(callback: (child: ViewBase) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item);
            });
        }
    }

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

    [backgroundColorProperty.getDefault](): Color {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarBackgroundColor();
    }
    [backgroundColorProperty.setNative](value: Color) {
        const parent = <TabNavigationBase>this.parent;
        
        return parent && parent.setTabBarBackgroundColor(value);
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        // disable the background CSS properties
    }

    [colorProperty.getDefault](): Color {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarColor();
    }
    [colorProperty.setNative](value: Color) {
        const parent = <TabNavigationBase>this.parent;
        
        return parent && parent.setTabBarColor(value);
    }
} 

export const iosIconRenderingModeProperty = new Property<TabStrip, "automatic" | "alwaysOriginal" | "alwaysTemplate">({ name: "iosIconRenderingMode", defaultValue: "automatic" });
iosIconRenderingModeProperty.register(TabStrip);
