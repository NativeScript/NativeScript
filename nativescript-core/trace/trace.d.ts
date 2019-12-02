/**
 * Allows you to trace and print specific information based on categories.
 * @module "trace"
 */ /** */

/**
 * Enables the trace module.
 */
export function enable(): void;

/**
 * Disables the trace module.
 */
export function disable(): void;

/**
 * A function that returns whether the tracer is enabled and there is a point in writing messages.
 * Check this to avoid writing complex string templates.
 * Send error messages even if tracing is disabled.
 */
export function isEnabled(): boolean;

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
 * Adds categories to existing categories the module will trace.
 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
 */
export function addCategories(categories: string);

/**
 * Check if category is already set in trace module.
 * @param category The category to check.
 */
export function isCategorySet(category: string): boolean;

/**
 * Writes a message using the available writers.
 * @param message The message to be written.
 * @param category The category of the message.
 * @param type Optional, the type of the message - info, warning, error.
 */
export function write(message: any, category: string, type?: number);

/**
 * Passes an error to the registered ErrorHandler
 * @param error The error to be handled.
 */
export function error(error: string | Error);
/**
 * Notifies all the attached listeners for an event that has occurred in the sender object.
 * @param object The Object instance that raised the event.
 * @param name The name of the raised event.
 * @param data An optional parameter that passes the data associated with the event.
 */
export function notifyEvent(object: Object, name: string, data?: any);

export function addEventListener(listener: EventListener);

export function removeEventListener(listener: EventListener);

export function getErrorHandler(): ErrorHandler;

export function setErrorHandler(handler: ErrorHandler);

/**
 * An enum that defines all predefined categories.
 */
export module categories {
    export const VisualTreeEvents: string;
    export const Layout: string;
    export const Style: string;
    export const ViewHierarchy: string;
    export const NativeLifecycle: string;
    export const Debug: string;
    export const Navigation: string;
    export const Test: string;
    export const Binding: string;
    export const Error: string;
    export const Animation: string;
    export const Transition: string;
    export const Livesync: string;
    export const ModuleNameResolver: string;

    export const separator: string;
    export const All: string;

    export function concat(...categories: string[]): string;
}

/**
 * An enum that defines all predefined message types.
 */
export module messageType {
    export const log: number;
    export const info: number;
    export const warn: number;
    export const error: number;
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

/**
 * An interface used to for handling trace error
 */
export interface ErrorHandler {
    handlerError(error: Error);
}

export class DefaultErrorHandler implements ErrorHandler {
    handlerError(error);
}
