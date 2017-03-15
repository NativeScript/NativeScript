declare var global: NodeJS.Global;

//Augment the NodeJS global type with our own extensions
declare namespace NodeJS {
    interface Global {
        android?: any;
        require(id: string): any;
        registerModule(name: string, loader: ((name: string) => any)): void;
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
