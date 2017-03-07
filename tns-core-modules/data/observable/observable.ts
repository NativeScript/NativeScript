import { Observable as ObservableDefinition, WrappedValue as WrappedValueDefinition, EventData, PropertyChangeData } from "data/observable";

interface ListenerEntry {
    callback: (data: EventData) => void;
    thisArg: any;
}

let _wrappedIndex = 0;

export class WrappedValue implements WrappedValueDefinition {
    constructor(public wrapped: any) {
    }

    public static unwrap(value: any) {
        return (value && value.wrapped) ? value.wrapped : value;
    }

    public static wrap(value: any) {
        const w = _wrappedValues[_wrappedIndex++ % 5];
        w.wrapped = value;
        return w;
    }
}

let _wrappedValues = [
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null)
]

export class Observable implements ObservableDefinition {
    public static propertyChangeEvent = "propertyChange";
    private _observers = {};

    public get(name: string): any {
        return this[name];
    }

    public set(name: string, value: any) {
        // TODO: Parameter validation
        if (this[name] === value) {
            return;
        }

        const newValue = WrappedValue.unwrap(value);
        this[name] = newValue;
        this.notifyPropertyChange(name, newValue);
    }

    public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
        this.addEventListener(eventNames, callback, thisArg);
    }

    public off(eventNames: string, callback?: any, thisArg?: any) {
        this.removeEventListener(eventNames, callback, thisArg);
    }

    public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: Object) {
        if (typeof eventNames !== "string") {
            throw new TypeError("Events name(s) must be string.");
        }

        if (typeof callback !== "function") {
            throw new TypeError("callback must be function.");
        }

        const events = eventNames.split(",");
        for (let i = 0, l = events.length; i < l; i++) {
            const event = events[i].trim();
            const list = this._getEventList(event, true);
            // TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)
            list.push({
                callback: callback,
                thisArg: thisArg
            });
        }
    }

    public removeEventListener(eventNames: string, callback?: any, thisArg?: Object) {
        if (typeof eventNames !== "string") {
            throw new TypeError("Events name(s) must be string.");
        }

        if (callback && typeof callback !== "function") {
            throw new TypeError("callback must be function.");
        }

        const events = eventNames.split(",");
        for (let i = 0, l = events.length; i < l; i++) {
            const event = events[i].trim();
            if (callback) {
                const list = this._getEventList(event, false);
                if (list) {
                    const index = this._indexOfListener(list, callback, thisArg);
                    if (index >= 0) {
                        list.splice(index, 1);
                    }
                    if (list.length === 0) {
                        delete this._observers[event];
                    }
                }
            }
            else {
                this._observers[event] = undefined;
                delete this._observers[event];
            }
        }
    }

    public notify<T extends EventData>(data: T) {
        const observers = <Array<ListenerEntry>>this._observers[data.eventName];
        if (!observers) {
            return;
        }

        for (let i = observers.length - 1; i >= 0; i--) {
            let entry = observers[i];
            if (entry.thisArg) {
                entry.callback.apply(entry.thisArg, [data]);
            } else {
                entry.callback(data);
            }
        }
    }

    public notifyPropertyChange(name: string, newValue: any) {
        this.notify(this._createPropertyChangeData(name, newValue));
    }

    public hasListeners(eventName: string) {
        return eventName in this._observers;
    }

    public _createPropertyChangeData(name: string, value: any): PropertyChangeData {
        return {
            eventName: Observable.propertyChangeEvent,
            propertyName: name,
            object: this,
            value: value
        };
    }

    public _emit(eventNames: string) {
        const events = eventNames.split(",");

        for (let i = 0, l = events.length; i < l; i++) {
            const event = events[i].trim();
            this.notify({ eventName: event, object: this });
        }
    }

    private _getEventList(eventName: string, createIfNeeded?: boolean): Array<ListenerEntry> {
        if (!eventName) {
            throw new TypeError("EventName must be valid string.");
        }

        let list = <Array<ListenerEntry>>this._observers[eventName];
        if (!list && createIfNeeded) {
            list = [];
            this._observers[eventName] = list;
        }

        return list;
    }

    private _indexOfListener(list: Array<ListenerEntry>, callback: (data: EventData) => void, thisArg?: any): number {
        for (let i = 0; i < list.length; i++) {
            const entry = list[i];
            if (thisArg) {
                if (entry.callback === callback && entry.thisArg === thisArg) {
                    return i;
                }
            }
            else {
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

    public set(name: string, value: any) {
        const currentValue = this._map[name];
        if (currentValue === value) {
            return;
        }

        const newValue = WrappedValue.unwrap(value);
        this._map[name] = newValue;
        this.notifyPropertyChange(name, newValue);
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
        configurable: true
    });
}

function addPropertiesFromObject(observable: ObservableFromObject, source: any, recursive: boolean = false) {
    let isRecursive = recursive;
    for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
            if (isRecursive) {
                if (!Array.isArray(source[prop]) && source[prop] && typeof source[prop] === 'object' && !(source[prop] instanceof Observable)) {
                    source[prop] = fromObjectRecursive(source[prop]);
                }
            }
            defineNewProperty(observable, prop);
            observable.set(prop, source[prop]);
        }
    }
}

export function fromObject(source: any): Observable {
    let observable = new ObservableFromObject();
    addPropertiesFromObject(observable, source, false);
    return observable;
}

export function fromObjectRecursive(source: any): Observable {
    let observable = new ObservableFromObject();
    addPropertiesFromObject(observable, source, true);
    return observable;
}