import { Optional } from '../../utils/typescript-utils';

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

export interface EventDataValue extends EventData {
	value?: boolean;
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

interface ListenerEntry {
	callback: (data: EventData) => void;
	thisArg: any;
	once?: true;
}

let _wrappedIndex = 0;

/**
 * Helper class that is used to fire property change even when real object is the same.
 * By default property change will not be fired for a same object.
 * By wrapping object into a WrappedValue instance `same object restriction` will be passed.
 */
export class WrappedValue {
	/**
	 * Creates an instance of WrappedValue object.
	 * @param wrapped - the real value which should be wrapped.
	 */
	constructor(
		/**
		 * Property which holds the real value.
		 */
		public wrapped: any
	) {}

	/**
	 * Gets the real value of previously wrappedValue.
	 * @param value - Value that should be unwraped. If there is no wrappedValue property of the value object then value will be returned.
	 */
	public static unwrap(value: any): any {
		return value instanceof WrappedValue ? value.wrapped : value;
	}

	/**
	 * Returns an instance of WrappedValue. The actual instance is get from a WrappedValues pool.
	 * @param value - Value that should be wrapped.
	 */
	public static wrap(value: any): any {
		const w = _wrappedValues[_wrappedIndex++ % 5];
		w.wrapped = value;

		return w;
	}
}

const _wrappedValues = [new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null)];

const _globalEventHandlers: {
	[eventClass: string]: {
		[eventName: string]: ListenerEntry[];
	};
} = {};

/**
 * Observable is used when you want to be notified when a change occurs. Use on/off methods to add/remove listener.
 * Please note that should you be using the `new Observable({})` constructor, it is **obsolete** since v3.0,
 * and you have to migrate to the "data/observable" `fromObject({})` or the `fromObjectRecursive({})` functions.
 */
export class Observable {
	/**
	 * String value used when hooking to propertyChange event.
	 */
	public static propertyChangeEvent = 'propertyChange';

	/**
	 * Alternative to `instanceof ViewBase`.
	 * @private
	 */
	public _isViewBase: boolean;

	private readonly _observers: { [eventName: string]: ListenerEntry[] } = {};

	public get(name: string): any {
		return this[name];
	}

	public set(name: string, value: any): void {
		// TODO: Parameter validation
		const oldValue = this[name];
		if (this[name] === value) {
			return;
		}

		const newValue = WrappedValue.unwrap(value);
		this[name] = newValue;
		this.notifyPropertyChange(name, newValue, oldValue);
	}

	public setProperty(name: string, value: any): void {
		const oldValue = this[name];
		if (this[name] === value) {
			return;
		}
		this[name] = value;
		this.notifyPropertyChange(name, value, oldValue);

		const specificPropertyChangeEventName = name + 'Change';
		if (this.hasListeners(specificPropertyChangeEventName)) {
			const eventData = this._createPropertyChangeData(name, value, oldValue);
			eventData.eventName = specificPropertyChangeEventName;
			this.notify(eventData);
		}
	}

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void {
		this.addEventListener(eventNames, callback, thisArg);
	}

	/**
	 * Adds one-time listener function for the event named `event`.
	 * @param event Name of the event to attach to.
	 * @param callback A function to be called when the specified event is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	public once(event: string, callback: (data: EventData) => void, thisArg?: any): void {
		if (typeof event !== 'string') {
			throw new TypeError('Event must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const list = this._getEventList(event, true);
		list.push({ callback, thisArg, once: true });
	}

	/**
	 * Shortcut alias to the removeEventListener method.
	 */
	public off(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this.removeEventListener(eventNames, callback, thisArg);
	}

	/**
	 * Adds a listener for the specified event name.
	 * @param eventNames Comma delimited names of the events to attach the listener to.
	 * @param callback A function to be called when some of the specified event(s) is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void {
		if (typeof eventNames !== 'string') {
			throw new TypeError('Events name(s) must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const events = eventNames.split(',');
		for (let i = 0, l = events.length; i < l; i++) {
			const event = events[i].trim();
			const list = this._getEventList(event, true);
			// TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)
			list.push({
				callback: callback,
				thisArg: thisArg,
			});
		}
	}

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 */
	public removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void {
		if (typeof eventNames !== 'string') {
			throw new TypeError('Events name(s) must be string.');
		}

		if (callback && typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const events = eventNames.split(',');
		for (let i = 0, l = events.length; i < l; i++) {
			const event = events[i].trim();
			if (callback) {
				const list = this._getEventList(event, false);
				if (list) {
					const index = Observable._indexOfListener(list, callback, thisArg);
					if (index >= 0) {
						list.splice(index, 1);
					}
					if (list.length === 0) {
						delete this._observers[event];
					}
				}
			} else {
				this._observers[event] = undefined;
				delete this._observers[event];
			}
		}
	}

	public static on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		this.addEventListener(eventName, callback, thisArg);
	}

