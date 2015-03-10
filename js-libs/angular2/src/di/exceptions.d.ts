export declare class KeyMetadataError extends Error {
}
export declare class ProviderError extends Error {
    keys: List<any>;
    constructResolvingMessage: Function;
    message: any;
    constructor(key: any, constructResolvingMessage: Function);
    addKey(key: any): void;
    toString(): any;
}
export declare class NoProviderError extends ProviderError {
    constructor(key: any);
}
export declare class AsyncBindingError extends ProviderError {
    constructor(key: any);
}
export declare class CyclicDependencyError extends ProviderError {
    constructor(key: any);
}
export declare class InstantiationError extends ProviderError {
    constructor(originalException: any, key: any);
}
export declare class InvalidBindingError extends Error {
    message: string;
    constructor(binding: any);
    toString(): string;
}
export declare class NoAnnotationError extends Error {
    message: string;
    constructor(typeOrFunc: any);
    toString(): string;
}
