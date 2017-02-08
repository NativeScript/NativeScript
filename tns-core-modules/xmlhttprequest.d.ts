interface XMLHttpRequestEventMap extends XMLHttpRequestEventTargetEventMap {
    "readystatechange": XHREvent;
}

interface XMLHttpRequest extends EventTarget, XMLHttpRequestEventTarget {
    onreadystatechange: (this: XMLHttpRequest, ev: XHREvent) => any;
    readonly readyState: number;
    readonly response: any;
    readonly responseText: string;
    responseType: string;
    readonly responseXML: any;
    readonly status: number;
    readonly statusText: string;
    timeout: number;
    withCredentials: boolean;
    msCaching?: string;
    readonly responseURL: string;
    abort(): void;
    getAllResponseHeaders(): string;
    getResponseHeader(header: string): string | null;
    msCachingEnabled(): boolean;
    open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
    overrideMimeType(mime: string): void;
    send(data?: any): void;
    setRequestHeader(header: string, value: string): void;
    readonly DONE: number;
    readonly HEADERS_RECEIVED: number;
    readonly LOADING: number;
    readonly OPENED: number;
    readonly UNSENT: number;
    addEventListener<K extends keyof XMLHttpRequestEventMap>(type: K, listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: XHREventListener, useCapture?: boolean): void;
}

declare var XMLHttpRequest: {
    prototype: XMLHttpRequest;
    new(): XMLHttpRequest;
    readonly DONE: number;
    readonly HEADERS_RECEIVED: number;
    readonly LOADING: number;
    readonly OPENED: number;
    readonly UNSENT: number;
    create(): XMLHttpRequest;
}

type XHREvent = any;
type XHREventListener = Function;

interface XMLHttpRequestEventTargetEventMap {
    "abort": XHREvent;
    "error": XHREvent;
    "load": XHREvent;
    "loadend": XHREvent;
    "loadstart": XHREvent;
    "progress": XHREvent;
    "timeout": XHREvent;
}

interface EventTarget {
    addEventListener(type: string, listener?: XHREventListener, useCapture?: boolean): void;
    dispatchEvent(evt: XHREvent): boolean;
    removeEventListener(type: string, listener?: XHREventListener, useCapture?: boolean): void;
}

interface XMLHttpRequestEventTarget {
    onabort: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    onerror: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    onload: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    onloadend: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    onloadstart: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    onprogress: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    ontimeout: (this: XMLHttpRequestEventTarget, ev: XHREvent) => any;
    addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(type: K, listener: (this: XMLHttpRequestEventTarget, ev: XMLHttpRequestEventTargetEventMap[K]) => any, useCapture?: boolean): void;
    addEventListener(type: string, listener: XHREventListener, useCapture?: boolean): void;
}
