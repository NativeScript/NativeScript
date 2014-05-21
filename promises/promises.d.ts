
declare module "promises" {
    /**
    Module P: Generic Promises for TypeScript
    Project, documentation, and license: https://github.com/pragmatrix/Promise
    */

    /**
    Returns a new "Deferred" value that may be resolved or rejected.
    */
    export function defer<Value>(): Deferred<Value>;
    /**
    Converts a value to a resolved promise.
    */
    export function resolve<Value>(v: Value): Promise<Value>;
    /**
    Returns a rejected promise.
    */
    export function reject<Value>(err: Rejection): Promise<Value>;
    /**
    http://en.wikipedia.org/wiki/Anamorphism

    Given a seed value, unfold calls the unspool function, waits for the returned promise to be resolved, and then
    calls it again if a next seed value was returned.

    All the values of all promise results are collected into the resulting promise which is resolved as soon
    the last generated element value is resolved.
    */
    export function unfold<Seed, Element>(unspool: (current: Seed) => {
        promise: Promise<Element>;
        next?: Seed;
    }, seed: Seed): Promise<Element[]>;
    /**
    The status of a Promise. Initially a Promise is Unfulfilled and may
    change to Rejected or Resolved.

    Once a promise is either Rejected or Resolved, it can not change its
    status anymore.
    */
    export enum Status {
        Unfulfilled = 0,
        Rejected = 1,
        Resolved = 2,
    }
    /**
    If a promise gets rejected, at least a message that indicates the error or
    reason for the rejection must be provided.
    */
    export interface Rejection {
        message: string;
    }
    /**
    Both Promise<T> and Deferred<T> share these properties.
    */
    export interface PromiseState<Value> {
        status: Status;
        result?: Value;
        error?: Rejection;
    }
    /**
    A Promise<Value> supports basic composition and registration of handlers that are called when the
    promise is fulfilled.

    When multiple handlers are registered with done(), fail(), or always(), they are called in the
    same order.
    */
    export interface Promise<Value> extends PromiseState<Value> {
        /**
        Returns a promise that represents a promise chain that consists of this
        promise and the promise that is returned by the function provided.
        The function receives the value of this promise as soon it is resolved.
    
        If this promise fails, the function is never called and the returned promise
        will also fail.
        */
        then<T2>(f: (v: Value) => Promise<T2>): Promise<T2>;
        then<T2>(f: (v: Value) => T2): Promise<T2>;
        done(f: (v: Value) => void): Promise<Value>;
        fail(f: (err: Rejection) => void): Promise<Value>;
        always(f: (v?: Value, err?: Rejection) => void): Promise<Value>;
    }
    /**
    Deferred<Value> supports the explicit resolving and rejecting of the
    promise and the registration of fulfillment handlers.

    A Deferred<Value> should be only visible to the function that initially sets up
    an asynchronous process. Callers of that function should only see the Promise<Value> that
    is returned by promise().
    */
    export interface Deferred<Value> extends PromiseState<Value> {
        promise(): Promise<Value>;
        resolve(result?: Value): Deferred<Value>;
        reject(err: Rejection): Deferred<Value>;
        done(f: (v: Value) => void): Deferred<Value>;
        fail(f: (err: Rejection) => void): Deferred<Value>;
        always(f: (v?: Value, err?: Rejection) => void): Deferred<Value>;
    }
    /**
    Creates a promise that gets resolved when all the promises in the argument list get resolved.
    As soon one of the arguments gets rejected, the resulting promise gets rejected.
    If no promises were provided, the resulting promise is immediately resolved.
    */
    export function when(...promises: Promise<any>[]): Promise<any[]>;
    /**
    Promise Generators and Iterators.
    */
    export interface Generator<E> {
        (): Iterator<E>;
    }
    export interface Iterator<E> {
        advance(): Promise<boolean>;
        current: E;
    }
    export function generator<E>(g: () => () => Promise<E>): Generator<E>;
    export function iterator<E>(f: () => Promise<E>): Iterator<E>;
    /**
    Iterator functions.
    */
    export function each<E>(gen: Generator<E>, f: (e: E) => void): Promise<{}>;
    /**
    std
    */
    export function isUndefined(v: any): boolean;
}