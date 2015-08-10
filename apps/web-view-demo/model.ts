import observable = require("data/observable");
import fs = require("file-system");

export class WebViewModel extends observable.Observable {
    constructor() {
        super();
        var file = fs.File.fromPath(fs.path.join(__dirname, "style.css"));
        this._css = file.readTextSync();
    }

    private _url: string;
    get url(): string {
        return this._url;
    }
    set url(value: string) {
        this._url = value;
        this.notify({ object: this, eventName: observable.Observable.propertyChangeEvent, propertyName: "url", value: value });
    }

    private _css: string;
    get css(): string {
        return this._css;
    }
}