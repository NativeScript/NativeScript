/**
 * Contains the Repeater class, which represents a UI Repeater component.
 * @module "ui/repeater"
 */ /** */

import { LayoutBase, CustomLayoutView, Template, Property } from "../layouts/layout-base";

/**
 * Represents a UI Repeater component.
 */
export class Repeater extends CustomLayoutView {
    /**
     * Gets or set the items collection of the Repeater.
     * The items property can be set to an array or an object defining length and getItem(index) method.
     */
    items: any[] | ItemsSource;

    /**
     * Gets or set the item template of the Repeater.
     */
    itemTemplate: string | Template;

    /**
     * Gets or set the items layout of the Repeater. Default value is StackLayout with orientation="vertical".
     */
    itemsLayout: LayoutBase;

    /**
     * Forces the Repeater to reload all its items.
     */
    refresh();
}

export interface ItemsSource {
    length: number;
    getItem(index: number): any;
}

/**
 * Represents the property backing the items property.
 */
export const itemsProperty: Property<Repeater, any[] | ItemsSource>;

/**
 * Represents the item template property.
 */
export const itemTemplateProperty: Property<Repeater, string | Template>;

/**
 * Represents the items layout property of each Repeater instance.
 */
export const itemsLayoutProperty: Property<Repeater, LayoutBase>;
