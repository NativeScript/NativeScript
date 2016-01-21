declare module "ui/layouts/absolute-layout" {
    import {LayoutBase} from "ui/layouts/layout-base";
    import {View} from "ui/core/view";
    import {Property} from "ui/core/dependency-observable";

    /**
     *  A layout that lets you specify exact locations (left/top coordinates) of its children.
     */
    class AbsoluteLayout extends LayoutBase {
        
        /**
         * Represents the observable property backing the left property.
         */
        public static leftProperty: Property;

        /**
         * Represents the observable property backing the top property.
         */
        public static topProperty: Property;

        /**
         * Gets the value of the Left property from a given View.
         */
        static getLeft(view: View): number;

        /**
         * Sets the value of the Left property from a given View.
         */
        static setLeft(view: View, value: number): void;

        /**
         * Gets the value of the Top property from a given View.
         */
        static getTop(view: View): number;

        /**
         * Sets the value of the Top property from a given View.
         */
        static setTop(view: View, value: number): void;
    }
}