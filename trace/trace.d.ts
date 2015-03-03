/**
 * Allows you to trace and print specific information based on categories.
 */
declare module "trace" {
    /**
     * Enables the trace module.
     */
    export function enable(): void;

    /**
     * Disables the trace module.
     */
    export function disable(): void;

    /**
     * Adds a TraceWriter instance to the trace module.
     * @param writer The TraceWriter instance to add.
     */
    export function addWriter(writer: TraceWriter);

    /**
     * Removes a TraceWriter instance from the trace module.
     * @param writer The TraceWriter instance to remove.
     */
    export function removeWriter(writer: TraceWriter);

    /**
     * Clears all the writers from the trace module.
     */
    export function clearWriters();

    /**
     * Sets the categories the module will trace.
     * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
     */
    export function setCategories(categories: string);

    /**
     * Writes a message using the available writers.
     * @param message The message to be written.
     * @param category The category of the message.
     * @param type Optional, the type of the message - info, warning, error.
     */
    export function write(message: any, category: string, type?: number);

    /**
     * Notifies all the attached listeners for an event that has occurred in the sender object.
     * @param object The Object instance that raised the event.
     * @param name The name of the raised event.
     * @param data An optional parameter that passes the data associated with the event.
     */
    export function notifyEvent(object: Object, name: string, data?: any);

    export function addEventListener(listener: EventListener);

    export function removeEventListener(listener: EventListener);

    /**
     * An enum that defines all predefined categories.
     */
    module categories {
        export var VisualTreeEvents: string;
        export var Layout: string;
        export var Style: string;
        export var ViewHierarchy: string;
        export var NativeLifecycle: string;
        export var Debug: string;
        export var Navigation: string;
        export var Test: string;
        export var Binding: string;

        export var All: string;

        export var separator: string;
        export function concat(...categories: string[]): string;
    }

    /**
     * An enum that defines all predefined message types.
     */
    module messageType {
        export var log: number;
        export var info: number;
        export var warn: number;
        export var error: number;
    }

    /**
     * An interface used to define a writer used by trace to print (log).
     */
    export interface TraceWriter {
        write(message: any, category: string, type?: number);
    }

    /**
     * An interface used to trace information about specific event.  
     */
    export interface EventListener {
        filter: string;
        on(object: Object, name: string, data?: any);
    }
}