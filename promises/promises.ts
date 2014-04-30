/**
    Module P: Generic Promises for TypeScript

    Project, documentation, and license: https://github.com/pragmatrix/Promise
*/



/**
    Returns a new "Deferred" value that may be resolved or rejected.
*/

export function defer<Value>(): Deferred<Value> {
    return new DeferredI<Value>();
}

/**
    Converts a value to a resolved promise.
*/

export function resolve<Value>(v: Value): Promise<Value> {
    return defer<Value>().resolve(v).promise();
}

/**
    Returns a rejected promise.
*/

export function reject<Value>(err: Rejection): Promise<Value> {
    return defer<Value>().reject(err).promise();
}

/**
    http://en.wikipedia.org/wiki/Anamorphism

    Given a seed value, unfold calls the unspool function, waits for the returned promise to be resolved, and then 
    calls it again if a next seed value was returned.

    All the values of all promise results are collected into the resulting promise which is resolved as soon
    the last generated element value is resolved.
*/

export function unfold<Seed, Element>(
    unspool: (current: Seed) => { promise: Promise<Element>; next?: Seed },
    seed: Seed)
    : Promise<Element[]> {
    var d = defer<Element[]>();
    var elements: Element[] = new Array<Element>();

    unfoldCore<Seed, Element>(elements, d, unspool, seed)

		return d.promise();
}

function unfoldCore<Seed, Element>(
    elements: Element[],
    deferred: Deferred<Element[]>,
    unspool: (current: Seed) => { promise: Promise<Element>; next?: Seed },
    seed: Seed): void {
    var result = unspool(seed);
    if (!result) {
        deferred.resolve(elements);
        return;
    }

    // fastpath: don't waste stack space if promise resolves immediately.

    while (result.next && result.promise.status == Status.Resolved) {
        elements.push(result.promise.result);
        result = unspool(result.next);
        if (!result) {
            deferred.resolve(elements);
            return;
        }
    }

    result.promise
        .done(v => {
            elements.push(v);
            if (!result.next)
                deferred.resolve(elements);
            else
                unfoldCore<Seed, Element>(elements, deferred, unspool, result.next);
        })
        .fail(e => {
            deferred.reject(e);
        });
}

/**
    The status of a Promise. Initially a Promise is Unfulfilled and may
    change to Rejected or Resolved.
	 
    Once a promise is either Rejected or Resolved, it can not change its 
    status anymore.
*/

export enum Status {
    Unfulfilled,
    Rejected,
    Resolved
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
    /// The current status of the promise.
    status: Status;

    /// If the promise got resolved, the result of the promise.
    result?: Value;

    /// If the promise got rejected, the rejection message.
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

    /// Add a handler that is called when the promise gets resolved.
    done(f: (v: Value) => void): Promise<Value>;
    /// Add a handler that is called when the promise gets rejected.
    fail(f: (err: Rejection) => void): Promise<Value>;
    /// Add a handler that is called when the promise gets fulfilled (either resolved or rejected).
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
    /// Returns the encapsulated promise of this deferred instance.
    /// The returned promise supports composition but removes the ability to resolve or reject
    /// the promise.
    promise(): Promise<Value>;

    /// Resolve the promise.
    resolve(result?: Value): Deferred<Value>;
    /// Reject the promise.
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

export function when(...promises: Promise<any>[]): Promise<any[]> {
    var allDone = defer<any[]>();
    if (!promises.length) {
        allDone.resolve([]);
        return allDone.promise();
    }

    var resolved = 0;
    var results = [];

    promises.forEach((p, i) => {
        p
            .done(v => {
                results[i] = v;
                ++resolved;
                if (resolved === promises.length && allDone.status !== Status.Rejected)
                    allDone.resolve(results);
            })
            .fail(e => {
                if (allDone.status !== Status.Rejected)
                    allDone.reject(new Error("when: one or more promises were rejected"));
            });
    });

    return allDone.promise();
}

/**
    Implementation of a promise.

    The Promise<Value> instance is a proxy to the Deferred<Value> instance.
*/

class PromiseI<Value> implements Promise<Value>
{
    constructor(public deferred: DeferredI<Value>)
    { }

    get status(): Status { return this.deferred.status; }
    get result(): Value { return this.deferred.result; }
    get error(): Rejection { return this.deferred.error; }

    done(f: (v: Value) => void): Promise<Value> {
        this.deferred.done(f);
        return this;
    }

