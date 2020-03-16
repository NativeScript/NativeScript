/**
 * Contains the TabStrip class, which represents a tab strip for tab navigation.
 * @module "ui/tab-navigation/tab-strip"
 */ /** */

import { Color } from "../../../color";
import { EventData, Property, View } from "../../core/view";
import { TabStripItem } from "../tab-strip-item";

/**
 * Represents a tab strip.
 */
export class TabStrip extends View {

    /**
     * Gets or sets the items of the tab strip.
     */
    items: Array<TabStripItem>;

    /**
     * Gets or sets whether icon size should be fixed based on specs or use the actual size. Defaults to true(fixed).
     */
    isIconSizeFixed: boolean;

    /**
     * Gets or sets the icon rendering mode on iOS
     */
    iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";

    /**
     * Gets or sets the color that marks the selected tab of the tab strip. Works for Tabs component only.
     */
    highlightColor: Color;

    /**
     * Gets or sets the color of the selected item in the tab strip.
     */
    selectedItemColor: Color;

    /**
     * Gets or sets the color of the non-selected items in the tab strip.
     */
    unSelectedItemColor: Color;

    /**
     * @private
     */
    _hasImage: boolean;

    /**
     * @private
     */
    _hasTitle: boolean;

    /**
     * String value used when hooking to itemTap event.
     */
    public static itemTapEvent: string;

    /**
     * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
     * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
     * @param callback - Callback function which will be executed when event is raised.
     * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
     */
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

    /**
     * Raised when an TabStripItem is tapped.
     */
    on(event: "itemTap", callback: (args: TabStripItemEventData) => void, thisArg?: any);
}

/**
 * Event data containing information for the TabStripItem's index.
 */
export interface TabStripItemEventData extends EventData {
    /**
     * The index of the TabStripItem.
     */
    index: number;
}

export const iosIconRenderingModeProperty: Property<TabStrip, "automatic" | "alwaysOriginal" | "alwaysTemplate">;
export const isIconSizeFixedProperty: Property<TabStrip, boolean>;
export const selectedItemColorProperty: Property<TabStrip, Color>;
export const unSelectedItemColorProperty: Property<TabStrip, Color>;