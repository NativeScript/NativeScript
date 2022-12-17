import type { ViewBase } from '../../ui/core/view-base';
import { DOMEvent } from '../dom-events/dom-event';
import { MutationSensitiveArray } from '../mutation-sensitive-array';

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

export interface ListenerEntry extends AddEventListenerOptions {
	callback: (data: EventData) => void;
	thisArg: any;
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
		[eventName: string]: MutationSensitiveArray<ListenerEntry>;
	};
} = {};

/**
 * Observable is used when you want to be notified when a change occurs. Use on/off methods to add/remove listener.
 * Please note that should you be using the `new Observable({})` constructor, it is **obsolete** since v3.0,
 * and you have to migrate to the "data/observable" `fromObject({})` or the `fromObjectRecursive({})` functions.
 */
export class Observable implements EventTarget {
	/**
	 * String value used when hooking to propertyChange event.
	 */
	public static propertyChangeEvent = 'propertyChange';

	/**
	 * Filed to use instead of instanceof ViewBase.
	 * @private
	 */
	public _isViewBase: boolean;

	/**
	 * Type predicate to accompany the _isViewBase property.
	 * @private
	 */
	isViewBase(): this is ViewBase {
		return this._isViewBase;
	}

	private readonly _observers: { [eventName: string]: MutationSensitiveArray<ListenerEntry> } = {};

	public get(name: string): any {
		return this[name];
	}

	public set(name: string, value: any, options?: CustomEventInit): void {
		// TODO: Parameter validation
		const oldValue = this[name];
		if (this[name] === value) {
			return;
		}

		const newValue = WrappedValue.unwrap(value);
		this[name] = newValue;
		this.notifyPropertyChange(name, newValue, oldValue, options);
	}

