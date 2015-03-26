declare module "ui/layouts/absolute-layout" {
    import layout = require("ui/layouts/layout");
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");    

    /**
     *  A layout that lets you specify exact locations (left/top coordinates) of its children.
     */
    class AbsoluteLayout extends layout.Layout {
        
        /**
         * Represents the observable property backing the left property.
         */
        public static leftProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the top property.
         */
        public static topProperty: dependencyObservable.Property;

        /**
         * Gets the value of the Left property from a given View.
         */
        static getLeft(view: view.View): number;

        /**
         * Sets the value of the Left property from a given View.
         */
        static setLeft(view: view.View, value: number): void;

        /**
         * Gets the value of the Top property from a given View.
         */
        static getTop(view: view.View): number;

        /**
         * Sets the value of the Top property from a given View.
         */
        static setTop(view: view.View, value: number): void;

    }
}