import observable = require("data/observable");
import fs = require("file-system");
import fileSystemAccess = require("file-system/file-system-access");

var fileAccess = new fileSystemAccess.FileSystemAccess();

export class WebViewModel extends observable.Observable {
    constructor() {
        super();
        fileAccess.readText(fs.path.join(__dirname, "style.css"), (result) => { this._css = result; });
    }

    private _url: string;
    get url(): string {
        return this._url;
    }
    set url(value: string) {
        this._url = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "url", value: value });
    }

    //private _text: string;
    //get text(): string {
    //    return this._text;
    //}
    //set text(value: string) {
    //    this._text = value;
    //    this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "text", value: value });

    //    if (application.ios) {
    //        this.url = this.text;
    //    }
    //}

    private _css: string;
    get css(): string {
        return this._css;
    }
}