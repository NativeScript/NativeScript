declare module "ui/layouts/dock-layout" {
    import view = require("ui/core/view");
    import layout = require("ui/layouts/layout-base");
    import dependencyObservable = require("ui/core/dependency-observable");    

    /**
     * A Layout that arranges its children at its outer edges, and allows its last child to take up the remaining space. 
     */
    class DockLayout extends layout.LayoutBase {

        /**
         * Represents the observable property backing the dock property.
         */
        public static dockProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the stretchLastChild property of each DockLayout instance.
         */
        public static stretchLastChildProperty: dependencyObservable.Property;

        /**
         * Gets the value of the Left property from a given View.
         */
        static getDock(view: view.View): string;

        /**
         * Sets the value of the Left property from a given View.
         */
        static setDock(view: view.View, value: string): void;

        /**
         * Gets or sets a value that indicates whether the last child element within a DockLayout stretches to fill the remaining available space.
         * The default value is true.
         */
        stretchLastChild: boolean;
    }
}