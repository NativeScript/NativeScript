import type { ViewBase } from '../../ui/core/view-base';
import { DOMEvent } from '../dom-events/dom-event';

import { Observable as ObservableDefinition, WrappedValue as WrappedValueDefinition } from '.';

export interface EventData {
	eventName: string;
	object: Partial<Observable>;
}

export interface EventDataValue extends EventData {
	value?: boolean;
}

export interface NotifyData extends Partial<EventData> {
	eventName: string;
	object?: Partial<Observable>;
}

export interface PropertyChangeData extends EventData {
	propertyName: string;
	value: any;
	oldValue?: any;
}

export interface ListenerEntry extends AddEventListenerOptions {
	callback: (data: EventData) => void;
	thisArg: any;
}

let _wrappedIndex = 0;

export class WrappedValue implements WrappedValueDefinition {
	constructor(public wrapped: any) {}

	public static unwrap(value: any): any {
		return value instanceof WrappedValue ? value.wrapped : value;
	}

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

export class Observable implements ObservableDefinition {
	public static propertyChangeEvent = 'propertyChange';
	public _isViewBase: boolean;
	isViewBase(): this is ViewBase {
		return this._isViewBase;
	}

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

	public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any, options?: AddEventListenerOptions | boolean): void {
		this.addEventListener(eventNames, callback, thisArg, options);
	}

	public once(event: string, callback: (data: EventData) => void, thisArg?: any, options?: (AddEventListenerOptions & { once: true }) | boolean): void {
		this.addEventListener(event, callback, thisArg, { ...normalizeEventOptions(options), once: true });
	}

	public off(eventNames: string, callback?: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): void {
		this.removeEventListener(eventNames, callback, thisArg, options);
	}

	public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any, options?: AddEventListenerOptions | boolean): void {
		if (typeof eventNames !== 'string') {
			throw new TypeError('Events name(s) must be string.');
		}

		if (typeof callback !== 'function') {
			throw new TypeError('callback must be function.');
		}

		const events = eventNames.trim().split(eventDelimiterPattern);
		for (let i = 0, l = events.length; i < l; i++) {
			const event = events[i];
			const list = this.getEventList(event, true);
			if (Observable._indexOfListener(list, callback, thisArg, options) >= 0) {
				// Don't allow addition of duplicate event listeners.
				continue;
			}

			// TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)
			list.push({
				callback,
				thisArg,
				...normalizeEventOptions(options),
			});
		}
	}

	public removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): void {
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
			if (list) {
				const index = Observable._indexOfListener(list, callback, thisArg, options);
				if (index >= 0) {
					list.splice(index, 1);
				}
				if (list.length === 0) {
					delete this._observers[event];
				}
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

	public static removeEventListener(eventName: string, callback?: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): void {
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
		if (callback) {
			const index = Observable._indexOfListener(events, callback, thisArg, options);
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

	public static addEventListener(eventName: string, callback: (data: EventData) => void, thisArg?: any, options?: AddEventListenerOptions | boolean): void {
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

		const list = _globalEventHandlers[eventClass][eventName];
		if (Observable._indexOfListener(list, callback, thisArg, options) >= 0) {
			// Don't allow addition of duplicate event listeners.
			return;
		}

		_globalEventHandlers[eventClass][eventName].push({
			callback,
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
	public notify<T extends NotifyData>(data: T, options?: CustomEventInit): void {
		data.object = data.object || this;

		// Now that we've filled in the `object` field (that was optional in
		// NotifyData), `data` can be treated as EventData.
		const eventData = data as EventData;

		new DOMEvent(data.eventName, options).dispatchTo({
			target: this,
			data: eventData,
			getGlobalEventHandlersPreHandling: () => this._getGlobalEventHandlers(eventData, 'First'),
			getGlobalEventHandlersPostHandling: () => this._getGlobalEventHandlers(eventData, ''),
		});
	}

	private _getGlobalEventHandlers(data: EventData, eventType: 'First' | ''): ListenerEntry[] {
		const eventClass = data.object?.constructor?.name;
		const globalEventHandlersForOwnClass = _globalEventHandlers[eventClass]?.[`${data.eventName}${eventType}`] ?? [];
		const globalEventHandlersForAllClasses = _globalEventHandlers['*']?.[`${data.eventName}${eventType}`] ?? [];
		return [...globalEventHandlersForOwnClass, ...globalEventHandlersForAllClasses];
	}

	public notifyPropertyChange(name: string, value: any, oldValue?: any, options?: CustomEventInit) {
		this.notify(this._createPropertyChangeData(name, value, oldValue), options);
	}

	public hasListeners(eventName: string) {
		return eventName in this._observers;
	}

	public _createPropertyChangeData(propertyName: string, value: any, oldValue?: any): PropertyChangeData {
		return {
			eventName: Observable.propertyChangeEvent,
			object: this,
			propertyName,
			value,
			oldValue,
		};
	}

	public _emit(eventNames: string) {
		for (const event of eventNames.trim().split(eventDelimiterPattern)) {
			this.notify({ eventName: event, object: this });
		}
	}

	public getEventList(eventName: string, createIfNeeded?: boolean): ListenerEntry[] | undefined {
		if (!eventName) {
			throw new TypeError('EventName must be valid string.');
		}

		let list = this._observers[eventName];
		if (!list && createIfNeeded) {
			list = [];
			this._observers[eventName] = list;
		}

		return list;
	}

	protected static _indexOfListener(list: Array<ListenerEntry>, callback: (data: EventData) => void, thisArg?: any, options?: EventListenerOptions | boolean): number {
		const capture = normalizeEventOptions(options)?.capture ?? false;
		return list.findIndex((entry) => entry.callback === callback && (!thisArg || entry.thisArg === thisArg) && !!entry.capture === capture);
	}
}

class ObservableFromObject extends Observable {
	public _map = {};

	public get(name: string): any {
		return this._map[name];
	}

	public set(name: string, value: any) {
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

function addPropertiesFromObject(observable: ObservableFromObject, source: any, recursive = false) {
	Object.keys(source).forEach((prop) => {
		let value = source[prop];
		if (recursive && !Array.isArray(value) && value && typeof value === 'object' && !(value instanceof Observable)) {
			value = fromObjectRecursive(value);
		}

		defineNewProperty(observable, prop);
		observable.set(prop, value);
	});
}

export const eventDelimiterPattern = /\s*,\s*/;

export function normalizeEventOptions(options?: AddEventListenerOptions | boolean) {
	return typeof options === 'object' ? options : { capture: options };
}

export function fromObject(source: any): Observable {
	const observable = new ObservableFromObject();
	addPropertiesFromObject(observable, source, false);

	return observable;
}

export function fromObjectRecursive(source: any): Observable {
	const observable = new ObservableFromObject();
	addPropertiesFromObject(observable, source, true);

	return observable;
}
