declare var global: NodeJS.Global & typeof globalThis;

interface ModuleResolver {
	/**
	 * A function used to resolve the exports for a module.
	 * @param uri The name of the module to be resolved.
	 */
	(uri: string): any;
}

/**
 * An extended JavaScript Error which will have the nativeError property initialized in case the error is caused by executing platform-specific code.
 */
declare interface NativeScriptError extends Error {
	/**
	 * Represents the native error object.
	 */
	nativeError: any;
}

//Augment the NodeJS global type with our own extensions
declare namespace NodeJS {
	interface Global {
		NativeScriptHasInitGlobal?: boolean;
		NativeScriptGlobals?: {
			/**
			 * Global framework event handling
			 */
			events: {
				on(eventNames: string, callback: (data: any) => void, thisArg?: any);
				on(event: 'propertyChange', callback: (data: any) => void, thisArg?: any);
				off(eventNames: string, callback?: any, thisArg?: any);
				addEventListener(eventNames: string, callback: (data: any) => void, thisArg?: any);
				removeEventListener(eventNames: string, callback?: any, thisArg?: any);
				set(name: string, value: any): void;
				setProperty(name: string, value: any): void;
				get(name: string): any;
				notify<T>(data: any): void;
				notifyPropertyChange(propertyName: string, value: any, oldValue?: any): void;
				hasListeners(eventName: string): boolean;
			};
			launched: boolean;
			// used by various classes to setup callbacks to wire up global app event handling when the app instance is ready
			appEventWiring: Array<any>;
			// determines if the app instance is ready upon bootstrap
			appInstanceReady: boolean;

			/**
			 * Ability for classes to initialize app event handling early even before the app instance is ready during boot cycle avoiding boot race conditions
			 * @param callback wire up any global event handling inside the callback
			 */
			addEventWiring(callback: () => void): void;
		};
		android?: any;
		require(id: string): any;

		moduleMerge(sourceExports: any, destExports: any): void;

		registerModule(name: string, loader: (name: string) => any): void;
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
		registerWebpackModules(context: { keys(): string[]; (key: string): any }, extensionMap?: { [originalFileExtension: string]: string });

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
		__onLiveSync: (context?: { type: string; path: string }) => void;
		__onLiveSyncCore: (context?: { type: string; path: string }) => void;
		__onUncaughtError: (error: NativeScriptError) => void;
		__onDiscardedError: (error: NativeScriptError) => void;
		__snapshot?: boolean;
		TNS_WEBPACK?: boolean;
		isIOS?: boolean;
		isAndroid?: boolean;
		__requireOverride?: (name: string, dir: string) => any;
	}
}

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearTimeout(timeoutId: number): void;
declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
declare function clearInterval(intervalId: number): void;

declare type ModuleType = 'markup' | 'script' | 'style';

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

declare enum RequestContext {
	'audio',
	'beacon',
	'cspreport',
	'download',
	'embed',
	'eventsource',
	'favicon',
	'fetch',
	'font',
	'form',
	'frame',
	'hyperlink',
	'iframe',
	'image',
	'imageset',
	'import',
	'internal',
	'location',
	'manifest',
	'object',
	'ping',
	'plugin',
	'prefetch',
	'script',
	'serviceworker',
	'sharedworker',
	'subresource',
	'style',
	'track',
	'video',
	'worker',
	'xmlhttprequest',
	'xslt',
}

// Extend the lib.dom.d.ts Body interface with `formData`
// interface Body {
//   formData(): Promise<FormData>;
// }

declare type HeaderInit = Headers | Array<string>;

declare function fetch(url: string, init?: RequestInit): Promise<Response>;

// declare var console: Console;
declare var require: NodeRequire;

// Extend NodeRequire with the webpack's require context extension.
interface RequireContext {
	keys(): string[];
	(id: string): any;
	<T>(id: string): T;
	resolve(id: string): string;
}

interface NodeRequire {
	context(path: string, deep?: boolean, filter?: RegExp): RequireContext;
}

declare var __dirname: string;
declare var __filename: string;

declare var module: NodeModule;
// Same as module.exports
declare var exports: any;

// Global functions
declare function Deprecated(target: Object, key?: string | symbol, value?: any): void;
declare function Experimental(target: Object, key?: string | symbol, value?: any): void;

