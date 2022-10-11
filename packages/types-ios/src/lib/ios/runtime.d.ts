/// <reference path="interop.d.ts" />



/**
 * Returns the version of the runtime.
 */
declare const __runtimeVersion: string;

/**
 * Triggers garbage collection in JavaScript
 */
declare function __collect(): void;

/**
 * Releases the reference to the wrapped native object
 * @param object The Objective-C object to release.
 */
declare function __releaseNativeCounterpart(object: NSObject): void;

/**
 * Gets accurate system timestamp in ms.
 */
declare function __time(): Number;
