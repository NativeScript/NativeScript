// Types
import { Tabs as TabsDefinition } from ".";

// Requires
import { TabNavigationBase } from "../tab-navigation-base/tab-navigation-base";
import { Property, CSSType, booleanConverter } from "../core/view";

export * from "../tab-navigation-base/tab-content-item";
export * from "../tab-navigation-base/tab-navigation-base";
export * from "../tab-navigation-base/tab-strip";
export * from "../tab-navigation-base/tab-strip-item";

export const traceCategory = "TabView";

export module knownCollections {
    export const items = "items";
}

@CSSType("Tabs")
export class TabsBase extends TabNavigationBase implements TabsDefinition {
    public swipeEnabled: boolean;
    public offscreenTabLimit: number;
    public tabsPosition: "top" | "bottom";
}

// TODO: Add Unit tests
export const swipeEnabledProperty = new Property<TabNavigationBase, boolean>({
    name: "swipeEnabled", defaultValue: true, valueConverter: booleanConverter
});
swipeEnabledProperty.register(TabNavigationBase);

// TODO: Add Unit tests
// TODO: Coerce to max number of items?
export const offscreenTabLimitProperty = new Property<TabNavigationBase, number>({
    name: "offscreenTabLimit", defaultValue: 1, valueConverter: (v) => parseInt(v)
});
offscreenTabLimitProperty.register(TabNavigationBase);

export const tabsPositionProperty = new Property<TabNavigationBase, "top" | "bottom">({ name: "tabsPosition", defaultValue: "top" });
tabsPositionProperty.register(TabNavigationBase);
