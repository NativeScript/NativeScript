/**
 * Contains the Placeholder class, which is used to add a native view to the visual tree.
 * @module "ui/placeholder"
 */ /** */

import { View, EventData } from "../core/view";

/**
 * Represents a Placeholder, which is used to add a native view to the visual tree.
 */
export class Placeholder extends View {
    /**
     * String value used when hooking to creatingView event.
     */
    public static creatingViewEvent: string;

    /**
     * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
     * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
     * @param callback - Callback function which will be executed when event is raised.
     * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
     */
    on(eventNames: string, callback: (args: EventData) => void);

    /**
     * Raised when a creatingView event occurs.
     */
    on(event: "creatingView", callback: (args: CreateViewEventData) => void);
}

/**
 * Event data containing information for creating a native view that will be added to the visual tree.
 */
export interface CreateViewEventData extends EventData {
    /**
     * The native view that should be added to the visual tree.
     */
    view: any;

    /**
     * An optional context for creating the view.
     */
    context?: any;
}
