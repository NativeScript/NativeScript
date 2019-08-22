/**
 * Contains the TabStrip class, which represents a tab strip for tab navigation.
 * @module "ui/tab-navigation/tab-strip"
 */ /** */

import { View, Property } from "../../core/view";
import { Color } from "../../../color";
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
     * @private
     */
    _hasImage: boolean;

    /**
     * @private
     */
    _hasTitle: boolean;
}

export const iosIconRenderingModeProperty: Property<TabStrip, "automatic" | "alwaysOriginal" | "alwaysTemplate">;
export const isIconSizeFixedProperty: Property<TabStrip, boolean>;
