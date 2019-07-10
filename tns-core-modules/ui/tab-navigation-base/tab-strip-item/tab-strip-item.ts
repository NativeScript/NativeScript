// Types
import { TabStripItem as TabStripItemDefinition } from ".";
import { TabNavigationBase } from "../tab-navigation-base";
import { TabStrip } from "../tab-strip";
import { Image } from "../../image/image";
import { Label } from "../../label/label";
import { Color } from "../../../color";
import { AddChildFromBuilder } from "../../core/view";

// Requires
import { 
    View, CSSType, backgroundColorProperty, backgroundInternalProperty, colorProperty, 
    fontSizeProperty, fontInternalProperty, PseudoClassHandler
} from "../../core/view";
import { textTransformProperty, TextTransform } from "../../text-base";

export * from "../../core/view";
export const traceCategory = "TabView";

@CSSType("TabStripItem")
export class TabStripItem extends View implements TabStripItemDefinition, AddChildFromBuilder {
    public static tapEvent = "tap";
    public static selectEvent = "select";
    public static unselectEvent = "unselect";

    public title: string;
    public iconSource: string;
    public image: Image;
    public label: Label;

    private _highlightedHandler: () => void;
    private _normalHandler: () => void;

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

    public requestLayout(): void {
        // Default implementation for non View instances (like TabViewItem).
        const parent = this.parent;
        if (parent) {
            parent.requestLayout();
        }
    }

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
    _updateTabStateChangeHandler(subscribe: boolean) {
        if (subscribe) {
            this._highlightedHandler = this._highlightedHandler || (() => {
                this._goToVisualState("highlighted");
            });

            this._normalHandler = this._normalHandler || (() => {
                this._goToVisualState("normal");
            });

            this.on(TabStripItem.selectEvent, this._highlightedHandler);
            this.on(TabStripItem.unselectEvent, this._normalHandler);

            const parent = <TabStrip>this.parent;
            const tabStripParent = parent && <TabNavigationBase>parent.parent;
            if ((<any>this).index === tabStripParent.selectedIndex) {
                this._goToVisualState("highlighted");
            }
        } else {
            this.off(TabStripItem.selectEvent, this._highlightedHandler);
            this.off(TabStripItem.unselectEvent, this._normalHandler);
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

    [colorProperty.getDefault](): Color {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;

        return tabStripParent && tabStripParent.getTabBarItemColor(this);
    }
    [colorProperty.setNative](value: Color) {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;
        
        return tabStripParent && tabStripParent.setTabBarItemColor(this, value);
    }

    [fontSizeProperty.getDefault](): { nativeSize: number } {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;

        return tabStripParent && tabStripParent.getTabBarItemFontSize(this);
    }
    [fontSizeProperty.setNative](value: number | { nativeSize: number }) {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;
        
        return tabStripParent && tabStripParent.setTabBarItemFontSize(this, value);
    }

    [fontInternalProperty.getDefault](): any {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;

        return tabStripParent && tabStripParent.getTabBarItemFontInternal(this);
    }
    [fontInternalProperty.setNative](value: any) {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;
        
        return tabStripParent && tabStripParent.setTabBarItemFontInternal(this, value);
    }

    [textTransformProperty.getDefault](): any {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;

        return tabStripParent && tabStripParent.getTabBarItemTextTransform(this);
    }
    [textTransformProperty.setNative](value: any) {
        const parent = <TabStrip>this.parent;
        const tabStripParent = parent && <TabNavigationBase>parent.parent;
        
        return tabStripParent && tabStripParent.setTabBarItemTextTransform(this, value);
    }
}
