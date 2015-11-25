import observable = require("data/observable");

export class ViewModel extends observable.Observable {
    constructor() {
        super();
        this.reset();
    }

    private _translateX = 0;;
    get translateX(): number {
        return this._translateX;
    }
    set translateX(value: number) {
        this._translateX = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "translateX", value: value });
    }

    private _translateY = 0;
    get translateY(): number {
        return this._translateY;
    }
    set translateY(value: number) {
        this._translateY = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "translateY", value: value });
    }

    private _scaleX = 100;
    get scaleX(): number {
        return this._scaleX;
    }
    set scaleX(value: number) {
        this._scaleX = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "scaleX", value: value });
    }

    private _scaleY = 100;
    get scaleY(): number {
        return this._scaleY;
    }
    set scaleY(value: number) {
        this._scaleY = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "scaleY", value: value });
    }

    private _originX = 50;
    get originX(): number {
        return this._originX;
    }
    set originX(value: number) {
        this._originX = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "originX", value: value });
    }

    private _originY = 50;
    get originY(): number {
        return this._originY;
    }
    set originY(value: number) {
        this._originY = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "originY", value: value });
    }

    private _rotate = 0;
    get rotate(): number {
        return this._rotate;
    }
    set rotate(value: number) {
        this._rotate = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "rotate", value: value });
    }

    public reset() {
        this.originX = 50;
        this.originY = 50;
        this.scaleX = 100;
        this.scaleY = 100;
        this.translateX = 0;
        this.translateY = 0;
        this.rotate = 0;
    }
}