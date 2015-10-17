import http = require("http");
import types = require("utils/types");

module XMLHttpRequestResponseType {
    export var empty = "";
    export var text = "text";
    export var json = "json";
}

export class XMLHttpRequest {
    public UNSENT = 0;
    public OPENED = 1;
    public HEADERS_RECEIVED = 2;
    public LOADING = 3;
    public DONE = 4;

    public onload: () => void;
    public onerror: (any) => void;

    private _options: http.HttpRequestOptions;
    private _readyState: number;
    private _status: number;
    private _response: any;
    private _responseText: Function;
    private _headers: any;
    private _errorFlag: boolean;
    private _responseType: string = "";

    public onreadystatechange: Function;

    constructor() {
        this._readyState = this.UNSENT;
    }

    public open(method: string, url: string, async?: boolean, user?: string, password?: string) {
        if (types.isString(method) && types.isString(url)) {
            this._options = { url: url, method: method };
            this._options.headers = {};

            if (types.isString(user)) {
                this._options.headers["user"] = user;
            }

            if (types.isString(password)) {
                this._options.headers["password"] = password;
            }

            this._setReadyState(this.OPENED);
        }
    }

    public abort() {
        this._errorFlag = true;

        this._response = null;
        this._responseText = null;
        this._headers = null;
        this._status = null;

        if (this._readyState === this.UNSENT || this._readyState === this.OPENED || this._readyState === this.DONE) {
            this._readyState = this.UNSENT;
        } else {
            this._setReadyState(this.DONE);
        }
    }

    public send(data?: any) {
        this._errorFlag = false;
        this._response = null;
        this._responseText = null;
        this._headers = null;
        this._status = null;

        if (types.isDefined(this._options)) {
            if (types.isString(data)) {
                this._options.content = data;
            } else if (data instanceof FormData) {
                this._options.content = (<FormData>data).toString();
            }

            http.request(this._options).then(r=> {
                if (!this._errorFlag) {
                    this._status = r.statusCode;
                    this._response = r.content.raw;

                    this._headers = r.headers;
                    this._setReadyState(this.HEADERS_RECEIVED);

                    this._setReadyState(this.LOADING);

                    if (this.responseType === XMLHttpRequestResponseType.empty ||
                        this.responseType === XMLHttpRequestResponseType.text ||
                        this.responseType === XMLHttpRequestResponseType.json) {
                        this._responseText = r.content.toString;
                    }

                    this._setReadyState(this.DONE);
                }

            }).catch(e => {
                this._errorFlag = true;
                this._setReadyState(this.DONE, e);
            });
        }
    }

    private _listeners: Map<string, Array<Function>> = new Map<string, Array<Function>>();

    public addEventListener(eventName: string, handler: Function) {
        if (eventName !== 'load' && eventName !== 'error') {
            throw new Error('Event not supported: ' + eventName);
        }

        let handlers = this._listeners.get(eventName) || [];
        handlers.push(handler);
        this._listeners.set(eventName, handlers);
    }

    public removeEventListener(eventName: string, toDetach: Function) {
        let handlers = this._listeners.get(eventName) || [];
        handlers = handlers.filter((handler) => handler !== toDetach);
        this._listeners.set(eventName, handlers);
    }

    private emitEvent(eventName: string, ...args: Array<any>) {
        let handlers = this._listeners.get(eventName) || [];
        handlers.forEach((handler) => {
            handler(...args);
        });
    }

    public setRequestHeader(header: string, value: string) {
        if (types.isDefined(this._options) && types.isString(header) && types.isString(value)) {
            this._options.headers[header] = value;
        }
    }

    public getAllResponseHeaders(): string {
        if (this._readyState < 2 || this._errorFlag) {
            return "";
        }

        var result = "";

        for (var i in this._headers) {
            // Cookie headers are excluded
            if (i !== "set-cookie" && i !== "set-cookie2") {
                result += i + ": " + this._headers[i] + "\r\n";
            }
        }
        return result.substr(0, result.length - 2);
    }

    public getResponseHeader(header: string): string {
        if (types.isString(header) && this._readyState > 1
            && this._headers
            && this._headers[header]
            && !this._errorFlag
            ) {
            return this._headers[header];
        }

        return null;
    }

    public overrideMimeType(mime: string) {
        //
    }

    get readyState(): number {
        return this._readyState;
    }

    public get responseType(): string {
        return this._responseType;
    }

    public set responseType(value: string) {
        if (value === XMLHttpRequestResponseType.empty || value in XMLHttpRequestResponseType) {
            this._responseType = value;
        } else {
            throw new Error(`Response type of '${value}' not supported.`);
        }
    }

    private _setReadyState(value: number, error?: any) {
        if (this._readyState !== value) {
            this._readyState = value;

            if (types.isFunction(this.onreadystatechange)) {
                this.onreadystatechange();
            }
        }

        if (this._readyState === this.DONE) {
            if (this._errorFlag) {
                if (types.isFunction(this.onerror)) {
                    this.onerror(error);
                }
                this.emitEvent('error', error);
            } else {
                if (types.isFunction(this.onload)) {
                    this.onload();
                }
                this.emitEvent('load');
            }
        }
    }

    get responseText(): string {
        if (types.isFunction(this._responseText)) {
            return this._responseText();
        }

        return "";
    }

    get response(): any {
        return this._response;
    }

    get status(): number {
        return this._status;
    }

    get statusText(): string {
        if (this._readyState === this.UNSENT || this._readyState === this.OPENED || this._errorFlag) {
            return "";
        }
        return statuses[this._status];
    }
}

var statuses = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non - Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request - URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
};

export class FormData {
    private _data: Map<string, any>;

    constructor() {
        this._data = new Map<string, any>();
    }

    append(name: string, value: any) {
        this._data.set(name, value);
    }

    toString(): string {
        var arr = new Array<string>();

        this._data.forEach(function (value, name, map) {
            arr.push(`${encodeURIComponent(name) }=${encodeURIComponent(value) }`);
        });

        return arr.join("&");
    }
}
