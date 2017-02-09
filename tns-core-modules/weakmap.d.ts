/* tslint:disable:no-unused-variable */

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