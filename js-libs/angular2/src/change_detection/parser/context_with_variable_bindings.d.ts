export declare class ContextWithVariableBindings {
    parent: any;
    varBindings: Map<any, any>;
    constructor(parent: any, varBindings: Map<any, any>);
    hasBinding(name: string): boolean;
    get(name: string): any;
    set(name: string, value: any): void;
    clearValues(): void;
}
