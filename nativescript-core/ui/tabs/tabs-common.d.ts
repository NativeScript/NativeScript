// Types
import { Tabs as TabsDefinition } from ".";

// Requires
import { CSSType, booleanConverter } from "../core/view";
import { Property } from "../core/properties";
import { TabbableComponent } from "../tabbable-component";

export * from "../tab-navigation-base/tab-content-item";
export * from "../tab-navigation-base/tab-navigation-base";
export * from "../tab-navigation-base/tab-strip";
export * from "../tab-navigation-base/tab-strip-item";

export const traceCategory = "TabView";

export module knownCollections {
    export const items = "items";
}

@CSSType("Tabs")
export abstract class TabsBase extends TabbableComponent implements TabsDefinition {
    public swipeEnabled: boolean;
    public offscreenTabLimit: number;
    public tabsPosition: "top" | "bottom";
    public iOSTabBarItemsAlignment: IOSTabBarItemsAlignment;
}

export const swipeEnabledProperty: Property<TabsBase, boolean>;
export const offscreenTabLimitProperty: Property<TabsBase, number>;
export const tabsPositionProperty: Property<TabsBase, "top" | "bottom">;

export type IOSTabBarItemsAlignment = "leading" | "justified" | "center" | "centerSelected";
export const iOSTabBarItemsAlignmentProperty: Property<TabsBase, IOSTabBarItemsAlignment>;