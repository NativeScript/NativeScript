import { Key } from './key';
export declare class Dependency {
    key: Key;
    asPromise: boolean;
    lazy: boolean;
    properties: List<any>;
    constructor(key: Key, asPromise: boolean, lazy: boolean, properties: List<any>);
}
export declare class Binding {
    key: Key;
    factory: Function;
    dependencies: List<any>;
    providedAsPromise: boolean;
    constructor(key: Key, factory: Function, dependencies: List<any>, providedAsPromise: boolean);
}
export declare function bind(token: any): BindingBuilder;
export declare class BindingBuilder {
    token: any;
    constructor(token: any);
    toClass(type: Type): Binding;
    toValue(value: any): Binding;
    toFactory(factoryFunction: Function, dependencies?: List<any>): Binding;
    toAsyncFactory(factoryFunction: Function, dependencies?: List<any>): Binding;
    _constructDependencies(factoryFunction: Function, dependencies: List<any>): any;
}
