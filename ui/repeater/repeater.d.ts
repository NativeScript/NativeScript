/**
 * Contains the Repeater class, which represents a UI Repeater component.
 */
declare module "ui/repeater" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");

    /**
     * Represents a UI Repeater component.
     */
    export class Repeater extends view.View {
        /**
         * Represents the observable property backing the orientation property of each Repeater instance.
         */
        public static orientationProperty: dependencyObservable.Property;

        /**
         * Dependency property used to support binding operations for the items wrapping of the current Repeater instance.
         */
        public static wrapProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the itemWidth property of each Repeater instance.
         */
        public static itemWidthProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the itemHeight property of each Repeater instance.
         */
        public static itemHeightProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the items property of each Repeater instance.
         */
        public static itemsProperty: dependencyObservable.Property;

        /**
         * Represents the item template property of each Repeater instance.
         */
        public static itemTemplateProperty: dependencyObservable.Property;

        /**
         * Gets or sets if layout should be horizontal or vertical.
         * The default value is vertical.
         */
        orientation: string;

        /**
         * Gets or sets whether the Repeater wraps items or not.
         */
        wrap: boolean;

        /**
         * Gets or sets the width used to measure and layout each child.
         * Default value is Number.NaN which does not restrict children.
         */
        itemWidth: number;
        
        /**
         * Gets or sets the height used to measure and layout each child.
         * Default value is Number.NaN which does not restrict children.
         */
        itemHeight: number;

        /**
         * Gets or set the items collection of the Repeater. 
         * The items property can be set to an array or an object defining length and getItem(index) method.
         */
        items: any;

        /**
         * Gets or set the item template of the Repeater. 
         */
        itemTemplate: string;

        /**
         * Forces the Repeater to reload all its items.
         */
        refresh();
    }
}