declare interface NativeClassOptions {
	nativeClassName?: string; // for @JavaProxy and
	protocols?: any[];
	interfaces?: any[];
}

/**
 * Decorates class that extends a native class(iOS or Android)
 */
declare function NativeClass<T extends { new (...args: any[]): {} }>(constructor: T);
declare function NativeClass<T extends { new (...args: any[]): {} }>(options?: NativeClassOptions);

/**
 * Decorates class that implements native Java interfaces.
 * @param interfaces Implemented interfaces.
 */
declare function Interfaces(...interfaces): ClassDecorator;

/**
 * Decorates class that extends native Java class
 * @param nativeClassName The name of the newly generated class. Must be unique in the application.
 */
declare function JavaProxy(nativeClassName: string): ClassDecorator;

/**
 * Important: Not applicable to Objective-C classes (iOS platform)
 * Decorates class that extends native Java class
 * @param interfaces An array of fully-classified Java interface names that the class must implement.
 */
declare function Interfaces(interfaces: any[]): ClassDecorator;

/**
 * Important: Not applicable to Java classes (Android platform)
 * Decorates a class that implements native Objective-C protocols.
 * @param protocols An array of fully-classified Objective-C protocol names that the class must implement.
 */
declare function ObjCClass(...protocols: any[]): ClassDecorator;

/**
 * Important: Not applicable to Java methods (Android platform)
 * Decorates method that it is exposed in Objective-C.
 * The JS name of the method will be used as the name of the native method
 * and the return type will be set to `interop.types.void`
 */
declare function ObjCMethod(): MethodDecorator;

/**
 * Important: Not applicable to Java methods (Android platform)
 * Decorates method that it is exposed in Objective-C.
 * @param name The name of the method to be exposed.
 * The native return type will be set to `interop.types.void`.
 */
declare function ObjCMethod(name: string): MethodDecorator;

/**
 * Important: Not applicable to Java methods (Android platform)
 * Decorates a method to be exposed in Objective-C.
 * The JS name of the method will be used for the name of the native method.
 * @param returnType The native type of the result.
 */
declare function ObjCMethod(returnType: any): MethodDecorator;

/**
 * Important: Not applicable to Java methods (Android platform)
 * Decorates a method to be exposed in Objective-C.
 * @param name The name of the method to be exposed. Can be different than the JS function name
 * and can follow Objective-C colon syntax (for example `tableView:cellForRowAtIndexPath:`).
 * @param returnType The native type of the result.
 */
declare function ObjCMethod(name: string, returnType: any): MethodDecorator;

/**
 * Important: Not applicable to Java classes or methods (Android platform)
 * This is a shorthand decorator that can be used to decorate either a method or a class
 * to be exposed to Objective-C.
 * @param params Parameters to send to the ObjCClass or ObjCMethod decorators.
 */
declare function ObjC(...params: any[]): ClassDecorator & MethodDecorator;

/**
 * Important: Not applicable to Java method parameters (Android platform)
 * Decorates a parameter in an Objective-C exposed method with its native type.
 * @param type The native type for the parameter.
 */
declare function ObjCParam(type: any): ParameterDecorator;

declare function Log(data: any): void;
declare function log(data: any): void;
declare function fail(data: any): void;

/**
 * Calls a function after a specified delay.
 * @param callback The function to be called.
 * @param milliseconds The time to wait before the function is called. Defaults to 0.
 */
// declare function setTimeout(callback: Function, milliseconds?: number): number;

/**
 * Clears the delay set by a call to the setTimeout function.
 * @param id The identifier returned by the previously called setTimeout() method.
 */
// declare function clearTimeout(id: number): void;

/**
 * Calls a function repeatedly with a delay between each call.
 * @param callback The function to be called.
 * @param milliseconds The delay between each function call.
 */
// declare function setInterval(callback: Function, milliseconds?: number): number;

/**
 * Clears repeated function which was set up by calling setInterval().
 * @param id The identifier returned by the setInterval() method.
 */
// declare function clearInterval(id: number): void;

declare function zonedCallback(callback: Function): Function;

declare class WeakRef<T> {
	constructor(obj: T);
	get(): T;
	clear(): void;
}
