declare module "ui/layouts/stack-layout" {
    import {LayoutBase} from "ui/layouts/layout-base";
    import {Property} from "ui/core/dependency-observable";

    /**
     * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
     */
    class StackLayout extends LayoutBase {
        /**
         * Represents the observable property backing the orientation property of each StackLayout instance.
         */
        public static orientationProperty: Property;

        /**
         * Gets or sets if layout should be horizontal or vertical.
         * The default value is vertical.
         */
        orientation: string;
    }
}