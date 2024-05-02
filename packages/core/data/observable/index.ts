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
	thisArg?: any;
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
		public wrapped: any,
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

const _wrappedValues = [new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null)] as const;

const _globalEventHandlers: {
	[eventClass: string]: {
		[eventName: string]: Array<ListenerEntry>;
	};
} = {};

const eventNamesRegex = /\s*,\s*/;

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

	private readonly _observers: { [eventName: string]: Array<ListenerEntry> } = {};

	/**
	 * Gets the value of the specified property.
	 */
	public get(name: string): any {
		return this[name];
	}

	/**
	 * Updates the specified property with the provided value.
	 */
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

	/**
	 * Updates the specified property with the provided value and raises a property change event and a specific change event based on the property name.
	 */
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
		this.addEventListener(event, callback, thisArg, true);
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
	public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
		once = once || undefined;
		thisArg = thisArg || undefined;

		if (typeof eventNames !== 'string') {
			throw new TypeError('Event name(s) must be a string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('Callback, if provided, must be a function.');
		}

		for (const eventName of eventNames.trim().split(eventNamesRegex)) {
			const list = this._getEventList(eventName, true);
			if (Observable._indexOfListener(list, callback, thisArg) !== -1) {
				// Already added.
				continue;
			}

			list.push({
				callback,
				thisArg,
				once,
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
		thisArg = thisArg || undefined;

		if (typeof eventNames !== 'string') {
			throw new TypeError('Events name(s) must be string.');
		}

		if (callback && typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		for (const eventName of eventNames.trim().split(eventNamesRegex)) {
			const entries = this._observers[eventName];
			if (!entries) {
				continue;
			}

			Observable.innerRemoveEventListener(entries, callback, thisArg);

			if (!entries.length) {
				// Clear all entries of this type
				delete this._observers[eventName];
			}
		}
	}

	/**
	 * Please avoid using the static event-handling APIs as they will be removed
	 * in future.
	 * @deprecated
	 */
	public static on(eventName: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
		this.addEventListener(eventName, callback, thisArg, once);
	}

	/**
	 * Please avoid using the static event-handling APIs as they will be removed
	 * in future.
	 * @deprecated
	 */
	public static once(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		this.addEventListener(eventName, callback, thisArg, true);
	}

	/**
	 * Please avoid using the static event-handling APIs as they will be removed
	 * in future.
	 * @deprecated
	 */
	public static off(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this.removeEventListener(eventName, callback, thisArg);
	}

	private static innerRemoveEventListener(entries: Array<ListenerEntry>, callback?: (data: EventData) => void, thisArg?: any): void {
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];

			// If we have a `thisArg`, refine on both `callback` and `thisArg`.
			if (thisArg && (entry.callback !== callback || entry.thisArg !== thisArg)) {
				continue;
			}

			// If we don't have a `thisArg`, refine only on `callback`.
			if (callback && entry.callback !== callback) {
				continue;
			}

			// If we have neither `thisArg` nor `callback`, just remove all events
			// of this type regardless.

			entries.splice(i, 1);
			i--;
		}
	}

	/**
	 * Please avoid using the static event-handling APIs as they will be removed
	 * in future.
	 * @deprecated
	 */
	public static removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void {
		thisArg = thisArg || undefined;

		if (typeof eventNames !== 'string') {
			throw new TypeError('Event name(s) must be a string.');
		}

		if (callback && typeof callback !== 'function') {
			throw new TypeError('Callback, if provided, must be function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;

		for (const eventName of eventNames.trim().split(eventNamesRegex)) {
			const entries = _globalEventHandlers?.[eventClass]?.[eventName];
			if (!entries) {
				continue;
			}

			Observable.innerRemoveEventListener(entries, callback, thisArg);

			if (!entries.length) {
				// Clear all entries of this type
				delete _globalEventHandlers[eventClass][eventName];
			}

			// Clear the primary class grouping if no list are left
			const keys = Object.keys(_globalEventHandlers[eventClass]);
			if (keys.length === 0) {
				delete _globalEventHandlers[eventClass];
			}
		}
	}

	/**
	 * Please avoid using the static event-handling APIs as they will be removed
	 * in future.
	 * @deprecated
	 */
	public static addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any, once?: boolean): void {
		once = once || undefined;
		thisArg = thisArg || undefined;

		if (typeof eventNames !== 'string') {
			throw new TypeError('Event name(s) must be a string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('Callback must be a function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;
		if (!_globalEventHandlers[eventClass]) {
			_globalEventHandlers[eventClass] = {};
		}

		for (const eventName of eventNames.trim().split(eventNamesRegex)) {
			if (!_globalEventHandlers[eventClass][eventName]) {
				_globalEventHandlers[eventClass][eventName] = [];
			}
			if (Observable._indexOfListener(_globalEventHandlers[eventClass][eventName], callback, thisArg) !== -1) {
				// Already added.
				return;
			}

			_globalEventHandlers[eventClass][eventName].push({ callback, thisArg, once });
		}
	}

	private _globalNotify<T extends EventData>(eventClass: string, eventType: string, data: T): void {
		// Check for the Global handlers for JUST this class
		if (_globalEventHandlers[eventClass]) {
			const eventName = data.eventName + eventType;
			const entries = _globalEventHandlers[eventClass][eventName];
			if (entries) {
				Observable._handleEvent(entries, data);
			}
		}

		// Check for the Global handlers for ALL classes
		if (_globalEventHandlers['*']) {
			const eventName = data.eventName + eventType;
			const entries = _globalEventHandlers['*'][eventName];
			if (entries) {
				Observable._handleEvent(entries, data);
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
		if (!observers.length) {
			return;
		}

		for (let i = observers.length - 1; i >= 0; i--) {
			const entry = observers[i];
			if (!entry) {
				continue;
			}

			if (entry.once) {
				observers.splice(i, 1);
			}

			const returnValue = entry.thisArg ? entry.callback.apply(entry.thisArg, [data]) : entry.callback(data);

			// This ensures errors thrown inside asynchronous functions do not get swallowed
			if (returnValue instanceof Promise) {
				returnValue.catch((err) => {
					console.error(err);
				});
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
		for (const eventName of eventNames.trim().split(eventNamesRegex)) {
			this.notify({ eventName, object: this });
		}
	}

	private _getEventList(eventName: string, createIfNeeded?: boolean): Array<ListenerEntry> | undefined {
		if (!eventName) {
			throw new TypeError('eventName must be a valid string.');
		}

		let list = <Array<ListenerEntry>>this._observers[eventName];
		if (!list && createIfNeeded) {
			list = [];
			this._observers[eventName] = list;
		}

		return list;
	}

	private static _indexOfListener(list: Array<ListenerEntry>, callback: (data: EventData) => void, thisArg?: any): number {
		thisArg = thisArg || undefined;

		return list.findIndex((entry) => entry.callback === callback && entry.thisArg === thisArg);
	}
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
