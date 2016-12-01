import { knownFolders } from "file-system"

export var debug = true;

var applicationRootPath: string;
function ensureAppRootPath() {
    if (!applicationRootPath) {
        applicationRootPath = knownFolders.currentApp().path;
        applicationRootPath = applicationRootPath.substr(0, applicationRootPath.length - "app/".length);
    }
}

export class Source {
    private _uri: string;
    private _line: number;
    private _column: number;
    
    private static _source: symbol = Symbol("source");

    constructor(uri: string, line: number, column: number) {
        ensureAppRootPath();

        if (uri.length > applicationRootPath.length && uri.substr(0, applicationRootPath.length) === applicationRootPath) {
            this._uri = "file://" + uri.substr(applicationRootPath.length);
        } else {
            this._uri = uri;
        }
        this._line = line;
        this._column = column;
    }
    
    get uri(): string { return this._uri; }
    get line(): number { return this._line; }
    get column(): number { return this._column; }
    
    public toString() {
        return this._uri + ":" + this._line + ":" + this._column;
    }

    public static get(object: any): Source {
        return object[Source._source];
    }
    
    public static set(object: any, src: Source) {
        object[Source._source] = src;
    }
}
