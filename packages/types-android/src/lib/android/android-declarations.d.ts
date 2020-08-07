/* tslint:disable:no-unused-variable */
// Android specific TypeScript declarations
declare function float(num: number): any;
declare function long(num: number): any;

/**
 * Triggers garbage collection in JavaScript
 */
declare var gc: () => void;

/**
 * Releases the reference to the wrapped native object
 * @param object The Java object to release.
 */
declare function __releaseNativeCounterpart(object: java.lang.Object): void;

interface ArrayConstructor {
    create(type: any, count: number): any;
}

declare module native {	export class Array<T> {	constructor(); length: number; [index: number]: T; } }

import globalAndroid = android;
