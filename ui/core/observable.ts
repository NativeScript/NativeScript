export enum ChangePhase {
    Changing,
    Changed
}

export interface ChangeData {
    eventName: string;
    sender: Observable;
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

    // true to track the Changing phase, false otherwise
    private _trackChanging = false;

    public addObserver(eventName: string, callback: (data: ChangeData) => void) {
        this.verifyCallback(callback);
        var list = this.getEventList(eventName, true);
        list.push(callback);
    }

    public removeObserver(eventName: string, callback: any) {
        var list = this.getEventList(eventName, false);
        if (!list) {
            return;
        }

        var index = list.indexOf(callback);
        if (index >= 0) {
            list.splice(index, 1);
        }
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
    * This method is intended to be overriden by inheritors to specify additional 
    */
    public setPropertyCore(data: PropertyChangeData) {
        this[data.propertyName] = data.value;
    }

    // The method will return true if the change is accepted, false otherwise
    public notify(data: ChangeData) {
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

    private getEventList(eventName: string, createIfNeeded?: boolean): Array<(data: ChangeData) => void> {
        if (!eventName) {
            throw new TypeError("EventName must be valid string.");
        }

        var list = <Array<(data: ChangeData) => void>>this._observers[eventName];
        if (!list && createIfNeeded) {
            list = new Array<(data: ChangeData) => void>();
            this._observers[eventName] = list;
        }

        return list;
    }

    private verifyCallback(callback: any) {
        if (!callback || typeof callback !== "function") {
            throw new TypeError("Callback must be a valid function.");
        }
    }
}