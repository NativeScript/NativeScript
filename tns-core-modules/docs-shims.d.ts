declare type Promise<T> = any;
declare type Set<T> = any;
declare type Map<K, V> = any;

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

declare type BodyInit = Blob|FormData|string;
declare type RequestInfo = Request|string;
