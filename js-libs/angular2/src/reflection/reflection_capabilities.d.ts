export declare class ReflectionCapabilities {
    factory(type: Type): Function;
    parameters(typeOfFunc: any): List<List<any>>;
    annotations(typeOfFunc: any): List<any>;
    getter(name: string): GetterFn;
    setter(name: string): SetterFn;
    method(name: string): MethodFn;
}
