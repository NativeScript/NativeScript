/**
 * Base event data.
 */
export interface EventData {
	/**
	 * The name of the event.
	 */
	eventName: string;
	/**
	 * The Observable instance that has raised the event.
	 */
	object: Observable;
}

/**
 * Data for the "propertyChange" event.
 */
export interface PropertyChangeData extends EventData {
	/**
	 * The name of the property that has changed.
	 */
	propertyName: string;
	/**
	 * The new value of the property.
	 */
	value: any;
	/**
	 * The previous value of the property.
	 */
	oldValue?: any;
}

/**
 * Helper class that is used to fire property change even when real object is the same.
 * By default property change will not be fired for a same object.
 * By wrapping object into a WrappedValue instance `same object restriction` will be passed.
 */
export class WrappedValue {
	/**
	 * Property which holds the real value.
	 */
	wrapped: any;

	/**
	 * Creates an instance of WrappedValue object.
	 * @param value - the real value which should be wrapped.
	 */
	constructor(value: any);

	/**
	 * Gets the real value of previously wrappedValue.
	 * @param value - Value that should be unwraped. If there is no wrappedValue property of the value object then value will be returned.
	 */
	static unwrap(value: any): any;

	/**
	 * Returns an instance of WrappedValue. The actual instance is get from a WrappedValues pool.
	 * @param value - Value that should be wrapped.
	 */
	static wrap(value: any): WrappedValue;
}

/**
 * Observable is used when you want to be notified when a change occurs. Use on/off methods to add/remove listener.
 */
export class Observable {
	/**
	 * Please note that should you be using the `new Observable({})` constructor, it is **obsolete** since v3.0,
	 * and you have to migrate to the "data/observable" `fromObject({})` or the `fromObjectRecursive({})` functions.
	 */
	constructor();

	/**
	 * String value used when hooking to propertyChange event.
	 */
	public static propertyChangeEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a propertyChange occurs.
	 */
	on(event: 'propertyChange', callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Adds one-time listener function for the event named `event`.
	 * @param event Name of the event to attach to.
	 * @param callback A function to be called when the specified event is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	once(event: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Shortcut alias to the removeEventListener method.
	 */
	off(eventNames: string, callback?: any, thisArg?: any);

	/**
	 * Adds a listener for the specified event name.
	 * @param eventNames Comma delimited names of the events to attach the listener to.
	 * @param callback A function to be called when some of the specified event(s) is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 */
	removeEventListener(eventNames: string, callback?: any, thisArg?: any);

	/**
	 * Updates the specified property with the provided value.
	 */
	set(name: string, value: any): void;

	/**
	 * Updates the specified property with the provided value and raises a property change event and a specific change event based on the property name.
	 */
	setProperty(name: string, value: any): void;

	/**
	 * Gets the value of the specified property.
	 */
	get(name: string): any;

	/**
	 * Notifies all the registered listeners for the event provided in the data.eventName.
	 * @param data The data associated with the event.
	 */
	notify<T extends EventData>(data: T): void;

	/**
	 * Notifies all the registered listeners for the property change event.
	 */
	notifyPropertyChange(propertyName: string, value: any, oldValue?: any): void;

	/**
	 * Checks whether a listener is registered for the specified event name.
	 * @param eventName The name of the event to check for.
	 */
	hasListeners(eventName: string): boolean;

	public _emit(eventNames: string);

	/**
	 * This method is intended to be overriden by inheritors to provide additional implementation.
	 */
	_createPropertyChangeData(name: string, value: any, oldValue?: any): PropertyChangeData;

	//@private
	/**
	 * Filed to use instead of instanceof ViewBase.
	 * @private
	 */
	public _isViewBase: boolean;
	//@endprivate
}

/**
 * Creates an Observable instance and sets its properties according to the supplied JavaScript object.
 * param obj - A JavaScript object used to initialize nativescript Observable instance.
 */
export function fromObject(obj: any): Observable;

/**
 * Creates an Observable instance and sets its properties according to the supplied JavaScript object.
 * This function will create new Observable for each nested object (expect arrays and functions) from supplied JavaScript object.
 * param obj - A JavaScript object used to initialize nativescript Observable instance.
 */
export function fromObjectRecursive(obj: any): Observable;
