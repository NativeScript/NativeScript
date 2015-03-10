import { Binding } from './binding';
import { Key } from './key';
export declare class Injector {
    _bindings: List<any>;
    _instances: List<any>;
    _parent: Injector;
    _defaultBindings: boolean;
    _asyncStrategy: _AsyncInjectorStrategy;
    _syncStrategy: _SyncInjectorStrategy;
    constructor(bindings: List<any>, _1?: any);
    get(token: any): any;
    asyncGet(token: any): any;
    createChild(bindings: List<any>): Injector;
    _createListOfBindings(flattenBindings: any): List<any>;
    _createInstances(): List<any>;
    _getByKey(key: Key, returnPromise: boolean, returnLazy: boolean): any;
    _resolveDependencies(key: Key, binding: Binding, forceAsync: boolean): List<any>;
    _getInstance(key: Key): any;
    _setInstance(key: Key, obj: any): void;
    _getBinding(key: Key): any;
    _markAsConstructing(key: Key): void;
    _clear(key: Key): void;
}
export declare class _SyncInjectorStrategy {
    injector: Injector;
    constructor(injector: Injector);
    readFromCache(key: Key): any;
    instantiate(key: Key): any;
    _createInstance(key: Key, binding: Binding, deps: List<any>): any;
}
export declare class _AsyncInjectorStrategy {
    injector: Injector;
    constructor(injector: Injector);
    readFromCache(key: Key): any;
    instantiate(key: Key): Promise<any>;
    _errorHandler(key: Key, e: any): Promise<any>;
    _findOrCreate(key: Key, binding: Binding, deps: List<any>): any;
    _cacheInstance(key: any, instance: any): any;
}
