import { Optional } from '../../utils/typescript-utils';
import { Event as NativeDOMEvent, EventPhases } from '../../ui/core/dom/src/event/Event';

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
		[eventName: string]: Array<EventDescriptior>;
	};
} = {};

interface EventDescriptior extends AddEventListenerOptions {
	target: EventTarget;
	type: string;
	removed?: boolean;
	abortHandler?: () => void;
	thisArg?: unknown;
	listener: EventListenerOrEventListenerObject;
}

function isThisArg(value: any) {
	if (!value) return false;
	if (typeof value !== 'object') return false;
	if (value?.constructor?.toString().indexOf('class') === 0) return true;
	// If object has none of the values in event options, it's thisArg.
	// We might never reach this point (hopefully) but adding this just to be
	// careful.
	if (!value.once && !value.signal && !value.passive && !value.capture && !value.thisArg) return true;
	return false;
}

const getEventDescriptor = (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: (AddEventListenerOptions & { thisArg: any }) | boolean): EventDescriptior => {
	const handleEvent = typeof listener === 'function' ? listener : listener.handleEvent;
	/**
	 * the most common case is handled first. No options. No capturing. No thisArg.
	 */
	if (!options || typeof options === 'boolean') {
		return { target, capture: !!options, type, listener: handleEvent };
	}

	// The second most common case, last argument is thisArg.
	if (isThisArg(options)) {
		return {
			type,
			target,
			thisArg: options,
			listener: handleEvent,
		};
	}
	// Finally the last and "new" case of event options.
	const { capture, once, passive, signal, thisArg } = options;
	return {
		target,
		capture,
		type,
		once,
		passive,
		signal,
		listener: handleEvent,
		thisArg: thisArg,
	};
};

function indexOfListener(list: EventDescriptior[], listener: EventListenerOrEventListenerObject | ((data: EventData) => void), thisArg?: any): number {
	for (let i = 0, l = list.length; i < l; i++) {
		const entry = list[i];
		if (thisArg) {
			if (entry.listener === listener && entry.thisArg === thisArg) {
				return i;
			}
		} else {
			if (entry.listener === listener) {
				return i;
			}
		}
	}

	return -1;
}

const CAPTURE_PHASE_KEY = '_captureObservers';
const BUBBLE_PHASE_KEY = '_observers';
type PhaseKey = '_captureObservers' | '_observers';

function addListener(this: any, type: string, listener: EventListenerOrEventListenerObject, descriptor: EventDescriptior) {
	const eventPhaseKey = descriptor.capture ? CAPTURE_PHASE_KEY : BUBBLE_PHASE_KEY;
	// Create an abort handler if any of the following is set.
	if (descriptor.once || descriptor.signal) {
		const abortHandler = () => {
			if (!descriptor.removed) this.removeEventListener(type, listener);
		};
		descriptor.abortHandler = abortHandler;

		if (descriptor.once) {
			descriptor.listener = function (...handlerArgs) {
				abortHandler();
				//@ts-ignore
				listener.call(this, ...handlerArgs);
			};
		}

		if (descriptor.signal) {
			descriptor.signal.addEventListener('abort', abortHandler);
		}
	}
	getEventList.call(this, type, eventPhaseKey, true).push(descriptor);
}

function removeListener(this: any, type: string, listener: EventListenerOrEventListenerObject, options: any, phase?: PhaseKey) {
	const eventPhaseKey = phase || BUBBLE_PHASE_KEY;
	const list = getEventList.call(this, type, eventPhaseKey, false) as EventDescriptior[];
	if (!list) return;

	if (!listener) {
		delete this[eventPhaseKey][type];
		return;
	}

	const index = indexOfListener(list, listener, isThisArg(options) ? options : undefined);
	const descriptor = list[index];
	if (!descriptor) return;
	descriptor.removed = true;
	list.splice(index, 1);
	if (descriptor.signal && descriptor.abortHandler) {
		descriptor.signal.removeEventListener('abort', descriptor.abortHandler);
	}
	if (!list.length) delete this[eventPhaseKey][type];
}

