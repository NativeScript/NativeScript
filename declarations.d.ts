/* tslint:disable:no-unused-variable */
/// <reference path="C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\CommonExtensions\Microsoft\TypeScript\lib.d.ts"/> 

declare class Request {
    constructor(input: string|Request, init?: RequestInit);
    method: string;
    url: string;
    headers: Headers;
    context: RequestContext;
    referrer: string;
    mode: RequestMode;
    credentials: RequestCredentials;
    cache: RequestCache;
}

interface RequestInit {
    method?: string;
    headers?: HeaderInit|{ [index: string]: string };
    body?: BodyInit;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
}

declare enum RequestContext {
    "audio", "beacon", "cspreport", "download", "embed", "eventsource", "favicon", "fetch",
    "font", "form", "frame", "hyperlink", "iframe", "image", "imageset", "import",
    "internal", "location", "manifest", "object", "ping", "plugin", "prefetch", "script",
    "serviceworker", "sharedworker", "subresource", "style", "track", "video", "worker",
    "xmlhttprequest", "xslt"
}

declare enum RequestMode { "same-origin", "no-cors", "cors" }
declare enum RequestCredentials { "omit", "same-origin", "include" }
declare enum RequestCache { "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached" }

declare class Headers {
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string;
    getAll(name: string): Array<string>;
    has(name: string): boolean;
    set(name: string, value: string): void;
}

declare class Body {
    bodyUsed: boolean;
    /*
            arrayBuffer(): Promise<ArrayBuffer>;
            blob(): Promise<Blob>;
    */
    formData(): Promise<FormData>;
    json(): Promise<any>;
    text(): Promise<string>;
}

declare class Response extends Body {
    constructor(body?: BodyInit, init?: ResponseInit);
    error(): Response;
    redirect(url: string, status: number): Response;
    type: ResponseType;
    url: string;
    status: number;
    ok: boolean;
    statusText: string;
    headers: Headers;
    clone(): Response;
}

declare enum ResponseType { "basic", "cors", "default", "error", "opaque" }

declare class ResponseInit {
    status: number;
    statusText: string;
    headers: HeaderInit;
}

declare type HeaderInit = Headers|Array<string>;
declare type BodyInit = Blob|FormData|string;
declare type RequestInfo = Request|string;

declare function fetch(url: string, init?: RequestInit): Promise<Response>;

interface XMLHttpRequest {
    send(data?: FormData): void;
}

interface Console {
    time(reportName: string): void;
    timeEnd(reportName: string): void;
    assert(test: boolean, message: string, ...formatParams: any[]): void;
    info(message: any, ...formatParams: any[]): void;
    warn(message: any, ...formatParams: any[]): void;
    error(message: any, ...formatParams: any[]): void;
    log(message: any, ...formatParams: any[]): void;
    trace(): void;
    dump(obj: any): void;
    createDump(obj: any): string;
    dir(obj: any): void;
}

interface WeakMap<K, V> {
    clear(): void;
    delete(key: K): boolean;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value: V): WeakMap<K, V>;
}

declare var WeakMap: {
    new <K, V>(): WeakMap<K, V>;
}

declare var console: Console;
declare var global;
declare var require;

// Global functions
declare function Deprecated(target: Object, key?: string | symbol, value?: any): void;

declare function Log(data: any): void;
declare function log(data: any): void;
declare function float(num: number): any;
declare function long(num: number): any;
declare function fail(data: any): void;

declare var __dirname: string;
declare var __filename: string;

/**
 * Calls a function after a specified delay.
 * @param callback The function to be called.
 * @param milliseconds The time to wait before the function is called. Defaults to 0.
 */
declare function setTimeout(callback: Function, milliseconds?: number): number;

/**
 * Clears the delay set by a call to the setTimeout function.
 * @param id The identifier returned by the previously called setTimeout() method.
 */
declare function clearTimeout(id: number): void;

/**
 * Calls a function repeatedly with a delay between each call.
 * @param callback The function to be called.
 * @param milliseconds The delay between each function call.
 */
declare function setInterval(callback: Function, milliseconds?: number): number;

/**
 * Clears repeated function which was set up by calling setInterval().
 * @param id The identifier returned by the setInterval() method.
 */
declare function clearInterval(id: number): void;

declare class WeakRef<T> {
    constructor(obj: T);
    get(): T;
    clear(): void;
}

declare module module {
    var id: string;
    var filename: string;
    var exports: any;
}
// Same as module.exports
declare var exports: any;
