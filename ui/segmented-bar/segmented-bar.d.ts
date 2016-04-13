/**
 * Contains the SegmentedBar class, which represents a SegmentedBar component.
 */
declare module "ui/segmented-bar" {
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import color = require("color");
    import bindable = require("ui/core/bindable");
    import observable = require("data/observable");

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
     * Defines the data for the SegmentedBar.selectedIndexChanged event.
     */
    export interface SelectedIndexChangedEventData extends observable.EventData {
        /**
         * The old selected index.
         */
        oldIndex: number;
        
        /**
         * The new selected index.
         */
        newIndex: number;
    }

    /**
     * Represents a UI SegmentedBar component.
     */
    export class SegmentedBar extends view.View implements view.AddChildFromBuilder {
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

        /**
         * String value used when hooking to the selectedIndexChanged event.
         */
        public static selectedIndexChangedEvent: string;
        
        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void, thisArg?: any);

        /**
         * Raised when the selected index changes.
         */
        on(event: "selectedIndexChanged", callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
        
        /**
         * Called for every child element declared in xml.
         * @param name - Name of the element.
         * @param value - Value of the element.
         */
        public _addChildFromBuilder(name: string, value: any): void;
        
        public insertTab(tabItem: SegmentedBarItem, index?: number): void;
        
        public getValidIndex(index?: number): number;
    }
}