function getEventList(eventName: string, phaseKey: PhaseKey, createIfNeeded?: boolean): Array<EventDescriptior> {
	if (!eventName) {
		throw new TypeError('EventName must be valid string.');
	}

	let list = this[phaseKey][eventName];
	if (!list && createIfNeeded) list = this[phaseKey][eventName] = [];
	return list;
}

// An empty class to make instanceOf EventTarget checks pass automatically.
class EventTarget {}
/**
 * Observable is used when you want to be notified when a change occurs. Use on/off methods to add/remove listener.
 * Please note that should you be using the `new Observable({})` constructor, it is **obsolete** since v3.0,
 * and you have to migrate to the "data/observable" `fromObject({})` or the `fromObjectRecursive({})` functions.
 */
export class Observable extends EventTarget implements globalThis.EventTarget {
	/**
	 * String value used when hooking to propertyChange event.
	 */
	public static propertyChangeEvent = 'propertyChange';

	/**
	 * Alternative to `instanceof ViewBase`.
	 * @private
	 */
	public _isViewBase: boolean;

	private readonly _observers: { [eventName: string]: EventDescriptior[] } = {};
	private readonly _captureObservers: { [eventName: string]: EventDescriptior[] } = {};

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
		this.addEventListener(event, callback, {
			thisArg,
			once: true,
		});
	}

	/**
	 * Shortcut alias to the removeEventListener method.
	 */
	public off(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this.removeEventListener(eventNames, callback, thisArg);
	}

	// public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	// public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;
	/**
	 * Adds a listener for the specified event name.
	 * @param eventNames Comma delimited names of the events to attach the listener to.
	 * @param callback A function to be called when some of the specified event(s) is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	public addEventListener(...args: unknown[]): void {
		const [type, listener, options] = args as [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | any];

		if (typeof type !== 'string') throw new TypeError('Events name(s) must be string.');
		if (typeof listener !== 'function' && !listener?.handleEvent) throw new TypeError('Callback must be function or an object with handeEvent function');
		// Add the event directly if it's a single event name.
		if (!type.includes(',')) {
			// Get the event descriptor.
			const descriptor = getEventDescriptor(this, type, listener, options);
			addListener.call(this, type, listener, descriptor);
			return;
		}

		// Loop over all events and attach the descriptor.
		const events = type.split(',');
		const length = events.length;
		for (let i = 0, l = length; i < l; i++) {
			const type = events[i].trim();
			// Get the event descriptor.
			const descriptor = getEventDescriptor(this, type, listener, options);
			addListener.call(this, type, listener, descriptor);
		}
	}

	// public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	// public removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void;

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param option An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 */
	public removeEventListener(...args: unknown[]): void {
		const [type, listener, options] = args as [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | any];

		if (typeof type !== 'string') throw new TypeError('Events name(s) must be string.');
		if (listener && typeof listener !== 'function' && !listener?.handleEvent) throw new TypeError(`Callback must be function or an object with handeEvent function`);

		if (!type.includes(',')) {
			removeListener.call(this, type, listener, options, options?.capture ? CAPTURE_PHASE_KEY : BUBBLE_PHASE_KEY);
			return;
		}
		const events = type.split(',');
		const length = events.length;
		for (let i = 0, l = length; i < l; i++) {
			removeListener.call(this, events[i].trim(), listener, options, options?.capture ? CAPTURE_PHASE_KEY : BUBBLE_PHASE_KEY);
		}
	}
	/**
	 * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
	 *
	 * @nativescript Event bubbling is disabled by default.
	 */
	dispatchEvent(event: Event): boolean {
		//@ts-ignore
		const { bubbles, captures, type } = event;
		/**
		 * If event already has target/currentTarget set, skip setting these values.
		 */

		(event as NativeDOMEvent)._target = this;
		//@ts-ignore
		(event as NativeDOMEvent).currentTarget = this;

		const capturePhase: Array<EventDescriptior>[] = [];

		const targetPhase: Array<EventDescriptior> = this._observers[type];
		const targetPhaseCapture: Array<EventDescriptior> = this._captureObservers[type];

		const bubblePhase: Array<EventDescriptior>[] = [];
		// Walk the tree & find ancestors that have any handlers attached.
		if (bubbles || captures) {
			// eslint-disable-next-line consistent-this, @typescript-eslint/no-this-alias
			// Start from the first parent.
			let currentNode = (this as any).parentNode;
			while (currentNode) {
				if (captures && currentNode._captureObservers[type]) capturePhase.unshift(currentNode._captureObservers[type]);
				if (bubbles && currentNode._observers[type]) bubblePhase.push(currentNode._observers[type]);
				//@ts-ignore todo
				currentNode = currentNode.parentNode;
			}
		}

		// Capturing starts from the highest ancestor goes down

		for (const listeners of capturePhase) {
			(event as NativeDOMEvent).eventPhase = EventPhases.CAPTURING_PHASE;
			Observable._handleEvent(listeners.slice(0), event as NativeDOMEvent);
			if (!event.bubbles || (event as NativeDOMEvent)._propagationStopped) return !event.cancelable || !event.defaultPrevented;
		}

		// Fire the event of the element that is the actual target.

		if (targetPhase) {
			(event as NativeDOMEvent).eventPhase = EventPhases.AT_TARGET;
			Observable._handleEvent(targetPhase, event as NativeDOMEvent);
			if (!event.bubbles || (event as NativeDOMEvent)._propagationStopped) return !event.cancelable || !event.defaultPrevented;
		}

		if (targetPhaseCapture) {
			Observable._handleEvent(targetPhaseCapture, event as NativeDOMEvent);
			if (!event.bubbles || (event as NativeDOMEvent)._propagationStopped) return !event.cancelable || !event.defaultPrevented;
		}

		// Bubbling starts from the nearest ancestor and goes up.

		for (const listeners of bubblePhase) {
			(event as NativeDOMEvent).eventPhase = EventPhases.BUBBLING_PHASE;
			Observable._handleEvent(listeners.slice(0), event as NativeDOMEvent);
			if (!event.bubbles || (event as NativeDOMEvent)._propagationStopped) return !event.cancelable || !event.defaultPrevented;
		}
		// Reset the event phase.
		(event as NativeDOMEvent).eventPhase = EventPhases.NONE;

		return !event.cancelable || !event.defaultPrevented;
	}

	public static on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		this.addEventListener(eventName, callback, thisArg);
	}

	public static once(eventName: string, callback: (data: EventData) => void, thisArg?: any): void {
		this.addEventListener(eventName, callback, { once: true, thisArg });
	}

	public static off(eventName: string, callback?: (data: EventData) => void, thisArg?: any): void {
		this.removeEventListener(eventName, callback, thisArg);
	}

	// public static removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	// public static removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any): void;
	public static removeEventListener(...args: unknown[]): void {
		const [type, listener, options] = args as [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | any];
		if (typeof type !== 'string') throw new TypeError('Events name(s) must be string.');
		if (listener && typeof listener !== 'function' && !listener?.handleEvent) throw new TypeError('callback must be function or an object with handeEvent function');

		const eventClass = this.name === 'Observable' ? '*' : this.name;

		// Short Circuit if no handlers exist..
		if (!_globalEventHandlers[eventClass] || !_globalEventHandlers[eventClass][type] || !_globalEventHandlers[eventClass][type].length) {
			return;
		}

		const events = _globalEventHandlers[eventClass][type];
		if (!listener) {
			delete _globalEventHandlers[eventClass][type];
		} else {
			const index = indexOfListener(events, listener, isThisArg(options) ? options : undefined);
			if (index > -1) events.splice(index, 1);
			if (events.length === 0) delete _globalEventHandlers[eventClass][type];
		}

		// Clear the primary class grouping if no events are left
		const keys = Object.keys(_globalEventHandlers[eventClass]);
		if (keys.length === 0) {
			delete _globalEventHandlers[eventClass];
		}
	}

	// public static addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
	// public static addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;

	public static addEventListener(...args: unknown[]): void {
		const [type, listener, options] = args as [type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | any];
		if (typeof type !== 'string') throw new TypeError('Events name(s) must be string.');
		if (typeof listener !== 'function' && !listener?.handleEvent) throw new TypeError('callback must be function or an object with handeEvent function');

		const eventClass = this.name === 'Observable' ? '*' : this.name;
		if (!_globalEventHandlers[eventClass]) {
			_globalEventHandlers[eventClass] = {};
		}
		if (!_globalEventHandlers[eventClass][type]) {
			_globalEventHandlers[eventClass][type] = [];
		}
		const descriptor = getEventDescriptor(this, type, listener, options);

		if (descriptor.once || descriptor.signal) {
			const abortHandler = () => {
				if (!descriptor.removed) Observable.removeEventListener(type, listener);
			};
			descriptor.abortHandler = abortHandler;

			if (descriptor.once) {
				descriptor.listener = function (...handlerArgs) {
					abortHandler();
					//@ts-ignore
					listener.call(this, ...handlerArgs);
				};
			}

			if (descriptor.signal) {
				descriptor.signal.addEventListener('abort', abortHandler);
			}
		}
		_globalEventHandlers[eventClass][type].push(descriptor);
	}

	private _globalNotify<T extends EventData>(eventClass: string, eventType: string, data: T): void {
		// Check for the Global handlers for JUST this class
		if (_globalEventHandlers[eventClass]) {
			const event = data.eventName + eventType;
			const events = _globalEventHandlers[eventClass][event];
			if (events) {
				const event = new NativeDOMEvent(data.eventName, { __event_data: data as unknown });
				Observable._handleEvent(events.slice(0), event);
			}
		}

		// Check for he Global handlers for ALL classes
		if (_globalEventHandlers['*']) {
			const event = data.eventName + eventType;
			const events = _globalEventHandlers['*'][event];
			if (events) {
				const event = new NativeDOMEvent(data.eventName, { __event_data: data as unknown });
				Observable._handleEvent(events.slice(0), event);
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

		const listeners = this._observers[data.eventName];
		if (listeners) {
			const event = new NativeDOMEvent(data.eventName, { __event_data: dataWithObject as unknown });
			// Create a shallow copy here because there is a possibility
			// that listeners will be removed while we iterate over events. For example
			// events that will unsub themselves.
			Observable._handleEvent(listeners.slice(0), event);
		}

		this._globalNotify(eventClass, '', dataWithObject);
	}

	private static _handleEvent<T extends NativeDOMEvent>(listeners: Array<EventDescriptior>, event: T): void {
		if (!listeners || !listeners.length) return;
		for (let i = 0, l = listeners.length; i < l; i++) {
			const descriptor = listeners[i];
			const { listener, removed, thisArg } = descriptor;
			if (removed) continue;
			event.passive = !event.cancelable || descriptor.passive;
			event._currentTarget = (thisArg as any) || (event as NativeDOMEvent).object || (descriptor.target as globalThis.EventTarget);
			let returnValue;
			if (thisArg) {
				returnValue = (listener as EventListener).apply(thisArg, [event]);
			} else {
				returnValue = (listener as EventListener)(event);
			}
			// This ensures errors thrown inside asynchronous functions do not get swallowed
			if (returnValue && returnValue instanceof Promise) {
				returnValue.catch((err) => {
					console.error(err);
				});
			}

			//@ts-ignore
			if (event._immediatePropagationStopped) return;
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
		return eventName in this._observers || eventName in this._captureObservers;
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
}

export interface Observable extends globalThis.EventTarget {
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
