declare module "ui/layouts/dock-layout" {
    import {LayoutBase} from "ui/layouts/layout-base";
    import {View} from "ui/core/view";
    import {Property} from "ui/core/dependency-observable";    

    /**
     * A Layout that arranges its children at its outer edges, and allows its last child to take up the remaining space. 
     */
    class DockLayout extends LayoutBase {

        /**
         * Represents the observable property backing the dock property.
         */
        public static dockProperty: Property;

        /**
         * Represents the observable property backing the stretchLastChild property of each DockLayout instance.
         */
        public static stretchLastChildProperty: Property;

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
}