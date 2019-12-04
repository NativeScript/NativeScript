/// <reference path="./nativescript-error.d.ts" />
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

        moduleMerge(sourceExports: any, destExports: any): void;

        registerModule(name: string, loader: ((name: string) => any)): void;
        /**
         * Register all modules from a webpack context.
         * The context is one created using the following webpack utility:
         * https://webpack.js.org/guides/dependency-management/#requirecontext
         *
         * The extension map is optional, modules in the webpack context will have their original file extension (e.g. may be ".ts" or ".scss" etc.),
         * while the built-in module builders in {N} will look for ".js", ".css" or ".xml" files. Adding a map such as:
         * ```
         * { ".ts": ".js" }
         * ```
         * Will resolve lookups for .js to the .ts file.
         * By default scss and ts files are mapped.
         */
        registerWebpackModules(context: { keys(): string[], (key: string): any }, extensionMap?: { [originalFileExtension: string]: string });

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

        /**
         *
         * @param name Name of the module to be loaded
         * @param loadForUI Is this UI module is being loaded for UI from @nativescript/core/ui/builder.
         * Xml, css/scss and js/ts modules for pages and custom-components should load with loadForUI=true.
         * Passing "true" will enable the HMR mechanics this module. Default value is false.
         */
        loadModule(name: string, loadForUI?: boolean): any;

        /**
         * Checks if the module has been registered with `registerModule` or in `registerWebpackModules`
         * @param name Name of the module
         */
        moduleExists(name: string): boolean;

        getRegisteredModules(): string[];

        _unregisterModule(name: string): void;

        _isModuleLoadedForUI(moduleName: string): boolean;

        onGlobalLayoutListener: any;
        zonedCallback(callback: Function): Function;
        Reflect?: any;
        Deprecated(target: Object, key?: string | symbol, descriptor?: any): any;
        Experimental(target: Object, key?: string | symbol, descriptor?: any): any;

        __native?: any;
        __inspector?: any;
        __extends: any;
        __onLiveSync: (context?: { type: string, path: string }) => void;
        __onLiveSyncCore: (context?: { type: string, path: string }) => void;
        __onUncaughtError: (error: NativeScriptError) => void;
        __onDiscardedError: (error: NativeScriptError) => void;
        TNS_WEBPACK?: boolean;
        __snapshot?: boolean;
        __requireOverride?: (name: string, dir: string) => any;
    }
}

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearTimeout(timeoutId: number): void;
declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearInterval(intervalId: number): void;

declare type ModuleType = "markup" | "script" | "style";

/**
 * Define a module context for Hot Module Replacement.
 */
interface ModuleContext {
    /**
     * The type of the module for replacement.
     */
    type: ModuleType;

    /**
     * The path of the module for replacement.
     */
    path: string;
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
