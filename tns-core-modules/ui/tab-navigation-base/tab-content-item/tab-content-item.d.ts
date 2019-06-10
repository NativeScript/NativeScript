/**
 * Contains the TabContentItem class, which represents a content entry for tab navigation.
 * @module "ui/tab-navigation/tab-content-item"
 */ /** */

import { View, ViewBase } from "../../core/view";

/**
 * Represents a tab navigation content entry.
 */
export class TabContentItem extends ViewBase {
    /**
     * Gets or sets the view of the TabViewItem.
     */
    public view: View;

    /**
     * @private
     */
    canBeLoaded?: boolean;
}
