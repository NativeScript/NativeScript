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
    oldValue: any;
    newValue: any;
    cancel?: boolean;
}

export class Observable {
    public static propertyChangeEvent = "propertyChange";
    private _observers = {};

    // true to track the Changing phase, false otherwise
    private _trackChanging = false;

    public bind(eventName: string, callback: (data: ChangeData) => void) {
        this.verifyCallback(callback);
        var list = this.getEventList(eventName, true);
        list.push(callback);
    }

    public setProperty(name: string, value: any) {
        // TODO: Parameter validation

        if (!(name in this._observers)) {
            // no observers to notify for the PropertyChange event
            return;
        }

        // create data for the change
        var data: PropertyChangeData = {
            eventName: Observable.propertyChangeEvent,
            propertyName: name,
            sender: this,
            oldValue: this[name],
            newValue: value,
            cancel: false
        };

        if (this._trackChanging) {
            data.phase = ChangePhase.Changing;
            this.notifyObservers(data);
            if (data.cancel) {
                // change is canceled by an observer
                // TODO: define some priority, e.g. if someone cancels the change should others be able to override this cancelation?
                return;
            }
        }

        data.phase = ChangePhase.Changed;
        this.notifyObservers(data);

        this.setPropertyCore(data);
    }

    public getProperty(name: string): any {
        return this[name];
    }

    /**
    * This method is intended to be overriden by inheritors to specify additional 
    */
    public setPropertyCore(data: PropertyChangeData) {
        // get the new value from the data since some observer may have it modified - e.g. validation scenario
        this[data.eventName] = data.newValue;
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

    // The method will return true if the change is accepted, false otherwise
    private notifyObservers(data: ChangeData) {
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
}