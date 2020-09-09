/**
 * An interface used to define a writer used by trace to print (log).
 */
export interface TraceWriter {
	write(message: any, category: string, type?: number): void;
}

/**
 * An interface used to trace information about specific event.
 */
export interface TraceEventListener {
	filter: string;
	on(object: Object, name: string, data?: any): void;
}

/**
 * An interface used to for handling trace error
 */
export interface TraceErrorHandler {
	handlerError(error: Error): any;
}

export namespace Trace {
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
	export function addWriter(writer: TraceWriter): void;

	/**
	 * Removes a TraceWriter instance from the trace module.
	 * @param writer The TraceWriter instance to remove.
	 */
	export function removeWriter(writer: TraceWriter): void;

	/**
	 * Clears all the writers from the trace module.
	 */
	export function clearWriters(): void;

	/**
	 * Sets the categories the module will trace.
	 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
	 */
	export function setCategories(categories: string): void;

	/**
	 * Adds categories to existing categories the module will trace.
	 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
	 */
	export function addCategories(categories: string): void;

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
	export function write(message: any, category: string, type?: number): void;

	/**
	 * Notifies all the attached listeners for an event that has occurred in the sender object.
	 * @param object The Object instance that raised the event.
	 * @param name The name of the raised event.
	 * @param data An optional parameter that passes the data associated with the event.
	 */
	export function notifyEvent(object: Object, name: string, data?: any): void;

	export function addEventListener(listener: TraceEventListener): void;

	export function removeEventListener(listener: TraceEventListener): void;

	export module messageType {
		export const log = 0;
		export const info = 1;
		export const warn = 2;
		export const error = 3;
	}

	/**
	 * all predefined categories.
	 */
	export module categories {
		export const VisualTreeEvents = 'VisualTreeEvents';
		export const Layout = 'Layout';
		export const Style = 'Style';
		export const ViewHierarchy = 'ViewHierarchy';
		export const NativeLifecycle = 'NativeLifecycle';
		export const Debug = 'Debug';
		export const Navigation = 'Navigation';
		export const Test = 'Test';
		export const Binding = 'Binding';
		export const BindingError = 'BindingError';
		export const Error = 'Error';
		export const Animation = 'Animation';
		export const Transition = 'Transition';
		export const Livesync = 'Livesync';
		export const ModuleNameResolver = 'ModuleNameResolver';

		export const separator = ',';
		export const All: Array<string>;

		export function concat(...args: any): string;
	}

	class ConsoleWriter implements TraceWriter {
		public write(message: any, category: string, type?: number): void;
	}

	export class DefaultErrorHandler implements TraceErrorHandler {
		handlerError(error: any): void;
	}

	export function getErrorHandler(): TraceErrorHandler;

	export function setErrorHandler(handler: TraceErrorHandler): void;

	/**
	 * Passes an error to the registered ErrorHandler
	 * @param error The error to be handled.
	 */
	export function error(error: string | Error): void;
}
