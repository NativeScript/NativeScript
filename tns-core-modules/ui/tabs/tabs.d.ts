/**
 * Contains the Tabs class, which represents a tab navigation component.
 * @module "ui/tabs"
 */ /** */

import { EventData, Property } from "../core/view";
import { TabContentItem } from "../tab-navigation-base/tab-content-item";
import {
    SelectedIndexChangedEventData, TabNavigationBase
} from "../tab-navigation-base/tab-navigation-base";
import { TabStrip } from "../tab-navigation-base/tab-strip";

export * from "../tab-navigation-base/tab-content-item";
export * from "../tab-navigation-base/tab-navigation-base";
export * from "../tab-navigation-base/tab-strip";
export * from "../tab-navigation-base/tab-strip-item";

/**
 * Represents a swipeable tabs view.
 */
export class Tabs extends TabNavigationBase {
    /**
     * Gets or sets the items of the Tabs.
     */
    items: Array<TabContentItem>;

    /**
     * Gets or sets the tab strip of the Tabs.
     */
    tabStrip: TabStrip;

    /**
     * Gets or sets the selectedIndex of the Tabs.
     */
    selectedIndex: number;

    /**
     * Gets or sets the swipe enabled state of the Tabs.
     */
    swipeEnabled: boolean;

    /**
     * Gets or sets the number of offscreen preloaded tabs of the Tabs.
     */
    offscreenTabLimit: number;

    /**
     * Gets or sets the position state of the Tabs.
     */
    tabsPosition: "top" | "bottom";

    /**
     * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) that represents the user interface for this component. Valid only when running on Android OS.
     */
    android: any /* android.view.View */; //android.support.v4.view.ViewPager;

    /**
     * Gets the native iOS [UITabBarController](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarController_Class/) that represents the user interface for this component. Valid only when running on iOS.
     */
    ios: any /* UITabBarController */;

    /**
     * String value used when hooking to the selectedIndexChanged event.
     */
    public static selectedIndexChangedEvent: string;

    /**
     * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
     * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
     * @param callback - Callback function which will be executed when event is raised.
     * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
     */
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

    /**
     * Raised when the selected index changes.
     */
    on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

export const itemsProperty: Property<Tabs, TabContentItem[]>;
export const tabStripProperty: Property<Tabs, TabStrip>
export const selectedIndexProperty: Property<Tabs, number>;
