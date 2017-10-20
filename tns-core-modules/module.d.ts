declare var global: NodeJS.Global;

interface ModuleResolver {
    /**
     * A function used to resolve the exports for a module.
     * @param uri The name of the module to be resolved. 
     */
    (uri: string): any;
}

//Augment the NodeJS global type with our own extensions
declare namespace NodeJS {
    interface Global {
        android?: any;
        require(id: string): any;
        registerModule(name: string, loader: ((name: string) => any)): void;
        /**
         * The NativeScript XML builder, style-scope, application modules use various resources such as:
         * app.css, page.xml files and modules during the application life-cycle.
         * The moduleResolvers can be used to provide additional mechanisms to locate such resources.
         * For example:
         * ```
         * global.moduleResolvers.unshift(uri => uri === "main-page" ? require("main-page") : null);
         * ```
         * More advanced scenarios will allow for specific bundlers to integrate their module resolving mechanisms.
         * When adding resolvers at the start of the array, avoid throwing and return null instead so subsequent resolvers may try to resolve the resource.
         * By default the only member of the array is global.require, as last resort - if it fails to find a module it will throw.
         */
        readonly moduleResolvers: ModuleResolver[];
        loadModule(name: string): any;
        moduleExists(name: string): boolean;
        moduleMerge(sourceExports: any, destExports: any): void;
        zonedCallback(callback: Function): Function;
        Reflect?: any;
        Deprecated(target: Object, key?: string | symbol, descriptor?: any): any;
        Experimental(target: Object, key?: string | symbol, descriptor?: any): any;
        __native?: any;
        __inspector?: any;
        __extends: any;
        __onLiveSync: () => void;
        __onUncaughtError: (error: NativeScriptError) => void;
        TNS_WEBPACK?: boolean;
        __requireOverride?: (name: string, dir: string) => any;
    }
}

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearTimeout(timeoutId: number): void;
declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearInterval(intervalId: number): void;

/**
 * An extended JavaScript Error which will have the nativeError property initialized in case the error is caused by executing platform-specific code.
 */
interface NativeScriptError extends Error {
    /**
     * Represents the native error object.
     */
    nativeError: any;
}

// Define a minimal subset of NodeRequire and NodeModule so user apps can compile without
// installing @types/node

interface NodeRequire {
    (id: string): any;
}

interface NodeModule {
    exports: any;
    id: string;
    filename: string;
}
