import image = require("image-source");

import definition = require("http");
import httpRequest = require("http/http-request");

import types = require("utils/types");

// merge the exports of the request file with the exports of this file
declare var exports;
require("utils/module-merge").merge(httpRequest, exports);

export function getString(arg: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => resolve(r.content.toString()), e => reject(e));
    });
}

export function getJSON<T>(arg: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => resolve(r.content.toJSON()), e => reject(e));
    });
}

export function getImage(arg: any): Promise<image.ImageSource> {
    return new Promise<image.ImageSource>((resolve, reject) => {
        httpRequest.request(typeof arg === "string" ? { url: arg, method: "GET" } : arg)
            .then(r => {
                r.content.toImage().then(source => resolve(source));
            }, e => reject(e));
    });
}

export class XMLHttpRequest {
    public UNSENT = 0;
    public OPENED = 1;
    public HEADERS_RECEIVED = 2;
    public LOADING = 3;
    public DONE = 4;

    private _options: definition.HttpRequestOptions;
    private _readyState: number;
    private _status: number;
    private _response: any;
    private _responseText: string = "";
    private _headers: any;
    private _errorFlag: boolean;

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

    public send(data?: string) {
        this._errorFlag = false;
        this._response = null;
        this._responseText = null;
        this._headers = null;
        this._status = null;

        if (types.isDefined(this._options)) {
            if (types.isString(data)) {
                this._options.content = data;
            }

            httpRequest.request(this._options).then(r=> {
                if (!this._errorFlag) {
                    this._status = r.statusCode;
                    this._response = r.content.raw;

                    this._headers = r.headers;
                    this._setReadyState(this.HEADERS_RECEIVED);

                    this._setReadyState(this.LOADING);

                    this._responseText = r.content.toString();
                    this._setReadyState(this.DONE);
                }

            }).catch(e => {
                    this._errorFlag = true;
                });
        }
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

    private _setReadyState(value: number) {
        if (this._readyState !== value) {
            this._readyState = value;

            if (types.isFunction(this.onreadystatechange)) {
                this.onreadystatechange();
            }
        }
    }

    get responseText(): string {
        return this._responseText;
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
        return this._status + " " + statuses[this._status];
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