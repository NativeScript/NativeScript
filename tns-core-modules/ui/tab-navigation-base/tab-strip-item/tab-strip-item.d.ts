/**
 * Contains the TabStripItem class, which represents a tab strip entry for tab navigation.
 * @module "ui/tab-navigation/tab-strip-item"
 */ /** */

import { ViewBase } from "../../core/view";

/**
 * Represents a tab strip entry.
 */
export class TabStripItem extends ViewBase {
    /**
     * Gets or sets the title of the tab strip entry.
     */
    title: string;

    /**
     * Gets or sets the icon source of the tab strip entry.
     */
    iconSource: string;
}
