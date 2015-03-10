export declare class Directive {
    selector: any;
    bind: any;
    lightDomServices: any;
    implementsTypes: any;
    lifecycle: any;
    constructor(_0?: any);
    hasLifecycleHook(hook: string): boolean;
}
export declare class Component extends Directive {
    lightDomServices: any;
    shadowDomServices: any;
    componentServices: any;
    lifecycle: any;
    constructor(_0?: any);
}
export declare class Decorator extends Directive {
    compileChildren: boolean;
    constructor(_0?: any);
}
export declare class Viewport extends Directive {
    constructor(_0?: any);
}
export declare const onDestroy: string;
export declare const onChange: string;
