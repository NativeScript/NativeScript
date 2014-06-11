export enum ChangePhase {
    Changing,
    Changed
}

export interface EventData {
    eventName: string;
    sender: Observable;
}

export interface ChangeData extends EventData {
    phase?: ChangePhase;
}

export interface PropertyChangeData extends ChangeData {
    propertyName: string;
    value: any;
    cancel?: boolean;
}

export class Observable {
    public static propertyChangeEvent = "propertyChange";
    private _observers = {};

    public on: (eventNames: string, callback: (data: EventData) => void) => void;
    public off: (eventNames: string, callback?: any) => void;
    public addEventListener: (eventNames: string, callback: (data: EventData) => void) => void;
    public removeEventListener: (eventNames: string, callback?: any) => void;

    // true to track the Changing phase, false otherwise
    private _trackChanging = false;

    constructor(body?: any) {
        this.on = this.addEventListener = this.addObserver;
        this.off = this.removeEventListener = this.removeObserver;
    }

    public addObserver(eventNames: string, callback: (data: EventData) => void) {
        Observable.verifyCallback(callback);
        var events: Array<string> = eventNames.split(",");
        var that = this;
        events.forEach(function (event: string) {
            var list = that.getEventList(event.trim(), true);
            list.push(callback);
        });
    }

    public removeObserver(eventNames: string, callback?: any) {
        var events: Array<string> = eventNames.split(",");
        var that = this;
        events.forEach(function (event: string) {
            if (callback) {
                var list = that.getEventList(event.trim(), false);
                if (list) {
                    var index = list.indexOf(callback);
                    if (index >= 0) {
                        list.splice(index, 1);
                    }
                }
            }
            else {
                that._observers[event.trim()] = undefined;
            }
        });
    }

    public setProperty(name: string, value: any) {
        // TODO: Parameter validation

        // create data for the change
        var data = this.createPropertyChangeData(name, value);

        if (this.hasObservers(Observable.propertyChangeEvent) && this._trackChanging) {
            data.phase = ChangePhase.Changing;
            this.notify(data);
            if (data.cancel) {
                // change is canceled by an observer
                // TODO: define some priority, e.g. if someone cancels the change should others be able to override this cancelation?
                return;
            }
        }

        data.phase = ChangePhase.Changed;
        this.setPropertyCore(data);
        this.notify(data);
    }

    public getProperty(name: string): any {
        return this[name];
    }

    /**
    * This method is intended to be overriden by inheritors to specify additional implementation
    */
    public setPropertyCore(data: PropertyChangeData) {
        this[data.propertyName] = data.value;
    }

    // The method will return true if the change is accepted, false otherwise
    public notify(data: EventData) {
        var observers = this.getEventList(data.eventName);
        if (!observers) {
            return;
        }

        var i,
            callback;
        for (i = 0; i < observers.length; i++) {
            callback = observers[i];
            callback(data);
        }
    }

    public hasObservers(eventName: string) {
        return eventName in this._observers;
    }

    public createPropertyChangeData(name: string, value: any): PropertyChangeData {
        return {
            eventName: Observable.propertyChangeEvent,
            propertyName: name,
            sender: this,
            value: value,
            cancel: false
        };
    }

    private getEventList(eventName: string, createIfNeeded?: boolean): Array<(data: EventData) => void> {
        if (!eventName) {
            throw new TypeError("EventName must be valid string.");
        }

        var list = <Array<(data: EventData) => void>>this._observers[eventName];
        if (!list && createIfNeeded) {
            list = [];
            this._observers[eventName] = list;
        }

        return list;
    }

    private static verifyCallback(callback: any) {
        if (!callback || typeof callback !== "function") {
            throw new TypeError("Callback must be a valid function.");
        }
    }

    public emit(eventNames: string) {
        var events: Array<string> = eventNames.split(",");
        var that = this;
        events.forEach(function (event: string) {
            that.notify({ eventName: event.trim(), sender: this });
        });
    }

}