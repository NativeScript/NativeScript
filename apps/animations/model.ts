import observable = require("data/observable");

export class ViewModel extends observable.Observable {
    constructor() {
        super();

        this._duration = 300;
        this._repeatCount = 0;
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

    private _repeatCount: number;
    get repeatCount(): number {
        return this._repeatCount;
    }
    set repeatCount(value: number) {
        this._repeatCount = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "repeatCount", value: value });
    }
}