	public static once(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		if (typeof eventName !== 'string') {
			throw new TypeError('Event must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;
		if (!_globalEventHandlers[eventClass]) {
			_globalEventHandlers[eventClass] = {};
		}
		if (!Array.isArray(_globalEventHandlers[eventClass][eventName])) {
			_globalEventHandlers[eventClass][eventName] = [];
		}
		_globalEventHandlers[eventClass][eventName].push({ callback, thisArg, once: true });
	}

	public static off(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this.removeEventListener(eventName, callback, thisArg);
	}

	public static removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		if (typeof eventName !== 'string') {
			throw new TypeError('Event must be string.');
		}

		if (callback && typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;

		// Short Circuit if no handlers exist..
		if (!_globalEventHandlers[eventClass] || !Array.isArray(_globalEventHandlers[eventClass][eventName])) {
			return;
		}

		const events = _globalEventHandlers[eventClass][eventName];
		if (thisArg) {
			for (let i = 0; i < events.length; i++) {
				if (events[i].callback === callback && events[i].thisArg === thisArg) {
					events.splice(i, 1);
					i--;
				}
			}
		} else if (callback) {
			for (let i = 0; i < events.length; i++) {
				if (events[i].callback === callback) {
					events.splice(i, 1);
					i--;
				}
			}
		} else {
			// Clear all events of this type
			delete _globalEventHandlers[eventClass][eventName];
		}

		if (events.length === 0) {
			// Clear all events of this type
			delete _globalEventHandlers[eventClass][eventName];
		}

		// Clear the primary class grouping if no events are left
		const keys = Object.keys(_globalEventHandlers[eventClass]);
		if (keys.length === 0) {
			delete _globalEventHandlers[eventClass];
		}
	}

	public static addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		if (typeof eventName !== 'string') {
			throw new TypeError('Event must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;
		if (!_globalEventHandlers[eventClass]) {
			_globalEventHandlers[eventClass] = {};
		}
		if (!Array.isArray(_globalEventHandlers[eventClass][eventName])) {
			_globalEventHandlers[eventClass][eventName] = [];
		}
		_globalEventHandlers[eventClass][eventName].push({ callback, thisArg });
	}

	private _globalNotify<T extends EventData>(eventClass: string, eventType: string, data: T): void {
		// Check for the Global handlers for JUST this class
		if (_globalEventHandlers[eventClass]) {
			const event = data.eventName + eventType;
			const events = _globalEventHandlers[eventClass][event];
			if (events) {
				Observable._handleEvent(events, data);
			}
		}

		// Check for he Global handlers for ALL classes
		if (_globalEventHandlers['*']) {
			const event = data.eventName + eventType;
			const events = _globalEventHandlers['*'][event];
			if (events) {
				Observable._handleEvent(events, data);
			}
		}
	}

	/**
	 * Notify this Observable instance with some data. This causes all event
	 * handlers on the Observable instance to be called, as well as any 'global'
	 * event handlers set on the instance's class.
	 *
	 * @param data an object that satisfies the EventData interface, though with
	 * an optional 'object' property. If left undefined, the 'object' property
	 * will implicitly be set as this Observable instance.
	 */
	public notify<T extends Optional<EventData, 'object'>>(data: T): void {
		data.object = data.object || this;
		const dataWithObject = data as EventData;

		const eventClass = this.constructor.name;
		this._globalNotify(eventClass, 'First', dataWithObject);

		const observers = this._observers[data.eventName];
		if (observers) {
			Observable._handleEvent(observers, dataWithObject);
		}

		this._globalNotify(eventClass, '', dataWithObject);
	}

	private static _handleEvent<T extends EventData>(observers: Array<ListenerEntry>, data: T): void {
		if (!observers) {
			return;
		}
		for (let i = observers.length - 1; i >= 0; i--) {
			const entry = observers[i];
			if (entry) {
				if (entry.once) {
					observers.splice(i, 1);
				}

				let returnValue: any;
				if (entry.thisArg) {
					returnValue = entry.callback.apply(entry.thisArg, [data]);
				} else {
					returnValue = entry.callback(data);
				}

				// This ensures errors thrown inside asynchronous functions do not get swallowed
				if (returnValue && returnValue instanceof Promise) {
					returnValue.catch((err) => {
						console.error(err);
					});
				}
			}
		}
	}

	/**
	 * Notifies all the registered listeners for the property change event.
	 */
	public notifyPropertyChange(name: string, value: any, oldValue?: any): void {
		this.notify(this._createPropertyChangeData(name, value, oldValue));
	}

	/**
	 * Checks whether a listener is registered for the specified event name.
	 * @param eventName The name of the event to check for.
	 */
	public hasListeners(eventName: string): boolean {
		return eventName in this._observers;
	}

	/**
	 * This method is intended to be overriden by inheritors to provide additional implementation.
	 */
	public _createPropertyChangeData(propertyName: string, value: any, oldValue?: any): PropertyChangeData {
		return {
			eventName: Observable.propertyChangeEvent,
			object: this,
			propertyName,
			value,
			oldValue,
		};
	}

	public _emit(eventNames: string): void {
		const events = eventNames.split(',');

		for (let i = 0, l = events.length; i < l; i++) {
			const event = events[i].trim();
			this.notify({ eventName: event, object: this });
		}
	}

	private _getEventList(eventName: string, createIfNeeded?: boolean): Array<ListenerEntry> {
		if (!eventName) {
			throw new TypeError('EventName must be valid string.');
		}

		let list = <Array<ListenerEntry>>this._observers[eventName];
		if (!list && createIfNeeded) {
			list = [];
			this._observers[eventName] = list;
		}

		return list;
	}

	private static _indexOfListener(list: Array<ListenerEntry>, callback: (data: EventData) => void, thisArg?: any): number {
		for (let i = 0; i < list.length; i++) {
			const entry = list[i];
			if (thisArg) {
				if (entry.callback === callback && entry.thisArg === thisArg) {
					return i;
				}
			} else {
				if (entry.callback === callback) {
					return i;
				}
			}
		}

		return -1;
	}
}

export interface Observable {
	/**
	 * Raised when a propertyChange occurs.
	 */
	on(event: 'propertyChange', callback: (data: EventData) => void, thisArg?: any): void;

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
}

class ObservableFromObject extends Observable {
	public readonly _map: Record<string, any> = {};

	public get(name: string): any {
		return this._map[name];
	}

	/**
	 * Updates the specified property with the provided value.
	 */
	public set(name: string, value: any): void {
		const currentValue = this._map[name];
		if (currentValue === value) {
			return;
		}

		const newValue = WrappedValue.unwrap(value);
		this._map[name] = newValue;
		this.notifyPropertyChange(name, newValue, currentValue);
	}
}

function defineNewProperty(target: ObservableFromObject, propertyName: string): void {
	Object.defineProperty(target, propertyName, {
		get: function () {
			return target._map[propertyName];
		},
		set: function (value) {
			target.set(propertyName, value);
		},
		enumerable: true,
		configurable: true,
	});
}

function addPropertiesFromObject(observable: ObservableFromObject, source: any, recursive = false): void {
	Object.keys(source).forEach((prop) => {
		let value = source[prop];
		if (recursive && !Array.isArray(value) && value && typeof value === 'object' && !(value instanceof Observable)) {
			value = fromObjectRecursive(value);
		}

		defineNewProperty(observable, prop);
		observable.set(prop, value);
	});
}

/**
 * Creates an Observable instance and sets its properties according to the supplied JavaScript object.
 * param obj - A JavaScript object used to initialize nativescript Observable instance.
 */
export function fromObject(source: any): Observable {
	const observable = new ObservableFromObject();
	addPropertiesFromObject(observable, source, false);

	return observable;
}

/**
 * Creates an Observable instance and sets its properties according to the supplied JavaScript object.
 * This function will create new Observable for each nested object (expect arrays and functions) from supplied JavaScript object.
 * param obj - A JavaScript object used to initialize nativescript Observable instance.
 */
export function fromObjectRecursive(source: any): Observable {
	const observable = new ObservableFromObject();
	addPropertiesFromObject(observable, source, true);

	return observable;
}
