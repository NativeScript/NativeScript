/**
 * Contains the Placeholder class, which is used to add a native view to the visual tree.
 */
declare module "ui/placeholder" {
    import view = require("ui/core/view");
    import observable = require("data/observable");

    /**
     * Known event names.
     */
    export module knownEvents {
        export var creatingView: string;
    }

    /**
     * Represents a Placeholder, which is used to add a native view to the visual tree.
     */
    export class Placeholder extends view.View {
        on(event: string, callback: (args: CreateViewEventData) => void);
        on(event: "creatingView", callback: (args: CreateViewEventData) => void);
    }

    /**
     * Event data containing information for creating a native view that will be added to the visual tree.
     */
    export interface CreateViewEventData extends observable.EventData {
        /**
         * The native view that should be added to the visual tree.
         */
        view: any;
        
        /**
         * An optional context for creating the view.
         */
        context?: any;
    }
}
