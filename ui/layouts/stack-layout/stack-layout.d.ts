declare module "ui/layouts/stack-layout" {
    import layout = require("ui/layouts/layout");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
     */
    class StackLayout extends layout.Layout {

        /**
         * Represents the observable property backing the orientation property of each StackLayout instance.
         */
        public static orientationProperty: dependencyObservable.Property;

        /**
         * Gets or sets if layout should be horizontal or vertical.
         * The default value is vertical.
         */
        orientation: string;
    }
}