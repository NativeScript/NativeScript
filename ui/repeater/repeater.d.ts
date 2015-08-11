/**
 * Contains the Repeater class, which represents a UI Repeater component.
 */
declare module "ui/repeater" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import layoutBaseModule = require("ui/layouts/layout-base");

    /**
     * Represents a UI Repeater component.
     */
    export class Repeater extends view.View {
        /**
         * Represents the observable property backing the items property of each Repeater instance.
         */
        public static itemsProperty: dependencyObservable.Property;

        /**
         * Represents the item template property of each Repeater instance.
         */
        public static itemTemplateProperty: dependencyObservable.Property;

        /**
         * Represents the items layout property of each Repeater instance.
         */
        public static itemsLayoutProperty: dependencyObservable.Property;

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
         * Gets or set the items layout of the Repeater. Default value is StackLayout with orientation="vertical".
         */
        itemsLayout: layoutBaseModule.LayoutBase;

        /**
         * Forces the Repeater to reload all its items.
         */
        refresh();
    }
}