    fail(f: (err: Rejection) => void): Promise<Value> {
        this.deferred.fail(f);
        return this;
    }

    always(f: (v?: Value, err?: Rejection) => void): Promise<Value> {
        this.deferred.always(f);
        return this;
    }

    then<T2>(f: (v: Value) => any): Promise<T2> {
        return this.deferred.then<any>(f);
    }
}

/**
    Implementation of a deferred.
*/

class DeferredI<Value> implements Deferred<Value>{

    private _resolved: (v: Value) => void = _ => { };
    private _rejected: (err: Rejection) => void = _ => { };

    private _status: Status = Status.Unfulfilled;
    private _result: Value;
    private _error: Rejection = { message: "" };
    private _promise: Promise<Value>;

    constructor() {
        this._promise = new PromiseI<Value>(this);
    }

    promise(): Promise<Value> {
        return this._promise;
    }

    get status(): Status {
        return this._status;
    }

    get result(): Value {
        if (this._status != Status.Resolved)
            throw new Error("Promise: result not available");
        return this._result;
    }

    get error(): Rejection {
        if (this._status != Status.Rejected)
            throw new Error("Promise: rejection reason not available");
        return this._error;
    }

    then<Result>(f: (v: Value) => any): Promise<Result> {
        var d = defer<Result>();

        this
            .done(v => {
                var promiseOrValue = f(v);

                // todo: need to find another way to check if r is really of interface
                // type Promise<any>, otherwise we would not support other 
                // implementations here.
                if (promiseOrValue instanceof PromiseI) {
                    var p = <Promise<Result>> promiseOrValue;
                    p.done(v2 => d.resolve(v2))
                        .fail(err => d.reject(err));
                    return p;
                }

                d.resolve(promiseOrValue);
            })
            .fail(err => d.reject(err));

        return d.promise();
    }

    done(f: (v: Value) => void): Deferred<Value> {
        if (this.status === Status.Resolved) {
            f(this._result);
            return this;
        }

        if (this.status !== Status.Unfulfilled)
            return this;

        var prev = this._resolved;
        this._resolved = v => { prev(v); f(v); }

			return this;
    }

    fail(f: (err: Rejection) => void): Deferred<Value> {
        if (this.status === Status.Rejected) {
            f(this._error);
            return this;
        }

        if (this.status !== Status.Unfulfilled)
            return this;

        var prev = this._rejected;
        this._rejected = e => { prev(e); f(e); }

			return this;
    }

    always(f: (v?: Value, err?: Rejection) => void): Deferred<Value> {
        this
            .done(v => f(v))
            .fail(err => f(null, err));

        return this;
    }

    resolve(result: Value) {
        if (this._status !== Status.Unfulfilled)
            throw new Error("tried to resolve a fulfilled promise");

        this._result = result;
        this._status = Status.Resolved;
        this._resolved(result);

        this.detach();
        return this;
    }

    reject(err: Rejection) {
        if (this._status !== Status.Unfulfilled)
            throw new Error("tried to reject a fulfilled promise");

        this._error = err;
        this._status = Status.Rejected;
        this._rejected(err);

        this.detach();
        return this;
    }

    private detach() {
        this._resolved = _ => { };
        this._rejected = _ => { };
    }
}

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

export function generator<E>(g: () => () => Promise<E>): Generator<E> {
    return () => iterator<E>(g());
};

export function iterator<E>(f: () => Promise<E>): Iterator<E> {
    return new IteratorI<E>(f);
}

class IteratorI<E> implements Iterator<E>
{
    current: E = undefined;

    constructor(private f: () => Promise<E>)
    { }

    advance(): Promise<boolean> {
        var res = this.f();
        return res.then(value => {
            if (isUndefined(value))
                return false;

            this.current = value;
            return true;
        });
    }
}

/**
    Iterator functions.
*/

export function each<E>(gen: Generator<E>, f: (e: E) => void): Promise<{}> {
    var d = defer();
    eachCore(d, gen(), f);
    return d.promise();
}

function eachCore<E>(fin: Deferred<{}>, it: Iterator<E>, f: (e: E) => void): void {
    it.advance()
        .done(hasValue => {
            if (!hasValue) {
                fin.resolve({});
                return;
            }

            f(it.current)
				eachCore<E>(fin, it, f);
        })
        .fail(err => fin.reject(err));
}

/**
    std
*/

export function isUndefined(v) {
    return typeof v === 'undefined';
}
