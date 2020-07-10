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

let enabled = false;
let _categories = {};
let _writers: Array<TraceWriter> = [];
let _eventListeners: Array<TraceEventListener> = [];
let _errorHandler: TraceErrorHandler;

export namespace Trace {
	/**
	 * Enables the trace module.
	 */
	export function enable() {
		enabled = true;
	}

	/**
	 * Disables the trace module.
	 */
	export function disable() {
		enabled = false;
	}

	/**
	 * A function that returns whether the tracer is enabled and there is a point in writing messages.
	 * Check this to avoid writing complex string templates.
	 * Send error messages even if tracing is disabled.
	 */
	export function isEnabled() {
		return enabled;
	}

	/**
	 * Adds a TraceWriter instance to the trace module.
	 * @param writer The TraceWriter instance to add.
	 */
	export function addWriter(writer: TraceWriter) {
		_writers.push(writer);
	}

	/**
	 * Removes a TraceWriter instance from the trace module.
	 * @param writer The TraceWriter instance to remove.
	 */
	export function removeWriter(writer: TraceWriter) {
		let index = _writers.indexOf(writer);
		if (index >= 0) {
			_writers.splice(index, 1);
		}
	}

	/**
	 * Clears all the writers from the trace module.
	 */
	export function clearWriters() {
		if (_writers.length > 0) {
			_writers.splice(0, _writers.length);
		}
	}

	/**
	 * Sets the categories the module will trace.
	 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
	 */
	export function setCategories(categories: string) {
		_categories = {};
		addCategories(categories);
	}

	/**
	 * Adds categories to existing categories the module will trace.
	 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
	 */
	export function addCategories(categories: string) {
		let split = categories.split(',');
		for (let i = 0; i < split.length; i++) {
			_categories[split[i].trim()] = true;
		}
	}

	/**
	 * Check if category is already set in trace module.
	 * @param category The category to check.
	 */
	export function isCategorySet(category: string): boolean {
		return category in _categories;
	}

	/**
	 * Writes a message using the available writers.
	 * @param message The message to be written.
	 * @param category The category of the message.
	 * @param type Optional, the type of the message - info, warning, error.
	 */
	export function write(message: any, category: string, type?: number) {
		// print error no matter what
		let i;
		if (type === messageType.error) {
			for (i = 0; i < _writers.length; i++) {
				_writers[i].write(message, category, type);
			}

			return;
		}

		if (!enabled) {
			return;
		}

		if (!(category in _categories)) {
			return;
		}

		for (i = 0; i < _writers.length; i++) {
			_writers[i].write(message, category, type);
		}
	}

	/**
	 * Notifies all the attached listeners for an event that has occurred in the sender object.
	 * @param object The Object instance that raised the event.
	 * @param name The name of the raised event.
	 * @param data An optional parameter that passes the data associated with the event.
	 */
	export function notifyEvent(object: Object, name: string, data?: any) {
		if (!enabled) {
			return;
		}

		let i, listener: TraceEventListener, filters: Array<string>;
		for (i = 0; i < _eventListeners.length; i++) {
			listener = _eventListeners[i];
			if (listener.filter) {
				filters = listener.filter.split(',');
				filters.forEach((value: string) => {
					if (value.trim() === name) {
						listener.on(object, name, data);
					}
				});
			} else {
				listener.on(object, name, data);
			}
		}
	}

	export function addEventListener(listener: TraceEventListener) {
		_eventListeners.push(listener);
	}

	export function removeEventListener(listener: TraceEventListener) {
		const index = _eventListeners.indexOf(listener);
		if (index >= 0) {
			_eventListeners.splice(index, 1);
		}
	}

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
		export const All = [VisualTreeEvents, Layout, Style, ViewHierarchy, NativeLifecycle, Debug, Navigation, Test, Binding, Error, Animation, Transition, Livesync, ModuleNameResolver].join(separator);

		export function concat(...args: any): string {
			let result: string;
			for (let i = 0; i < arguments.length; i++) {
				if (!result) {
					result = arguments[i];
					continue;
				}

				result = result.concat(separator, arguments[i]);
			}

			return result;
		}
	}

	class ConsoleWriter implements TraceWriter {
		public write(message: any, category: string, type?: number) {
			if (!console) {
				return;
			}

			let msgType;
			if (type === undefined) {
				msgType = messageType.log;
			} else {
				msgType = type;
			}

			switch (msgType) {
				case messageType.log:
					console.log(category + ': ' + message);
					break;
				case messageType.info:
					console.info(category + ': ' + message);
					break;
				case messageType.warn:
					console.warn(category + ': ' + message);
					break;
				case messageType.error:
					console.error(category + ': ' + message);
					break;
			}
		}
	}
	// register a ConsoleWriter by default
	addWriter(new ConsoleWriter());

	export class DefaultErrorHandler implements TraceErrorHandler {
		handlerError(error) {
			throw error;
		}
	}
	setErrorHandler(new DefaultErrorHandler());

	export function getErrorHandler(): TraceErrorHandler {
		return _errorHandler;
	}

	export function setErrorHandler(handler: TraceErrorHandler) {
		_errorHandler = handler;
	}

	/**
	 * Passes an error to the registered ErrorHandler
	 * @param error The error to be handled.
	 */
	export function error(error: string | Error) {
		if (!_errorHandler) {
			return;
		}

		if (typeof error === 'string') {
			error = new Error(error);
		}

		_errorHandler.handlerError(error);
	}
}
