/**
 * Contains the TabNavigationBase class, which serves as the base class for tab navigation.
 * @module "ui/tab-navigation/tab-navigation-base"
 */ /** */

import {
    View, ViewBase, Property, CoercibleProperty, isIOS, AddArrayFromBuilder, AddChildFromBuilder, EventData, Color
} from "../../core/view";
import { TabStrip } from "../tab-strip";
import { TabStripItem } from "../tab-strip-item";
import { TabContentItem } from "../tab-content-item";

/**
 * Defines the data for the tab navigation selectedIndexChanged event.
 */
export interface SelectedIndexChangedEventData extends EventData {
    /**
     * The old selected index.
     */
    oldIndex: number;

    /**
     * The new selected index.
     */
    newIndex: number;
}

/**
 * Serves as a base class for tab navigation.
 */
export class TabNavigationBase extends View {
    /**
     * Gets or sets the items of the tab navigation.
     */
    items: Array<TabContentItem>;

    /**
     * Gets or sets the tab strip of the tab navigation.
     */
    tabStrip: TabStrip;

    /**
     * Gets or sets the selectedIndex of the tab navigation.
     */
    selectedIndex: number;

    /**
     * Gets the native android widget that represents the user interface for this component. Valid only when running on Android OS.
     */
    android: any /* android.view.View */; //android.support.v4.view.ViewPager;

    /**
     * Gets the native iOS widget that represents the user interface for this component. Valid only when running on iOS.
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

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void;

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    onSelectedIndexChanged(oldIndex: number, newIndex: number): void;

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarBackgroundColor(): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarBackgroundArgbColor(): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarBackgroundColor(value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarColor(): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarColor(value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarFontInternal(): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarFontInternal(value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarTextTransform(): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarTextTransform(value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarHighlightColor(): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarHighlightColor(value: any)

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarSelectedItemColor(): Color

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarSelectedItemColor(value: Color)

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarUnSelectedItemColor(): Color

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarUnSelectedItemColor(value: Color)

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarItemTitle(tabStripItem: TabStripItem, value: any): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarItemBackgroundColor(tabStripItem: TabStripItem): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarItemColor(tabStripItem: TabStripItem): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarItemColor(tabStripItem: TabStripItem, value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarIconColor(tabStripItem: TabStripItem, value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarItemFontSize(tabStripItem: TabStripItem): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarItemFontSize(tabStripItem: TabStripItem, value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarItemFontInternal(tabStripItem: TabStripItem): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarItemFontInternal(tabStripItem: TabStripItem, value: any): void

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    getTabBarItemTextTransform(tabStripItem: TabStripItem): any

    /**
     * @private
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    setTabBarItemTextTransform(tabStripItem: TabStripItem, value: any): void
}

export function getIconSpecSize(size: { width: number, height: number }): { width: number, height: number }

export const itemsProperty: Property<TabNavigationBase, TabContentItem[]>;
export const tabStripProperty: Property<TabNavigationBase, TabStrip>
export const selectedIndexProperty: CoercibleProperty<TabNavigationBase, number>;
