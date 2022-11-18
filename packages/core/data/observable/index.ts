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

interface ListenerEntry {
	callback: (data: EventData) => void;
	thisArg: any;
	once?: true;
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

const _globalEventHandlers = {};

export class Observable implements ObservableDefinition {
	public static propertyChangeEvent = 'propertyChange';
	public _isViewBase: boolean;

	private _observers = {};

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

	public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void {
		this.addEventListener(eventNames, callback, thisArg);
	}

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

	public off(eventNames: string, callback?: any, thisArg?: any): void {
		this.removeEventListener(eventNames, callback, thisArg);
	}

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

	public removeEventListener(eventNames: string, callback?: any, thisArg?: any): void {
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

	public static on(eventName: string, callback: any, thisArg?: any): void {
		this.addEventListener(eventName, callback, thisArg);
	}

	public static once(eventName: string, callback: any, thisArg?: any): void {
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

	public static off(eventName: string, callback?: any, thisArg?: any): void {
		this.removeEventListener(eventName, callback, thisArg);
	}

	public static removeEventListener(eventName: string, callback?: any, thisArg?: any): void {
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

	public static addEventListener(eventName: string, callback: any, thisArg?: any): void {
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

	public notify<T extends NotifyData>(data: T): void {
		const eventData = data as EventData;
		eventData.object = eventData.object || this;
		const eventClass = this.constructor.name;
		this._globalNotify(eventClass, 'First', eventData);

		const observers = <Array<ListenerEntry>>this._observers[data.eventName];
		if (observers) {
			Observable._handleEvent(observers, eventData);
		}

		this._globalNotify(eventClass, '', eventData);
	}

	private static _handleEvent<T extends EventData>(observers: Array<ListenerEntry>, data: T): void {
		if (!observers) {
			return;
		}
		for (let i = observers.length - 1; i >= 0; i--) {
			const entry = observers[i];
			if (entry.once) {
				observers.splice(i, 1);
			}

			let returnValue;
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

	public notifyPropertyChange(name: string, value: any, oldValue?: any) {
		this.notify(this._createPropertyChangeData(name, value, oldValue));
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
