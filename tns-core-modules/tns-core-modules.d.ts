/* tslint:disable:no-unused-variable */
///<reference path="./module.d.ts" />

declare enum RequestContext {
    "audio", "beacon", "cspreport", "download", "embed", "eventsource", "favicon", "fetch",
    "font", "form", "frame", "hyperlink", "iframe", "image", "imageset", "import",
    "internal", "location", "manifest", "object", "ping", "plugin", "prefetch", "script",
    "serviceworker", "sharedworker", "subresource", "style", "track", "video", "worker",
    "xmlhttprequest", "xslt"
}

// Extend the lib.dom.d.ts Body interface with `formData`
interface Body {
    formData() : Promise<FormData>;
}

declare type HeaderInit = Headers|Array<string>;

declare function fetch(url: string, init?: RequestInit): Promise<Response>;

declare var console: Console;
declare var require: NodeRequire;

declare var __dirname: string;
declare var __filename: string;

declare var module: NodeModule;
// Same as module.exports
declare var exports: any;

// Global functions
declare function Deprecated(target: Object, key?: string | symbol, value?: any): void;
declare function Experimental(target: Object, key?: string | symbol, value?: any): void;

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
declare function setTimeout(callback: Function, milliseconds?: number): number;

/**
 * Clears the delay set by a call to the setTimeout function.
 * @param id The identifier returned by the previously called setTimeout() method.
 */
declare function clearTimeout(id: number): void;

/**
 * Calls a function repeatedly with a delay between each call.
 * @param callback The function to be called.
 * @param milliseconds The delay between each function call.
 */
declare function setInterval(callback: Function, milliseconds?: number): number;

/**
 * Clears repeated function which was set up by calling setInterval().
 * @param id The identifier returned by the setInterval() method.
 */
declare function clearInterval(id: number): void;

declare function zonedCallback(callback: Function): Function;

declare class WeakRef<T> {
    constructor(obj: T);
    get(): T;
    clear(): void;
}

interface Array<T> {
    filter<U extends T>(pred: (a: T) => a is U): U[];
}

//Dialogs
declare function alert(message?: any): void;
declare function confirm(message?: string): boolean;
