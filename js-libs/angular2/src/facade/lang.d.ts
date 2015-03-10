declare var _global: Window;
export { _global as global };
export declare var Type: FunctionConstructor;
export declare var Math: Math;
export interface RegExp {
    multiple: _globalRegExp;
    single: _globalRegExp;
}
declare var int: any;
export { int };
export declare class FIELD {
    definition: string;
    constructor(definition: any);
}
export declare class ConstAnnotation {
}
export declare class AbstractAnnotation {
}
export declare class ImplementsAnnotation {
    constructor(ty: any);
}
export declare function addAnnotation(c: any, ann: any): any;
export declare function CONST(): (c: any) => any;
export declare function ABSTRACT(): (c: any) => any;
export declare function IMPLEMENTS(ty: any): (c: any) => any;
export declare function isPresent(obj: any): boolean;
export declare function isBlank(obj: any): boolean;
export declare function isString(obj: any): boolean;
export declare function stringify(token: any): string;
export declare class StringWrapper {
    static fromCharCode(code: int): string;
    static charCodeAt(s: string, index: int): number;
    static split(s: string, regExp: RegExp): string[];
    static equals(s: string, s2: string): boolean;
    static replaceAll(s: string, from: RegExp, replace: string): string;
    static startsWith(s: string, start: string): boolean;
    static substring(s: string, start: int, end?: int): string;
    static replaceAllMapped(s: string, from: RegExp, cb: Function): string;
    static contains(s: string, substr: string): boolean;
}
export declare class StringJoiner {
    parts: string[];
    constructor();
    add(part: string): void;
    toString(): string;
}
export declare class NumberParseError extends Error {
    message: string;
    constructor(message: any);
    toString(): string;
}
export declare class NumberWrapper {
    static parseIntAutoRadix(text: string): int;
    static parseInt(text: string, radix: int): int;
    static parseFloat(text: string): number;
    static NaN: number;
    static isNaN(value: any): boolean;
    static isInteger(value: any): boolean;
}
export declare class RegExpWrapper {
    static create(regExpStr: any, flags?: string): RegExp;
    static firstMatch(regExp: any, input: any): any;
    static matcher(regExp: any, input: any): {
        re: any;
        input: any;
    };
}
export declare class RegExpMatcherWrapper {
    static next(matcher: any): any;
}
export declare class FunctionWrapper {
    static apply(fn: Function, posArgs: any): any;
}
export declare var BaseException: typeof Error;
export declare function looseIdentical(a: any, b: any): boolean;
export declare function getMapKey(value: any): any;
export declare function normalizeBlank(obj: any): any;
export declare function isJsObject(o: any): boolean;
export declare function assertionsEnabled(): boolean;
export declare function print(obj: any): void;
export declare var Json: JSON;
