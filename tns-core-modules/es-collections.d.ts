/* tslint:disable */
/////////////////////////////
/// IE11 ECMAScript Extensions
/////////////////////////////

interface List<T> extends Array<T> {}

interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value: V): Map<K, V>;
    size: number;
    keys(): Array<K>;
    values(): Array<V>;
}
declare var Map: {
    new <K, V>(): Map<K, V>;

    // needed by Angular
    // alexeagle: PATCHED
    new<K, V>(m: Map<K, V>): Map<K, V>;
    new<K, V>(l: List<any>): Map<K, V>;
    prototype: Map<any, any>;
}

//For compatibility - some libs insist on the Map/Set types being named that way
declare type MapConstructor = typeof Map;
declare type SetConstructor = typeof Set;

interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    size: number;
}
declare var Set: {
    new <T>(): Set<T>;

    // needed by Angular
    // alexeagle PATCHED
    new<T>(s: Set<T>): Set<T>;
    new<T>(l: List<T>): Set<T>;
    prototype: Set<any>;
}

//Compatibility interfaces for rxjs
interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}
