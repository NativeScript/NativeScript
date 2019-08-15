/**
 * Contains the TabContentItem class, which represents a content entry for tab navigation.
 * @module "ui/tab-navigation/tab-content-item"
 */ /** */

import { View, ViewBase } from "../../core/view";
import { ContentView } from "../../content-view";

/**
 * Represents a tab navigation content entry.
 */
export class TabContentItem extends ContentView {
    /**
     * @private
     */
    canBeLoaded?: boolean;
}