	public setProperty(name: string, value: any, options?: CustomEventInit): void {
		const oldValue = this[name];
		if (this[name] === value) {
			return;
		}
		this[name] = value;
		this.notifyPropertyChange(name, value, oldValue, options);

		const specificPropertyChangeEventName = name + 'Change';
		if (this.hasListeners(specificPropertyChangeEventName)) {
			const eventData = this._createPropertyChangeData(name, value, oldValue);
			eventData.eventName = specificPropertyChangeEventName;
			this.notify(eventData, options);
		}
	}

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 * @param options An optional parameter. If passed as a boolean, configures the useCapture value. Otherwise, specifies options.
	 */
	public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any, options?: AddEventListenerOptions | boolean): void {
		this.addEventListener(eventNames, callback, thisArg, options);
	}

	/**
	 * Adds one-time listener function for the event named `event`.
	 * @param event Name of the event to attach to.
	 * @param callback A function to be called when the specified event is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 * @param options An optional parameter. If passed as a boolean, configures the useCapture value. Otherwise, specifies options.
	 */
	public once(event: string, callback: (data: EventData) => void, thisArg?: any, options?: (AddEventListenerOptions & { once: true }) | boolean): void {
		this.addEventListener(event, callback, thisArg, { ...normalizeEventOptions(options), once: true });
	}

	/**
	 * Shortcut alias to the removeEventListener method.
	 */
	public off(eventNames: string, callback?: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): void {
		this.removeEventListener(eventNames, callback, thisArg, options);
	}

	/**
	 * Adds a listener for the specified event name.
	 * @param eventNames Comma delimited names of the events to attach the listener to.
	 * @param callback A function to be called when some of the specified event(s) is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 * @param options An optional parameter. If passed as a boolean, configures the useCapture value. Otherwise, specifies options.
	 */
	public addEventListener(eventNames: string, callback: EventListenerOrEventListenerObject | ((data: EventData) => void), thisArg?: any, options?: AddEventListenerOptions | boolean): void {
		if (typeof eventNames !== 'string') {
			throw new TypeError('Events name(s) must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('Callback must be function.');
		}

		const events = eventNames.trim().split(eventDelimiterPattern);
		for (let i = 0, l = events.length; i < l; i++) {
			const event = events[i];
			const list = this.getEventList(event, true);
			if (Observable._indexOfListener(list, callback as (data: EventData) => void, thisArg, options) >= 0) {
				// Don't allow addition of duplicate event listeners.
				continue;
			}

			// TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)
			list.push({
				callback: callback as (data: EventData) => void,
				thisArg,
				...normalizeEventOptions(options),
			});
		}
	}

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 * @param options An optional parameter. If passed as a boolean, configures the useCapture value. Otherwise, specifies options.
	 */
	public removeEventListener(eventNames: string, callback?: EventListenerOrEventListenerObject | ((data: EventData) => void), thisArg?: any, options?: EventListenerOptions | boolean): void {
		if (typeof eventNames !== 'string') {
			throw new TypeError('Events name(s) must be string.');
		}

		if (callback && typeof callback !== 'function') {
			throw new TypeError('Callback, if provided, must be function.');
		}

		for (const event of eventNames.trim().split(eventDelimiterPattern)) {
			if (!callback) {
				delete this._observers[event];
				continue;
			}

			const list = this.getEventList(event, false);
			if (!list) {
				continue;
			}

			const index = Observable._indexOfListener(list, callback as (data: EventData) => void, thisArg, options);
			if (index >= 0) {
				list.splice(index, 1);
			}
			if (list.length === 0) {
				delete this._observers[event];
			}
		}
	}

	public static on(eventName: string, callback: (data: EventData) => void, thisArg?: any, options?: AddEventListenerOptions | boolean): void {
		this.addEventListener(eventName, callback, thisArg, options);
	}

	public static once(eventName: string, callback: (data: EventData) => void, thisArg?: any, options?: (AddEventListenerOptions & { once: true }) | boolean): void {
		this.addEventListener(eventName, callback, thisArg, { ...normalizeEventOptions(options), once: true });
	}

	public static off(eventName: string, callback?: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): void {
		this.removeEventListener(eventName, callback, thisArg, options);
	}

	public static removeEventListener(eventName: string, callback?: EventListenerOrEventListenerObject | ((data: EventData) => void), thisArg?: any, options?: EventListenerOptions | boolean): void {
		if (typeof eventName !== 'string') {
			throw new TypeError('Event must be string.');
		}

		if (callback && typeof callback !== 'function') {
			throw new TypeError('Callback, if provided, must be function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;

		// Short Circuit if no handlers exist..
		if (!_globalEventHandlers[eventClass] || !Array.isArray(_globalEventHandlers[eventClass][eventName])) {
			return;
		}

		const events = _globalEventHandlers[eventClass][eventName];
		if (callback) {
			const index = Observable._indexOfListener(events, callback as (data: EventData) => void, thisArg, options);
			if (index >= 0) {
				events.splice(index, 1);
			}
		} else {
			// Clear all events of this type
			delete _globalEventHandlers[eventClass][eventName];
		}

		if (!events.length) {
			// Clear all events of this type
			delete _globalEventHandlers[eventClass][eventName];
		}

		// Clear the primary class grouping if no events are left
		const keys = Object.keys(_globalEventHandlers[eventClass]);
		if (!keys.length) {
			delete _globalEventHandlers[eventClass];
		}
	}

	public static addEventListener(eventName: string, callback: EventListenerOrEventListenerObject | ((data: EventData) => void), thisArg?: any, options?: AddEventListenerOptions | boolean): void {
		if (typeof eventName !== 'string') {
			throw new TypeError('Event must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('Callback must be function.');
		}

		const eventClass = this.name === 'Observable' ? '*' : this.name;
		if (!_globalEventHandlers[eventClass]) {
			_globalEventHandlers[eventClass] = {};
		}
		if (!Array.isArray(_globalEventHandlers[eventClass][eventName])) {
			_globalEventHandlers[eventClass][eventName] = new MutationSensitiveArray();
		}

		const list = _globalEventHandlers[eventClass][eventName];
		if (Observable._indexOfListener(list, callback as (data: EventData) => void, thisArg, options) >= 0) {
			// Don't allow addition of duplicate event listeners.
			return;
		}

		_globalEventHandlers[eventClass][eventName].push({
			callback: callback as (data: EventData) => void,
			thisArg,
			...normalizeEventOptions(options),
		});
	}

	/**
	 * Notifies all the registered listeners for the event provided in the
	 * data.eventName.
	 *
	 * Old behaviour (for reference):
	 * - pre-handling phase: Notifies all observers registered globally, i.e.
	 *   for the given event name on the given class name (or all class names)
	 *   with the eventName suffix 'First'.
	 *
	 * - handling phase: Notifies all observers registered on the Observable
	 *   itself.
	 *
	 * - post-handling phase: Notifies all observers registered globally, i.e.
	 *   for the given event name on the given class name (or all class names)
	 *   without any eventName suffix.
	 *
	 *
	 * New behaviour (based on DOM, but backwards-compatible):
	 * - pre-handling phase: Same as above.
	 *
	 * - capturing phase: Calls the callback for event listeners registered on
	 *   each ancestor of the target in turn (starting with the most ancestral),
	 *   but not the target itself.
	 *
	 * - at-target phase: Calls the callback for event listeners registered on
	 *   the target. Equivalent to the old 'handling phase'.
	 *
	 * - bubbling phase: Calls the callback for event listeners registered on
	 *   each ancestor of the target (again, not the target itself) in turn,
	 *   starting with the immediate parent.
	 *
	 * - post-handling phase: Same as above.
	 *
	 * - The progragation can be stopped in any of these phases using
	 *   event.stopPropagation() or event.stopImmediatePropagation().
	 *
	 * The old behaviour is the default. That is to say, by taking the default
	 * option of { bubbles: false } and ensuring that any event listeners added
	 * also use the default option of { capture: false }, then the event will
	 * go through just the pre-handling, at-target, and post-handling phases. As
	 * long as none of the new DOM-specific features like stopPropagation() are
	 * used, it will behave equivalently.
	 *
	 * @param data The data associated with the event.
	 * @param options Options for the event, in line with DOM Standard.
	 */
	public notify<T extends EventData>(data: T, options?: CustomEventInit): void {
		new DOMEvent(data.eventName, options).dispatchTo({
			target: this,
			data,
			getGlobalEventHandlersPreHandling: () => this._getGlobalEventHandlers(data, 'First'),
			getGlobalEventHandlersPostHandling: () => this._getGlobalEventHandlers(data, ''),
		});
	}

	dispatchEvent(event: DOMEvent): boolean {
		const data = {
			eventName: event.type,
			object: this,
			detail: event.detail,
		};

		return event.dispatchTo({
			target: this,
			data,
			getGlobalEventHandlersPreHandling: () => this._getGlobalEventHandlers(data, 'First'),
			getGlobalEventHandlersPostHandling: () => this._getGlobalEventHandlers(data, ''),
		});
	}

	private _getGlobalEventHandlers(data: EventData, eventType: 'First' | ''): MutationSensitiveArray<ListenerEntry> {
		const eventClass = data.object?.constructor?.name;
		const globalEventHandlersForOwnClass = _globalEventHandlers[eventClass]?.[`${data.eventName}${eventType}`] ?? [];
		const globalEventHandlersForAllClasses = _globalEventHandlers['*']?.[`${data.eventName}${eventType}`] ?? [];
		return new MutationSensitiveArray(...globalEventHandlersForOwnClass, ...globalEventHandlersForAllClasses);
	}

	/**
	 * Notifies all the registered listeners for the property change event.
	 */
	public notifyPropertyChange(name: string, value: any, oldValue?: any, options?: CustomEventInit) {
		this.notify(this._createPropertyChangeData(name, value, oldValue), options);
	}

	/**
	 * Checks whether a listener is registered for the specified event name.
	 * @param eventName The name of the event to check for.
	 */
	public hasListeners(eventName: string) {
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

	public _emit(eventNames: string, options?: CustomEventInit) {
		for (const event of eventNames.trim().split(eventDelimiterPattern)) {
			this.notify({ eventName: event, object: this }, options);
		}
	}

	public getEventList(eventName: string, createIfNeeded?: boolean): MutationSensitiveArray<ListenerEntry> | undefined {
		if (!eventName) {
			throw new TypeError('EventName must be valid string.');
		}

		let list = this._observers[eventName];
		if (!list && createIfNeeded) {
			list = new MutationSensitiveArray();
			this._observers[eventName] = list;
		}

		return list;
	}

	protected static _indexOfListener(list: Array<ListenerEntry>, callback: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): number {
		const capture = normalizeEventOptions(options)?.capture ?? false;
		return list.findIndex((entry) => entry.callback === callback && (!thisArg || entry.thisArg === thisArg) && !!entry.capture === capture);
	}
}

export interface Observable {
	/**
	 * Raised when a propertyChange occurs.
	 */
	on(event: 'propertyChange', callback: (data: EventData) => void, thisArg?: any, options?: AddEventListenerOptions | boolean): void;

	/**
	 * Updates the specified property with the provided value.
	 */
	set(name: string, value: any): void;

	/**
	 * Updates the specified property with the provided value and raises a property change event and a specific change event based on the property name.
	 */
	setProperty(name: string, value: any, options?: CustomEventInit): void;

	/**
	 * Gets the value of the specified property.
	 */
	get(name: string): any;
}

class ObservableFromObject extends Observable {
	public _map = {};

	public get(name: string): any {
		return this._map[name];
	}

	/**
	 * Updates the specified property with the provided value.
	 */
	public set(name: string, value: any, options?: CustomEventInit) {
		const currentValue = this._map[name];
		if (currentValue === value) {
			return;
		}

		const newValue = WrappedValue.unwrap(value);
		this._map[name] = newValue;
		this.notifyPropertyChange(name, newValue, currentValue, options);
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

function addPropertiesFromObject(observable: ObservableFromObject, source: any, recursive?: boolean, options?: CustomEventInit) {
	Object.keys(source).forEach((prop) => {
		let value = source[prop];
		if (recursive && !Array.isArray(value) && value && typeof value === 'object' && !(value instanceof Observable)) {
			value = fromObjectRecursive(value);
		}

		defineNewProperty(observable, prop);
		observable.set(prop, value, options);
	});
}

export const eventDelimiterPattern = /\s*,\s*/;

export function normalizeEventOptions(options?: AddEventListenerOptions | boolean) {
	return typeof options === 'object' ? options : { capture: options };
}

/**
 * Creates an Observable instance and sets its properties according to the supplied JavaScript object.
 * param obj - A JavaScript object used to initialize nativescript Observable instance.
 */
export function fromObject(source: any, options?: CustomEventInit): Observable {
	const observable = new ObservableFromObject();
	addPropertiesFromObject(observable, source, false, options);

	return observable;
}

/**
 * Creates an Observable instance and sets its properties according to the supplied JavaScript object.
 * This function will create new Observable for each nested object (expect arrays and functions) from supplied JavaScript object.
 * param obj - A JavaScript object used to initialize nativescript Observable instance.
 */
export function fromObjectRecursive(source: any, options?: CustomEventInit): Observable {
	const observable = new ObservableFromObject();
	addPropertiesFromObject(observable, source, true, options);

	return observable;
}
