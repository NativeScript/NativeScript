/* tslint:disable */
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

interface Promise<R> extends Thenable<R> {
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

interface PromiseConstructor {
    /**
      * A reference to the prototype.
      */
    prototype: Promise<any>;

    /**
     * Creates a new Promise.
     * @param executor A callback used to initialize the promise. This callback is passed two arguments:
     * a resolve callback used resolve the promise with a value or the result of another promise,
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new <T>(executor: (resolve: (value?: T | Thenable<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

    /**
     * Returns promise (only if promise.constructor == Promise)
     */
    cast<R>(promise: Promise<R>): Promise<R>;
    /**
     * Make a promise that fulfills to obj.
     */
    cast<R>(object: R): Promise<R>;

    /**
     * Make a new promise from the thenable. 
     * A thenable is promise-like in as far as it has a "then" method. 
     * This also creates a new promise if you pass it a genuine JavaScript promise, making it less efficient for casting than Promise.cast.
     */
    resolve<R>(thenable?: Thenable<R>): Promise<R>;
    /**
     * Make a promise that fulfills to obj. Same as Promise.cast(obj) in this situation.
     */
    resolve<R>(object?: R): Promise<R>;

    /**
     * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
     */
    reject(error: any): Promise<any>;

    /**
     * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects. 
     * the array passed to all can be a mixture of promise-like objects and other objects. 
     * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
     */
    all<R>(promises: Promise<R>[]): Promise<R[]>;

    /**
     * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
     */
    race<R>(promises: Promise<R>[]): Promise<R>;
}

declare var Promise: PromiseConstructor;
