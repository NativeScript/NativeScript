export function isString(value: any): boolean {
    return typeof value === "string";
}

export function isNumber(value: any): boolean {
    return typeof value === "number";
}

export function isFunction(value: any): boolean {
    if (!value) {
        return false;
    }
    return typeof value === "function";
}

export function isUndefined(value: any): boolean {
    return typeof value === "undefined";
}

export function isDefined(value: any): boolean {
    return typeof value !== "undefined";
}

export function isNullOrUndefined(value: any): boolean {
    return (typeof value === "undefined") || (value === null);
}

export function verifyCallback(value: any) {
    if (value && !isFunction(value)) {
        throw new TypeError("Callback must be a valid function.");
    }
}

var funcNameRegex = /function (.{1,})\(/;
export function getClass(object): string {
    var results = (funcNameRegex).exec((object).constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
}

export function getBaseClasses(object): Array<string> {
    var baseProto = object.__proto__;
    var result = [];
    result.push(getClass(object));
    
    while (baseProto !== Object.prototype) {
        var baseProtoString = baseProto.toString();
        // while extending some classes for platform specific versions results in duplicate class types in hierarchy
        if (result.indexOf(baseProtoString) === -1) {
            result.push(baseProtoString);
        }
        baseProto = baseProto.__proto__;
    }

    result.push("Object");

    return result;
}