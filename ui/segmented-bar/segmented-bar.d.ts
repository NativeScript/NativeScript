/**
 * Contains the SegmentedBar class, which represents a SegmentedBar component.
 */
declare module "ui/segmented-bar" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import color = require("color");
    import bindable = require("ui/core/bindable");

    /**
     * Represents a SegmentedBar item.
     */
    class SegmentedBarItem extends bindable.Bindable {
        /**
         * Gets or sets the title of the SegmentedBarItem.
         */
        public title: string;
    }

    /**
     * Represents a UI SegmentedBar component.
     */
    export class SegmentedBar extends view.View {
        /**
         * Gets or sets the selected index of the SegmentedBar component.
         */
        selectedIndex: number;

        /**
         * Gets or sets the selected background color of the SegmentedBar component.
         */
        selectedBackgroundColor: color.Color;

        /**
         * Gets or sets the items of the SegmentedBar.
         */
        items: Array<SegmentedBarItem>;

        /**
         * Gets or sets the selected index dependency property of the SegmentedBar.
         */
        public static selectedIndexProperty: dependencyObservable.Property;

        /**
         * Gets or sets the selected background color property of the SegmentedBar.
         */
        public static selectedBackgroundColorProperty: dependencyObservable.Property;

        /**
         * Gets or sets the items dependency property of the SegmentedBar.
         */
        public static itemsProperty: dependencyObservable.Property;
    }
}