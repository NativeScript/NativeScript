import types = require("utils/types");
import definition = require("data/observable");

interface ListenerEntry {
    callback: (data: definition.EventData) => void;
    thisArg: any;
}

export class Observable implements definition.Observable {
    public static propertyChangeEvent = "propertyChange";
    private _map: Map<string, Object>;

    private _observers = {};

    constructor(json?: any) {
        if (json) {
            this._map = new Map<string, Object>();
            for (var prop in json) {
                if (json.hasOwnProperty(prop)) {
                    this._defineNewProperty(prop);
                    this.set(prop, json[prop]);
                }
            }
        }
    }

    private _defineNewProperty(propertyName: string): void {
        Object.defineProperty(this, propertyName, {
            get: function () {
                return this._map.get(propertyName);
            },
            set: function (value) {
                this._map.set(propertyName, value);
                this.notify(this._createPropertyChangeData(propertyName, value));
            },
            enumerable: true,
            configurable: true
        });
    }

    get typeName(): string {
        return types.getClass(this);
    }

    public on(eventNames: string, callback: (data: definition.EventData) => void, thisArg?: any) {
        this.addEventListener(eventNames, callback, thisArg);
    }

    public off(eventNames: string, callback?: any, thisArg?: any) {
        this.removeEventListener(eventNames, callback, thisArg);
    }

    public addEventListener(eventNames: string, callback: (data: definition.EventData) => void, thisArg?: any) {
        if (!types.isString(eventNames)) {
            throw new TypeError("Events name(s) must be string.");
        }

        types.verifyCallback(callback);

        var events: Array<string> = eventNames.split(",");

        for (var i = 0, l = events.length; i < l; i++) {
            var event = events[i].trim();
            var list = this._getEventList(event, true);
            // TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)
            list.push({
                callback: callback,
                thisArg: thisArg
            });
        }
    }

    public removeEventListener(eventNames: string, callback?: any, thisArg?: any) {
        if (!types.isString(eventNames)) {
            throw new TypeError("Events name(s) must be string.");
        }

        var events: Array<string> = eventNames.split(",");

        for (var i = 0, l = events.length; i < l; i++) {
            var event = events[i].trim();
            if (callback) {
                var list = this._getEventList(event, false);
                if (list) {
                    var index = this._indexOfListener(list, callback, thisArg);
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

    public notifyPropertyChange(propertyName: string, newValue: any) {
        this.notify(this._createPropertyChangeData(propertyName, newValue));
    }

    public set(name: string, value: any) {
        // TODO: Parameter validation
        if (this[name] === value) {
            return;
        }

        // create data for the change
        var data = this._createPropertyChangeData(name, value);

        this._setCore(data);
        this.notify(data);

        // TODO: Maybe we need to update source object used in the constructor as well?
    }

    public get(name: string): any {
        return this[name];
    }

    //private disableNotifications = false;
    private disableNotifications = {};

    public _setCore(data: definition.PropertyChangeData) {
        this.disableNotifications[data.propertyName] = true;
        this[data.propertyName] = data.value;
        delete this.disableNotifications[data.propertyName];
    }

    public notify<T extends definition.EventData>(data: T) {
        if (this.disableNotifications[(<any>data).propertyName]) {
            return;
        }

        var observers = this._getEventList(data.eventName);
        if (!observers) {
            return;
        }

        var i;
        var entry: ListenerEntry;
        var observersLength = observers.length;
        for (i = observersLength - 1; i >= 0; i--) {
            entry = observers[i];
            if (entry.thisArg) {
                entry.callback.apply(entry.thisArg, [data]);
            } else {
                entry.callback(data);
            }
        }
    }

    public hasListeners(eventName: string) {
        return eventName in this._observers;
    }

    public _createPropertyChangeData(name: string, value: any): definition.PropertyChangeData {
        return {
            eventName: Observable.propertyChangeEvent,
            propertyName: name,
            object: this,
            value: value
        };
    }

    public _emit(eventNames: string) {
        var events: Array<string> = eventNames.split(",");

        for (var i = 0, l = events.length; i < l; i++) {
            var event = events[i].trim();
            this.notify({ eventName: event, object: this });
        }
    }

    private _getEventList(eventName: string, createIfNeeded?: boolean): Array<ListenerEntry> {
        if (!eventName) {
            throw new TypeError("EventName must be valid string.");
        }

        var list = <Array<ListenerEntry>>this._observers[eventName];
        if (!list && createIfNeeded) {
            list = [];
            this._observers[eventName] = list;
        }

        return list;
    }

    private _indexOfListener(list: Array<ListenerEntry>, callback: (data: definition.EventData) => void, thisArg?: any): number {
        var i;
        var entry: ListenerEntry;

        for (i = 0; i < list.length; i++) {
            entry = list[i];
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

    public toString(): string {
        return this.typeName;
    }
}
