/**
 * @module "ui/layouts/layout-base"
 */ /** */

import { View, CustomLayoutView, Property, Length } from "../core/view";

export * from "../core/view";

/**
 * Base class for all views that supports children positioning.
 */
export class LayoutBase extends CustomLayoutView {
    /**
     * Returns the number of children in this Layout.
     */
    getChildrenCount(): number;

    /**
     * Returns the view at the specified position.
     * @param index The position at which to get the child from.
     */
    getChildAt(index: number): View;

    /**
     * Returns the position of the child view
     * @param child The child view that we are looking for.
     */
    getChildIndex(child: View): number;

    /**
     * Adds the view to children array.
     * @param view The view to be added to the end of the children array.
     */
    addChild(view: View): void;

    /**
     * Inserts the view to children array at the specified index.
     * @param view The view to be added to the end of the children array.
     * @param atIndex The insertion index.
     */
    insertChild(child: View, atIndex: number): void;

    /**
     * Removes the specified view from the children array.
     * @param view The view to remove from the children array.
     */
    removeChild(view: View): void;

    /**
     * Removes all views in this layout.
     */
    removeChildren(): void;

    /**
     * INTERNAL. Used by the layout system.
     */
    _registerLayoutChild(child: View): void;

    /**
     * INTERNAL. Used by the layout system.
     */
    _unregisterLayoutChild(child: View): void;

    /**
     * Calls the callback for each child that should be laid out.
     * @param callback The callback
     */
    eachLayoutChild(callback: (child: View, isLast: boolean) => void): void;

    /**
     * Gets or sets padding style property.
     */
    padding: string | Length;

    /**
     * Specify the bottom padding of this layout.
     */
    paddingBottom: Length;

    /**
     * Specify the left padding of this layout.
     */
    paddingLeft: Length;

    /**
     * Specify the right padding of this layout.
     */
    paddingRight: Length;

    /**
     * Specify the top padding of this layout.
     */
    paddingTop: Length;

    /**
     * Gets or sets a value indicating whether to clip the content of this layout.
     */
    clipToBounds: boolean;

    /**
     * Gets or sets a value indicating whether touch event should pass through to a parent view of the
     * layout container in case an interactive child view did not handle it.
     * Default value of this property is false. This does not affect the appearance of the view.
     */
    isPassThroughParentEnabled: boolean;
}

export const clipToBoundsProperty: Property<LayoutBase, boolean>;
export const isPassThroughParentEnabledProperty: Property<LayoutBase, boolean>;
