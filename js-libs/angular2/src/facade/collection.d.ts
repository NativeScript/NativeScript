export declare var List: ArrayConstructor;
export declare var Map: MapConstructor;
export declare var Set: SetConstructor;
export declare class MapWrapper {
    static create(): Map<any, any>;
    static clone(m: Map<any, any>): Map<any, any>;
    static createFromStringMap(stringMap: any): Map<any, any>;
    static createFromPairs<K, V>(pairs: Array<[K, V]>): Map<K, V>;
    static get(m: any, k: any): any;
    static set(m: any, k: any, v: any): void;
    static contains(m: any, k: any): any;
    static forEach(m: any, fn: any): void;
    static size(m: any): any;
    static delete(m: any, k: any): void;
    static clear(m: any): void;
    static iterable(m: any): any;
    static keys(m: any): any;
    static values(m: any): any;
}
/**
 * Wraps Javascript Objects
 */
export declare class StringMapWrapper {
    static create(): Object;
    static contains(map: any, key: any): any;
    static get(map: any, key: any): any;
    static set(map: any, key: any, value: any): void;
    static isEmpty(map: any): boolean;
    static forEach(map: any, callback: any): void;
    static merge(m1: any, m2: any): {};
}
export declare class ListWrapper {
    static create(): List<any>;
    static createFixedSize(size: any): List<any>;
    static get(m: any, k: any): any;
    static set(m: any, k: any, v: any): void;
    static clone(array: List<any>): any[];
    static map(array: any, fn: any): any;
    static forEach(array: any, fn: any): void;
    static push(array: any, el: any): void;
    static first(array: any): any;
    static last(array: any): any;
    static find(list: List<any>, pred: Function): any;
    static reduce(list: List<any>, fn: {
        (previousValue: any, currentValue: any, currentIndex: number, array: List<any>): any;
    }, init: any): any;
    static filter(array: any, pred: Function): any;
    static any(list: List<any>, pred: Function): boolean;
    static contains(list: List<any>, el: any): boolean;
    static reversed(array: any): any[];
    static concat(a: any, b: any): any;
    static isList(list: any): boolean;
    static insert(list: any, index: int, value: any): void;
    static removeAt(list: any, index: int): any;
    static removeAll(list: any, items: any): void;
    static removeLast(list: List<any>): any;
    static remove(list: any, el: any): boolean;
    static clear(list: any): void;
    static join(list: any, s: any): any;
    static isEmpty(list: any): boolean;
    static fill(list: List<any>, value: any, start?: int, end?: int): void;
    static equals(a: List<any>, b: List<any>): boolean;
    static slice(l: List<any>, from: int, to: int): List<any>;
}
export declare function isListLikeIterable(obj: any): boolean;
export declare function iterateListLike(obj: any, fn: Function): void;
export declare class SetWrapper {
    static createFromList(lst: List<any>): Set<any>;
    static has(s: Set<any>, key: any): boolean;
}
