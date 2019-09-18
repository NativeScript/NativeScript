/**
 * @module "ui/layouts/wrap-layout"
 */ /** */

import { LayoutBase, Property, Length } from "../layout-base";

/**
 * WrapLayout position children in rows or columns depending on orientation property
 * until space is filled and then wraps them on new row or column.
 */
export class WrapLayout extends LayoutBase {

    /**
     * Gets or sets the flow direction. Default value is horizontal.
     * If orientation is horizontal items are arranged in rows, else items are arranged in columns.
     */
    orientation: Orientation;

    /**
     * Gets or sets the width used to measure and layout each child.
     * Default value is Number.NaN which does not restrict children.
     */
    itemWidth: Length;

    /**
     * Gets or sets the height used to measure and layout each child.
     * Default value is Number.NaN which does not restrict children.
     */
    itemHeight: Length;
}

export type Orientation = "horizontal" | "vertical";

/**
 * Represents the observable property backing the orientation property of each WrapLayout instance.
 */
export const orientationProperty: Property<WrapLayout, Orientation>;

/**
 * Represents the observable property backing the itemWidth property of each WrapLayout instance.
 */
export const itemWidthProperty: Property<WrapLayout, Length>;

/**
 * Represents the observable property backing the itemHeight property of each WrapLayout instance.
 */
export const itemHeightProperty: Property<WrapLayout, Length>;
