export declare var Promise: PromiseConstructor;
export declare class PromiseWrapper {
    static resolve(obj: any): Promise<any>;
    static reject(obj: any): Promise<any>;
    static all(promises: List<any>): Promise<any>;
    static then<TResult>(promise: Promise<TResult>, success: (value: any) => TResult | Promise<TResult>, rejection: (reason: any) => TResult | Promise<TResult>): Promise<TResult>;
    static completer(): {
        promise: Promise<{}>;
        complete: any;
        reject: any;
    };
    static setTimeout(fn: Function, millis: int): void;
    static isPromise(maybePromise: any): boolean;
}
