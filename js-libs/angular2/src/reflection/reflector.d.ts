export { SetterFn, GetterFn, MethodFn } from './types';
export declare class Reflector {
    _typeInfo: Map<any, any>;
    _getters: Map<any, any>;
    _setters: Map<any, any>;
    _methods: Map<any, any>;
    reflectionCapabilities: any;
    constructor(reflectionCapabilities: any);
    registerType(type: any, typeInfo: any): void;
    registerGetters(getters: any): void;
    registerSetters(setters: any): void;
    registerMethods(methods: any): void;
    factory(type: Type): Function;
    parameters(typeOfFunc: any): List<any>;
    annotations(typeOfFunc: any): List<any>;
    getter(name: string): GetterFn;
    setter(name: string): SetterFn;
    method(name: string): MethodFn;
}
