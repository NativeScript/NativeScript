export var checkKey = function(key: string) : void {
    if ("string" !== typeof key) {
        throw new Error("key: '" + key + "' must be a string");
    }    
}

export var ensureValidValue = function (value: any, valueType: string): void {
    if (valueType !== typeof value) {
        throw new Error("value: '" + value + "' must be a " + valueType);
    }
}
