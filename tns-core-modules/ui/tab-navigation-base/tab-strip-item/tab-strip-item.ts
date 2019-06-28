// Types
import { TabStripItem as TabStripItemDefinition } from ".";
import { TabNavigationBase } from "../tab-navigation-base";
import { TabStrip } from "../tab-strip";
import { Image } from "../../image/image";
import { Label } from "../../label/label";
import { Color } from "../../../color";
import { AddChildFromBuilder } from "../../core/view";

// Requires
import { View, CSSType, backgroundColorProperty, backgroundInternalProperty } from "../../core/view";

export * from "../../core/view";
export const traceCategory = "TabView";

@CSSType("TabStripItem")
export class TabStripItem extends View implements TabStripItemDefinition, AddChildFromBuilder {
    public title: string;
    public iconSource: string;
    public image: Image;
    public label: Label;

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "Image") {
            this.image = <Image>value;
            this.iconSource = (<Image>value).src;
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }

        if (name === "Label") {
            this.label = <Label>value;
            this.title = (<Label>value).text;
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }
    }

    [backgroundColorProperty.getDefault](): Color {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;

        return tabStripParent && tabStripParent.getTabBarBackgroundColor();
    }
    [backgroundColorProperty.setNative](value: Color) {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;
        
        return tabStripParent && tabStripParent.setTabBarItemBackgroundColor(this, value);
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        // disable the background CSS properties
    }
}
