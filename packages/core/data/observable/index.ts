import { Observable as ObservableDefinition, WrappedValue as WrappedValueDefinition } from '.';

export interface EventData {
	eventName: string;
	object: Observable;
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
	onListenerAdded(eventName: string, count: number) {}
	onListenerRemoved(eventName: string, count: number) {}

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
            this.onListenerAdded(event, list.length );
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
				this.onListenerRemoved(event, list ? list.length : 0);
			} else {
				this._observers[event] = undefined;
				delete this._observers[event];
				this.onListenerRemoved(event, 0);
			}
		}
	}

	public notify<T extends EventData>(data: T): void {
		const eventClass = this.constructor.name;
		

		const observers = <Array<ListenerEntry>>this._observers[data.eventName];
		if (observers) {
			Observable._handleEvent(observers, data);
		}

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
			if (entry.thisArg) {
				entry.callback.apply(entry.thisArg, [data]);
			} else {
				entry.callback(data);
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
