//Base module declarations
//Not required in Angular apps since it clashes with its typings.
declare var global: any;

interface NativeScriptRequire {
    (id: string): any;
}

interface NativeScriptModule {
    id: string;
    filename: string;
    exports: any;
}
