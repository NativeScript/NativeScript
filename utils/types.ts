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

var classInfosMap = new Map<Function, ClassInfo>();
var funcNameRegex = /function (.{1,})\(/;
export function getClass(object: Object): string {
    return getClassInfo(object).name;
}

export function getClassInfo(object: Object): ClassInfo {
    var constructor = object.constructor;

    var result = classInfosMap.get(constructor);
    if (!result) {
        result = new ClassInfo(constructor);
        classInfosMap.set(constructor, result);
    }

    return result;
}

export function getBaseClasses(object): Array<string> {
    var result = [];
    var info = getClassInfo(object);
    while (info) {
        result.push(info.name);
        info = info.baseClassInfo;
    }
    return result;
}

export class ClassInfo {
    private _typeCosntructor: Function;
    private _name: string;
    private _baseClassInfo: ClassInfo;

    constructor(typeCosntructor: Function) {
        this._typeCosntructor = typeCosntructor;
    }

    get name(): string {
        if (!this._name) {
            var results = (funcNameRegex).exec(this._typeCosntructor.toString());
            this._name = (results && results.length > 1) ? results[1] : "";
        }

        return this._name;
    }

    get baseClassInfo(): ClassInfo {
        if (isUndefined(this._baseClassInfo)) {
            var constructorProto = this._typeCosntructor.prototype;
            if (constructorProto.__proto__) {
                this._baseClassInfo = getClassInfo(constructorProto.__proto__);
            }
            else {
                this._baseClassInfo = null;
            }
        }

        return this._baseClassInfo;
    }
}