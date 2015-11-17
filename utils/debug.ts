import { knownFolders } from "file-system"

export var debug = true;

// TODO: Get this from the runtimes...
var applicationRootPath = knownFolders.currentApp().path;
applicationRootPath = applicationRootPath.substr(0, applicationRootPath.length - "app/".length);

export class Source {
	private _uri: string;
	private _line: number;
	private _column: number;
	
	private static _source: symbol = Symbol("source");
	private static _appRoot: string;
	
	constructor(uri: string, line: number, column: number) {
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

export class ScopeError implements Error {
	private _child: Error;
	private _message: string;
	
	constructor(child: Error, message?: string) {
		if (!child) {
			throw new Error("Required child error!");
		}
		this._child = child;
		this._message = message;
	}
	
	get child() { return this._child; }
	get message() {
		if (this._message && this._childMessage) {
			// It is a ↳ but the ios fails to show this symbol at the moment.
			return this._message + "\n \u21B3" + this._childMessage.replace("\n", "\n  ");	
		}
		return this._message || this._childMessage || undefined;
	}
	get name() { return this.child.name; }
	get stack() { return (<any>this.child).stack; }
	
	private get _childMessage(): string {
		return this.child.message;
	}
	
	public toString() { return "Error: " + this.message; }
}

export class SourceError extends ScopeError {
	private _source: Source;
	
	constructor(child: Error, source: Source, message?: string) {
		super(child, message ? message + " @" + source + "" : source + "");
		this._source = source;
	}
	
	get source() { return this._source; }
}