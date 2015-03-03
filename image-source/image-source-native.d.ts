//@private
/**
 * This module is used as a native implementation for each of the underlying platforms.
 * Users will not typically require it as it supports the module infrastructure.
 */
//
export declare function fromResource(name: string): any;
export declare function fromFile(path: string): any;
export declare function fromData(data: any): any;
export declare function saveToFile(instance: any, path: string, format: number, quality?: number): boolean;
export declare function toBase64String(instance: any, format: number, quality?: number): string;