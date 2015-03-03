/* tslint:disable:no-unused-variable */
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
    dir(obj: any): void;
}

declare var console: Console;
declare var global;
declare var require;

// Global functions
declare function Log(data: any): void;
declare function log(data: any): void;
declare function float(num: number): any;
declare function long(num: number): any;
declare function fail(data: any): void;

declare var __dirname: string;
declare var __filename: string;

declare class XMLHttpRequest {
    onreadystatechange: Function;
    open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
    abort(): void;
    send(data?: string): void;
    setRequestHeader(header: string, value: string): void;
    getAllResponseHeaders(): string;
    getResponseHeader(header: string): string;
    overrideMimeType(mime: string): void;
    readyState: number;
    responseText: string;
    status: number;
}

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

// Type definitions for es6-promise
// Project: https://github.com/jakearchibald/ES6-Promise
// Definitions by: François de Campredon <https://github.com/fdecampredon/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => void): Thenable<U>;
}

declare class Promise<R> implements Thenable<R> {
    /**
     * If you call resolve in the body of the callback passed to the constructor, 
     * your promise is fulfilled with result object passed to resolve.
     * If you call reject your promise is rejected with the object passed to resolve. 
     * For consistency and debugging (eg stack traces), obj should be an instanceof Error. 
     * Any errors thrown in the constructor callback will be implicitly passed to reject().
     */
    constructor(callback: (resolve: (result?: R) => void, reject: (error: any) => void) => void);
    /**
     * If you call resolve in the body of the callback passed to the constructor, 
     * your promise will be fulfilled/rejected with the outcome of thenable passed to resolve.
     * If you call reject your promise is rejected with the object passed to resolve. 
     * For consistency and debugging (eg stack traces), obj should be an instanceof Error. 
     * Any errors thrown in the constructor callback will be implicitly passed to reject().
     */
    constructor(callback: (resolve: (thenable?: Thenable<R>) => void, reject: (error: any) => void) => void);

    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => Thenable<U>): Promise<U>;
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Promise<U>;
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => void): Promise<U>;
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => Thenable<U>): Promise<U>;
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
     * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Promise<U>;
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => void): Promise<U>;

    /**
     * Sugar for promise.then(undefined, onRejected)
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => Thenable<U>): Promise<U>;
    /**
     * Sugar for promise.then(undefined, onRejected)
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => U): Promise<U>;
    /**
     * Sugar for promise.then(undefined, onRejected)
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => void): Promise<U>;
}

declare module Promise {
    /**
     * Returns promise (only if promise.constructor == Promise)
     */
    function cast<R>(promise: Promise<R>): Promise<R>;
    /**
     * Make a promise that fulfills to obj.
     */
    function cast<R>(object: R): Promise<R>;

    /**
     * Make a new promise from the thenable. 
     * A thenable is promise-like in as far as it has a "then" method. 
     * This also creates a new promise if you pass it a genuine JavaScript promise, making it less efficient for casting than Promise.cast.
     */
    function resolve<R>(thenable?: Thenable<R>): Promise<R>;
    /**
     * Make a promise that fulfills to obj. Same as Promise.cast(obj) in this situation.
     */
    function resolve<R>(object?: R): Promise<R>;

    /**
     * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
     */
    function reject(error: any): Promise<any>;

    /**
     * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects. 
     * the array passed to all can be a mixture of promise-like objects and other objects. 
     * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
     */
    function all<R>(promises: Promise<R>[]): Promise<R[]>;

    /**
     * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
     */
    function race<R>(promises: Promise<R>[]): Promise<R>;
}

declare function alert(message: string): Promise<void>;