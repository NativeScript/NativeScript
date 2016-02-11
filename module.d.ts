//Base module declarations
//Not required in Angular apps since it clashes with its typings.
declare var global: any;

interface NativeScriptRequire {
    (id: string): any;
}

declare interface NativeScriptModule {
    id: string;
    filename: string;
    exports: any;
}
