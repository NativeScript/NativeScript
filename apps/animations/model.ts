import observable = require("data/observable");

export class ViewModel extends observable.Observable {
    constructor() {
        super();

        this._duration = 3000;
        this._iterations = 1;
    }

    private _playSequentially: boolean;
    get playSequentially(): boolean {
        return this._playSequentially;
    }
    set playSequentially(value: boolean) {
        this._playSequentially = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "playSequentially", value: value });
    }

    private _duration: number;
    get duration(): number {
        return this._duration;
    }
    set duration(value: number) {
        this._duration = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "duration", value: value });
    }

    private _iterations: number;
    get iterations(): number {
        return this._iterations;
    }
    set iterations(value: number) {
        this._iterations = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "iterations", value: value });
    }
}