declare module "ui/layouts/layout-base" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Base class for all views that supports children positioning.
     */
    export class LayoutBase extends view.CustomLayoutView {

        public static clipToBoundsProperty: dependencyObservable.Property;

        /**
         * Returns the number of children in this Layout.
         */
        getChildrenCount(): number;

        /**
         * Returns the view at the specified position.
         * @param index The position at which to get the child from.
         */
        getChildAt(index: number): view.View;

        /**
         * Returns the position of the child view
         * @param child The child view that we are looking for.
         */
        getChildIndex(child: view.View): number;

        /**
         * Adds the view to children array.
         * @param view The view to be added to the end of the children array.
         */
        addChild(view: view.View): void;

        /**
         * Inserts the view to children array at the specified index.
         * @param view The view to be added to the end of the children array.
         * @param atIndex The insertion index.
         */
        insertChild(child: view.View, atIndex: number): void;

        /**
         * Removes the specified view from the children array.
         * @param view The view to remove from the children array.
         */
        removeChild(view: view.View): void;

        /**
         * Removes all views in this layout.
         */
        removeChildren(): void;

        /**
         * Calls the callback for each child that should be laid out.
         * @param callback The callback
         */
        eachLayoutChild(callback: (child: view.View, isLast: boolean) => void): void;

        /**
         * Iterates over children and changes their width and height to one calculated from percentage values.
         *
         * @param widthMeasureSpec  Width MeasureSpec of the parent layout.
         * @param heightMeasureSpec Height MeasureSpec of the parent layout.
         */
        protected static adjustChildrenLayoutParams(layoutBase: LayoutBase, widthMeasureSpec: number, heightMeasureSpec: number): void;

        /**
         * Iterates over children and restores their original dimensions that were changed for
         * percentage values.
         */
        protected static restoreOriginalParams(layoutBase: LayoutBase): void;

        /**
         * Gets or sets padding style property.
         */
        padding: string;

        /**
         * Specify the bottom padding of this layout.
         */
        paddingBottom: number;

        /**
         * Specify the left padding of this layout.
         */
        paddingLeft: number;

        /**
         * Specify the right padding of this layout.
         */
        paddingRight: number;

        /**
         * Specify the top padding of this layout.
         */
        paddingTop: number;
    }
}