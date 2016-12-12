declare module "ui/layouts/dock-layout" {
    import { LayoutBase, View, Property } from "ui/layouts/layout-base";

    /**
     * A Layout that arranges its children at its outer edges, and allows its last child to take up the remaining space. 
     */
    class DockLayout extends LayoutBase {
        /**
         * Gets the value of the Left property from a given View.
         */
        static getDock(view: View): string;

        /**
         * Sets the value of the Left property from a given View.
         */
        static setDock(view: View, value: string): void;

        /**
         * Gets or sets a value that indicates whether the last child element within a DockLayout stretches to fill the remaining available space.
         * The default value is true.
         */
        stretchLastChild: boolean;
    }

    /**
     * Represents the observable property backing the dock property.
     */
    export const dockProperty: Property<DockLayout, "left" | "top" | "right" | "bottom">;

    /**
     * Represents the observable property backing the stretchLastChild property of each DockLayout instance.
     */
    export const stretchLastChildProperty: Property<DockLayout, boolean>;
}