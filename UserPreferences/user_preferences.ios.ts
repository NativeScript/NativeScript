import Common = require("UserPreferences/user_preferences_common");

var userDefaults = Foundation.NSUserDefaults.standardUserDefaults();

export var hasKey = function (key: string): boolean {
    Common.checkKey(key);
    return (null != userDefaults.objectForKey(key)) ? true : false;
}

// getters
export var getBoolean = function (key: string, defaultValue?: boolean): boolean {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.boolForKey(key);
    }
    return defaultValue;
}

export var getString = function (key: string, defaultValue?: string): string {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.stringForKey(key);
    }
    return defaultValue;
}

export var getNumber = function (key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.doubleForKey(key);
    }
    return defaultValue;
}

// setters
export var setBoolean = function (key: string, value: boolean): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "boolean");
    userDefaults.setBoolForKey(value, key);
    userDefaults.synchronize();
}

export var setString = function (key: string, value: string): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "string");
    userDefaults.setObjectForKey(value, key);
    userDefaults.synchronize();
}

export var setNumber = function (key: string, value: number): void {
    Common.checkKey(key);
    Common.ensureValidValue(value, "number");
    userDefaults.setDoubleForKey(value, key);
    userDefaults.synchronize();
}

export var remove = function (key: string): void {
    Common.checkKey(key);
    userDefaults.removeObjectForKey(key);
    userDefaults.synchronize();
}

/*
these are commented out to be used only if requested by users or otherwise needed

import utils_module = require("Utils/utils_ios"); 

export var getStringArray = function (key: string, defaultValue?: string[]): string[] {
    Common.checkKey(key);
    if (hasKey(key)) {
        var nsArray = userDefaults.stringArrayForKey(key);
        var jsArray = utils_module.Collections.nsArrayToJSArray(nsArray);
        return jsArray;
    }
    return defaultValue;
}

export var getInt = function (key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return userDefaults.integerForKey(key);
    }
    return defaultValue;
}

export var getLong = function (key: string, defaultValue?: number): number {
    Common.checkKey(key);
    if (hasKey(key)) {
        return Math.ceil(userDefaults.doubleForKey(key));
    }
    return defaultValue;
}

export var setStringArray = function (key: string, values: string[]): void {
    Common.checkKey(key);
    var nsArray = utils_module.Collections.jsArrayToNSArray(values);
    userDefaults.setObjectForKey(nsArray, key);
    userDefaults.synchronize();
}

export var setInt = function (key: string, value: number): void {
    Common.checkKey(key);
    userDefaults.setIntegerForKey(value, key);
    userDefaults.synchronize();
}

export var setLong = function (key: string, value: number): void {
    Common.checkKey(key);
    userDefaults.setDoubleForKey(Math.ceil(value), key);
    userDefaults.synchronize();
}
*/