/// <reference path="../jasmine/jasmine.d.ts" />
/// <reference path="../zone/zone.d.ts" />
/// <reference path="../hammerjs/hammerjs.d.ts" />
declare var assert: any;
declare var module: any;
declare var $traceurRuntime: any;
declare var global: Window;
declare var $: any;
declare var angular: any;
declare var _resolve: any;
declare var require: any;
declare var browser: any;
declare var benchpressRunner: any;
declare type int = number;
declare type Type = {
    new (...args: any[]): any;
};
interface List<T> extends Array<T> {
}
declare type TemplateElement = HTMLTemplateElement;
declare type StyleElement = HTMLStyleElement;
declare type SetterFn = Function;
declare type GetterFn = Function;
declare type MethodFn = Function;
declare type _globalRegExp = RegExp;
interface HTMLElement {
    createShadowRoot(): HTMLElement;
}
interface HTMLTemplateElement extends HTMLElement {
    content: DocumentFragment;
}
interface Window {
    Array: typeof Array;
    List: typeof Array;
    Map: typeof Map;
    Set: typeof Set;
    RegExp: typeof RegExp;
    JSON: typeof JSON;
    Math: typeof Math;
    assert: typeof assert;
    NaN: typeof NaN;
    setTimeout: typeof setTimeout;
    Promise: typeof Promise;
    zone: Zone;
    Hammer: HammerStatic;
    DocumentFragment: DocumentFragment;
    Node: Node;
    NodeList: NodeList;
    Text: Text;
    HTMLElement: HTMLElement;
    HTMLTemplateElement: TemplateElement;
    HTMLStyleElement: StyleElement;
    gc(): void;
}
interface Window extends jasmine.GlobalPolluter {
    print(msg: string): void;
    dump(msg: string): void;
    describe(description: string, specDefinitions: () => void): jasmine.Suite;
    ddescribe(description: string, specDefinitions: () => void): jasmine.Suite;
    beforeEach(beforeEachFunction: () => void): void;
    beforeAll(beforeAllFunction: () => void): void;
    afterEach(afterEachFunction: () => void): void;
    afterAll(afterAllFunction: () => void): void;
    xdescribe(desc: string, specDefinitions: () => void): jasmine.XSuite;
    it(description: string, func: (done?: () => void) => void): jasmine.Spec;
    iit(description: string, func: () => void): jasmine.Spec;
    xit(desc: string, func: () => void): jasmine.XSpec;
}
declare module jasmine {
    interface Matchers {
        toHaveText(text: string): void;
        toBeAnInstanceOf(obj: any): void;
        toBePromise(): void;
        toBe(value: any): void;
    }
}
interface Map<K, V> {
    jasmineToString?(): void;
}
interface Console {
    profileEnd(str: string): any;
}

/**
 * Represents the completion of an asynchronous operation
 */
interface Promise<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onfulfilled?: (value: T) => TResult | Promise<TResult>, onrejected?: (reason: any) => TResult | Promise<TResult>): Promise<TResult>;

    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch(onrejected?: (reason: any) => T | Promise<T>): Promise<T>;
}

interface PromiseConstructor {
    /** 
      * A reference to the prototype. 
      */
    prototype: Promise<any>;

    /**
     * Creates a new Promise.
     * @param init A callback used to initialize the promise. This callback is passed two arguments: 
     * a resolve callback used resolve the promise with a value or the result of another promise, 
     * and a reject callback used to reject the promise with a provided reason or error.
     */
    new <T>(init: (resolve: (value?: T | Promise<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

    <T>(init: (resolve: (value?: T | Promise<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises 
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    all<T>(values: (T | Promise<T>)[]): Promise<T[]>;

    /**
     * Creates a Promise that is resolved with an array of results when all of the provided Promises
     * resolve, or rejected when any Promise is rejected.
     * @param values An array of values.
     * @returns A new Promise.
     */
    all(values: Promise<void>[]): Promise<void>;

    /**
     * Creates a Promise that is resolved or rejected when any of the provided Promises are resolved 
     * or rejected.
     * @param values An array of Promises.
     * @returns A new Promise.
     */
    race<T>(values: (T | Promise<T>)[]): Promise<T>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject(reason: any): Promise<void>;

    /**
     * Creates a new rejected promise for the provided reason.
     * @param reason The reason the promise was rejected.
     * @returns A new rejected Promise.
     */
    reject<T>(reason: any): Promise<T>;

    /**
      * Creates a new resolved promise for the provided value.
      * @param value A promise.
      * @returns A promise whose internal state matches the provided promise.
      */
    resolve<T>(value: T | Promise<T>): Promise<T>;

    /**
     * Creates a new resolved promise .
     * @returns A resolved promise.
     */
    resolve(): Promise<void>;
}

declare var Promise: PromiseConstructor;
