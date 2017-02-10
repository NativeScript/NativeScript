declare module "ui/layouts/stack-layout" {
    import { LayoutBase, Property } from "ui/layouts/layout-base";

    /**
     * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
     */
    class StackLayout extends LayoutBase {
        /**
         * Gets or sets if layout should be horizontal or vertical.
         * The default value is vertical.
         */
        orientation: "horizontal" | "vertical";
    }

    /**
     * Represents the observable property backing the orientation property of each StackLayout instance.
     */
    export const orientationProperty: Property<StackLayout, "horizontal" | "vertical">;
}