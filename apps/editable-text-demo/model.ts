import observable = require("data/observable");

export class WebViewModel extends observable.Observable {
    constructor() {
        super();
    }

    private _text: string;
    get text(): string {
        return this._text;
    }
    set text(value: string) {
        console.log(value);
        this._text = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "text", value: value });
    }
}